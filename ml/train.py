import json, os, sys
import numpy as np
import scipy.io as sio
import tensorflow as tf

os.makedirs('out', exist_ok=True)
m = sio.loadmat('data/emnist-balanced.mat')['dataset']
mapping = [chr(c) for c in m['mapping'][0, 0][:, 1]]


def load(split):
    s = m[split][0, 0]
    x = s['images'][0, 0].reshape(-1, 28, 28, order='F').astype(np.float32) / 255.0
    y = s['labels'][0, 0].ravel().astype(np.int64)
    return x, y


xtr, ytr = load('train')
xte, yte = load('test')

if '--preview' in sys.argv:
    from PIL import Image
    grid = np.zeros((28 * 6, 28 * 10))
    for i in range(60):
        grid[(i // 10) * 28:(i // 10 + 1) * 28, (i % 10) * 28:(i % 10 + 1) * 28] = xtr[i]
    Image.fromarray((grid * 255).astype(np.uint8)).resize((560, 336)).save('out/preview.png')
    print(''.join(mapping[k] for k in ytr[:60]))
    sys.exit()

# Drop digits: the app only asks for letters.
keep_tr = ytr >= 10
keep_te = yte >= 10
xtr, ytr = xtr[keep_tr], ytr[keep_tr] - 10
xte, yte = xte[keep_te], yte[keep_te] - 10
labels = mapping[10:]
n = len(labels)
if os.path.exists('out/synthetic.npz'):
    # Stroke-rendered print letters (Hershey single-line fonts), drawn the same way the app draws.
    syn = np.load('out/synthetic.npz')
    xtr = np.concatenate([xtr, syn['x']])
    ytr = np.concatenate([ytr, syn['y']])
    print('with synthetic', len(syn['y']))
xtr = xtr[..., None]
xte = xte[..., None]

aug = tf.keras.Sequential([
    tf.keras.layers.RandomRotation(0.06, fill_mode='constant'),
    tf.keras.layers.RandomZoom((-0.12, 0.12), fill_mode='constant'),
    tf.keras.layers.RandomTranslation(0.08, 0.08, fill_mode='constant'),
])


def thickness(x):
    # Randomly thicken (max-pool dilation) or thin strokes to match finger-drawn input.
    r = tf.random.uniform([tf.shape(x)[0], 1, 1, 1])
    dil = tf.nn.max_pool2d(x, 3, 1, 'SAME')
    ero = -tf.nn.max_pool2d(-x, 2, 1, 'SAME')
    return tf.where(r < 0.3, dil, tf.where(r < 0.45, ero, x))


def prep(x, y):
    x = aug(x, training=True)
    x = thickness(x)
    return tf.clip_by_value(x, 0, 1), y


ds = (tf.data.Dataset.from_tensor_slices((xtr, ytr)).shuffle(20000).batch(256)
      .map(prep, num_parallel_calls=tf.data.AUTOTUNE).prefetch(4))
val = tf.data.Dataset.from_tensor_slices((xte, yte)).batch(512)

if '--augpreview' in sys.argv:
    from PIL import Image
    sel = np.random.choice(len(xtr), 60)
    xb, yb = prep(tf.constant(xtr[sel]), ytr[sel])
    xb = xb.numpy()[..., 0]
    grid = np.concatenate([np.concatenate(list(xb[r * 10:(r + 1) * 10]), 1) for r in range(6)], 0)
    Image.fromarray((grid * 255).astype(np.uint8)).resize((560, 336)).save('out/augpreview.png')
    sys.exit()

L = tf.keras.layers
model = tf.keras.Sequential([
    tf.keras.Input((28, 28, 1)),
    L.Conv2D(32, 3, padding='same', activation='relu'),
    L.BatchNormalization(),
    L.Conv2D(32, 3, padding='same', activation='relu'),
    L.BatchNormalization(),
    L.MaxPooling2D(),
    L.Dropout(0.2),
    L.Conv2D(64, 3, padding='same', activation='relu'),
    L.BatchNormalization(),
    L.Conv2D(64, 3, padding='same', activation='relu'),
    L.BatchNormalization(),
    L.MaxPooling2D(),
    L.Dropout(0.25),
    L.Conv2D(128, 3, padding='same', activation='relu'),
    L.BatchNormalization(),
    L.GlobalAveragePooling2D(),
    L.Dense(128, activation='relu'),
    L.Dropout(0.3),
    L.Dense(n, activation='softmax'),
])
epochs = int(os.environ.get('EPOCHS', 24))
sched = tf.keras.optimizers.schedules.CosineDecay(2e-3, epochs * len(ds))
model.compile(tf.keras.optimizers.Adam(sched), 'sparse_categorical_crossentropy', metrics=['accuracy'])
model.fit(ds, validation_data=val, epochs=epochs, verbose=2)
model.save('out/emnist.keras')

# Export weights in a simple binary + json manifest that the browser rebuilds with tf.sequential.
weights = []
blobs = []
for layer in model.layers:
    for w in layer.weights:
        a = w.numpy().astype(np.float32)
        weights.append({'name': w.path, 'shape': list(a.shape)})
        blobs.append(a.tobytes())
with open('out/weights.bin', 'wb') as f:
    f.write(b''.join(blobs))
json.dump({'labels': labels, 'weights': weights}, open('out/meta.json', 'w'))

pred = model.predict(xte, verbose=0)
top1 = (pred.argmax(1) == yte).mean()
top3 = np.mean([yte[i] in np.argsort(-pred[i])[:3] for i in range(len(yte))])
print('test top1', top1, 'top3', top3)

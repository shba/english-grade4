# Render single-stroke print letters (Hershey fonts) like the app's rasterizer, with random handwriting-like variation.
import json, os, string, numpy as np
from PIL import Image, ImageDraw
from HersheyFonts import HersheyFonts

os.makedirs("out", exist_ok=True)
rng = np.random.default_rng(1)
labels = list('ABCDEFGHIJKLMNOPQRSTUVWXYZabdefghnqrt')
def label_of(ch):
    if ch in labels: return labels.index(ch)
    return labels.index(ch.upper())

def glyph(font, ch):
    f = HersheyFonts(); f.load_default_font(font)
    strokes = []
    for a, b in f.lines_for_text(ch):
        if strokes and strokes[-1][-1] == tuple(a): strokes[-1].append(tuple(b))
        else: strokes.append([tuple(a), tuple(b)])
    return [np.array(s, float) for s in strokes]

def render(strokes, lw):
    S = 112
    pts = np.concatenate(strokes)
    x0, y0 = pts.min(0); x1, y1 = pts.max(0)
    scale = 92 / max(x1 - x0, y1 - y0, 1e-3)
    ox = S / 2 - (x0 + x1) / 2 * scale; oy = S / 2 - (y0 + y1) / 2 * scale
    im = Image.new('L', (S, S), 0); d = ImageDraw.Draw(im)
    for s in strokes:
        p = [(x * scale + ox, y * scale + oy) for x, y in s]
        if len(p) > 1: d.line(p, fill=255, width=lw, joint='curve')
        for (x, y) in (p[0], p[-1]):
            d.ellipse([x - lw / 2, y - lw / 2, x + lw / 2, y + lw / 2], fill=255)
    im = im.resize((56, 56), Image.BILINEAR).resize((28, 28), Image.BILINEAR)
    return np.asarray(im, np.float32) / 255

def vary(strokes):
    slant = rng.uniform(-0.3, 0.3); sx = rng.uniform(0.7, 1.35); rot = rng.uniform(-0.12, 0.12)
    c, s_ = np.cos(rot), np.sin(rot)
    out = []
    for st in strokes:
        st = st.copy()
        # densify
        dense = [st[0]]
        for a, b in zip(st[:-1], st[1:]):
            n = max(1, int(np.hypot(*(b - a)) / 1.5))
            for k in range(1, n + 1): dense.append(a + (b - a) * k / n)
        st = np.array(dense)
        x = st[:, 0] * sx - slant * st[:, 1]; y = st[:, 1]
        x, y = c * x - s_ * y, s_ * x + c * y
        wob = np.cumsum(rng.normal(0, 0.18, (len(x), 2)), 0)
        wob -= np.linspace(0, 1, len(x))[:, None] * wob[-1]
        off = rng.normal(0, 0.5, 2)
        out.append(np.stack([x + wob[:, 0] + off[0], y + wob[:, 1] + off[1]], 1))
    return out

xs, ys = [], []
for font in ['futural', 'rowmans', 'futuram', 'timesr', 'timesi', 'scripts']:
    for ch in string.ascii_letters:
        g = glyph(font, ch)
        n = 70 if font in ('futural', 'rowmans') else 35
        for _ in range(n):
            xs.append(render(vary(g), int(rng.integers(9, 15))))
            ys.append(label_of(ch))
xs = np.array(xs); ys = np.array(ys, np.int64)
np.savez_compressed('out/synthetic.npz', x=xs, y=ys)
print(xs.shape)
grid = np.concatenate([np.concatenate(list(xs[i * 300:i * 300 + 300:30]), 1) for i in range(0, 40, 4)], 0)
Image.fromarray((grid * 255).astype(np.uint8)).save('out/synth_preview.png')

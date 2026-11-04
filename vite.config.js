import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

function listFiles(dir) {
  return readdirSync(dir).flatMap((f) => {
    const p = join(dir, f);
    return statSync(p).isDirectory() ? listFiles(p) : [p];
  });
}

/** Writes sw.js with the full list of built files so the app works offline after the first visit. */
function serviceWorker() {
  return {
    name: 'precache-sw',
    apply: 'build',
    generateBundle(_, bundle) {
      const pub = listFiles('public').map((p) => relative('public', p).split('\\').join('/'));
      const files = ['./', ...Object.keys(bundle), ...pub].filter((f) => f !== 'sw.js' && !f.split('/').some((p) => p.startsWith('.')));
      const version = Date.now().toString(36);
      const source = `const CACHE = 'eng4-${version}';
const FILES = ${JSON.stringify(files)};
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).catch(() => caches.match('./', { ignoreSearch: true })));
    return;
  }
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
    )
  );
});
`;
      this.emitFile({ type: 'asset', fileName: 'sw.js', source });
    },
  };
}

// base './' keeps every URL relative, so the same build works on GitHub Pages (/repo-name/) and Netlify (/).
export default defineConfig({
  base: './',
  plugins: [react(), serviceWorker()],
  build: { chunkSizeWarningLimit: 900 },
});

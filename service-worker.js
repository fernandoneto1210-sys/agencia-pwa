const CACHE_NAME = 'agencia-pwa-v1';
const ARQUIVOS_PARA_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest'
  // Adicione aqui outros arquivos que queira cachear
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((respostaCache) => {
        return respostaCache || fetch(event.request);
      })
  );
});

const CACHE_NAME = 'agencia-pwa-v1';
const ARQUIVOS_PARA_CACHE = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './manifest.webmanifest'
  // Você pode adicionar mais arquivos aqui, se quiser
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ARQUIVOS_PARA_CACHE))
  );
});

self.addEventListener('activate', (event) => {
  // Aqui você pode limpar caches antigos se mudar o nome do cache
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((respostaCache) => {
        // Se existir no cache, devolve o cache; senão, busca na rede
        return respostaCache || fetch(event.request);
      })
  );
});
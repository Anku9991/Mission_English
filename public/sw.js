self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch listener is required by browsers to trigger the PWA install prompt.
  // We just let the network handle it normally to avoid caching complex dynamic Next.js routes incorrectly.
  event.respondWith(fetch(event.request));
});

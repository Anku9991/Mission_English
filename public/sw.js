self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', (event) => {
  // A minimal fetch listener is required by browsers to trigger the PWA install prompt.
  // We wrap it in a try/catch or respond with a safe fallback to prevent unhandled promise rejections
  // when navigating offline or cancelling requests.
  event.respondWith(
    fetch(event.request).catch(() => {
      // Return a basic offline response if needed, or just let it fail silently
      return new Response("Offline", { status: 503, statusText: "Service Unavailable" });
    })
  );
});

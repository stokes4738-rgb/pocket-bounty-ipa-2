// PWA Service Worker for better offline support and input handling
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(clients.claim());
});

// Cache important assets
self.addEventListener('fetch', (event) => {
  // For now, just pass through all requests
  // This ensures the service worker is active and can help with PWA features
  event.respondWith(fetch(event.request));
});
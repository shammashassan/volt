const CACHE_NAME = 'volt-pwa-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/site.webmanifest',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/file.svg',
  '/globe.svg',
  '/next.svg',
  '/window.svg'
];

// Install Event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event
self.addEventListener('fetch', (event) => {
  // Only cache GET requests, avoid API and chrome-extension/dev requests
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip API routes, chrome extensions, dev-server HMR, and other domains
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset, and fetch in background for fresh assets (Stale-While-Revalidate)
        if (!url.pathname.startsWith('/_next/data') && !url.pathname.startsWith('/share')) {
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse);
                });
              }
            })
            .catch(() => { /* Ignore background fetch failures offline */ });
        }
        return cachedResponse;
      }

      // Network first, fallback to cache
      return fetch(event.request)
        .then((networkResponse) => {
          // If valid response, cache it
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff2)$/))
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback for page navigation
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});

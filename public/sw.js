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
  // Only cache GET requests, avoid API, authentication, and dev-mode HMR
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);
  
  // Skip API routes, auth routes, dev-server HMR, and other domains
  if (
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/_next/webpack-hmr') ||
    url.pathname.startsWith('/login') ||
    url.pathname.startsWith('/register') ||
    url.hostname !== self.location.hostname
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // If we have a cached response, return it (and fetch in background to refresh)
      if (cachedResponse) {
        // Refresh in background if it's not a static immutable file
        if (
          !url.pathname.startsWith('/_next/static') && 
          !url.pathname.startsWith('/share')
        ) {
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

      // Network first, fall back to cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          // Cache logic: we want to dynamically cache:
          // 1. Static assets (JS, CSS, fonts, images)
          // 2. Main pages (HTML navigations)
          // 3. Next.js router payloads (RSC data containing _rsc query parameter)
          const isStaticAsset = url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff2)$/);
          const isPageNavigation = event.request.mode === 'navigate';
          const isNextRouterPayload = url.searchParams.has('_rsc');

          if (isStaticAsset || isPageNavigation || isNextRouterPayload) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
          // If a Next.js RSC data request fails, try to return a cached base page or generic empty response
          if (url.searchParams.has('_rsc')) {
            return caches.match(event.request).then((res) => {
              return res || new Response(JSON.stringify({ offline: true }), {
                headers: { 'Content-Type': 'application/json' }
              });
            });
          }
        });
    })
  );
});

const CACHE_NAME = 'volt-pwa-cache-v2';
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

  const isPageNavigation = event.request.mode === 'navigate';
  const isNextRouterPayload = url.searchParams.has('_rsc');

  // Network First strategy for page navigations (HTML documents) and Next.js RSC data
  if (isPageNavigation || isNextRouterPayload) {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Offline fallback
          if (isPageNavigation) {
            return caches.match('/');
          }
          // If Next.js RSC request fails, try cache first, then dynamic empty offline response
          return caches.match(event.request).then((cachedResponse) => {
            return cachedResponse || new Response(JSON.stringify({ offline: true }), {
              headers: { 'Content-Type': 'application/json' }
            });
          });
        })
    );
    return;
  }

  // Cache First (with SWR/network updates) for static assets
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Refresh in background if it's not a static hashed asset
        const isImmutable = url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(woff2)$/);
        if (!isImmutable) {
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

      // If not in cache, fetch from network and cache
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }

          const isStaticAsset = url.pathname.startsWith('/_next/static') || url.pathname.match(/\.(png|jpg|jpeg|svg|gif|ico|woff2)$/);
          if (isStaticAsset) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }

          return networkResponse;
        });
    })
  );
});

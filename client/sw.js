// Service Worker with proper cache versioning
const CACHE_VERSION = Date.now(); // Dynamic versioning
const CACHE_NAME = `green-garden-cache-v${CACHE_VERSION}`;
const IMAGE_CACHE_NAME = `green-garden-images-v${CACHE_VERSION}`;
const API_CACHE_NAME = `green-garden-api-v${CACHE_VERSION}`;

// Resources to cache immediately
const STATIC_RESOURCES = [
  '/',
  '/services',
  '/manifest.json'
];

// API endpoints to cache
const CACHEABLE_APIS = [
  '/api/services',
  '/api/carousel-images',
  '/api/feature-cards',
  '/api/testimonials'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(STATIC_RESOURCES))
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache images aggressively
  if (request.destination === 'image') {
    event.respondWith(
      caches.open(IMAGE_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          return fetch(request).then((response) => {
            // Only cache successful responses
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Cache API responses
  if (CACHEABLE_APIS.some(api => url.pathname.startsWith(api))) {
    event.respondWith(
      caches.open(API_CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          // Return cached version if available
          if (cachedResponse) {
            // Fetch fresh data in the background
            fetch(request).then((response) => {
              if (response.status === 200) {
                cache.put(request, response.clone());
              }
            });
            return cachedResponse;
          }

          // Fetch and cache new data
          return fetch(request).then((response) => {
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Default network-first strategy for other requests
  event.respondWith(fetch(request));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && 
              cacheName !== IMAGE_CACHE_NAME && 
              cacheName !== API_CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
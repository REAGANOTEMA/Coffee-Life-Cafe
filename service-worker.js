// COFFEE LIFE CAFE Service Worker
const CACHE_NAME = 'coffee-life-v1.0.0';
const APP_SHELL = [
  '/',
  '/index.html',
  '/form.html',
  '/payment.html',
  '/images/logo.png',
  '/manifest.json',
  '/styles.css',
  '/script.js'
];

// --- Install: Pre-cache essential files ---
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Pre-caching app shell');
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// --- Activate: Clean up old caches ---
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// --- Fetch: Fast response with background refresh ---
self.addEventListener('fetch', (event) => {
  // Only handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const networkFetch = fetch(event.request)
        .then((response) => {
          // Cache the new response for future visits
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
        .catch(() => {
          // Offline fallback if network fails
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });

      // Return cached first, then update in background
      return cachedResponse || networkFetch;
    })
  );
});

// --- Optional: Background Sync or Notifications (future-ready) ---
self.addEventListener('sync', (event) => {
  console.log('[ServiceWorker] Sync event:', event.tag);
  // You can handle queued requests here if needed later.
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

console.log('[ServiceWorker] Coffee Life Cafe ready to serve fresh coffee ☕');

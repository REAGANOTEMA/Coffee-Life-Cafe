const CACHE_NAME = 'coffee-life-cache-v2'; // Increment version when updating files

// List of assets to cache
const urlsToCache = [
  '/index.html',
  '/form.html',
  '/payment.html',
  '/manifest.json',
  '/images/logo.jpg',

  // CSS files
  '/css/global.css',
  '/css/home.css',
  '/css/responsive.css',
  '/css/hero.css',
  '/css/location.css',
  '/css/gallery.css',
  '/css/apps.css',
  '/css/qr.css',
  '/css/footer.css',
  '/css/contact.css',
  '/css/payments.css',
  '/css/menu.css',
  '/css/cart.css',
  '/css/whatsapp.css',
  '/css/form.css',      // ✅ Make sure this file exists
  '/css/payment.css',   // ✅ Make sure this file exists

  // JavaScript files
  '/js/location.js',
  '/js/menu.js',
  '/js/form.js',        // ✅ Make sure this file exists
  '/js/payment.js'      // ✅ Make sure this file exists
];

// Install Service Worker and Cache Assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Caching assets...');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Activate and Clean Old Caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            console.log('Removing old cache:', key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch Handler - Cache First, then Network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // If we have the file in cache, return it
      if (cachedResponse) {
        return cachedResponse;
      }

      // Else fetch it from network, then cache it
      return fetch(event.request)
        .then(networkResponse => {
          // Only cache valid responses (status 200 and basic type)
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }

          // Clone and store in cache
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });

          return networkResponse;
        })
        .catch(() => {
          // If offline and navigating, show fallback
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

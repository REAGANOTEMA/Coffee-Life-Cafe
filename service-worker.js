const CACHE_NAME = 'coffee-life-cache-v2'; // Increment for updates

const urlsToCache = [
// HTML pages
'/index.html',
'/form.html',
'/payment.html',
'/manifest.json',

// Images
'/images/logo.png',

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
'/css/payment.css',
'/css/menu.css',
'/css/cart.css',
'/css/whatsapp.css',
'/css/form.css',

// JavaScript files
'/js/location.js',
'/js/menu.js',
'/js/form.js',
'/js/payment.js'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
event.waitUntil(
caches.open(CACHE_NAME).then(cache => {
console.log('[ServiceWorker] Caching app shell and content');
return cache.addAll(urlsToCache);
})
);
self.skipWaiting();
});

// Activate service worker and clean old caches
self.addEventListener('activate', event => {
event.waitUntil(
caches.keys().then(keys =>
Promise.all(
keys.map(key => {
if (key !== CACHE_NAME) {
console.log('[ServiceWorker] Removing old cache', key);
return caches.delete(key);
}
})
)
)
);
self.clients.claim();
});

// Fetch handler with Cache First, then Network
self.addEventListener('fetch', event => {
event.respondWith(
caches.match(event.request).then(cachedResponse => {
if (cachedResponse) {
return cachedResponse;
}

```
  return fetch(event.request)
    .then(networkResponse => {
      if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
        return networkResponse;
      }

      const responseToCache = networkResponse.clone();
      caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, responseToCache);
      });

      return networkResponse;
    })
    .catch(() => {
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html');
      }
    });
})
```

);
});

// Optional: Push notifications or background sync can be added here later

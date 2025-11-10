// Service Worker for Personal Hobby Hub PWA
const CACHE_NAME = 'hobby-hub-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/main.css',
  '/css/components.css',
  '/css/dashboard.css',
  '/css/books.css',
  '/css/media.css',
  '/css/projects.css',
  '/css/materials.css',
  '/css/journal.css',
  '/css/goals.css',
  '/css/search.css',
  '/css/toast.css',
  '/js/app.js'
];

// Install event - cache files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

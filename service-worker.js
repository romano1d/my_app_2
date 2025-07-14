// service-worker.js
const CACHE_NAME = 'radio-app-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/script.js',
    '/style.css',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
    // Можете добавить сюда ваш аудио-поток, если он статичный.
    // Для потокового радио, как правило, не кэшируется сам поток.
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => { console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Возвращаем ресурс из кэша, если он есть
                if (response) {
                    return response;
                }
                // Иначе, выполняем запрос к сети
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});

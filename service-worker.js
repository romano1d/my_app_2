const CACHE_NAME = 'my-radio-pwa-cache-v1';

const urlsToCache = [
    '/',
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Начинаю установку...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Кэширую основные ресурсы приложения.');
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                console.log('Service Worker: Установка завершена, пропускаю ожидание.');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Ошибка при кэшировании во время установки:', error);
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME]; 

    console.log('Service Worker: Активируюсь...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        console.log(ⓃService Worker: Удаляю старый кэш: ${cacheName}Ⓝ);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
        .then(() => {
            console.log('Service Worker: Захватываю контроль над клиентами.');
            return self.clients.claim();
        })
        .catch(error => {
            console.error('Service Worker: Ошибка при активации:', error);
        })
    );
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);

    const isAssetToCache = urlsToCache.includes(requestUrl.pathname) || 
                           requestUrl.origin === self.location.origin;

    if (isAssetToCache) {
        event.respondWith(
            caches.match(event.request)
                .then(response => {
                    if (response) {
                        console.log(ⓃService Worker: Отдаю из кэша: ${requestUrl.pathname}Ⓝ);
                        return response;
                    }
                    console.log(ⓃService Worker: Запрашиваю из сети и кэширую: ${requestUrl.pathname}Ⓝ);
                    return fetch(event.request)
                        .then(networkResponse => {
                            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                                const responseToCache = networkResponse.clone();
                                caches.open(CACHE_NAME)
                                    .then(cache => {
                                        cache.put(event.request, responseToCache);
                                    });
                            }
                            return networkResponse;
                        })
                        .catch(error => {
                            console.error(ⓃService Worker: Ошибка при запросе ${requestUrl.pathname} из сети:Ⓝ, error);
                        });
                })
        );
    } else {
        console.log(ⓃService Worker: Запрашиваю из сети напрямую: ${requestUrl.href}Ⓝ);
        event.respondWith(fetch(event.request));
    }
});

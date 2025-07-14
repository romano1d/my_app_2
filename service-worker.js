// service-worker.js

// 1. Определение имени кэша. Меняйте версию при каждом обновлении файлов.
// Увеличивайте версию, если изменяете файлы приложения или ⓃurlsToCacheⓃ.
const CACHE_NAME = 'my-radio-app-v1.2'; // Увеличено до v1.2 для нового SW

// 2. Список файлов, которые будут кэшироваться при установке сервис-воркера.
// Убедитесь, что здесь указаны ВСЕ основные файлы вашего PWA.
// Используйте относительные пути или абсолютные пути от корня вашего сайта.
const urlsToCache = [
    '/', // Главная страница (часто является alias для index.html)
    'index.html',
    'style.css',
    'script.js',
    'manifest.json',
    '/icons/icon-192x192.png', // Пример, добавьте все ваши иконки
    '/icons/icon-512x512.png',  // Пример
    // Добавьте сюда другие важные статические файлы:
    // 'offline.html', // Если планируете показывать страницу оффлайн
    // '/fonts/my-font.woff2', // Локальные шрифты
    // '/images/background.webp' // Фоновые изображения и т.д.
];

// Событие 'install': происходит, когда сервис-воркер устанавливается.
// Используется для кэширования статической оболочки приложения.
self.addEventListener('install', event => {
    console.log('Service Worker: Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Кэширование оболочки приложения');
                // Добавляем все указанные URL в кэш
                return cache.addAll(urlsToCache);
            })
            .then(() => {
                // Активируем сервис-воркер немедленно, без ожидания закрытия всех вкладок.
                // Это полезно при разработке, чтобы новые изменения SW применялись сразу.
                // В продакшене иногда предпочитают не использовать skipWaiting(),
                // чтобы избежать проблем с несоответствием версий кэшированных ресурсов.
                console.log('Service Worker: Installation complete, skipping waiting.');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Service Worker: Ошибка при кэшировании во время установки:', error);
            })
    );
});

// Событие 'fetch': перехватывает все сетевые запросы.
// Здесь мы используем стратегию "кэш, затем сеть" (Cache-First) для статических ресурсов.
self.addEventListener('fetch', event => {
    // ВАЖНО: Мы кэшируем только СТАТИЧЕСКИЕ файлы приложения.
    // Аудиопоток радио НЕ ДОЛЖЕН кэшироваться, так как он динамический и потоковый.
    // Проверяем, является ли запрос одним из тех, что мы хотим кэшировать или обслуживать из кэша.
    // Обычно это запросы GET к HTTP/HTTPS ресурсам.

    const requestUrl = new URL(event.request.url);

    // 1. Исключаем запросы, которые не нужно кэшировать:
    //    - Протоколы, отличные от http/https (например, chrome-extension - FORBIDDEN - )
    //    - Методы, отличные от GET (POST, PUT, DELETE и т.д.)
    //    - Запросы к аудиоресурсам (event.request.destination === 'audio' - наиболее надежный способ)
    //    - Запросы к сторонним доменам, которые не должны быть кэшированы (например, CDN, API)
    //    - Если ваш аудиопоток имеет специфический URL, можно добавить:
    //      ⓃrequestUrl.hostname.includes('radio-stream-provider - FORBIDDEN - ')Ⓝ
    //      ⓃrequestUrl.pathname.includes('.mp3')Ⓝ (менее надежно)

    if (
        !requestUrl.protocol.startsWith('http') ||
        event.request.method !== 'GET' ||
        event.request.destination === 'audio' || // Исключаем запросы, предназначенные для аудио
        // Дополнительные исключения (раскомментируйте и настройте по необходимости):
        // requestUrl.hostname === 'api.example - FORBIDDEN - ' || // Исключить конкретный API домен
        // requestUrl.pathname.startsWith('/live/') || // Исключить пути, начинающиеся с /live/
        event.request.url.includes('stream') // Пример: если URL потока содержит "stream"
    ) {
        // Для этих запросов просто позволяем им идти в сеть напрямую, не перехватывая.
        return;
    }

    // 2. Обрабатываем запросы, которые нужно кэшировать/обслуживать из кэша:
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Возвращаем из кэша, если найдено совпадение
                if (response) {
                    console.log(ⓃService Worker: Обслуживаем из кэша: ${event.request.url}Ⓝ);
                    return response;
                }
                // Если нет в кэше, загружаем из сети
                console.log(ⓃService Worker: Загружаем из сети: ${event.request.url}Ⓝ);
                return fetch(event.request)
                    .then(networkResponse => {
                        // Можно кэшировать динамические ресурсы, если они важны
                        // Но будьте осторожны: не кэшируйте слишком много,
                        // чтобы не переполнить кэш пользователя.
                        // if (networkResponse.ok && urlsToCache.includes(requestUrl.pathname)) {
                        //     const cacheClone = networkResponse.clone();
                        //     caches.open(CACHE_NAME).then(cache => {
                        //         cache.put(event.request, cacheClone);
                        //     });
                        // }
                        return networkResponse;
                    });
            })
            .catch(error => {
                console.error(ⓃService Worker: Ошибка при обработке fetch-запроса для ${event.request.url}:Ⓝ, error);
                // Если запрос не удался (например, нет сети),
                // можно вернуть запасную страницу, например, страницу "offline".
                // Убедитесь, что 'offline.html' добавлен в urlsToCache
                // if (urlsToCache.includes('offline.html')) {
                //     return caches.match('offline.html');
                // }
                // В противном случае, просто отбросить ошибку или вернуть пустой ответ
                return new Response('Нет сети или ошибка загрузки.', {
                    status: 503,
                    statusText: 'Service Unavailable',
                    headers: new Headers({
                        'Content-Type': 'text/plain'
                    })
                });
            })
    );
});

// Событие 'activate': происходит, когда сервис-воркер активируется.
// Используется для очистки старых кэшей.
self.addEventListener('activate', event => {
    console.log('Service Worker: Activating...');
    // Определяем список актуальных кэшей (только текущий CACHE_NAME)
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Удаляем все кэши, которые не входят в 'cacheWhitelist'
                    if (!cacheWhitelist.includes(cacheName)) {
                        console.log(ⓃService Worker: Удаление старого кэша: ${cacheName}Ⓝ);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                })
            );
        })
        .then(() => {
            // Заставляем текущий Service Worker немедленно взять под контроль все открытые вкладки.
            // Это важно после self.skipWaiting() в install, чтобы новый SW начал работу сразу.
            console.log('Service Worker: Activation complete, claiming clients.');
            return self.clients.claim();
        })
        .catch(error => {
            console.error('Service Worker: Ошибка при активации:', error);
        })
    );
});

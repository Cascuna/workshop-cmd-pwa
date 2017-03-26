self.addEventListener('install', event => event.waitUntil(
    caches.open('bs-v1-core')
        .then(cache => cache.addAll([
            '/offline/',
            '/dist/css/bootstrap.css',
            '/dist/css/fonts.css',
            '/assets/css/src/docs.css',
            '/assets/js/vendor/jquery.min.js',
            '/dist/js/bootstrap.js',
            '/dist/fonts/glyphicons-halflings-regular.woff2'
        ]))
        .then(self.skipWaiting())
));

self.addEventListener('fetch', event => {
    const request = event.request;
    if (request.mode === 'navigate') {
        event.respondWith(
            fetch(request)
                .then(response => cachePage(request, response))
                .catch(err => fetchCoreFile(request.url))
                .catch(err => fetchCoreFile('/offline/'))
        );
    } else {
        event.respondWith(
            fetch(request)
                .catch(err => fetchCoreFile(request.url))
        );
    }
});

function fetchCoreFile(url) {
    return caches.open('bs-v1-core')
        .then(cache => cache.match(url))
        .then(response => response ? response : Promise.reject());
}

function cachePage(request, response) {
    const clonedResponse = response.clone();
    caches.open('bs-v1-pages')
        .then(cache => cache.put(request, clonedResponse));
    return response;
}
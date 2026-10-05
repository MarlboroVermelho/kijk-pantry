const CACHE_NAME = "kijk-pantry-v3";

const ARQUIVOS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.json",
    "./icons/icon-192.png",
    "./icons/icon-512.png"
];

self.addEventListener("install", event => {
    self.skipWaiting();

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(ARQUIVOS))
    );
});


self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(nomes => {
            return Promise.all(
                nomes
                    .filter(nome => nome !== CACHE_NAME)
                    .map(nome => caches.delete(nome))
            );
        }).then(() => self.clients.claim())
    );
});


self.addEventListener("fetch", event => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const copia = response.clone();

                caches.open(CACHE_NAME)
                    .then(cache => cache.put(event.request, copia));

                return response;
            })
            .catch(() => caches.match(event.request))
    );
});
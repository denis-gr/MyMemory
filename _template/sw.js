importScripts("https://cdn.jsdelivr.net/npm/workbox-sw@6/build/workbox-sw.min.js");

const ignoreQueryStringPlugin = {
    cachedResponseWillBeUsed: async({request, cachedResponse}) =>
        cachedResponse || caches.match(request.url, {ignoreSearch: true})
};

workbox.routing.registerRoute(
    () => true,
    new workbox.strategies.StaleWhileRevalidate({
        plugins: [
            new workbox.cacheableResponse.CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            ignoreQueryStringPlugin
        ]
    })
);

workbox.precaching.precacheAndRoute([
    "https://cdn.jsdelivr.net/npm/workbox-sw@6/build/workbox-sw.min.js",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/css/bootstrap.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap-icons@1/font/bootstrap-icons.min.css",
    "https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.min.js",
    "https://cdn.jsdelivr.net/npm/vue@3/dist/vue.global.prod.js",
    "{{ start_url }}/styles/main.css",
    "{{ start_url }}/scripts/main.js",
    "{{ start_url }}/sw.js",
    "{{ start_url }}/index.html",
], {
    ignoreURLParametersMatching: [/.* /]
});
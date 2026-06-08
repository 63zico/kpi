const LEVELOVE_SW_VERSION = "20260608-pwa-test-1";
const LEVELOVE_CACHE_PREFIX = "levelove-pwa-";
const LEVELOVE_CACHE_NAME = LEVELOVE_CACHE_PREFIX + LEVELOVE_SW_VERSION;

self.addEventListener("install", function (event) {
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches
      .keys()
      .then(function (keys) {
        return Promise.all(
          keys
            .filter(function (key) {
              return key.indexOf(LEVELOVE_CACHE_PREFIX) === 0 && key !== LEVELOVE_CACHE_NAME;
            })
            .map(function (key) {
              return caches.delete(key);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(fetch(event.request));
});

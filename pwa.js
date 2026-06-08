(function registerLevelovePwa() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", function () {
    navigator.serviceWorker.register("/sw.js").catch(function (error) {
      console.warn("LEVELOVE service worker registration failed", error);
    });
  });
})();

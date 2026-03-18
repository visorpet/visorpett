// Visorpet Service Worker — PWA offline support
const CACHE_NAME = "visorpet-v1";
const STATIC_ASSETS = [
  "/",
  "/manifest.json",
  "/icons/icon-192x192.png",
  "/icons/icon-512x512.png",
];

// Rotas que ficam em cache (shell do app)
const CACHE_ROUTES = [
  "/cliente/inicio",
  "/cliente/meus-pets",
  "/dono/inicio",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignora requests externos, APIs e _next
  if (
    url.origin !== self.location.origin ||
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/")
  ) {
    return;
  }

  // Estratégia Network First com fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cacheia navegações bem-sucedidas
        if (request.mode === "navigate" && response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: retorna do cache ou página offline
        return caches.match(request).then(
          (cached) => cached ?? caches.match("/")
        );
      })
  );
});

// Push notifications (para futura integração)
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title ?? "Visorpet", {
      body:  data.body ?? "",
      icon:  "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data:  { url: data.url ?? "/" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url ?? "/")
  );
});

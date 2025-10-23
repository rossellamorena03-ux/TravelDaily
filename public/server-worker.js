self.addEventListener("push", (event) => {
  console.log("📩 Notifica push ricevuta:", event.data?.text());

  const data = event.data ? event.data.json() : {};
  const title = data.title || "Notifica";
  const options = {
    body: data.body || "Hai una nuova notifica.",
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// opzionale: gestisci i click sulla notifica
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow("/"));
});

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  self.clients.claim();
});


const CACHE_NAME = 'buurtbieb-pwa-v64';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/seedData.js',
  './js/supabaseClient.js',
  './js/isbnService.js',
  './js/app.js',
  './assets/icons/icon.svg',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  // Network-first met cache fallback zodat nieuwe Netlify-deploys direct actief zijn
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return networkResponse;
      })
      .catch(async () => {
        const cached = await caches.match(event.request, { ignoreSearch: true });
        if (cached) return cached;
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
        return Response.error();
      })
  );
});

// Web Push: ontvang binnenkomende BuurtChat-meldingen ook als de app gesloten is
self.addEventListener('push', (event) => {
  let payload = {
    title: '💬 Nieuw BuurtChat-bericht',
    body: 'Je hebt een nieuw bericht ontvangen op BuurtBieb.nl',
    url: './#chat',
    conversation_id: '',
    tag: 'buurtbieb-chat'
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      payload = { ...payload, ...parsed };
    } catch {
      const txt = event.data.text();
      if (txt) payload.body = txt;
    }
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: './assets/icons/icon-192.png',
      badge: './assets/icons/icon-192.png',
      tag: payload.tag || 'buurtbieb-chat',
      renotify: true,
      vibrate: [120, 60, 120],
      data: {
        url: payload.url || './#chat',
        conversation_id: payload.conversation_id || ''
      }
    })
  );
});

// Tikken op de melding opent direct het juiste BuurtChat-gesprek
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const data = event.notification.data || {};
  const targetUrl = new URL(data.url || './#chat', self.registration.scope).href;
  const convId = data.conversation_id || '';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope)) {
          client.postMessage({ type: 'OPEN_CHAT_FROM_PUSH', conversationId: convId });
          if ('focus' in client) return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});

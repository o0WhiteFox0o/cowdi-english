/// <reference lib="webworker" />
/* eslint-disable no-undef */

// Custom Service Worker — Cowdi English
// Features:
//  • Precache app shell (Workbox injectManifest)
//  • Runtime cache: API, fonts, CDN
//  • Background Sync: retry failed POST/PUT khi offline
//  • Push Notification: hiển thị nhắc nhở từ pet
//  • Notification click: mở app + focus

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { StaleWhileRevalidate, NetworkFirst, CacheFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

const sw = /** @type {ServiceWorkerGlobalScope} */ (self);

// ── 1. Precache (injected by vite-plugin-pwa) ────────────────────────────────
// IMPORTANT: must reference `self.__WB_MANIFEST` literally for Workbox to inject
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// ── 2. SPA navigation fallback ───────────────────────────────────────────────
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: 'cowdi-pages',
      networkTimeoutSeconds: 4,
    }),
    {
      denylist: [/^\/api\//, /^\/auth\//, /^\/health/, /\/sw\.js$/, /\/manifest\.webmanifest$/],
    }
  )
);

// ── 3. Runtime caching ──────────────────────────────────────────────────────
// API GET (progress, pet-data, stats) — stale-while-revalidate
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === self.location.origin &&
    /^\/api\/(progress|pet-data|my-stats|user)/.test(url.pathname),
  new StaleWhileRevalidate({
    cacheName: 'cowdi-api-cache',
    plugins: [
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 60 * 60 }),
    ],
  })
);

// Leaderboard — network first
registerRoute(
  ({ url, request }) =>
    request.method === 'GET' &&
    url.origin === self.location.origin &&
    /^\/api\/(leaderboard|rankings)/.test(url.pathname),
  new NetworkFirst({
    cacheName: 'cowdi-rankings-cache',
    networkTimeoutSeconds: 5,
    plugins: [new ExpirationPlugin({ maxEntries: 5, maxAgeSeconds: 5 * 60 })],
  })
);

// Google Fonts
registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com',
  new StaleWhileRevalidate({ cacheName: 'google-fonts-stylesheets' })
);
registerRoute(
  ({ url }) => url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts-webfonts',
    plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 })],
  })
);

// CDN
registerRoute(
  ({ url }) => url.origin === 'https://cdn.jsdelivr.net',
  new CacheFirst({
    cacheName: 'cdn-cache',
    plugins: [new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

// Pet/Icon images — cache lazily
registerRoute(
  ({ url, request }) =>
    request.destination === 'image' &&
    url.origin === self.location.origin &&
    /\/assets\/images\/(pets|Icons|events)\//.test(url.pathname),
  new CacheFirst({
    cacheName: 'cowdi-images',
    plugins: [new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  })
);

// ── 4. Background Sync — retry write requests khi offline ───────────────────
// Workbox queue auto retry: 24h, max 50 entries
const bgSyncPlugin = new BackgroundSyncPlugin('cowdi-write-queue', {
  maxRetentionTime: 24 * 60, // phút
  onSync: async ({ queue }) => {
    let entry;
    let synced = 0;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
        synced++;
      } catch (err) {
        // Re-queue, dừng vòng lặp
        await queue.unshiftRequest(entry);
        throw err;
      }
    }
    if (synced > 0) {
      // Báo cho client
      const clients = await sw.clients.matchAll({ type: 'window' });
      clients.forEach((c) => c.postMessage({ type: 'BG_SYNC_DONE', count: synced }));
    }
  },
});

// Áp dụng cho POST/PUT/DELETE đến /api/progress, /api/word-status, /api/pet-data, /api/my-stats
registerRoute(
  ({ url, request }) =>
    url.origin === self.location.origin &&
    /^\/api\/(progress|word-status|pet-data|my-stats|skill-xp)/.test(url.pathname) &&
    ['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method),
  async ({ event }) => {
    try {
      const response = await fetch(event.request.clone());
      return response;
    } catch (err) {
      // Offline → đẩy vào queue
      await bgSyncPlugin.fetchDidFail({ request: event.request.clone() });
      // Trả response giả để app không crash
      return new Response(
        JSON.stringify({ queued: true, message: 'Đã lưu offline, sẽ đồng bộ khi có mạng' }),
        { status: 202, headers: { 'Content-Type': 'application/json' } }
      );
    }
  },
  'POST'
);
// Lặp lại cho các method khác (registerRoute mặc định chỉ GET nếu không truyền)
['PUT', 'PATCH', 'DELETE'].forEach((method) => {
  registerRoute(
    ({ url, request }) =>
      url.origin === self.location.origin &&
      /^\/api\/(progress|word-status|pet-data|my-stats|skill-xp)/.test(url.pathname) &&
      request.method === method,
    async ({ event }) => {
      try {
        return await fetch(event.request.clone());
      } catch (err) {
        await bgSyncPlugin.fetchDidFail({ request: event.request.clone() });
        return new Response(
          JSON.stringify({ queued: true, message: 'Đã lưu offline, sẽ đồng bộ khi có mạng' }),
          { status: 202, headers: { 'Content-Type': 'application/json' } }
        );
      }
    },
    method
  );
});

// ── 5. Push Notification ─────────────────────────────────────────────────────
sw.addEventListener('push', (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch (_) {
    payload = { title: 'Cowdi', body: event.data ? event.data.text() : 'Bạn có thông báo mới' };
  }

  const title = payload.title || 'Cowdi English 🐾';
  const options = {
    body: payload.body || 'Pet của bạn đang chờ học cùng!',
    icon: payload.icon || '/pwa-192x192.png',
    badge: payload.badge || '/pwa-192x192.png',
    image: payload.image || undefined,
    tag: payload.tag || 'cowdi-notification',
    renotify: payload.renotify !== false,
    requireInteraction: payload.requireInteraction || false,
    vibrate: [120, 60, 120],
    data: {
      url: payload.url || '/',
      ...(payload.data || {}),
    },
    actions: payload.actions || [
      { action: 'open', title: '📖 Học ngay' },
      { action: 'dismiss', title: 'Để sau' },
    ],
  };

  event.waitUntil(sw.registration.showNotification(title, options));
});

// ── 6. Notification click — focus / mở tab ──────────────────────────────────
sw.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'dismiss') return;

  const targetUrl = (event.notification.data && event.notification.data.url) || '/';
  const fullUrl = new URL(targetUrl, sw.location.origin).href;

  event.waitUntil(
    sw.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Nếu app đã mở → focus và navigate
      for (const client of clientList) {
        if ('focus' in client) {
          client.postMessage({ type: 'NAVIGATE', url: targetUrl });
          return client.focus();
        }
      }
      // Chưa mở → mở tab mới
      if (sw.clients.openWindow) {
        return sw.clients.openWindow(fullUrl);
      }
    })
  );
});

// ── 7. Skip waiting on user demand ──────────────────────────────────────────
sw.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    sw.skipWaiting();
  }
});

/* Service worker for the life log.
 *
 * DELIBERATELY has no `fetch` handler. It exists only to receive Web Push and
 * to focus the app when a notification is tapped. Adding a fetch handler would
 * put this page behind a cache, and a stale logger is worse than a missed
 * reminder -- that was the main risk of taking the push route at all.
 */

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('push', (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch (e) { data = {}; }
  const title = data.title || 'Log';
  const options = {
    body: data.body || '',
    tag: data.tag || 'life-log',           // one slot per card, so it replaces rather than stacks
    renotify: true,
    requireInteraction: false,
    data: { url: data.url || './' },
    icon: './icon-192.png',
    badge: './icon-192.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || './';
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) return client.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow(target);
    })
  );
});

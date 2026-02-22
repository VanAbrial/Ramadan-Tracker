/* =============================================
   sw.js — Service Worker
   Handles background notifications
   ============================================= */

const CACHE_NAME = 'ramadan-tracker-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/css/glass.css',
  '/css/animations.css',
  '/js/db.js',
  '/js/app.js',
  '/js/tracker.js',
  '/js/quran.js',
  '/js/reminder.js'
];

/* ── Install: cache semua assets ── */
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

/* ── Activate ── */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

/* ── Fetch: serve from cache ── */
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});

/* ── Push Notification ── */
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { title: '🌙 Ramadan Tracker', body: 'Pengingat ibadah!' };
  e.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icon-192.png',
      badge: '/icon-192.png',
      tag: data.tag || 'ramadan-notif',
      vibrate: [200, 100, 200],
      requireInteraction: false
    })
  );
});

/* ── Notification Click ── */
self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(
    clients.matchAll({ type: 'window' }).then(clientList => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});

/* ── Background Sync: cek jadwal sholat ── */
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SCHEDULE_NOTIFICATIONS') {
    const reminders = e.data.reminders || [];
    scheduleAll(reminders);
  }
});

/* ── Alarm-style: pakai setInterval di SW ── */
let alarmInterval = null;

function scheduleAll(reminders) {
  if (alarmInterval) clearInterval(alarmInterval);

  // Jadwal sholat tetap
  const FIXED = [
    { key: 'sahur',   h: 3,  m: 45, title: '🌙 Sahur!',           body: 'Waktunya sahur! Jangan sampai terlewat.' },
    { key: 'imsak',   h: 4,  m: 15, title: '⏰ Imsak 15 Menit!',  body: 'Segera hentikan makan & minum.' },
    { key: 'subuh',   h: 4,  m: 41, title: '🌄 Waktu Subuh',      body: 'Saatnya sholat Subuh. Yuk bangkit!' },
    { key: 'dzuhur',  h: 12, m: 10, title: '☀️ Waktu Dzuhur',     body: 'Jangan lupa sholat Dzuhur.' },
    { key: 'ashar',   h: 15, m: 18, title: '🌤 Waktu Ashar',      body: 'Waktunya sholat Ashar.' },
    { key: 'maghrib', h: 18, m: 18, title: '🌅 Buka Puasa!',      body: 'Alhamdulillah, saatnya berbuka!' },
    { key: 'isya',    h: 19, m: 27, title: '🌃 Waktu Isya',       body: 'Jangan lupa sholat Isya.' },
    { key: 'tarawih', h: 19, m: 48, title: '🕌 Waktu Tarawih',    body: 'Yuk sholat Tarawih berjamaah!' },
  ];

  const fired = {};

  alarmInterval = setInterval(() => {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const dayKey = now.toISOString().split('T')[0];

    // Cek jadwal tetap
    FIXED.forEach(s => {
      const key = `${dayKey}_${s.key}`;
      if (h === s.h && m === s.m && !fired[key]) {
        fired[key] = true;
        self.registration.showNotification(s.title, {
          body: s.body,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: s.key,
          vibrate: [200, 100, 200]
        });
      }
    });

    // Cek custom reminders
    reminders.forEach(r => {
      const [rh, rm] = r.time.split(':').map(Number);
      const key = `${dayKey}_custom_${r.id}`;
      if (h === rh && m === rm && !fired[key]) {
        fired[key] = true;
        self.registration.showNotification('⏰ ' + r.title, {
          body: `Pengingat: ${r.title}`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'custom_' + r.id,
          vibrate: [200, 100, 200]
        });
      }
    });

  }, 30000); // cek tiap 30 detik
}

/* =============================================
   reminder.js — Notification & Reminder System
   + Service Worker integration untuk background notif
   ============================================= */

const ReminderSystem = (() => {

  let notifPermission = 'default';
  let checkInterval = null;
  let lastNotified = {};
  let swRegistration = null;

  /* ── Init ── */
  function init() {
    notifPermission = Notification.permission;
    updateUI();

    // Register Service Worker
    registerSW();

    // Fallback: cek tiap 30 detik kalau SW belum siap
    clearInterval(checkInterval);
    checkInterval = setInterval(checkScheduled, 30000);
    checkScheduled();

    renderReminderList();
    renderNotifStatus();

    const btn = document.getElementById('btnEnableNotif');
    if (btn) btn.addEventListener('click', requestPermission);

    const btn2 = document.getElementById('btnNotif');
    if (btn2) btn2.addEventListener('click', requestPermission);
  }

  /* ── Register Service Worker ── */
  async function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    try {
      swRegistration = await navigator.serviceWorker.register('/sw.js');
      console.log('✅ Service Worker registered:', swRegistration.scope);
      syncRemindersToSW();
    } catch (err) {
      console.warn('SW registration failed:', err);
    }
  }

  /* ── Sync reminders ke Service Worker ── */
  function syncRemindersToSW() {
    if (!swRegistration || !swRegistration.active) {
      setTimeout(syncRemindersToSW, 1000);
      return;
    }
    const reminders = DB.getReminders();
    swRegistration.active.postMessage({
      type: 'SCHEDULE_NOTIFICATIONS',
      reminders
    });
  }

  /* ── Permission ── */
  async function requestPermission() {
    if (!('Notification' in window)) {
      showToast('⚠️ Browser tidak mendukung notifikasi');
      return;
    }

    const result = await Notification.requestPermission();
    notifPermission = result;
    DB.setNotifPref(result === 'granted');
    updateUI();

    if (result === 'granted') {
      showToast('✅ Notifikasi berhasil diaktifkan!');
      sendNotif('🌙 Ramadan Tracker', 'Notifikasi telah diaktifkan. Semangat ibadah!', '☪');
      syncRemindersToSW();
    } else {
      showToast('❌ Notifikasi ditolak');
    }
  }

  /* ── Send Notification ── */
  function sendNotif(title, body, icon = '🕌') {
    if (notifPermission !== 'granted') return;

    // Pakai SW kalau tersedia (bisa muncul walau tab tertutup)
    if (swRegistration) {
      swRegistration.showNotification(title, {
        body,
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: title,
        vibrate: [200, 100, 200]
      });
    } else {
      try {
        new Notification(title, { body, tag: title });
      } catch(e) {
        console.warn('Notif failed:', e);
      }
    }
  }

  /* ── Fixed Schedule Notifications (fallback saat tab terbuka) ── */
  const FIXED_SCHEDULE = [
    { key: 'sahur',   h: 3,  m: 45, title: '🌙 Sahur!',          body: 'Waktunya sahur! Jangan sampai terlewat ya.' },
    { key: 'imsak',   h: 4,  m: 15, title: '⏰ Imsak 15 Menit!', body: 'Segera hentikan makan & minum.' },
    { key: 'subuh',   h: 4,  m: 41, title: '🌄 Waktu Subuh',     body: 'Saatnya sholat Subuh. Yuk bangkit!' },
    { key: 'dzuhur',  h: 12, m: 10, title: '☀️ Waktu Dzuhur',    body: 'Jangan lupa sholat Dzuhur.' },
    { key: 'ashar',   h: 15, m: 18, title: '🌤 Waktu Ashar',     body: 'Waktunya sholat Ashar.' },
    { key: 'maghrib', h: 18, m: 18, title: '🌅 Buka Puasa!',     body: 'Alhamdulillah, saatnya berbuka!' },
    { key: 'isya',    h: 19, m: 27, title: '🌃 Waktu Isya',      body: 'Jangan lupa sholat Isya.' },
    { key: 'tarawih', h: 19, m: 48, title: '🕌 Waktu Tarawih',   body: 'Yuk sholat Tarawih berjamaah!' },
  ];

  function checkScheduled() {
    const now = new Date();
    const h = now.getHours();
    const m = now.getMinutes();
    const dayKey = DB.dateKey(now);

    if (DB.isRamadanDay(now)) {
      FIXED_SCHEDULE.forEach(sched => {
        const notifKey = `${dayKey}_${sched.key}`;
        if (h === sched.h && m === sched.m && !lastNotified[notifKey]) {
          lastNotified[notifKey] = true;
          sendNotif(sched.title, sched.body);
        }
      });
    }

    const reminders = DB.getReminders();
    reminders.forEach(r => {
      const [rh, rm] = r.time.split(':').map(Number);
      const notifKey = `${dayKey}_custom_${r.id}`;
      if (h === rh && m === rm && !lastNotified[notifKey]) {
        lastNotified[notifKey] = true;
        sendNotif('⏰ ' + r.title, `Pengingat: ${r.title}`, '🔔');
      }
    });
  }

  /* ── UI: Add Custom Reminder ── */
  function addCustom(e) {
    if (e) e.preventDefault();
    const title  = document.getElementById('reminderTitle').value.trim();
    const time   = document.getElementById('reminderTime').value;
    const repeat = document.getElementById('reminderRepeat').value;
    if (!title || !time) {
      showToast('⚠️ Isi judul dan waktu dulu!');
      return;
    }

    DB.addReminder({ title, time, repeat });
    renderReminderList();
    syncRemindersToSW();
    document.getElementById('reminderTitle').value = '';
    document.getElementById('reminderTime').value  = '';
    showToast('✅ Pengingat ditambahkan!');
  }

  /* ── UI: Reminder List ── */
  function renderReminderList() {
    const el = document.getElementById('reminderItems');
    if (!el) return;
    const list = DB.getReminders();

    if (list.length === 0) {
      el.innerHTML = '<p style="color:var(--text-muted);font-size:0.85rem;text-align:center;padding:1rem">Belum ada pengingat</p>';
      return;
    }

    el.innerHTML = list.map(r => `
      <div class="reminder-item-row" data-id="${r.id}">
        <span class="ri-icon">🔔</span>
        <div class="ri-info">
          <div class="ri-title">${escapeHtml(r.title)}</div>
          <div class="ri-time">${r.time} · ${r.repeat === 'daily' ? 'Setiap hari' : 'Sekali'}</div>
        </div>
        <button class="ri-delete" onclick="ReminderSystem.deleteReminder(${r.id})">✕</button>
      </div>
    `).join('');
  }

  /* ── UI: Notif Status ── */
  function renderNotifStatus() {
    const statusIcon = document.getElementById('statusIcon');
    const statusText = document.getElementById('statusText');
    const btn        = document.getElementById('btnEnableNotif');
    const navIcon    = document.getElementById('notifIcon');

    if (!statusIcon) return;

    if (notifPermission === 'granted') {
      statusIcon.textContent = '🔔';
      statusText.textContent = 'Notifikasi aktif! Anda akan mendapat pengingat ibadah.';
      if (btn) { btn.textContent = '✅ Notifikasi Aktif'; btn.disabled = true; }
      if (navIcon) navIcon.textContent = '🔔';
    } else if (notifPermission === 'denied') {
      statusIcon.textContent = '🔕';
      statusText.textContent = 'Notifikasi diblokir. Ubah di pengaturan browser.';
      if (btn) { btn.textContent = '⚙️ Buka Pengaturan Browser'; btn.disabled = false; }
    } else {
      statusIcon.textContent = '🔔';
      statusText.textContent = 'Aktifkan notifikasi untuk mendapat pengingat sholat & puasa.';
      if (btn) { btn.textContent = '🔔 Aktifkan Notifikasi'; btn.disabled = false; }
    }
  }

  function updateUI() { renderNotifStatus(); }

  function deleteReminder(id) {
    DB.deleteReminder(id);
    renderReminderList();
    syncRemindersToSW();
    showToast('🗑 Pengingat dihapus');
  }

  function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  return { init, requestPermission, deleteReminder, sendNotif, renderReminderList, addCustom };
})();

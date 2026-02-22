/* =============================================
   app.js — Main Application
   Navigation, Countdown, Particles, Dashboard
   ============================================= */

/* ── Toast ── */
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

/* ── Navigation ── */
function initNavigation() {
  // Desktop nav
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.page);
    });
  });

  // Bottom nav (Android)
  document.querySelectorAll('.bnav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      navigateTo(btn.dataset.page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function navigateTo(pageName) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('page-' + pageName);
  if (target) target.classList.add('active');

  // Sync desktop nav
  document.querySelectorAll('.nav-link').forEach(l => {
    l.classList.toggle('active', l.dataset.page === pageName);
  });

  // Sync bottom nav
  document.querySelectorAll('.bnav-item').forEach(b => {
    b.classList.toggle('active', b.dataset.page === pageName);
  });

  if (pageName === 'tracker') {
    Tracker.renderTable();
    Tracker.updateDonut();
  }
}

/* ── Date & Hijri Display ── */
function updateDateDisplay() {
  const el = document.getElementById('todayDate');
  if (!el) return;

  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  el.textContent = now.toLocaleDateString('id-ID', options);
}

/* ── Countdown ── */
const SHOLAT = DB.getTodaySchedule();

function pad(n) { return String(n).padStart(2, '0'); }

function formatCountdown(diffMs) {
  if (diffMs < 0) return '00:00:00';
  const h = Math.floor(diffMs / 3600000);
  const m = Math.floor((diffMs % 3600000) / 60000);
  const s = Math.floor((diffMs % 60000) / 1000);
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function getNextTime(h, m) {
  const now = new Date();
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= now) target.setDate(target.getDate() + 1);
  return target - now;
}

function updateCountdowns() {
  // Imsak
  const imsakEl = document.getElementById('countdown-imsak');
  if (imsakEl) imsakEl.textContent = formatCountdown(getNextTime(SHOLAT.imsak.h, SHOLAT.imsak.m));

  // Buka (Maghrib)
  const bukaEl = document.getElementById('countdown-buka');
  if (bukaEl) bukaEl.textContent = formatCountdown(getNextTime(SHOLAT.maghrib.h, SHOLAT.maghrib.m));

  // Tarawih
  const tarawihEl = document.getElementById('countdown-tarawih');
  if (tarawihEl) tarawihEl.textContent = formatCountdown(getNextTime(SHOLAT.tarawih.h, SHOLAT.tarawih.m));
}

/* ── Ramadan Progress ── */
function updateRamadanProgress() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const start = new Date(DB.RAMADAN_START);
  start.setHours(0, 0, 0, 0);
  const end = new Date(DB.RAMADAN_END);
  end.setHours(0, 0, 0, 0);

  let dayNum = 0;
  let passed = 0;

  if (today >= start && today <= end) {
    dayNum = Math.floor((today - start) / 86400000) + 1;
    passed = dayNum;
  } else if (today > end) {
    passed = 30;
    dayNum = 30;
  }

  const pct = Math.min(100, Math.round((passed / 30) * 100));

  const progBar = document.getElementById('ramadanProgress');
  const progLabel = document.getElementById('ramadanProgressLabel');
  const statDay = document.getElementById('statDay');
  const statSisa = document.getElementById('statSisa');

  if (progBar)   progBar.style.width = pct + '%';
  if (progLabel) progLabel.textContent = pct + '%';
  if (statDay)   statDay.textContent = passed;
  if (statSisa)  statSisa.textContent = Math.max(0, 30 - passed);

  renderDayDots(today, start, passed);
}

function renderDayDots(today, start, passed) {
  const container = document.getElementById('daysDots');
  if (!container) return;

  let html = '';
  for (let i = 1; i <= 30; i++) {
    const dayDate = new Date(start);
    dayDate.setDate(dayDate.getDate() + (i - 1));

    let cls = 'future';
    if (i < passed) cls = 'past';
    if (i === passed) cls = 'today';

    const dateStr = dayDate.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' });
    html += `<div class="day-dot ${cls}" title="Hari ke-${i}: ${dateStr}">${i}</div>`;
  }
  container.innerHTML = html;
}

/* ── Highlight Current Sholat ── */
function highlightCurrentSholat() {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const currentMins = h * 60 + m;

  const times = [
    { id: 'st-subuh',   start: SHOLAT.subuh.h * 60 + SHOLAT.subuh.m,   end: SHOLAT.dzuhur.h * 60 + SHOLAT.dzuhur.m },
    { id: 'st-dzuhur',  start: SHOLAT.dzuhur.h * 60 + SHOLAT.dzuhur.m, end: SHOLAT.ashar.h * 60 + SHOLAT.ashar.m },
    { id: 'st-ashar',   start: SHOLAT.ashar.h * 60 + SHOLAT.ashar.m,   end: SHOLAT.maghrib.h * 60 + SHOLAT.maghrib.m },
    { id: 'st-maghrib', start: SHOLAT.maghrib.h * 60 + SHOLAT.maghrib.m,end: SHOLAT.isya.h * 60 + SHOLAT.isya.m },
    { id: 'st-isya',    start: SHOLAT.isya.h * 60 + SHOLAT.isya.m,     end: 23 * 60 + 59 }
  ];

  times.forEach(t => {
    const el = document.getElementById(t.id);
    if (el) {
      el.classList.toggle('active-sholat', currentMins >= t.start && currentMins < t.end);
    }
  });
}

/* ── Particles ── */
function initParticles() {
  const container = document.getElementById('particles');
  if (!container) return;

  const symbols = ['☪', '✦', '★', '◆', '•', '✧', '⋆'];
  const count = 18;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';

    const sym = symbols[Math.floor(Math.random() * symbols.length)];
    p.textContent = sym;
    p.style.cssText = `
      left: ${Math.random() * 100}%;
      font-size: ${8 + Math.random() * 14}px;
      color: rgba(0,150,60,${0.08 + Math.random() * 0.15});
      animation-duration: ${12 + Math.random() * 18}s;
      animation-delay: ${-Math.random() * 20}s;
      width: auto;
      background: none;
    `;
    container.appendChild(p);
  }
}

/* ── Update label waktu sholat di dashboard ── */
function updateSholatLabels() {
  const s = DB.getTodaySchedule();
  const map = {
    'st-subuh':   s.subuh.label,
    'st-dzuhur':  s.dzuhur.label,
    'st-ashar':   s.ashar.label,
    'st-maghrib': s.maghrib.label,
    'st-isya':    s.isya.label
  };
  Object.entries(map).forEach(([id, time]) => {
    const el = document.getElementById(id);
    if (el) {
      const timeEl = el.querySelector('.st-time');
      if (timeEl) timeEl.textContent = time;
    }
  });

  // Update countdown subtitle labels
  const imsakSub  = document.getElementById('time-imsak');
  const bukaSub   = document.getElementById('time-buka');
  const tarawihSub= document.getElementById('time-tarawih');
  if (imsakSub)   imsakSub.textContent   = s.imsak.label   + ' WIB';
  if (bukaSub)    bukaSub.textContent    = s.maghrib.label  + ' WIB';
  if (tarawihSub) tarawihSub.textContent = s.tarawih.label  + ' WIB';
}

/* ── App Init ── */
document.addEventListener('DOMContentLoaded', () => {
  // Navigation
  initNavigation();

  // Particles
  initParticles();

  // Date
  updateDateDisplay();

  // Update label waktu sholat real dari DB
  updateSholatLabels();

  // Ramadan progress
  updateRamadanProgress();

  // Countdown (update every second)
  updateCountdowns();
  setInterval(updateCountdowns, 1000);

  // Highlight sholat (update every minute)
  highlightCurrentSholat();
  setInterval(highlightCurrentSholat, 60000);

  // Modules
  Tracker.init();
  ReminderSystem.init();
  QuranApp.init();

  // Add shimmer to cards after load
  setTimeout(() => {
    document.querySelectorAll('.glass-card').forEach(card => {
      card.classList.add('glass-shimmer');
    });
  }, 500);

  // Handle hash navigation
  const hash = window.location.hash.replace('#', '');
  if (hash && ['dashboard','tracker','quran','reminder'].includes(hash)) {
    navigateTo(hash);
  }

  console.log('%c🌙 Ramadan Tracker 1447H', 'color:#4caf50;font-size:1.2rem;font-weight:bold');
  console.log('%cSelamat Berpuasa! Semoga ibadah kita diterima.', 'color:#81c784');
});
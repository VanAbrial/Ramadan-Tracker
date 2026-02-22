/* =============================================
   db.js — Database Layer (LocalStorage)
   Jadwal sholat disesuaikan dengan data real
   dari detik.com/hikmah (foto user)
   ============================================= */

const DB = (() => {

  const PREFIX = 'ramadan1447_';

  const RAMADAN_START = new Date('2026-02-19');
  const RAMADAN_END   = new Date('2026-03-20');
  const TOTAL_DAYS    = 30;

  /* ── Helpers ── */
  function _key(name) { return PREFIX + name; }

  function _get(name, fallback = null) {
    try {
      const raw = localStorage.getItem(_key(name));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function _set(name, value) {
    try {
      localStorage.setItem(_key(name), JSON.stringify(value));
      return true;
    } catch { return false; }
  }

  /* ── Date Utilities ── */
  function dateKey(date) {
    const d = date || new Date();
    return d.toISOString().split('T')[0];
  }

  function getRamadanDays() {
    const days = [];
    const cur = new Date(RAMADAN_START);
    while (cur <= RAMADAN_END) {
      days.push(new Date(cur));
      cur.setDate(cur.getDate() + 1);
    }
    return days;
  }

  function getDayNumber(date) {
    const d = date || new Date();
    const diff = Math.floor((d - RAMADAN_START) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff < TOTAL_DAYS ? diff + 1 : null;
  }

  function isRamadanDay(date) {
    const d = date || new Date();
    return d >= RAMADAN_START && d <= RAMADAN_END;
  }

  function getCurrentDayInRamadan() {
    const today = new Date();
    today.setHours(0,0,0,0);
    return getDayNumber(today);
  }

  /* ── Tracker ── */
  function initTracker() {
    const existing = _get('tracker', null);
    if (!existing) {
      const data = {};
      getRamadanDays().forEach(d => {
        data[dateKey(d)] = {
          puasa: false, subuh: false, dzuhur: false,
          ashar: false, maghrib: false, isya: false, tarawih: false
        };
      });
      _set('tracker', data);
      return data;
    }
    return existing;
  }

  function getTracker() { return _get('tracker') || initTracker(); }

  function setIbadah(dateStr, ibadahKey, value) {
    const tracker = getTracker();
    if (!tracker[dateStr]) {
      tracker[dateStr] = { puasa:false,subuh:false,dzuhur:false,ashar:false,maghrib:false,isya:false,tarawih:false };
    }
    tracker[dateStr][ibadahKey] = value;
    _set('tracker', tracker);
    return tracker[dateStr];
  }

  function getDayData(dateStr) {
    const tracker = getTracker();
    return tracker[dateStr] || { puasa:false,subuh:false,dzuhur:false,ashar:false,maghrib:false,isya:false,tarawih:false };
  }

  /* ── Statistics ── */
  function getStats() {
    const tracker = getTracker();
    const today = new Date(); today.setHours(0,0,0,0);
    let totalPuasa=0, totalSholat=0, totalTarawih=0, passedDays=0;

    getRamadanDays().forEach(d => {
      const dc = new Date(d); dc.setHours(0,0,0,0);
      if (dc > today) return;
      passedDays++;
      const day = tracker[dateKey(d)] || {};
      if (day.puasa)   totalPuasa++;
      if (day.tarawih) totalTarawih++;
      totalSholat += ['subuh','dzuhur','ashar','maghrib','isya'].filter(k => day[k]).length;
    });

    const maxSholat = passedDays * 5;
    return {
      totalPuasa, totalTarawih, totalSholat, passedDays, maxSholat,
      pctPuasa:   passedDays > 0 ? Math.round((totalPuasa   / passedDays)  * 100) : 0,
      pctTarawih: passedDays > 0 ? Math.round((totalTarawih / passedDays)  * 100) : 0,
      pctSholat:  maxSholat  > 0 ? Math.round((totalSholat  / maxSholat)   * 100) : 0,
      overall:    passedDays > 0
        ? Math.round(((totalPuasa + totalTarawih + totalSholat) / (passedDays + passedDays + maxSholat)) * 100)
        : 0
    };
  }

  /* ── Reminders ── */
  function getReminders()     { return _get('reminders', []); }
  function addReminder(r)     { const l = getReminders(); r.id = Date.now(); l.push(r); _set('reminders', l); return r; }
  function deleteReminder(id) { const l = getReminders().filter(r => r.id !== id); _set('reminders', l); return l; }

  /* ── Quran Progress ── */
  function getLastRead()  { return _get('quranLastRead', null); }
  function setLastRead(d) { _set('quranLastRead', d); }

  /* ── Notification ── */
  function getNotifPref()  { return _get('notifEnabled', false); }
  function setNotifPref(v) { _set('notifEnabled', v); }

  /* ════════════════════════════════════════════════════
     JADWAL SHOLAT REAL — Sumber: detik.com/hikmah
     Data persis dari foto yang dikirim user
     Format: [imsak, subuh, dzuhur, ashar, maghrib, isya]
     Tarawih otomatis = isya + 20 menit
  ════════════════════════════════════════════════════ */
  const JADWAL_RAMADAN = {
    
    '2026-02-19': ['04:31','04:41','12:10','15:20','18:18','19:28'], // Hari 1
    '2026-02-20': ['04:32','04:42','12:10','15:19','18:18','19:28'], // Hari 2
    '2026-02-21': ['04:32','04:42','12:10','15:19','18:18','19:28'], // Hari 3
    '2026-02-22': ['04:32','04:42','12:10','15:18','18:18','19:27'], // Hari 4
    '2026-02-23': ['04:32','04:42','12:10','15:17','18:17','19:27'], // Hari 5
    '2026-02-24': ['04:32','04:42','12:10','15:16','18:17','19:27'], // Hari 6
    '2026-02-25': ['04:32','04:42','12:09','15:15','18:17','19:26'], // Hari 7
    '2026-02-26': ['04:33','04:43','12:09','15:14','18:16','19:26'], // Hari 8
    '2026-02-27': ['04:33','04:43','12:09','15:14','18:16','19:25'], // Hari 9
    '2026-02-28': ['04:33','04:43','12:09','15:13','18:16','19:25'], // Hari 10
    '2026-03-01': ['04:33','04:43','12:09','15:12','18:15','19:24'], // Hari 11
    '2026-03-02': ['04:33','04:43','12:09','15:11','18:15','19:24'], // Hari 12
    '2026-03-03': ['04:33','04:43','12:08','15:10','18:14','19:23'], // Hari 13
    '2026-03-04': ['04:33','04:43','12:08','15:09','18:14','19:23'], // Hari 14
    '2026-03-05': ['04:33','04:43','12:08','15:08','18:14','19:23'], // Hari 15
    '2026-03-06': ['04:33','04:43','12:08','15:09','18:13','19:22'], // Hari 16
    '2026-03-07': ['04:33','04:43','12:07','15:09','18:13','19:22'], // Hari 17
    '2026-03-08': ['04:33','04:43','12:07','15:10','18:12','19:21'], // Hari 18
    '2026-03-09': ['04:33','04:43','12:07','15:10','18:12','19:21'], // Hari 19
    '2026-03-10': ['04:33','04:43','12:07','15:11','18:11','19:20'], // Hari 20
    '2026-03-11': ['04:33','04:43','12:06','15:11','18:11','19:20'], // Hari 21
    '2026-03-12': ['04:33','04:43','12:06','15:11','18:11','19:19'], // Hari 22
    '2026-03-13': ['04:33','04:43','12:06','15:12','18:10','19:19'], // Hari 23
    '2026-03-14': ['04:33','04:43','12:06','15:12','18:10','19:18'], // Hari 24
    '2026-03-15': ['04:33','04:43','12:05','15:12','18:09','19:18'], // Hari 25
    '2026-03-16': ['04:33','04:43','12:05','15:12','18:09','19:17'], // Hari 26
    '2026-03-17': ['04:33','04:43','12:05','15:13','18:08','19:17'], // Hari 27
    '2026-03-18': ['04:33','04:43','12:05','15:13','18:08','19:16'], // Hari 28
    '2026-03-19': ['04:32','04:42','12:04','15:13','18:07','19:16'], // Hari 29
    '2026-03-20': ['04:32','04:42','12:04','15:13','18:07','19:15'], // Hari 30 / Idul Fitri
  };

  /* ── Helper: parse row jadi object terstruktur ── */
  function _parseRow(row) {
    const [im, su, dz, as, ma, is] = row;
    const isH = +is.split(':')[0];
    const isM = +is.split(':')[1];
    const tMin = isM + 20;
    const tH   = isH + Math.floor(tMin / 60);
    const tM   = tMin % 60;
    const tLabel = `${String(tH).padStart(2,'0')}:${String(tM).padStart(2,'0')}`;

    return {
      imsak:   { label: im, h: +im.split(':')[0], m: +im.split(':')[1] },
      subuh:   { label: su, h: +su.split(':')[0], m: +su.split(':')[1] },
      dzuhur:  { label: dz, h: +dz.split(':')[0], m: +dz.split(':')[1] },
      ashar:   { label: as, h: +as.split(':')[0], m: +as.split(':')[1] },
      maghrib: { label: ma, h: +ma.split(':')[0], m: +ma.split(':')[1] },
      isya:    { label: is, h: isH,               m: isM               },
      tarawih: { label: tLabel, h: tH,            m: tM                }
    };
  }

  /* ── Jadwal hari ini ── */
  function getTodaySchedule() {
    const key = dateKey(new Date());
    const row = JADWAL_RAMADAN[key];
    if (row) return _parseRow(row);

    // Fallback kalau di luar range
    return _parseRow(['04:33','04:43','12:07','15:11','18:11','19:20']);
  }

  /* ── Jadwal per tanggal spesifik ── */
  function getScheduleByDate(dateStr) {
    const row = JADWAL_RAMADAN[dateStr];
    return row ? _parseRow(row) : null;
  }

  /* ── Semua jadwal mentah ── */
  function getAllSchedules() { return JADWAL_RAMADAN; }

  /* ── getSholatTimes & SHOLAT_TIMES (kompatibel dg app.js) ── */
  function getSholatTimes() { return getTodaySchedule(); }

  const SHOLAT_TIMES = getTodaySchedule();

  /* ── Public API ── */
  return {
    RAMADAN_START, RAMADAN_END, TOTAL_DAYS,
    dateKey, getRamadanDays, getDayNumber, isRamadanDay, getCurrentDayInRamadan,
    initTracker, getTracker, setIbadah, getDayData, getStats,
    IBADAH_KEYS: ['puasa','subuh','dzuhur','ashar','maghrib','isya','tarawih'],
    getReminders, addReminder, deleteReminder,
    getLastRead, setLastRead,
    getNotifPref, setNotifPref,
    getTodaySchedule, getScheduleByDate, getAllSchedules,
    getSholatTimes, SHOLAT_TIMES,
    JADWAL_RAMADAN
  };
})();

DB.initTracker();
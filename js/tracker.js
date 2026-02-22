/* =============================================
   tracker.js — Ibadah Tracker (Revisi)
   Fix: semua tanggal tampil, warna sage green
   ============================================= */

const Tracker = (() => {

  // Hari mulai Kamis 19 Feb 2026
  const DAYS_ID = [
    'Kamis','Jumat','Sabtu','Minggu','Senin','Selasa','Rabu',
    'Kamis','Jumat','Sabtu','Minggu','Senin','Selasa','Rabu',
    'Kamis','Jumat','Sabtu','Minggu','Senin','Selasa','Rabu',
    'Kamis','Jumat','Sabtu','Minggu','Senin','Selasa','Rabu',
    'Kamis','Jumat'
  ];

  function getDayName(index) { return DAYS_ID[index] || ''; }

  function formatDateShort(date) {
    const d = date.getDate();
    const months = ['','Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
    return `${d} ${months[date.getMonth()+1]}`;
  }

  /* ── Render Tracker Table ── */
  function renderTable() {
    const tbody = document.getElementById('trackerBody');
    if (!tbody) return;

    const days = DB.getRamadanDays();
    const today = new Date();
    today.setHours(0,0,0,0);
    let html = '';

    days.forEach((date, index) => {
      const dk = DB.dateKey(date);
      const dayData = DB.getDayData(dk);

      // FIX: normalize jam ke 0 sebelum compare
      const dateCopy = new Date(date);
      dateCopy.setHours(0,0,0,0);

      const isFuture = dateCopy > today;
      const isToday  = dateCopy.getTime() === today.getTime();
      const isPast   = dateCopy < today;

      let rowBg = '';
      if (isToday) rowBg = 'today-row';

      const cols = ['puasa','subuh','dzuhur','ashar','maghrib','isya','tarawih'];

      // Warna teks tanggal
      let tglColor = 'var(--text-mid)';
      if (isToday) tglColor = 'var(--g-bright)';
      if (isPast)  tglColor = 'var(--text-soft)';

      html += `<tr class="${rowBg}">
        <td style="color:${tglColor}; font-weight:${isToday?800:500}">
          ${formatDateShort(date)}
        </td>
        <td style="color:var(--text-muted); font-size:0.78rem">${getDayName(index)}</td>`;

      cols.forEach(key => {
        const checked = dayData[key];
        // Future = disabled, tapi TETAP tampil (bukan hilang)
        html += `<td>
          <button
            class="tracker-check ${checked ? 'checked' : ''}"
            onclick="Tracker.toggle('${dk}','${key}',this)"
            ${isFuture ? `disabled title="Hari belum tiba" style="opacity:0.35;cursor:not-allowed"` : ''}
          >${checked ? '✓' : ''}</button>
        </td>`;
      });

      html += '</tr>';
    });

    tbody.innerHTML = html;
  }

  /* ── Toggle ── */
  function toggle(dateStr, key, btn) {
    const dayData = DB.getDayData(dateStr);
    const newVal = !dayData[key];
    DB.setIbadah(dateStr, key, newVal);

    if (newVal) {
      btn.classList.add('checked');
      btn.textContent = '✓';
      showToast('✅ ' + key.charAt(0).toUpperCase() + key.slice(1) + ' dicatat!');
    } else {
      btn.classList.remove('checked');
      btn.textContent = '';
      showToast('↩️ ' + key.charAt(0).toUpperCase() + key.slice(1) + ' dibatalkan');
    }

    updateDashboardStats();
    updateDonut();
  }

  /* ── Dashboard Stats ── */
  function updateDashboardStats() {
    const stats = DB.getStats();

    const els = {
      sumPuasa:    document.getElementById('sumPuasa'),
      sumSholat:   document.getElementById('sumSholat'),
      sumSholatMax:document.getElementById('sumSholatMax'),
      sumTarawih:  document.getElementById('sumTarawih'),
      barPuasa:    document.getElementById('barPuasa'),
      barSholat:   document.getElementById('barSholat'),
      barTarawih:  document.getElementById('barTarawih'),
      pctPuasa:    document.getElementById('pctPuasa'),
      pctSholat:   document.getElementById('pctSholat'),
      pctTarawih:  document.getElementById('pctTarawih'),
    };

    if (els.sumPuasa)    els.sumPuasa.textContent    = stats.totalPuasa;
    if (els.sumSholat)   els.sumSholat.textContent   = stats.totalSholat;
    if (els.sumSholatMax)els.sumSholatMax.textContent= stats.maxSholat;
    if (els.sumTarawih)  els.sumTarawih.textContent  = stats.totalTarawih;
    if (els.barPuasa)    els.barPuasa.style.width    = stats.pctPuasa   + '%';
    if (els.barSholat)   els.barSholat.style.width   = stats.pctSholat  + '%';
    if (els.barTarawih)  els.barTarawih.style.width  = stats.pctTarawih + '%';
    if (els.pctPuasa)    els.pctPuasa.textContent    = stats.pctPuasa   + '%';
    if (els.pctSholat)   els.pctSholat.textContent   = stats.pctSholat  + '%';
    if (els.pctTarawih)  els.pctTarawih.textContent  = stats.pctTarawih + '%';
  }

  /* ── Donut ── */
  function updateDonut() {
    const stats = DB.getStats();
    const pct  = stats.overall;
    const circ = 2 * Math.PI * 80;
    const donutFill = document.getElementById('donutFill');
    const overallPct = document.getElementById('overallPct');
    if (donutFill) {
      const filled = (pct / 100) * circ;
      donutFill.setAttribute('stroke-dasharray', `${filled} ${circ - filled}`);
    }
    if (overallPct) overallPct.textContent = pct + '%';
    ensureGradientDef();
  }

  function ensureGradientDef() {
    const svg = document.querySelector('.donut-svg');
    if (!svg || svg.querySelector('defs')) return;
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="donutGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#00C853"/>
        <stop offset="50%"  stop-color="#00E676"/>
        <stop offset="100%" stop-color="#1DE9B6"/>
      </linearGradient>`;
    svg.insertBefore(defs, svg.firstChild);
    const fill = document.getElementById('donutFill');
    if (fill) fill.setAttribute('stroke', 'url(#donutGrad)');
  }

  function init() {
    renderTable();
    updateDashboardStats();
    updateDonut();
  }

  return { init, renderTable, toggle, updateDashboardStats, updateDonut };
})();
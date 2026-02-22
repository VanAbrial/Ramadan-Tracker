/* =============================================
   quran.js — Al-Qur'an Digital (Revisi)
   + Transliterasi Latin setiap ayat
   ============================================= */

const QuranApp = (() => {

  const API_BASE = 'https://api.alquran.cloud/v1';
  let activeTab = 'surah';
  let currentSurah = null;
  let currentJuz = null;

  /* ── Surah Metadata ── */
  const SURAH_META = [
    {n:1,name:'Al-Fatihah',arabic:'الفاتحة',meaning:'Pembuka',ayat:7,type:'Makkiyyah'},
    {n:2,name:'Al-Baqarah',arabic:'البقرة',meaning:'Sapi Betina',ayat:286,type:'Madaniyyah'},
    {n:3,name:'Ali Imran',arabic:'آل عمران',meaning:'Keluarga Imran',ayat:200,type:'Madaniyyah'},
    {n:4,name:'An-Nisa',arabic:'النساء',meaning:'Wanita',ayat:176,type:'Madaniyyah'},
    {n:5,name:'Al-Maidah',arabic:'المائدة',meaning:'Jamuan Makan',ayat:120,type:'Madaniyyah'},
    {n:6,name:'Al-Anam',arabic:'الأنعام',meaning:'Binatang Ternak',ayat:165,type:'Makkiyyah'},
    {n:7,name:'Al-Araf',arabic:'الأعراف',meaning:'Tempat Tertinggi',ayat:206,type:'Makkiyyah'},
    {n:8,name:'Al-Anfal',arabic:'الأنفال',meaning:'Rampasan Perang',ayat:75,type:'Madaniyyah'},
    {n:9,name:'At-Taubah',arabic:'التوبة',meaning:'Pengampunan',ayat:129,type:'Madaniyyah'},
    {n:10,name:'Yunus',arabic:'يونس',meaning:'Yunus',ayat:109,type:'Makkiyyah'},
    {n:11,name:'Hud',arabic:'هود',meaning:'Hud',ayat:123,type:'Makkiyyah'},
    {n:12,name:'Yusuf',arabic:'يوسف',meaning:'Yusuf',ayat:111,type:'Makkiyyah'},
    {n:13,name:'Ar-Rad',arabic:'الرعد',meaning:'Guruh',ayat:43,type:'Madaniyyah'},
    {n:14,name:'Ibrahim',arabic:'إبراهيم',meaning:'Ibrahim',ayat:52,type:'Makkiyyah'},
    {n:15,name:'Al-Hijr',arabic:'الحجر',meaning:'Batu Besar',ayat:99,type:'Makkiyyah'},
    {n:16,name:'An-Nahl',arabic:'النحل',meaning:'Lebah',ayat:128,type:'Makkiyyah'},
    {n:17,name:'Al-Isra',arabic:'الإسراء',meaning:'Perjalanan Malam',ayat:111,type:'Makkiyyah'},
    {n:18,name:'Al-Kahf',arabic:'الكهف',meaning:'Gua',ayat:110,type:'Makkiyyah'},
    {n:19,name:'Maryam',arabic:'مريم',meaning:'Maryam',ayat:98,type:'Makkiyyah'},
    {n:20,name:'Taha',arabic:'طه',meaning:'Taha',ayat:135,type:'Makkiyyah'},
    {n:21,name:'Al-Anbiya',arabic:'الأنبياء',meaning:'Para Nabi',ayat:112,type:'Makkiyyah'},
    {n:22,name:'Al-Haj',arabic:'الحج',meaning:'Haji',ayat:78,type:'Madaniyyah'},
    {n:23,name:'Al-Muminun',arabic:'المؤمنون',meaning:'Orang Beriman',ayat:118,type:'Makkiyyah'},
    {n:24,name:'An-Nur',arabic:'النور',meaning:'Cahaya',ayat:64,type:'Madaniyyah'},
    {n:25,name:'Al-Furqan',arabic:'الفرقان',meaning:'Pembeda',ayat:77,type:'Makkiyyah'},
    {n:26,name:'Asy-Syuara',arabic:'الشعراء',meaning:'Penyair',ayat:227,type:'Makkiyyah'},
    {n:27,name:'An-Naml',arabic:'النمل',meaning:'Semut',ayat:93,type:'Makkiyyah'},
    {n:28,name:'Al-Qasas',arabic:'القصص',meaning:'Cerita',ayat:88,type:'Makkiyyah'},
    {n:29,name:'Al-Ankabut',arabic:'العنكبوت',meaning:'Laba-laba',ayat:69,type:'Makkiyyah'},
    {n:30,name:'Ar-Rum',arabic:'الروم',meaning:'Bangsa Romawi',ayat:60,type:'Makkiyyah'},
    {n:31,name:'Luqman',arabic:'لقمان',meaning:'Luqman',ayat:34,type:'Makkiyyah'},
    {n:32,name:'As-Sajdah',arabic:'السجدة',meaning:'Sujud',ayat:30,type:'Makkiyyah'},
    {n:33,name:'Al-Ahzab',arabic:'الأحزاب',meaning:'Golongan Bersekutu',ayat:73,type:'Madaniyyah'},
    {n:34,name:'Saba',arabic:'سبأ',meaning:'Saba',ayat:54,type:'Makkiyyah'},
    {n:35,name:'Fatir',arabic:'فاطر',meaning:'Pencipta',ayat:45,type:'Makkiyyah'},
    {n:36,name:'Yasin',arabic:'يس',meaning:'Ya Sin',ayat:83,type:'Makkiyyah'},
    {n:37,name:'As-Saffat',arabic:'الصافات',meaning:'Yang Bershaf-shaf',ayat:182,type:'Makkiyyah'},
    {n:38,name:'Sad',arabic:'ص',meaning:'Sad',ayat:88,type:'Makkiyyah'},
    {n:39,name:'Az-Zumar',arabic:'الزمر',meaning:'Rombongan',ayat:75,type:'Makkiyyah'},
    {n:40,name:'Ghafir',arabic:'غافر',meaning:'Yang Maha Pengampun',ayat:85,type:'Makkiyyah'},
    {n:41,name:'Fussilat',arabic:'فصلت',meaning:'Yang Dijelaskan',ayat:54,type:'Makkiyyah'},
    {n:42,name:'Asy-Syura',arabic:'الشورى',meaning:'Musyawarah',ayat:53,type:'Makkiyyah'},
    {n:43,name:'Az-Zukhruf',arabic:'الزخرف',meaning:'Perhiasan',ayat:89,type:'Makkiyyah'},
    {n:44,name:'Ad-Dukhan',arabic:'الدخان',meaning:'Kabut',ayat:59,type:'Makkiyyah'},
    {n:45,name:'Al-Jasiyah',arabic:'الجاثية',meaning:'Yang Berlutut',ayat:37,type:'Makkiyyah'},
    {n:46,name:'Al-Ahqaf',arabic:'الأحقاف',meaning:'Bukit Pasir',ayat:35,type:'Makkiyyah'},
    {n:47,name:'Muhammad',arabic:'محمد',meaning:'Muhammad',ayat:38,type:'Madaniyyah'},
    {n:48,name:'Al-Fath',arabic:'الفتح',meaning:'Kemenangan',ayat:29,type:'Madaniyyah'},
    {n:49,name:'Al-Hujurat',arabic:'الحجرات',meaning:'Kamar',ayat:18,type:'Madaniyyah'},
    {n:50,name:'Qaf',arabic:'ق',meaning:'Qaf',ayat:45,type:'Makkiyyah'},
    {n:51,name:'Az-Zariyat',arabic:'الذاريات',meaning:'Angin Menerbangkan',ayat:60,type:'Makkiyyah'},
    {n:52,name:'At-Tur',arabic:'الطور',meaning:'Bukit',ayat:49,type:'Makkiyyah'},
    {n:53,name:'An-Najm',arabic:'النجم',meaning:'Bintang',ayat:62,type:'Makkiyyah'},
    {n:54,name:'Al-Qamar',arabic:'القمر',meaning:'Bulan',ayat:55,type:'Makkiyyah'},
    {n:55,name:'Ar-Rahman',arabic:'الرحمن',meaning:'Yang Maha Pengasih',ayat:78,type:'Madaniyyah'},
    {n:56,name:'Al-Waqiah',arabic:'الواقعة',meaning:'Hari Kiamat',ayat:96,type:'Makkiyyah'},
    {n:57,name:'Al-Hadid',arabic:'الحديد',meaning:'Besi',ayat:29,type:'Madaniyyah'},
    {n:58,name:'Al-Mujadilah',arabic:'المجادلة',meaning:'Wanita Menggugat',ayat:22,type:'Madaniyyah'},
    {n:59,name:'Al-Hasyr',arabic:'الحشر',meaning:'Pengusiran',ayat:24,type:'Madaniyyah'},
    {n:60,name:'Al-Mumtahanah',arabic:'الممتحنة',meaning:'Wanita Yang Diuji',ayat:13,type:'Madaniyyah'},
    {n:61,name:'As-Saf',arabic:'الصف',meaning:'Barisan',ayat:14,type:'Madaniyyah'},
    {n:62,name:'Al-Jumuah',arabic:'الجمعة',meaning:'Jumat',ayat:11,type:'Madaniyyah'},
    {n:63,name:'Al-Munafiqun',arabic:'المنافقون',meaning:'Orang Munafik',ayat:11,type:'Madaniyyah'},
    {n:64,name:'At-Tagabun',arabic:'التغابن',meaning:'Penyesalan',ayat:18,type:'Madaniyyah'},
    {n:65,name:'At-Talaq',arabic:'الطلاق',meaning:'Talak',ayat:12,type:'Madaniyyah'},
    {n:66,name:'At-Tahrim',arabic:'التحريم',meaning:'Mengharamkan',ayat:12,type:'Madaniyyah'},
    {n:67,name:'Al-Mulk',arabic:'الملك',meaning:'Kerajaan',ayat:30,type:'Makkiyyah'},
    {n:68,name:'Al-Qalam',arabic:'القلم',meaning:'Pena',ayat:52,type:'Makkiyyah'},
    {n:69,name:'Al-Haqqah',arabic:'الحاقة',meaning:'Hari Kiamat',ayat:52,type:'Makkiyyah'},
    {n:70,name:'Al-Maarij',arabic:'المعارج',meaning:'Tempat Naik',ayat:44,type:'Makkiyyah'},
    {n:71,name:'Nuh',arabic:'نوح',meaning:'Nuh',ayat:28,type:'Makkiyyah'},
    {n:72,name:'Al-Jin',arabic:'الجن',meaning:'Jin',ayat:28,type:'Makkiyyah'},
    {n:73,name:'Al-Muzzammil',arabic:'المزمل',meaning:'Orang Berselimut',ayat:20,type:'Makkiyyah'},
    {n:74,name:'Al-Muddassir',arabic:'المدثر',meaning:'Orang Berkemul',ayat:56,type:'Makkiyyah'},
    {n:75,name:'Al-Qiyamah',arabic:'القيامة',meaning:'Hari Kiamat',ayat:40,type:'Makkiyyah'},
    {n:76,name:'Al-Insan',arabic:'الإنسان',meaning:'Manusia',ayat:31,type:'Madaniyyah'},
    {n:77,name:'Al-Mursalat',arabic:'المرسلات',meaning:'Yang Diutus',ayat:50,type:'Makkiyyah'},
    {n:78,name:'An-Naba',arabic:'النبأ',meaning:'Berita Besar',ayat:40,type:'Makkiyyah'},
    {n:79,name:'An-Naziat',arabic:'النازعات',meaning:'Malaikat Mencabut',ayat:46,type:'Makkiyyah'},
    {n:80,name:'Abasa',arabic:'عبس',meaning:'Bermuka Masam',ayat:42,type:'Makkiyyah'},
    {n:81,name:'At-Takwir',arabic:'التكوير',meaning:'Tergulung',ayat:29,type:'Makkiyyah'},
    {n:82,name:'Al-Infitar',arabic:'الانفطار',meaning:'Terbelah',ayat:19,type:'Makkiyyah'},
    {n:83,name:'Al-Mutaffifin',arabic:'المطففين',meaning:'Orang Yang Curang',ayat:36,type:'Makkiyyah'},
    {n:84,name:'Al-Insyiqaq',arabic:'الانشقاق',meaning:'Terbelah',ayat:25,type:'Makkiyyah'},
    {n:85,name:'Al-Buruj',arabic:'البروج',meaning:'Gugusan Bintang',ayat:22,type:'Makkiyyah'},
    {n:86,name:'At-Tariq',arabic:'الطارق',meaning:'Yang Datang Malam',ayat:17,type:'Makkiyyah'},
    {n:87,name:'Al-Ala',arabic:'الأعلى',meaning:'Yang Paling Tinggi',ayat:19,type:'Makkiyyah'},
    {n:88,name:'Al-Ghasyiyah',arabic:'الغاشية',meaning:'Hari Pembalasan',ayat:26,type:'Makkiyyah'},
    {n:89,name:'Al-Fajr',arabic:'الفجر',meaning:'Fajar',ayat:30,type:'Makkiyyah'},
    {n:90,name:'Al-Balad',arabic:'البلد',meaning:'Negeri',ayat:20,type:'Makkiyyah'},
    {n:91,name:'Asy-Syams',arabic:'الشمس',meaning:'Matahari',ayat:15,type:'Makkiyyah'},
    {n:92,name:'Al-Lail',arabic:'الليل',meaning:'Malam',ayat:21,type:'Makkiyyah'},
    {n:93,name:'Ad-Duha',arabic:'الضحى',meaning:'Waktu Duha',ayat:11,type:'Makkiyyah'},
    {n:94,name:'Al-Insyirah',arabic:'الشرح',meaning:'Kelapangan',ayat:8,type:'Makkiyyah'},
    {n:95,name:'At-Tin',arabic:'التين',meaning:'Buah Tin',ayat:8,type:'Makkiyyah'},
    {n:96,name:'Al-Alaq',arabic:'العلق',meaning:'Segumpal Darah',ayat:19,type:'Makkiyyah'},
    {n:97,name:'Al-Qadr',arabic:'القدر',meaning:'Kemuliaan',ayat:5,type:'Makkiyyah'},
    {n:98,name:'Al-Bayyinah',arabic:'البينة',meaning:'Bukti Yang Nyata',ayat:8,type:'Madaniyyah'},
    {n:99,name:'Az-Zalzalah',arabic:'الزلزلة',meaning:'Gempa Bumi',ayat:8,type:'Madaniyyah'},
    {n:100,name:'Al-Adiyat',arabic:'العاديات',meaning:'Kuda Perang',ayat:11,type:'Makkiyyah'},
    {n:101,name:'Al-Qariah',arabic:'القارعة',meaning:'Hari Kiamat',ayat:11,type:'Makkiyyah'},
    {n:102,name:'At-Takasur',arabic:'التكاثur',meaning:'Bermegah-megahan',ayat:8,type:'Makkiyyah'},
    {n:103,name:'Al-Asr',arabic:'العصر',meaning:'Waktu Ashar',ayat:3,type:'Makkiyyah'},
    {n:104,name:'Al-Humazah',arabic:'الهمزة',meaning:'Pengumpat',ayat:9,type:'Makkiyyah'},
    {n:105,name:'Al-Fil',arabic:'الفيل',meaning:'Gajah',ayat:5,type:'Makkiyyah'},
    {n:106,name:'Quraisy',arabic:'قريش',meaning:'Suku Quraisy',ayat:4,type:'Makkiyyah'},
    {n:107,name:'Al-Maun',arabic:'الماعون',meaning:'Barang Berguna',ayat:7,type:'Makkiyyah'},
    {n:108,name:'Al-Kausar',arabic:'الكوثر',meaning:'Nikmat Yang Banyak',ayat:3,type:'Makkiyyah'},
    {n:109,name:'Al-Kafirun',arabic:'الكافرون',meaning:'Orang Kafir',ayat:6,type:'Makkiyyah'},
    {n:110,name:'An-Nasr',arabic:'النصر',meaning:'Pertolongan',ayat:3,type:'Madaniyyah'},
    {n:111,name:'Al-Lahab',arabic:'المسد',meaning:'Gejolak Api',ayat:5,type:'Makkiyyah'},
    {n:112,name:'Al-Ikhlas',arabic:'الإخلاص',meaning:'Ikhlas',ayat:4,type:'Makkiyyah'},
    {n:113,name:'Al-Falaq',arabic:'الفلق',meaning:'Waktu Subuh',ayat:5,type:'Makkiyyah'},
    {n:114,name:'An-Nas',arabic:'الناس',meaning:'Manusia',ayat:6,type:'Makkiyyah'}
  ];

  /* ── Render Surah List ── */
  function renderSurahList(filter = '') {
    const el = document.getElementById('surahList');
    if (!el) return;
    const filtered = SURAH_META.filter(s =>
      s.name.toLowerCase().includes(filter.toLowerCase()) ||
      s.meaning.toLowerCase().includes(filter.toLowerCase()) ||
      String(s.n).includes(filter)
    );
    el.innerHTML = filtered.map(s => `
      <div class="surah-item ${currentSurah === s.n ? 'active' : ''}"
           onclick="QuranApp.loadSurah(${s.n})">
        <div class="surah-num">${s.n}</div>
        <div class="surah-info">
          <div class="s-name">${s.name}</div>
          <div class="s-meaning">${s.meaning} · ${s.ayat} ayat</div>
        </div>
        <span class="surah-arabic">${s.arabic}</span>
      </div>`).join('');
  }

  /* ── Render Juz List ── */
  function renderJuzList() {
    const el = document.getElementById('juzList');
    if (!el) return;
    let html = '';
    for (let i = 1; i <= 30; i++) {
      html += `
        <div class="juz-item ${currentJuz === i ? 'active' : ''}"
             onclick="QuranApp.loadJuz(${i})">
          <div class="surah-num">${i}</div>
          <div class="surah-info">
            <div class="s-name">Juz ${i}</div>
            <div class="s-meaning">Juz ke-${i} dari 30</div>
          </div>
          <span class="surah-arabic" style="font-family:serif;font-size:0.85rem">${i}</span>
        </div>`;
    }
    el.innerHTML = html;
  }

  /* ── Build Ayat HTML (Arab + Latin + Terjemah) ── */
  function buildAyatHTML(arabicAyah, latinAyah, transAyah) {
    const arabText  = arabicAyah ? arabicAyah.text : '';
    const num       = arabicAyah ? arabicAyah.numberInSurah : '';
    const latinText = latinAyah  ? latinAyah.text  : '';
    const transText = transAyah  ? transAyah.text  : '';

    return `
      <div class="ayat-item">
        <div class="ayat-arabic">
          ${arabText}
          <span class="ayat-num">${num}</span>
        </div>
        ${latinText ? `<div class="ayat-latin">📖 ${latinText}</div>` : ''}
        ${transText ? `<div class="ayat-translation">${transText}</div>` : ''}
      </div>`;
  }

  /* ── Load Surah ── */
  async function loadSurah(num) {
    currentSurah = num;
    renderSurahList();

    const reader = document.getElementById('surahReader');
    if (!reader) return;

    const meta = SURAH_META.find(s => s.n === num);
    if (!meta) return;

    reader.innerHTML = `<div class="reader-loading"><div class="loading-spinner"></div>Memuat ${meta.name}...</div>`;
    DB.setLastRead({ type: 'surah', num, name: meta.name });

    try {
      const [arabRes, latinRes, transRes] = await Promise.all([
        fetch(`${API_BASE}/surah/${num}`),
        fetch(`${API_BASE}/surah/${num}/en.transliteration`),
        fetch(`${API_BASE}/surah/${num}/id.indonesian`)
      ]);

      const arabData  = await arabRes.json();
      const latinData = await latinRes.json();
      const transData = await transRes.json();

      if (arabData.code !== 200) throw new Error('Gagal memuat data Arab');

      const ayahs  = arabData.data.ayahs;
      const latins = latinData.data?.ayahs || [];
      const transl = transData.data?.ayahs || [];

      const hasBismillah = num !== 1 && num !== 9;

      let html = `
        <div class="quran-reader-header">
          <div class="reader-surah-arabic">${meta.arabic}</div>
          <div class="reader-surah-name">${meta.name}</div>
          <div class="reader-surah-meta">${meta.meaning} · ${meta.ayat} Ayat · ${meta.type}</div>
        </div>
        ${hasBismillah ? '<div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>' : ''}`;

      ayahs.forEach((ayah, i) => {
        html += buildAyatHTML(ayah, latins[i], transl[i]);
      });

      reader.innerHTML = html;

    } catch (err) {
      reader.innerHTML = errorHTML(num, 'surah', err.message);
    }
  }

  /* ── Load Juz ── */
  async function loadJuz(num) {
    currentJuz = num;
    renderJuzList();

    const reader = document.getElementById('juzReader');
    if (!reader) return;

    reader.innerHTML = `<div class="reader-loading"><div class="loading-spinner"></div>Memuat Juz ${num}...</div>`;
    DB.setLastRead({ type: 'juz', num });

    try {
      const [arabRes, latinRes, transRes] = await Promise.all([
        fetch(`${API_BASE}/juz/${num}/quran-uthmani`),
        fetch(`${API_BASE}/juz/${num}/en.transliteration`),
        fetch(`${API_BASE}/juz/${num}/id.indonesian`)
      ]);

      const arabData  = await arabRes.json();
      const latinData = await latinRes.json();
      const transData = await transRes.json();

      if (arabData.code !== 200) throw new Error('Gagal memuat Juz');

      const ayahs  = arabData.data.ayahs;
      const latins = latinData.data?.ayahs || [];
      const transl = transData.data?.ayahs || [];

      let html = `
        <div class="quran-reader-header">
          <div class="reader-surah-name">Juz ${num}</div>
          <div class="reader-surah-meta">${ayahs.length} Ayat</div>
        </div>`;

      let lastSurahNum = null;
      ayahs.forEach((ayah, i) => {
        if (ayah.surah?.number !== lastSurahNum) {
          lastSurahNum = ayah.surah?.number;
          const sm = SURAH_META.find(s => s.n === lastSurahNum);
          if (sm) {
            /* ── FIX: Warna header surah disesuaikan ke sage green ── */
            html += `
              <div style="text-align:center;padding:0.9rem 0;margin:0.9rem 0;border-top:1px solid rgba(168,197,160,0.35);border-bottom:1px solid rgba(168,197,160,0.20)">
                <div style="font-family:'Amiri',serif;font-size:1.3rem;color:#4A7A40">${sm.arabic}</div>
                <div style="font-size:0.85rem;color:#2D5035;font-weight:700">${sm.name} · Surah ${sm.n}</div>
              </div>`;
          }
        }
        html += buildAyatHTML(ayah, latins[i], transl[i]);
      });

      reader.innerHTML = html;

    } catch (err) {
      reader.innerHTML = errorHTML(num, 'juz', err.message);
    }
  }

  /* ── Error UI ── */
  function errorHTML(num, type, msg) {
    return `
      <div style="text-align:center;padding:3rem;color:var(--text-muted)">
        <div style="font-size:2.2rem;margin-bottom:0.9rem">📡</div>
        <p style="margin-bottom:0.4rem">Gagal memuat data. Periksa koneksi internet.</p>
        <p style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem">${msg}</p>
        <button class="btn-glass" onclick="QuranApp.${type === 'surah' ? 'loadSurah' : 'loadJuz'}(${num})">🔄 Coba Lagi</button>
      </div>`;
  }

  /* ── Switch Tabs ── */
  function switchTab(tab) {
    activeTab = tab;
    document.getElementById('panel-surah').classList.toggle('hidden', tab !== 'surah');
    document.getElementById('panel-juz').classList.toggle('hidden', tab !== 'juz');
    document.getElementById('tab-surah').classList.toggle('active', tab === 'surah');
    document.getElementById('tab-juz').classList.toggle('active', tab === 'juz');
  }

  /* ── Init ── */
  function init() {
    renderSurahList();
    renderJuzList();

    const search = document.getElementById('surahSearch');
    if (search) search.addEventListener('input', e => renderSurahList(e.target.value));

    const last = DB.getLastRead();
    if (last) {
      if (last.type === 'surah') loadSurah(last.num);
      else if (last.type === 'juz') { switchTab('juz'); loadJuz(last.num); }
    }
  }

  return { init, loadSurah, loadJuz, switchTab, SURAH_META };
})();

function switchQuranTab(tab) { QuranApp.switchTab(tab); }
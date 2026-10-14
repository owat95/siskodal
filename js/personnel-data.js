/* ============================================================
 * PERSONNEL-DATA.JS â€” Database personel 3 matra (50 each)
 * Enriched: province, education, international, karier
 * ============================================================ */

const PersonnelData = (() => {
  'use strict';

  // ============================================
  // PROVINSI (38 provinsi Indonesia)
  // ============================================
  const PROVINCES = [
    'Aceh','Sumatera Utara','Sumatera Barat','Riau','Kepulauan Riau',
    'Jambi','Bengkulu','Sumatera Selatan','Bangka Belitung','Lampung',
    'Banten','DKI Jakarta','Jawa Barat','Jawa Tengah','DI Yogyakarta',
    'Jawa Timur','Bali','Nusa Tenggara Barat','Nusa Tenggara Timur',
    'Kalimantan Barat','Kalimantan Tengah','Kalimantan Selatan',
    'Kalimantan Timur','Kalimantan Utara','Sulawesi Utara','Sulawesi Tengah',
    'Sulawesi Selatan','Sulawesi Tenggara','Gorontalo','Sulawesi Barat',
    'Maluku','Maluku Utara','Papua','Papua Barat','Papua Selatan',
    'Papua Tengah','Papua Pegunungan','Papua Barat Daya'
  ];

  // ============================================
  // PANGKAT + RANKS
  // ============================================
  const RANKS = {
    ad: ['PRADA','PRATU','KOPDA','KOPTU','KOPKA','SERMA','PELDA','PELTU',
         'LETDA','LETTU','KAPTEN','MAYOR','LETKOL','KOLONEL'],
    al: ['KELASI','KOPRAL','SERSAN','SERKA','SERMA','LETDA','LETTU',
         'KAPTEN','MAYOR','LETKOL','KOLONEL'],
    au: ['PRADA','PRATU','KOPDA','KOPTU','KOPKA','SERMA','PELDA','PELTU',
         'LETDA','LETTU','KAPTEN','MAYOR','LETKOL','KOLONEL']
  };

  // ============================================
  // UNIT PER MATRA
  // ============================================
  const UNITS = {
    ad: ['Kodam Jaya','Kodam III/Siliwangi','Kodam IV/Diponegoro','Kodam V/Brawijaya',
         'Kodam I/Bukit Barisan','Kodam II/Sriwijaya','Kodam VI/Mulawarman',
         'Kodam VII/Wirabuana','Kodam XVI/Pattimura','Kodam XVII/Cenderawasih',
         'Kostrad','Kopassus','Batalyon Infanteri 315','Batalyon Kavaleri 4',
         'Batalyon Artileri 15','Pusdikif','Pusdikkav'],
    al: ['Lantamal I Belawan','Lantamal II Padang','Lantamal III Jakarta',
         'Lantamal IV Tanjungpinang','Lantamal V Surabaya','Lantamal VI Makassar',
         'Lantamal VII Kupang','Lantamal VIII Manado','Lantamal IX Ambon',
         'Lantamal X Jayapura','Lantamal XI Merauke','Lantamal XII Pontianak',
         'Koarmada I','Koarmada II','Koarmada III','Kormar','Kopaska','Denjaka',
         'Skuadron 11','Skuadron 21','Skuadron 31'],
    au: ['Lanud Halim PK','Lanud Iswahjudi','Lanud Hasanuddin','Lanud Adisutjipto',
         'Lanud Sultan Iskandar Muda','Lanud Sam Ratulangi','Lanud Supadio',
         'Lanud Abdulrachman Saleh','Lanud Sultan Hasanuddin',
         'Skadron Udara 3','Skadron Udara 11','Skadron Udara 15',
         'Skadron Udara 17','Skadron Udara 31','Skadron Teknik 021',
         'Kosekhanudnas I','Kosekhanudnas II','Kosekhanudnas III','Kopasgat']
  };

  // ============================================
  // SPECIALTY PER MATRA
  // ============================================
  const SPECIALTIES = {
    ad: ['INFANTERI','KAVALERI','ARTILERI','KOPASSUS','ZENI','PERHUBUNGAN',
         'INTEL','KESEHATAN','LOGISTIK','POLISI MILITER'],
    al: ['PELAUT','SELAM','MARINIR','KOPASKA','DENJAKA','TEKNIK','INTEL',
         'KESEHATAN','LOGISTIK','PENERBANG'],
    au: ['PENERBANG','RADAR','TEKNISI','PSU','KOPASGAT','INTEL','KESEHATAN',
         'LOGISTIK','KOMANDO','PENERBANG HELI']
  };

  // ============================================
  // PENDIDIKAN MILITER (per matra)
  // ============================================
  const EDUCATION = {
    ad: [
      { code: 'AKMIL', name: 'Akademi Militer', tier: 1, minRank: 0 },
      { code: 'SUSJAB', name: 'Kursus Jabatan', tier: 1, minRank: 3 },
      { code: 'SELAPA', name: 'Sekolah Lanjutan Perwira', tier: 2, minRank: 8 },
      { code: 'SESKOAD', name: 'Sekolah Staf Komando AD', tier: 2, minRank: 11 },
      { code: 'SESKOTNI', name: 'Sekolah Staf Komando TNI', tier: 2, minRank: 13 },
      { code: 'LEMHANNAS', name: 'Lemhannas RI', tier: 3, minRank: 14 },
      { code: 'SUSPA_INTEL', name: 'Suspa Intelijen', tier: 2, minRank: 9 },
      { code: 'SUSPA_KAV', name: 'Suspa Kavaleri', tier: 2, minRank: 7 },
      { code: 'SUSPA_ART', name: 'Suspa Artileri', tier: 2, minRank: 7 },
      { code: 'SUSPA_KOPASSUS', name: 'Komando Pasukan Khusus', tier: 2, minRank: 6 }
    ],
    al: [
      { code: 'AAL', name: 'Akademi Angkatan Laut', tier: 1, minRank: 0 },
      { code: 'SUSJAB', name: 'Kursus Jabatan', tier: 1, minRank: 3 },
      { code: 'SESKOAL', name: 'Sekolah Staf Komando AL', tier: 2, minRank: 9 },
      { code: 'SESKOTNI', name: 'Sekolah Staf Komando TNI', tier: 2, minRank: 12 },
      { code: 'LEMHANNAS', name: 'Lemhannas RI', tier: 3, minRank: 13 },
      { code: 'SESKO_SELAM', name: 'Sekolah Selam', tier: 2, minRank: 5 },
      { code: 'SESKO_MARINIR', name: 'Sekolah Marinir', tier: 2, minRank: 6 },
      { code: 'KOPASKA_TR', name: 'Kopaska Training', tier: 2, minRank: 4 },
      { code: 'SESKO_PENERBANG', name: 'Sekolah Penerbang AL', tier: 2, minRank: 6 }
    ],
    au: [
      { code: 'AAU', name: 'Akademi Angkatan Udara', tier: 1, minRank: 0 },
      { code: 'SUSJAB', name: 'Kursus Jabatan', tier: 1, minRank: 3 },
      { code: 'SEKOLAH_PENERBANG', name: 'Sekolah Penerbang', tier: 2, minRank: 5 },
      { code: 'SESKOAU', name: 'Sekolah Staf Komando AU', tier: 2, minRank: 9 },
      { code: 'SESKOTNI', name: 'Sekolah Staf Komando TNI', tier: 2, minRank: 12 },
      { code: 'LEMHANNAS', name: 'Lemhannas RI', tier: 3, minRank: 13 },
      { code: 'SESKO_RADAR', name: 'Sekolah Radar', tier: 2, minRank: 5 },
      { code: 'SESKO_TEKNIK', name: 'Sekolah Teknik AU', tier: 2, minRank: 6 },
      { code: 'KOPASGAT_TR', name: 'Kopasgat Training', tier: 2, minRank: 4 },
      { code: 'SUSPA_INTEL', name: 'Suspa Intelijen', tier: 2, minRank: 8 }
    ]
  };

  // ============================================
  // MISI INTERNASIONAL
  // ============================================
  const INTL_MISSIONS = [
    { code: 'MONUSCO', name: 'PBB MONUSCO', location: 'Congo', role: 'Military Observer', duration: 24 },
    { code: 'UNIFIL', name: 'PBB UNIFIL', location: 'Lebanon', role: 'Battalion Staff', duration: 12 },
    { code: 'MINUSMA', name: 'PBB MINUSMA', location: 'Mali', role: 'Logistics Officer', duration: 18 },
    { code: 'UNMISS', name: 'PBB UNMISS', location: 'South Sudan', role: 'Intelligence Officer', duration: 12 },
    { code: 'UNTSO', name: 'PBB UNTSO', location: 'Middle East', role: 'Observer', duration: 12 },
    { code: 'GARUDA_SHIELD', name: 'Garuda Shield', location: 'Hawaii, USA', role: 'Exercise Observer', duration: 2 },
    { code: 'COBRA_GOLD', name: 'Cobra Gold', location: 'Thailand', role: 'Combined Staff', duration: 2 },
    { code: 'MALINDO', name: 'Latma Malindo', location: 'Malaysia', role: 'Liaison Officer', duration: 1 },
    { code: 'RIMPAC', name: 'RIMPAC', location: 'Hawaii, USA', role: 'Naval Observer', duration: 2 },
    { code: 'INDO_US_NAVAL', name: 'Indo-US Naval Exercise', location: 'Jakarta', role: 'Exercise Planner', duration: 1 },
    { code: 'OBSERVER_IRAN', name: 'Observer Mission', location: 'Iran', role: 'Military AttachÃ© Support', duration: 6 },
    { code: 'DPKO_NY', name: 'DPKO Assignment', location: 'New York, USA', role: 'Staff Officer', duration: 24 }
  ];

  // ============================================
  // POSISI TERBUKA (untuk AI Succession)
  // ============================================
  const OPEN_POSITIONS = {
    ad: [
      { position: 'Danyonif 315/Garuda', province: 'Papua', currentHolder: 'Letkol Joko Kusuma', reason: 'Pensiun 6 bulan', neededRank: 'LETKOL', minKpi: 80 },
      { position: 'Dandim 1701/Jayapura', province: 'Papua', currentHolder: 'Letkol Andi Wijaya', reason: 'Pensiun 8 bulan', neededRank: 'LETKOL', minKpi: 78 },
      { position: 'Kasi Intel Korem 172', province: 'Papua Barat', currentHolder: 'Mayor Bambang', reason: 'Mutasi', neededRank: 'MAYOR', minKpi: 75 },
      { position: 'Danyonkav 4/Como', province: 'Papua Tengah', currentHolder: 'Letkol Suryo', reason: 'Pensiun 10 bulan', neededRank: 'LETKOL', minKpi: 80 },
      { position: 'Danyon Armed 15/YC', province: 'Papua Pegunungan', currentHolder: 'Letkol Rahman', reason: 'Tugas Luar Negeri', neededRank: 'LETKOL', minKpi: 82 }
    ],
    al: [
      { position: 'Komandan KRI Diponegoro', province: 'Papua', currentHolder: 'Letkol Laut Budi', reason: 'Pensiun 6 bulan', neededRank: 'LETKOL', minKpi: 80 },
      { position: 'Danlanal Biak', province: 'Papua', currentHolder: 'Kolonel Laut Hendra', reason: 'Pensiun 10 bulan', neededRank: 'KOLONEL', minKpi: 82 },
      { position: 'Dansubdenpomal Jayapura', province: 'Papua', currentHolder: 'Mayor Laut Siti', reason: 'Mutasi', neededRank: 'MAYOR', minKpi: 75 },
      { position: 'Komandan KRI Sultan Hasanuddin', province: 'Sulawesi Selatan', currentHolder: 'Letkol Laut Agus', reason: 'Pensiun 5 bulan', neededRank: 'LETKOL', minKpi: 80 },
      { position: 'Danlanal Merauke', province: 'Papua Selatan', currentHolder: 'Letkol Laut Wawan', reason: 'Pensiun 7 bulan', neededRank: 'LETKOL', minKpi: 78 }
    ],
    au: [
      { position: 'Danlanud Jayapura', province: 'Papua', currentHolder: 'Kolonel Pnb. Ahmad', reason: 'Pensiun 6 bulan', neededRank: 'KOLONEL', minKpi: 82 },
      { position: 'Danwing Udara 3 Biak', province: 'Papua', currentHolder: 'Letkol Pnb. Rudi', reason: 'Pensiun 9 bulan', neededRank: 'LETKOL', minKpi: 80 },
      { position: 'Danskadron Udara 27', province: 'Papua Barat', currentHolder: 'Mayor Pnb. Yusuf', reason: 'Mutasi', neededRank: 'MAYOR', minKpi: 78 },
      { position: 'Danlanud Timika', province: 'Papua Tengah', currentHolder: 'Letkol Pnb. Didi', reason: 'Pensiun 5 bulan', neededRank: 'LETKOL', minKpi: 80 },
      { position: 'Kasiops Lanud Merauke', province: 'Papua Selatan', currentHolder: 'Kapten Pnb. Hendra', reason: 'Tugas Luar Negeri', neededRank: 'KAPTEN', minKpi: 75 }
    ]
  };

  // ============================================
  // NAMA INDONESIA
  // ============================================
  const FIRST = ['Budi','Agus','Hendra','Wawan','Siti','Dewi','Rina','Sari','Andi','Dian',
                 'Eko','Fajar','Gunawan','Hadi','Irfan','Joko','Krisna','Lukman','Maman','Nanda',
                 'Oki','Putra','Rahmat','Slamet','Taufik','Umar','Vino','Wahyu','Yudi','Zaki',
                 'Ahmad','Bayu','Cahyo','Dedi','Erwin','Ferdi','Gilang','Hasan','Iwan','Joni'];
  const LAST = ['Santoso','Wijaya','Pratama','Kusuma','Hartono','Setiawan','Nugroho','Saputra',
                'Hidayat','Firmansyah','Maulana','Ramadhan','Siregar','Simatupang','Situmorang',
                'Hutapea','Nainggolan','Panjaitan','Sihombing','Ginting','Wibowo','Susanto',
                'Purnomo','Halim','Sutanto','Handoko','Permadi','Wardana','Utama','Kurniawan'];

  // ============================================
  // DETERMINISTIC RANDOM
  // ============================================
  let seed = 42;
  function rand() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }
  function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }
  function pickMultiple(arr, count) {
    const out = [];
    const pool = [...arr];
    for (let i = 0; i < count && pool.length > 0; i++) {
      const idx = Math.floor(rand() * pool.length);
      out.push(pool.splice(idx, 1)[0]);
    }
    return out;
  }

  // ============================================
  // GENERATE PERSONEL
  // ============================================
  function generatePersonnel(matra, count = 50, seedOffset = 0) {
    seed = 42 + seedOffset;
    const ranks = RANKS[matra];
    const units = UNITS[matra];
    const specialties = SPECIALTIES[matra];
    const eduPool = EDUCATION[matra];
    const persons = [];

    for (let i = 0; i < count; i++) {
      const rankIdx = randInt(0, ranks.length - 1);
      const rank = ranks[rankIdx];
      const firstName = pick(FIRST);
      const lastName = pick(LAST);
      const specialty = pick(specialties);
      const unit = pick(units);
      const province = pick(PROVINCES);

      const kpi = {
        skill:      randInt(55, 98),
        fitness:    randInt(60, 100),
        leadership: randInt(50, 97),
        discipline: randInt(65, 100),
        ops:        randInt(40, 95)
      };

      const yearsInRank = randInt(1, 6);
      const lastPromotionDate = new Date(Date.now() - yearsInRank * 365.25 * 24 * 3600 * 1000);

      // Pendidikan: filter yang sesuai pangkat
      const eligibleEdu = eduPool.filter(e => rankIdx >= e.minRank);
      const eduCount = Math.min(eligibleEdu.length, randInt(1, 4));
      const education = pickMultiple(eligibleEdu, eduCount);

      // Penugasan internasional (30% personel)
      const intlAssignments = [];
      if (rand() < 0.3) {
        const intlCount = randInt(1, 2);
        const picks = pickMultiple(INTL_MISSIONS, intlCount);
        picks.forEach(m => {
          const yearsAgo = randInt(2, 10);
          const startYear = new Date().getFullYear() - yearsAgo;
          intlAssignments.push({
            mission: m.name,
            code: m.code,
            location: m.location,
            role: m.role,
            startYear: startYear,
            endYear: startYear + (m.duration / 12).toFixed(0) * 1,
            years: m.duration / 12
          });
        });
      }

      // Pensiun dalam X bulan (untuk kandidat succession)
      const yearsToRetirement = randInt(1, 15);

      persons.push({
        id: `${matra}-${String(i + 1).padStart(3, '0')}`,
        nrp: `${matra === 'ad' ? 1 : matra === 'al' ? 2 : 3}${randInt(10000000, 99999999)}`,
        name: `${firstName} ${lastName}`,
        rank,
        rankIdx,
        tier: rankIdx < 7 ? 1 : (rankIdx < 11 ? 2 : 3),
        unit,
        specialty,
        province,
        kpi,
        education,
        intlAssignments,
        lastPromotionDate: lastPromotionDate.toISOString(),
        awards: randInt(0, 8),
        violations: rand() < 0.85 ? 0 : randInt(1, 2),
        status: rand() < 0.9 ? 'active' : 'on_mission',
        yearsToRetirement,
        joinedAt: new Date(Date.now() - randInt(5, 25) * 365.25 * 24 * 3600 * 1000).toISOString()
      });
    }
    return persons;
  }

  // ============================================
  // GENERATE ONCE, CACHE
  // ============================================
  const DATA = {
    ad: generatePersonnel('ad', 50, 0),
    al: generatePersonnel('al', 50, 1000),
    au: generatePersonnel('au', 50, 2000)
  };

  // ============================================
  // EXPORT
  // ============================================
  return {
    PROVINCES,
    RANKS,
    UNITS,
    SPECIALTIES,
    EDUCATION,
    INTL_MISSIONS,
    OPEN_POSITIONS,
    get: (matra) => DATA[matra] || [],
    getAll: () => DATA,
    getById: (matra, id) => DATA[matra].find(p => p.id === id),
    getRankName: (matra, code) => code // placeholder â€” akan di-override oleh KPIEngine
  };
})();

if (typeof window !== 'undefined') window.PersonnelData = PersonnelData;
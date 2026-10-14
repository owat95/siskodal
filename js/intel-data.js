/* ============================================================
 * INTEL-DATA.JS — Strategic Intelligence Data
 * Country Profiles · OSINT Feed · Threat Matrix · Sources
 * ============================================================ */

const IntelData = (() => {
  'use strict';

  // ============================================
  // ADMIRALTY CODE
  // ============================================
  const ADMIRALTY = {
    reliability: {
      A: { code: 'A', label: 'Completely reliable',   color: '#22c55e', score: 5 },
      B: { code: 'B', label: 'Usually reliable',      color: '#4ade80', score: 4 },
      C: { code: 'C', label: 'Fairly reliable',       color: '#eab308', score: 3 },
      D: { code: 'D', label: 'Not usually reliable',  color: '#f97316', score: 2 },
      E: { code: 'E', label: 'Unreliable',            color: '#ef4444', score: 1 },
      F: { code: 'F', label: 'Cannot be judged',      color: '#64748b', score: 0 }
    },
    accuracy: {
      1: { code: 1, label: 'Confirmed by other sources', color: '#22c55e', score: 5 },
      2: { code: 2, label: 'Probably true',              color: '#4ade80', score: 4 },
      3: { code: 3, label: 'Possibly true',              color: '#eab308', score: 3 },
      4: { code: 4, label: 'Doubtful',                   color: '#f97316', score: 2 },
      5: { code: 5, label: 'Improbable',                 color: '#ef4444', score: 1 },
      6: { code: 6, label: 'Cannot be judged',           color: '#64748b', score: 0 }
    }
  };

  // ============================================
  // COUNTRY PROFILES
  // ============================================
  const COUNTRIES = [
    {
      id: 'CHN', name: 'China', flag: '🇨🇳',
      region: 'ASIA',
      threatLevel: 'HIGH',
      color: '#ef4444',
      summary: 'Aktivitas maritim agresif di Laut Natuna Utara (SCS). Klaim nine-dash line bersinggungan dengan ZEE Indonesia.',
      capabilities: [
        'PLAN (People\'s Liberation Army Navy) — 355+ kapal',
        'PLAAF — 2,800+ pesawat tempur',
        'APT groups: APT1, APT40, APT41 (cyber)',
        'Coast Guard (CCG) — 150+ kapal besar'
      ],
      recentActivity: [
        { date: '2026-10-04', type: 'MARITIME', desc: 'CCG vessel patroli di ZEE Natuna', admiralty: 'A2' },
        { date: '2026-10-02', type: 'CYBER',    desc: 'APT40 phishing campaign ke IKN infrastructure', admiralty: 'B2' },
        { date: '2026-09-28', type: 'SIGINT',   desc: 'Komunikasi militer aktif dari Hainan base', admiralty: 'A1' }
      ],
      metrics: {
        maritimeIncursions: 47,
        cyberIncidents: 23,
        diplomaticTension: 'HIGH',
        militaryPresence: 'ELEVATED'
      }
    },
    {
      id: 'RUS', name: 'Russia', flag: '🇷🇺',
      region: 'EURASIA',
      threatLevel: 'MEDIUM',
      color: '#f97316',
      summary: 'Aktivitas cyber operation dan arms sales ke Asia. Sentimen netral-positif dengan Indonesia.',
      capabilities: [
        'FSB / GRU cyber units (Sandworm, APT28)',
        'Rosoboronexport — major arms supplier',
        'Naval presence terbatas di Asia Tenggara',
        'Information warfare capabilities tinggi'
      ],
      recentActivity: [
        { date: '2026-10-03', type: 'CYBER',    desc: 'DNS beacon dari subnet Rusia ke IKN', admiralty: 'B2' },
        { date: '2026-09-30', type: 'DIPLOMATIC', desc: 'Pembicaraan pengadaan Su-35 batch 3', admiralty: 'C2' }
      ],
      metrics: {
        maritimeIncursions: 2,
        cyberIncidents: 15,
        diplomaticTension: 'LOW',
        militaryPresence: 'MINIMAL'
      }
    },
    {
      id: 'USA', name: 'United States', flag: '🇺🇸',
      region: 'AMERICAS',
      threatLevel: 'LOW',
      color: '#3b82f6',
      summary: 'Partner strategis. Kerjasama militer melalui Garuda Shield, IMET, FMS. Naval presence di Indo-Pasifik.',
      capabilities: [
        'US Navy 7th Fleet — 50-70 kapal di Indo-Pasifik',
        'USPACOM — koordinasi regional',
        'Intelligence sharing (Five Eyes partnership)',
        'FMS (Foreign Military Sales) program'
      ],
      recentActivity: [
        { date: '2026-10-04', type: 'EXERCISE', desc: 'Latma Garuda Shield 2026 fase 2', admiralty: 'A1' },
        { date: '2026-10-01', type: 'DIPLOMATIC', desc: 'Kunjungan USS Ronald Reagan ke Jakarta', admiralty: 'A1' }
      ],
      metrics: {
        maritimeIncursions: 0,
        cyberIncidents: 0,
        diplomaticTension: 'NONE',
        militaryPresence: 'COOPERATIVE'
      }
    },
    {
      id: 'AUS', name: 'Australia', flag: '🇦🇺',
      region: 'OCEANIA',
      threatLevel: 'LOW',
      color: '#22c55e',
      summary: 'Partner strategis. Kerjasama maritime security, counter-terrorism, dan intelligence sharing.',
      capabilities: [
        'RAN — Royal Australian Navy',
        'RAAF — surveillance & patrol aircraft',
        'ASIS — intelligence cooperation',
        'Joint maritime patrol di perbatasan'
      ],
      recentActivity: [
        { date: '2026-10-03', type: 'EXERCISE', desc: 'Latma Ausindo 2026 di Darwin', admiralty: 'A1' },
        { date: '2026-09-29', type: 'MARITIME', desc: 'Joint patrol di Arafuru', admiralty: 'A1' }
      ],
      metrics: {
        maritimeIncursions: 0,
        cyberIncidents: 0,
        diplomaticTension: 'NONE',
        militaryPresence: 'COOPERATIVE'
      }
    },
    {
      id: 'MYS', name: 'Malaysia', flag: '🇲🇾',
      region: 'ASIA',
      threatLevel: 'LOW',
      color: '#eab308',
      summary: 'Tetangga langsung. Kerjasama perbatasan, patroli bersama, dan penyelesaian sengketa via diplomasi.',
      capabilities: [
        'RMN — Royal Malaysian Navy',
        'Border patrol di Kalimantan',
        'Joint Malindo exercises',
        'Cooperation on piracy & smuggling'
      ],
      recentActivity: [
        { date: '2026-10-04', type: 'BORDER', desc: 'Pertemuan perbatasan Kalimantan Utara', admiralty: 'A1' },
        { date: '2026-09-30', type: 'MARITIME', desc: 'Latma Malindo Jaya 2026', admiralty: 'A1' }
      ],
      metrics: {
        maritimeIncursions: 3,
        cyberIncidents: 1,
        diplomaticTension: 'LOW',
        militaryPresence: 'COOPERATIVE'
      }
    },
    {
      id: 'VNM', name: 'Vietnam', flag: '🇻🇳',
      region: 'ASIA',
      threatLevel: 'LOW',
      color: '#06b6d4',
      summary: 'Partner di SCS. Sama-sama menghadapi klaim China di Laut Natuna.',
      capabilities: [
        'VPN — Vietnam People\'s Navy',
        'Coastal defense systems',
        'Anti-access/area denial (A2/AD)',
        'Cooperation on SCS'
      ],
      recentActivity: [
        { date: '2026-10-01', type: 'DIPLOMATIC', desc: 'Rapat bilateral SCS di Hanoi', admiralty: 'A1' }
      ],
      metrics: {
        maritimeIncursions: 1,
        cyberIncidents: 0,
        diplomaticTension: 'LOW',
        militaryPresence: 'COOPERATIVE'
      }
    },
    {
      id: 'PHL', name: 'Philippines', flag: '🇵🇭',
      region: 'ASIA',
      threatLevel: 'LOW',
      color: '#3b82f6',
      summary: 'Partner ASEAN. Aktif dalam SCS code of conduct negotiations.',
      capabilities: [
        'PN — Philippine Navy',
        'Coast guard cooperation',
        'US alliance (MDT)',
        'Cooperation on SCS'
      ],
      recentActivity: [
        { date: '2026-09-28', type: 'MARITIME', desc: 'Joint patrol Natuna-Philippines', admiralty: 'A1' }
      ],
      metrics: {
        maritimeIncursions: 2,
        cyberIncidents: 0,
        diplomaticTension: 'LOW',
        militaryPresence: 'COOPERATIVE'
      }
    },
    {
      id: 'PNG', name: 'Papua New Guinea', flag: '🇵🇬',
      region: 'OCEANIA',
      threatLevel: 'LOW',
      color: '#22c55e',
      summary: 'Tetangga perbatasan darat. Cooperation on border management.',
      capabilities: [
        'PNGDF — PNG Defence Force',
        'Border security',
        'Traditional border crossing',
        'Cooperation on refugees'
      ],
      recentActivity: [
        { date: '2026-10-02', type: 'BORDER', desc: 'Patroli gabungan di Skouw', admiralty: 'A1' }
      ],
      metrics: {
        maritimeIncursions: 0,
        cyberIncidents: 0,
        diplomaticTension: 'NONE',
        militaryPresence: 'COOPERATIVE'
      }
    }
  ];

  // ============================================
  // OSINT FEED (raw intelligence)
  // ============================================
  const OSINT_FEED = [
    {
      id: 'INT-2026-0001',
      timestamp: Date.now() - 30 * 60 * 1000,
      sourceType: 'SIGINT',
      source: 'NSA-TNI Station',
      admiralty: 'A2',
      classification: 'SECRET',
      title: 'Pergerakan Kapal Induk China',
      content: 'PLAN carrier Shandong terdeteksi keluar dari Hainan. Kurs: Selatan. Estimasi tiba di Laut Natuna Utara dalam 48 jam.',
      country: 'CHN',
      category: 'MARITIME',
      severity: 'HIGH',
      status: 'VERIFIED',
      verifiedBy: 'Analis SOC',
      verifiedAt: Date.now() - 25 * 60 * 1000
    },
    {
      id: 'INT-2026-0002',
      timestamp: Date.now() - 2 * 3600 * 1000,
      sourceType: 'OSINT',
      source: 'Global Maritime News',
      admiralty: 'B2',
      classification: 'CONFIDENTIAL',
      title: 'Aktivitas IUU Fishing',
      content: 'Laporan dari publikasi maritim: 12 kapal ikan bendera Vanuatu terdeteksi di Arafuru. Kemungkinan fronts untuk China.',
      country: 'CHN',
      category: 'MARITIME',
      severity: 'MEDIUM',
      status: 'VERIFIED',
      verifiedBy: 'Analis OSINT',
      verifiedAt: Date.now() - 90 * 60 * 1000
    },
    {
      id: 'INT-2026-0003',
      timestamp: Date.now() - 45 * 60 * 1000,
      sourceType: 'HUMINT',
      source: 'Field Agent (Papua)',
      admiralty: 'C3',
      classification: 'TOP_SECRET',
      title: 'Aktivitas KKB di Pegunungan',
      content: 'Sumber lapangan melaporkan: 30 personel bersenjata di area Puncak Jaya. Kemungkinan persiapan operasi besar.',
      country: 'ID',
      category: 'INTERNAL',
      severity: 'CRITICAL',
      status: 'PENDING',
      verifiedBy: null,
      verifiedAt: null
    },
    {
      id: 'INT-2026-0004',
      timestamp: Date.now() - 15 * 60 * 1000,
      sourceType: 'CYBERINT',
      source: 'BSSN Feed',
      admiralty: 'A1',
      classification: 'SECRET',
      title: 'APT41 Campaign Confirmed',
      content: 'BSSN + Wazuh correlation: APT41 menyerang infrastructure IKN. 23 critical events, 8 unique IPs China. Auto-block aktif.',
      country: 'CHN',
      category: 'CYBER',
      severity: 'HIGH',
      status: 'VERIFIED',
      verifiedBy: 'Analis Cyber',
      verifiedAt: Date.now() - 10 * 60 * 1000
    },
    {
      id: 'INT-2026-0005',
      timestamp: Date.now() - 5 * 3600 * 1000,
      sourceType: 'OSINT',
      source: 'Twitter / X (open source)',
      admiralty: 'D4',
      classification: 'UNCLASS',
      title: 'Unverified: Konvoi Militer di Perbatasan',
      content: 'Video viral menunjukkan konvoi militer di perbatasan Kalimantan-Malaysia. Belum dapat diverifikasi. Kemungkinan hoax.',
      country: 'MYS',
      category: 'BORDER',
      severity: 'LOW',
      status: 'DISMISSED',
      verifiedBy: 'Analis OSINT',
      verifiedAt: Date.now() - 4 * 3600 * 1000,
      dismissReason: 'Tidak dapat diverifikasi, kemungkinan video lama'
    },
    {
      id: 'INT-2026-0006',
      timestamp: Date.now() - 20 * 60 * 1000,
      sourceType: 'IMINT',
      source: 'Satellite Imagery (Commercial)',
      admiralty: 'B2',
      classification: 'CONFIDENTIAL',
      title: 'Pembangunan Fasilitas Baru di Hainan',
      content: 'Citra satelit menunjukkan konstruksi landasan baru di Hainan. Kemungkinan extension untuk bomber H-6K.',
      country: 'CHN',
      category: 'MILITARY',
      severity: 'MEDIUM',
      status: 'PENDING',
      verifiedBy: null,
      verifiedAt: null
    },
    {
      id: 'INT-2026-0007',
      timestamp: Date.now() - 8 * 60 * 60 * 1000,
      sourceType: 'SIGINT',
      source: 'NSA-TNI Station',
      admiralty: 'A2',
      classification: 'SECRET',
      title: 'Komunikasi Militer Rusia Aktif',
      content: 'Intercept komunikasi terenkripsi dari Vladivostok. Frekuensi VHF aktif 24 jam terakhir. Kemungkinan naval exercise.',
      country: 'RUS',
      category: 'MILITARY',
      severity: 'MEDIUM',
      status: 'VERIFIED',
      verifiedBy: 'Analis SIGINT',
      verifiedAt: Date.now() - 7 * 3600 * 1000
    },
    {
      id: 'INT-2026-0008',
      timestamp: Date.now() - 60 * 60 * 1000,
      sourceType: 'HUMINT',
      source: 'Diplomatic Source',
      admiralty: 'B2',
      classification: 'CONFIDENTIAL',
      title: 'Pembicaraan Pengadaan Su-35',
      content: 'Sumber diplomatik: negosiasi lanjutan Su-35 batch 3 dengan Rusia. Estimasi kontrak Q1 2027.',
      country: 'RUS',
      category: 'PROCUREMENT',
      severity: 'LOW',
      status: 'VERIFIED',
      verifiedBy: 'Analis HUMINT',
      verifiedAt: Date.now() - 50 * 60 * 1000
    }
  ];

  // ============================================
  // THREAT MATRIX
  // ============================================
  const THREAT_MATRIX = [
    // STATE ACTORS
    { actor: 'China',       type: 'STATE',    category: 'MARITIME',  severity: 'HIGH',     probability: 0.75, impact: 0.85, region: 'Natuna' },
    { actor: 'China',       type: 'STATE',    category: 'CYBER',     severity: 'CRITICAL', probability: 0.90, impact: 0.80, region: 'IKN' },
    { actor: 'Russia',      type: 'STATE',    category: 'CYBER',     severity: 'MEDIUM',   probability: 0.45, impact: 0.70, region: 'National' },
    { actor: 'North Korea', type: 'STATE',    category: 'CYBER',     severity: 'MEDIUM',   probability: 0.35, impact: 0.55, region: 'National' },

    // PROXY
    { actor: 'KKB/OPM',     type: 'PROXY',    category: 'INTERNAL',  severity: 'HIGH',     probability: 0.70, impact: 0.60, region: 'Papua' },
    { actor: 'JI/MIT',      type: 'PROXY',    category: 'TERROR',    severity: 'MEDIUM',   probability: 0.30, impact: 0.75, region: 'National' },

    // CRIMINAL
    { actor: 'IUU Fishing', type: 'CRIMINAL', category: 'MARITIME',  severity: 'MEDIUM',   probability: 0.85, impact: 0.40, region: 'Arafuru' },
    { actor: 'Drug Cartel', type: 'CRIMINAL', category: 'SMUGGLING', severity: 'HIGH',     probability: 0.65, impact: 0.55, region: 'Malaka' },
    { actor: 'Human Trafficking', type: 'CRIMINAL', category: 'SMUGGLING', severity: 'MEDIUM', probability: 0.50, impact: 0.60, region: 'Border' },

    // CYBER
    { actor: 'APT41',       type: 'CYBER',    category: 'CYBER',     severity: 'CRITICAL', probability: 0.92, impact: 0.85, region: 'IKN' },
    { actor: 'APT40',       type: 'CYBER',    category: 'CYBER',     severity: 'HIGH',     probability: 0.78, impact: 0.75, region: 'National' },
    { actor: 'Ransomware',  type: 'CYBER',    category: 'CYBER',     severity: 'MEDIUM',   probability: 0.60, impact: 0.65, region: 'National' }
  ];

  // ============================================
  // HELPERS
  // ============================================
  function getCountry(id) {
    return COUNTRIES.find(c => c.id === id);
  }

  function getIntel(id) {
    return OSINT_FEED.find(i => i.id === id);
  }

  function getAdmiralty(reliability, accuracy) {
    return {
      reliability: ADMIRALTY.reliability[reliability],
      accuracy: ADMIRALTY.accuracy[accuracy],
      combined: `${reliability}${accuracy}`,
      score: (ADMIRALTY.reliability[reliability].score + ADMIRALTY.accuracy[accuracy].score) / 2
    };
  }

  function getIntelByStatus(status) {
    return OSINT_FEED.filter(i => i.status === status);
  }

  function getStats() {
    return {
      totalIntel: OSINT_FEED.length,
      verified: OSINT_FEED.filter(i => i.status === 'VERIFIED').length,
      pending: OSINT_FEED.filter(i => i.status === 'PENDING').length,
      dismissed: OSINT_FEED.filter(i => i.status === 'DISMISSED').length,
      countries: COUNTRIES.length,
      countriesHighThreat: COUNTRIES.filter(c => c.threatLevel === 'HIGH').length,
      threatActors: THREAT_MATRIX.length,
      criticalThreats: THREAT_MATRIX.filter(t => t.severity === 'CRITICAL').length
    };
  }

  function verifyIntel(id, analyst = 'Analis SOC') {
    const item = getIntel(id);
    if (!item) return { ok: false, reason: 'NOT_FOUND' };

    item.status = 'VERIFIED';
    item.verifiedBy = analyst;
    item.verifiedAt = Date.now();
    console.log(`[INTEL] Verified: ${id} by ${analyst}`);
    return { ok: true };
  }

  function dismissIntel(id, reason = '', analyst = 'Analis SOC') {
    const item = getIntel(id);
    if (!item) return { ok: false, reason: 'NOT_FOUND' };

    item.status = 'DISMISSED';
    item.verifiedBy = analyst;
    item.verifiedAt = Date.now();
    item.dismissReason = reason;
    console.log(`[INTEL] Dismissed: ${id} — ${reason}`);
    return { ok: true };
  }

  return {
    ADMIRALTY,
    COUNTRIES,
    OSINT_FEED,
    THREAT_MATRIX,
    getCountry,
    getIntel,
    getAdmiralty,
    getIntelByStatus,
    getStats,
    verifyIntel,
    dismissIntel
  };
})();

if (typeof window !== 'undefined') window.IntelData = IntelData;
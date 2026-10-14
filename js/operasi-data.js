/* ============================================================
 * OPERASI-DATA.JS — Mission, Units, Targets
 * Data untuk C2 Operations Center
 * ============================================================ */

const OperasiData = (() => {
  'use strict';

  // ============================================
  // MISSION TYPES
  // ============================================
  const MISSION_TYPES = {
    MARITIME_DEFENSE:   { code: 'MARITIME_DEFENSE',   label: 'Pertahanan Maritim',     icon: '⚓', color: '#1e40af' },
    BORDER_SECURITY:    { code: 'BORDER_SECURITY',    label: 'Keamanan Perbatasan',    icon: '🚧', color: '#059669' },
    AIR_PATROL:         { code: 'AIR_PATROL',         label: 'Patroli Udara',          icon: '✈️', color: '#3b82f6' },
    COUNTER_TERRORISM:  { code: 'COUNTER_TERRORISM',  label: 'Kontra Terorisme',       icon: '🎯', color: '#ef4444' },
    SAR:                { code: 'SAR',                label: 'Search & Rescue',        icon: '🆘', color: '#eab308' },
    HUMANITARIAN:       { code: 'HUMANITARIAN',       label: 'Bantuan Kemanusiaan',    icon: '🏥', color: '#22c55e' },
    CYBER_DEFENSE:      { code: 'CYBER_DEFENSE',      label: 'Pertahanan Siber',       icon: '🛡️', color: '#a855f7' }
  };

  // ============================================
  // MISSION STATUS
  // ============================================
  const MISSION_STATUS = {
    PLANNING:   { code: 'PLANNING',   label: 'Perencanaan',  color: '#eab308', order: 1 },
    APPROVED:   { code: 'APPROVED',   label: 'Disetujui',    color: '#3b82f6', order: 2 },
    EXECUTING:  { code: 'EXECUTING',  label: 'Dilaksanakan', color: '#22c55e', order: 3 },
    COMPLETED:  { code: 'COMPLETED',  label: 'Selesai',      color: '#64748b', order: 4 },
    ABORTED:    { code: 'ABORTED',    label: 'Dibatalkan',   color: '#ef4444', order: 5 }
  };

  // ============================================
  // PRIORITY
  // ============================================
  const PRIORITY = {
    P1: { code: 'P1', label: 'IMMEDIATE',  color: '#ef4444' },
    P2: { code: 'P2', label: 'URGENT',     color: '#f97316' },
    P3: { code: 'P3', label: 'ROUTINE',    color: '#eab308' },
    P4: { code: 'P4', label: 'LOW',        color: '#22c55e' }
  };

  // ============================================
  // UNIT CATEGORIES
  // ============================================
  const UNIT_CATEGORIES = {
    KRI:        { code: 'KRI',        label: 'Kapal Perang',        matra: 'al', icon: '🚢' },
    SUBMARINE:  { code: 'SUBMARINE',  label: 'Kapal Selam',         matra: 'al', icon: '🔻' },
    PATROL:     { code: 'PATROL',     label: 'Kapal Patroli',       matra: 'al', icon: '⛵' },
    FIGHTER:    { code: 'FIGHTER',    label: 'Pesawat Tempur',      matra: 'au', icon: '✈️' },
    UAV:        { code: 'UAV',        label: 'UAV MALE',            matra: 'au', icon: '🛸' },
    TRANSPORT:  { code: 'TRANSPORT',  label: 'Pesawat Angkut',      matra: 'au', icon: '🛬' },
    INFANTRY:   { code: 'INFANTRY',   label: 'Batalyon Infanteri',  matra: 'ad', icon: '🪖' },
    ARMOR:      { code: 'ARMOR',      label: 'Kavaleri',            matra: 'ad', icon: '🚙' },
    ARTILLERY:  { code: 'ARTILLERY',  label: 'Artileri',            matra: 'ad', icon: '🎯' },
    SPECIAL:    { code: 'SPECIAL',    label: 'Pasukan Khusus',      matra: 'ad', icon: '⚡' }
  };

  // ============================================
  // AVAILABLE UNITS (from real-ish TNI units)
  // ============================================
  const AVAILABLE_UNITS = [
    // ============ AL — Laut ============
    { id: 'U-KRI-DIP', name: 'KRI Diponegoro-365', category: 'KRI', matra: 'al', base: 'Lantamal I Belawan', homeport: { lat: 3.783, lon: 98.683 }, crew: 120, speed: 28, readiness: 95, weapons: ['Meriam 76mm', 'Rudal Exocet'], status: 'READY' },
    { id: 'U-KRI-SUH', name: 'KRI Sultan Hasanuddin-366', category: 'KRI', matra: 'al', base: 'Lantamal II Makassar', homeport: { lat: -5.147, lon: 119.432 }, crew: 120, speed: 28, readiness: 88, weapons: ['Meriam 76mm', 'Rudal Exocet'], status: 'READY' },
    { id: 'U-KRI-JL',  name: 'KRI John Lie-358',   category: 'KRI', matra: 'al', base: 'Lantamal III Jakarta', homeport: { lat: -6.103, lon: 106.883 }, crew: 110, speed: 27, readiness: 92, weapons: ['Meriam 57mm', 'Rudal Mistral'], status: 'READY' },
    { id: 'U-KRI-AY',  name: 'KRI Ahmad Yani-351', category: 'KRI', matra: 'al', base: 'Lantamal V Surabaya', homeport: { lat: -7.206, lon: 112.735 }, crew: 140, speed: 26, readiness: 82, weapons: ['Meriam 76mm'], status: 'MAINTENANCE' },
    { id: 'U-KRI-NG',  name: 'KRI Nagapasa-403',   category: 'SUBMARINE', matra: 'al', base: 'Lantamal V Surabaya', homeport: { lat: -7.206, lon: 112.735 }, crew: 40, speed: 20, readiness: 90, weapons: ['Torpedo Black Shark', 'Rudal Harpoon'], status: 'READY' },
    { id: 'U-KRI-FK',  name: 'KRI Frans Kaisiepo-368', category: 'KRI', matra: 'al', base: 'Lantamal XI Merauke', homeport: { lat: -8.493, lon: 140.401 }, crew: 120, speed: 28, readiness: 85, weapons: ['Meriam 76mm', 'Rudal Exocet'], status: 'READY' },
    { id: 'U-KAL-NAT', name: 'KAL Natuna',         category: 'PATROL', matra: 'al', base: 'Lantamal IV Tanjungpinang', homeport: { lat: 3.950, lon: 108.383 }, crew: 30, speed: 25, readiness: 92, weapons: ['Meriam 20mm'], status: 'READY' },
    { id: 'U-KAL-MAR', name: 'KAL Marore',         category: 'PATROL', matra: 'al', base: 'Lantamal VIII Manado', homeport: { lat: 1.474, lon: 124.842 }, crew: 30, speed: 25, readiness: 88, weapons: ['Meriam 20mm'], status: 'READY' },

    // ============ AU — Udara ============
    { id: 'U-F16-01', name: 'F-16C Falcon TS-1601', category: 'FIGHTER', matra: 'au', base: 'Skadron Udara 3 Iswahjudi', homeport: { lat: -7.616, lon: 111.434 }, crew: 1, speed: 2400, readiness: 92, weapons: ['AIM-120 AMRAAM', 'AIM-9 Sidewinder'], status: 'READY' },
    { id: 'U-F16-02', name: 'F-16C Falcon TS-1602', category: 'FIGHTER', matra: 'au', base: 'Skadron Udara 3 Iswahjudi', homeport: { lat: -7.616, lon: 111.434 }, crew: 1, speed: 2400, readiness: 88, weapons: ['AIM-120 AMRAAM', 'AIM-9 Sidewinder'], status: 'READY' },
    { id: 'U-F16-03', name: 'F-16C Falcon TS-1603', category: 'FIGHTER', matra: 'au', base: 'Skadron Udara 3 Iswahjudi', homeport: { lat: -7.616, lon: 111.434 }, crew: 1, speed: 2400, readiness: 65, weapons: ['AIM-120 AMRAAM'], status: 'MAINTENANCE' },
    { id: 'U-SU30-01', name: 'Su-30MK2 TS-3001',   category: 'FIGHTER', matra: 'au', base: 'Skadron Udara 11 Hasanuddin', homeport: { lat: -5.061, lon: 119.554 }, crew: 2, speed: 2100, readiness: 90, weapons: ['R-77', 'Kh-31'], status: 'READY' },
    { id: 'U-SU30-02', name: 'Su-30MK2 TS-3002',   category: 'FIGHTER', matra: 'au', base: 'Skadron Udara 11 Hasanuddin', homeport: { lat: -5.061, lon: 119.554 }, crew: 2, speed: 2100, readiness: 94, weapons: ['R-77', 'Kh-31'], status: 'READY' },
    { id: 'U-UAV-RVN', name: 'UAV MALE Raven-01',  category: 'UAV', matra: 'au', base: 'Lanud Supadio', homeport: { lat: -0.150, lon: 109.403 }, crew: 0, speed: 280, readiness: 95, weapons: ['EO/IR Sensor', 'SAR'], status: 'READY' },
    { id: 'U-UAV-RVN2',name: 'UAV MALE Raven-02',  category: 'UAV', matra: 'au', base: 'Lanud El Tari', homeport: { lat: -10.171, lon: 123.671 }, crew: 0, speed: 280, readiness: 92, weapons: ['EO/IR Sensor'], status: 'READY' },
    { id: 'U-C130-01', name: 'C-130H Hercules A-1310', category: 'TRANSPORT', matra: 'au', base: 'Skadron Udara 31 Halim', homeport: { lat: -6.266, lon: 106.891 }, crew: 5, speed: 600, readiness: 85, weapons: [], status: 'READY' },

    // ============ AD — Darat ============
    { id: 'U-YONIF-315', name: 'Yonif 315/Garuda',      category: 'INFANTRY', matra: 'ad', base: 'Kodam XVII/Cenderawasih', homeport: { lat: -2.533, lon: 140.717 }, crew: 750, speed: 20, readiness: 92, weapons: ['SS1', 'SS2', 'Grenade Launcher'], status: 'READY' },
    { id: 'U-YONIF-328', name: 'Yonif 328/Dirgahayu',   category: 'INFANTRY', matra: 'ad', base: 'Kodam Jaya', homeport: { lat: -6.175, lon: 106.827 }, crew: 750, speed: 20, readiness: 88, weapons: ['SS1', 'SS2'], status: 'READY' },
    { id: 'U-YONIF-600', name: 'Yonif 600/Modang',      category: 'INFANTRY', matra: 'ad', base: 'Kodam VI/Mulawarman', homeport: { lat: -1.267, lon: 116.831 }, crew: 750, speed: 20, readiness: 82, weapons: ['SS1', 'SS2'], status: 'READY' },
    { id: 'U-YONKAV-4', name: 'Yonkav 4/Como',          category: 'ARMOR', matra: 'ad', base: 'Kodam XVII/Cenderawasih', homeport: { lat: -2.533, lon: 140.717 }, crew: 450, speed: 65, readiness: 90, weapons: ['Leopard 2A6', 'Marder 1A3'], status: 'READY' },
    { id: 'U-YONARMED-15', name: 'Yonarmed 15/YC',      category: 'ARTILLERY', matra: 'ad', base: 'Kodam XVII/Cenderawasih', homeport: { lat: -3.500, lon: 138.500 }, crew: 380, speed: 55, readiness: 87, weapons: ['CAESAR 155mm', 'MLRS Astros'], status: 'READY' },
    { id: 'U-KOPASSUS', name: 'Sat-81 Gultor Kopassus', category: 'SPECIAL', matra: 'ad', base: 'Kopassus Cijantung', homeport: { lat: -6.316, lon: 106.853 }, crew: 120, speed: 25, readiness: 96, weapons: ['HK416', 'Sniper AX-50'], status: 'READY' },
    { id: 'U-DENJAKA',  name: 'Denjaka',                category: 'SPECIAL', matra: 'al', base: 'Kormar Jakarta', homeport: { lat: -6.103, lon: 106.883 }, crew: 80, speed: 30, readiness: 95, weapons: ['HK416', 'Sniper'], status: 'READY' }
  ];

  // ============================================
  // TARGETS (from ICR/SIBER feed)
  // ============================================
  const AVAILABLE_TARGETS = [
    { id: 'TGT-001', type: 'HOSTILE_VESSEL',  name: 'Kapal Ikan Asing (KIA)',        location: { lat: 3.95, lon: 108.38 }, area: 'Laut Natuna Utara', confidence: 0.92, source: 'IMINT', priority: 'P1', description: '3 kapal KIA terdeteksi mencurigakan tanpa AIS' },
    { id: 'TGT-002', type: 'HOSTILE_AIRCRAFT', name: 'UAV Asing Unidentified',      location: { lat: 4.20, lon: 108.50 }, area: 'Laut Natuna',        confidence: 0.78, source: 'SIGINT', priority: 'P1', description: 'UAV asing di FIR Jakarta tanpa flight plan' },
    { id: 'TGT-003', type: 'SMUGGLING',        name: 'Jalur Penyelundupan',         location: { lat: 2.50, lon: 101.00 }, area: 'Selat Malaka',      confidence: 0.85, source: 'HUMINT', priority: 'P2', description: 'Jalur penyelundupan narkoba lintas batas' },
    { id: 'TGT-004', type: 'ARMED_GROUP',      name: 'Kelompok Bersenjata (OPM)',   location: { lat: -4.50, lon: 138.50 }, area: 'Papua Pegunungan',  confidence: 0.88, source: 'HUMINT', priority: 'P1', description: 'Aktivitas KKB di area pegunungan' },
    { id: 'TGT-005', type: 'FOREIGN_MILITARY', name: 'Aktivitas Militer Asing',     location: { lat: 5.20, lon: 108.20 }, area: 'Laut Natuna Utara', confidence: 0.72, source: 'OSINT',  priority: 'P2', description: 'Kapal perang asing patroli di ZEE Indonesia' },
    { id: 'TGT-006', type: 'ILLEGAL_FISHING',  name: 'Kapal Ikan Ilegal',           location: { lat: -8.50, lon: 138.50 }, area: 'Laut Arafuru',      confidence: 0.95, source: 'AIS',    priority: 'P2', description: '20 kapal ikan illegal di Arafuru' },
    { id: 'TGT-007', type: 'CYBER_THREAT',     name: 'APT Kelompok Siber',          location: { lat: 39.90, lon: 116.40 }, area: 'Cyber Space',       confidence: 0.82, source: 'CYBERINT',priority: 'P1', description: 'APT dari China serang infrastruktur IKN' }
  ];

  // ============================================
  // MISSIONS (seed)
  // ============================================
  const MISSIONS = [
    {
      id: 'OPS-2026-001',
      name: 'Operasi Natuna Shield',
      type: 'MARITIME_DEFENSE',
      status: 'EXECUTING',
      priority: 'P1',
      classification: 'SECRET',
      location: { name: 'Laut Natuna Utara', lat: 3.95, lon: 108.38 },
      area: { radius: 150000, color: '#ef4444' },
      objective: 'Mempertahankan kedaulatan ZEE Indonesia di Laut Natuna Utara dari intrusi asing. Deteksi & usir kapal asing tanpa izin.',
      commander: 'Letkol Laut (P) Ahmad Wijaya',
      startDate: Date.now() - 2 * 24 * 3600 * 1000,
      endDate: Date.now() + 3 * 24 * 3600 * 1000,
      progress: 65,
      units: ['U-KRI-DIP', 'U-KAL-NAT', 'U-UAV-RVN'],
      targets: ['TGT-001', 'TGT-002', 'TGT-005'],
      phases: [
        { name: 'Persiapan',      status: 'DONE',        start: 0,  duration: 20 },
        { name: 'Deteksi',        status: 'DONE',        start: 20, duration: 30 },
        { name: 'Intervensi',     status: 'IN_PROGRESS', start: 50, duration: 40 },
        { name: 'Konsolidasi',    status: 'PENDING',     start: 90, duration: 10 }
      ]
    },
    {
      id: 'OPS-2026-002',
      name: 'Operasi Papua Aman',
      type: 'COUNTER_TERRORISM',
      status: 'EXECUTING',
      priority: 'P1',
      classification: 'TOP_SECRET',
      location: { name: 'Papua Pegunungan', lat: -4.50, lon: 138.50 },
      area: { radius: 80000, color: '#dc2626' },
      objective: 'Operasi kontra KKB di wilayah pegunungan Papua. Koordinasi dengan Kodam XVII/Cenderawasih.',
      commander: 'Kolonel Inf. Budi Santoso',
      startDate: Date.now() - 5 * 24 * 3600 * 1000,
      endDate: Date.now() + 10 * 24 * 3600 * 1000,
      progress: 42,
      units: ['U-YONIF-315', 'U-YONKAV-4', 'U-KOPASSUS'],
      targets: ['TGT-004'],
      phases: [
        { name: 'Intel',          status: 'DONE',        start: 0,  duration: 15 },
        { name: 'Isolasi',        status: 'DONE',        start: 15, duration: 25 },
        { name: 'Sweep',          status: 'IN_PROGRESS', start: 40, duration: 40 },
        { name: 'Stabilisasi',    status: 'PENDING',     start: 80, duration: 20 }
      ]
    },
    {
      id: 'OPS-2026-003',
      name: 'Operasi Malaka Strait',
      type: 'BORDER_SECURITY',
      status: 'EXECUTING',
      priority: 'P2',
      classification: 'CONFIDENTIAL',
      location: { name: 'Selat Malaka', lat: 2.50, lon: 101.00 },
      area: { radius: 60000, color: '#eab308' },
      objective: 'Cegah penyelundupan narkoba & human trafficking di Selat Malaka.',
      commander: 'Letkol Laut (P) Sari Dewi',
      startDate: Date.now() - 1 * 24 * 3600 * 1000,
      endDate: Date.now() + 6 * 24 * 3600 * 1000,
      progress: 28,
      units: ['U-KAL-MAR', 'U-KRI-JL'],
      targets: ['TGT-003'],
      phases: [
        { name: 'Surveillance',   status: 'IN_PROGRESS', start: 0,  duration: 40 },
        { name: 'Interdiksi',     status: 'PENDING',     start: 40, duration: 40 },
        { name: 'Evakuasi',       status: 'PENDING',     start: 80, duration: 20 }
      ]
    },
    {
      id: 'OPS-2026-004',
      name: 'Operasi Arafuru Sweep',
      type: 'MARITIME_DEFENSE',
      status: 'PLANNING',
      priority: 'P2',
      classification: 'RESTRICTED',
      location: { name: 'Laut Arafuru', lat: -8.50, lon: 138.50 },
      area: { radius: 200000, color: '#22c55e' },
      objective: 'Sweep kapal ikan illegal di Laut Arafuru. Koordinasi dengan KKP.',
      commander: 'Letkol Laut (P) Hendra Wijaya',
      startDate: Date.now() + 2 * 24 * 3600 * 1000,
      endDate: Date.now() + 12 * 24 * 3600 * 1000,
      progress: 0,
      units: ['U-KRI-FK'],
      targets: ['TGT-006'],
      phases: [
        { name: 'Planning',       status: 'IN_PROGRESS', start: 0,  duration: 30 },
        { name: 'Deployment',     status: 'PENDING',     start: 30, duration: 20 },
        { name: 'Sweep',          status: 'PENDING',     start: 50, duration: 40 },
        { name: 'Return',         status: 'PENDING',     start: 90, duration: 10 }
      ]
    },
    {
      id: 'OPS-2026-005',
      name: 'Cyber Defense IKN',
      type: 'CYBER_DEFENSE',
      status: 'APPROVED',
      priority: 'P1',
      classification: 'SECRET',
      location: { name: 'Cyber Space', lat: -0.500, lon: 117.000 },
      area: { radius: 0, color: '#a855f7' },
      objective: 'Pertahankan infrastruktur siber IKN dari serangan APT. Koordinasi dengan BSSN.',
      commander: 'Kolonel Cyber Andi Pratama',
      startDate: Date.now() + 1 * 24 * 3600 * 1000,
      endDate: Date.now() + 30 * 24 * 3600 * 1000,
      progress: 0,
      units: [],
      targets: ['TGT-007'],
      phases: [
        { name: 'Assessment',     status: 'DONE',        start: 0,  duration: 20 },
        { name: 'Hardening',      status: 'IN_PROGRESS', start: 20, duration: 30 },
        { name: 'Monitoring',     status: 'PENDING',     start: 50, duration: 50 }
      ]
    },
    {
      id: 'OPS-2026-006',
      name: 'SAR KMP Express',
      type: 'SAR',
      status: 'COMPLETED',
      priority: 'P2',
      classification: 'UNCLASS',
      location: { name: 'Selat Sunda', lat: -6.00, lon: 105.50 },
      area: { radius: 40000, color: '#eab308' },
      objective: 'SAR korban tenggelamnya KMP di Selat Sunda.',
      commander: 'Letkol Laut (P) Yusuf R.',
      startDate: Date.now() - 7 * 24 * 3600 * 1000,
      endDate: Date.now() - 5 * 24 * 3600 * 1000,
      progress: 100,
      units: ['U-KRI-AY', 'U-C130-01'],
      targets: [],
      phases: [
        { name: 'Alert',          status: 'DONE', start: 0,  duration: 5 },
        { name: 'Search',         status: 'DONE', start: 5,  duration: 70 },
        { name: 'Rescue',         status: 'DONE', start: 75, duration: 20 },
        { name: 'Debrief',        status: 'DONE', start: 95, duration: 5 }
      ]
    }
  ];

  // ============================================
  // HELPERS
  // ============================================
  function getMission(id) {
    return MISSIONS.find(m => m.id === id);
  }

  function getUnit(id) {
    return AVAILABLE_UNITS.find(u => u.id === id);
  }

  function getTarget(id) {
    return AVAILABLE_TARGETS.find(t => t.id === id);
  }

  function getMissionsByStatus(status) {
    return MISSIONS.filter(m => m.status === status);
  }

  function getStats() {
    return {
      total: MISSIONS.length,
      planning: getMissionsByStatus('PLANNING').length,
      approved: getMissionsByStatus('APPROVED').length,
      executing: getMissionsByStatus('EXECUTING').length,
      completed: getMissionsByStatus('COMPLETED').length,
      aborted: getMissionsByStatus('ABORTED').length,
      availableUnits: AVAILABLE_UNITS.length,
      availableTargets: AVAILABLE_TARGETS.length
    };
  }

  return {
    MISSION_TYPES,
    MISSION_STATUS,
    PRIORITY,
    UNIT_CATEGORIES,
    AVAILABLE_UNITS,
    AVAILABLE_TARGETS,
    MISSIONS,
    getMission,
    getUnit,
    getTarget,
    getMissionsByStatus,
    getStats
  };
})();

if (typeof window !== 'undefined') window.OperasiData = OperasiData;
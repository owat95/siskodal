/* ============================================================
 * ICR-CORE.JS — NATO Common ICR Framework
 * Shared across AD/AL/AU. Reference: NATO AJP-2, STANAG series
 * ============================================================ */

const ICRCore = (() => {
  'use strict';

  // ============================================
  // NATO INTELLIGENCE DISCIPLINES
  // ============================================
  const INT_DISCIPLINES = {
    IMINT:   { code: 'IMINT',   name: 'Imagery Intelligence',         color: '#3b82f6', icon: '📷' },
    SIGINT:  { code: 'SIGINT',  name: 'Signals Intelligence',         color: '#a855f7', icon: '📡' },
    HUMINT:  { code: 'HUMINT',  name: 'Human Intelligence',           color: '#eab308', icon: '👤' },
    MASINT:  { code: 'MASINT',  name: 'Measurement & Signature',      color: '#f97316', icon: '📊' },
    OSINT:   { code: 'OSINT',   name: 'Open Source Intelligence',     color: '#22c55e', icon: '🌐' },
    GEOINT:  { code: 'GEOINT',  name: 'Geospatial Intelligence',      color: '#06b6d4', icon: '🗺️' },
    TECHINT: { code: 'TECHINT', name: 'Technical Intelligence',       color: '#ef4444', icon: '🔧' },
    CYBERINT:{ code: 'CYBERINT',name: 'Cyber Intelligence',           color: '#ec4899', icon: '💻' }
  };

  // ============================================
  // NATO CLASSIFICATION LEVELS
  // ============================================
  const CLASSIFICATION = {
    UNCLASS:      { level: 0, label: 'UNCLASSIFIED', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    RESTRICTED:   { level: 1, label: 'RESTRICTED',   color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
    CONFIDENTIAL: { level: 2, label: 'CONFIDENTIAL', color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    SECRET:       { level: 3, label: 'SECRET',       color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    TOP_SECRET:   { level: 4, label: 'TOP SECRET',   color: '#991b1b', bg: 'rgba(153,27,27,0.25)' }
  };

  // ============================================
  // INTELLIGENCE CYCLE (NATO AJP-2.1)
  // ============================================
  const INT_CYCLE = [
    { phase: 1, name: 'DIRECTION',      desc: 'Komandan tetapkan PIR & IR' },
    { phase: 2, name: 'COLLECTION',     desc: 'Tasking sensor & platform' },
    { phase: 3, name: 'PROCESSING',     desc: 'Transform raw → usable' },
    { phase: 4, name: 'EXPLOITATION',   desc: 'Analisis → intelligence' },
    { phase: 5, name: 'DISSEMINATION',  desc: 'Distribusi ke consumer' },
    { phase: 6, name: 'FEEDBACK',       desc: 'Refinement & re-tasking' }
  ];

  // ============================================
  // PIR MATRIX (per matra)
  // ============================================
  const PIR_MATRIX = {
    ad: [
      { id: 'PIR-AD-001', priority: 'P1', domain: 'LAND_BORDER',   text: 'Deteksi pergerakan militer asing di perbatasan Malaysia', active: true },
      { id: 'PIR-AD-002', priority: 'P1', domain: 'LAND_BORDER',   text: 'Monitoring aktivitas OPM di Papua', active: true },
      { id: 'PIR-AD-003', priority: 'P2', domain: 'INTERNAL',      text: 'Deteksi kelompok separatis bersenjata', active: true },
      { id: 'PIR-AD-004', priority: 'P2', domain: 'LOGISTICS',     text: 'Monitoring jalur logistik lintas batas', active: false }
    ],
    al: [
      { id: 'PIR-AL-001', priority: 'P1', domain: 'MARITIME',      text: 'Deteksi kapal asing tanpa AIS di Natuna', active: true },
      { id: 'PIR-AL-002', priority: 'P1', domain: 'MARITIME',      text: 'Monitoring illegal fishing di Arafuru', active: true },
      { id: 'PIR-AL-003', priority: 'P2', domain: 'SUBSURFACE',    text: 'Deteksi aktivitas kapal selam asing', active: true },
      { id: 'PIR-AL-004', priority: 'P3', domain: 'SMUGGLING',     text: 'Monitoring penyelundupan Selat Malaka', active: true }
    ],
    au: [
      { id: 'PIR-AU-001', priority: 'P1', domain: 'AIRSPACE',      text: 'Deteksi intrusi udara di FIR Jakarta', active: true },
      { id: 'PIR-AU-002', priority: 'P1', domain: 'AIRSPACE',      text: 'Monitoring UAV asing di Natuna', active: true },
      { id: 'PIR-AU-003', priority: 'P2', domain: 'RADAR',         text: 'Deteksi emisi radar asing', active: true },
      { id: 'PIR-AU-004', priority: 'P2', domain: 'SIGINT',        text: 'Intercept komunikasi udara asing', active: false }
    ]
  };

  // ============================================
  // NATO MESSAGE FORMATS
  // ============================================
  const NATO_FORMATS = {
    'STANAG_4607':  { code: '4607', name: 'GMTI',              desc: 'Ground Moving Target Indicator' },
    'STANAG_4609':  { code: '4609', name: 'FMV',               desc: 'Full Motion Video' },
    'STANAG_4545':  { code: '4545', name: 'NITF',              desc: 'National Imagery Transmission Format' },
    'STANAG_7023':  { code: '7023', name: 'Recce Imagery',     desc: 'Air Reconnaissance Primary Imagery' },
    'STANAG_4676':  { code: '4676', name: 'ISR Tracking',      desc: 'ISR Tracking Standard' },
    'STANAG_4586':  { code: '4586', name: 'UAV Control',       desc: 'UAV Control System' },
    'STANAG_4559':  { code: '4559', name: 'NSILI',             desc: 'NATO Standard ISR Library Interface' },
    'ADatP-3':      { code: 'ADatP-3', name: 'NATO Msg Text',  desc: 'NATO Message Text Format' }
  };

  // ============================================
  // MATRA PROFILES (untuk ditonjolkan)
  // ============================================
  const MATRA_PROFILES = {
    ad: {
      code: 'AD',
      name: 'TNI ANGKATAN DARAT',
      color: '#059669',
      icon: '★',
      strength: [
        'Ground-based persistent surveillance 24/7',
        'Batalyon Intelijen lapangan (HUMINT kuat)',
        'Perbatasan darat Malaysia & PNG coverage',
        'SIGINT truck mobile di perbatasan',
        'Teritorial intel network sampai desa'
      ],
      primarySensors: ['CCTV Border', 'Ground Radar', 'Tactical UAV', 'SIGINT Truck', 'HUMINT Field Agent'],
      natoFormats: ['STANAG_4607', 'STANAG_4676', 'ADatP-3']
    },
    al: {
      code: 'AL',
      name: 'TNI ANGKATAN LAUT',
      color: '#1e40af',
      icon: '⚓',
      strength: [
        'Maritime Domain Awareness (MDA) — 2/3 NKRI',
        'Subsurface detection (sonar array)',
        'Coastal radar network 24/7',
        'MPA (Maritime Patrol Aircraft) integrated',
        'Pangkat laut + kapal selam patroli'
      ],
      primarySensors: ['Coastal Radar', 'Ship Sonar', 'Sonobuoy', 'MPA FLIR', 'AIS Receiver'],
      natoFormats: ['STANAG_4609', 'STANAG_4607', 'STANAG_4559']
    },
    au: {
      code: 'AU',
      name: 'TNI ANGKATAN UDARA',
      color: '#2563eb',
      icon: '✈',
      strength: [
        'Airspace surveillance (GCI Radar 200km)',
        'AWACS-like airborne early warning',
        'Fighter recon pod (IMINT real-time)',
        'MALE UAV (long endurance 24+ jam)',
        'Air-to-air + air-to-ground imagery'
      ],
      primarySensors: ['GCI Radar', 'AWACS', 'Fighter Pod', 'MALE UAV', 'Ground ELINT'],
      natoFormats: ['STANAG_4545', 'STANAG_7023', 'STANAG_4586']
    }
  };

  // ============================================
  // CONFIG — Edge AI Thresholds
  // ============================================
  const EDGE_CONFIG = {
    confidenceThreshold: 0.7,     // Minimum AI confidence
    eventBufferSize: 1000,         // Max events di edge buffer
    batchIntervalMs: 5000,         // Kirim batch setiap 5 detik
    heartbeatIntervalMs: 30000,    // Heartbeat ke middleware
    bandwidthReductionTarget: 0.99, // 99% bandwidth saving
    encryption: 'AES-256-GCM',
    transmissionProtocol: 'MQTT-over-TLS'
  };

  // ============================================
  // HELPERS
  // ============================================
  function getDiscipline(code) {
    return INT_DISCIPLINES[code] || null;
  }

  function getClassification(code) {
    return CLASSIFICATION[code] || CLASSIFICATION.UNCLASS;
  }

  function getPIR(matra, priority = null) {
    const list = PIR_MATRIX[matra] || [];
    return priority ? list.filter(p => p.priority === priority) : list;
  }

  function getActivePIR(matra) {
    return (PIR_MATRIX[matra] || []).filter(p => p.active);
  }

  function getProfile(matra) {
    return MATRA_PROFILES[matra] || null;
  }

  function getNatoFormat(key) {
    return NATO_FORMATS[key] || null;
  }

  function getAllDisciplines() {
    return Object.values(INT_DISCIPLINES);
  }

  function getAllClassifications() {
    return Object.entries(CLASSIFICATION).map(([k, v]) => ({ key: k, ...v }));
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    INT_DISCIPLINES,
    CLASSIFICATION,
    INT_CYCLE,
    PIR_MATRIX,
    NATO_FORMATS,
    MATRA_PROFILES,
    EDGE_CONFIG,
    getDiscipline,
    getClassification,
    getPIR,
    getActivePIR,
    getProfile,
    getNatoFormat,
    getAllDisciplines,
    getAllClassifications
  };
})();

if (typeof window !== 'undefined') window.ICRCore = ICRCore;
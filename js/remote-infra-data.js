/* ============================================================
 * REMOTE-INFRA-DATA.JS — Remote Infrastructure Monitoring
 * Version:  v2.0 — Network Segmentation Fix (ISSUE-001)
 * Build:    2026-10-05
 *
 * 40 sites total:
 *   - 27 Kodam  (7 regions + 1 reserve block)
 *   -  8 Edge AI (frontier Jetson Orin AGX)
 *   -  4 Middleware hubs (Kafka/Redis aggregation)
 *   -  1 IKN Central (strategic AI command)
 *
 * IP ALLOCATION SCHEME
 * ────────────────────
 * Layer / Region        CIDR Block              Purpose
 * ─────────────────────────────────────────────────────────────
 * SENSOR                10.20.0.0/16            Aggregated sensor layer
 * IKN_CENTRAL           10.90.0.0/16            Strategic AI command
 * MIDDLEWARE            10.80.0.0/16            Regional hubs
 * KODAM JAWA            10.60.0.0/16            5 Kodam + reserve
 * KODAM SUMATERA        10.61.0.0/16            7 Kodam + reserve
 * KODAM KALIMANTAN      10.62.0.0/16            3 Kodam + reserve
 * KODAM BALI_NUSA       10.63.0.0/16            3 Kodam + reserve
 * KODAM SULAWESI        10.64.0.0/16            3 Kodam + reserve
 * KODAM MALUKU          10.65.0.0/16            2 Kodam + reserve
 * KODAM PAPUA           10.66.0.0/16            4 Kodam + reserve
 * KODAM RESERVE         10.67.0.0/16            Future expansion
 * EDGE_AI               10.70.0.0/16            8 frontier sites
 *
 * HIERARCHY (uplink path)
 * ───────────────────────
 *  Kodam (region)  →  Middleware Hub  →  IKN Central
 *  Edge AI (front) →  Middleware Hub  →  IKN Central
 *  Kodam JAWA      →  IKN Central (direct — strategic)
 *
 * VLAN SCHEME (per site)
 * ──────────────────────
 *  VLAN  100  Management (SSH/HTTPS/SNMP)
 *  VLAN  200  Operational data (MQTT/CBOR)
 *  VLAN  300  CCTV / Video (RTSP)
 *  VLAN  400  Sensor / Telemetry
 *  VLAN  999  Honeypot / Blackhole
 * ============================================================ */

const RemoteInfraData = (() => {
  'use strict';

  // ============================================
  // NETWORK SCHEME — documentation constant
  // ============================================
  const NETWORK_SCHEME = {
    layers: {
      SENSOR:      { block: '10.20.0.0/16', purpose: 'Sensor aggregation (CCTV, radar, FLIR, LoRa, AIS)' },
      IKN_CENTRAL: { block: '10.90.0.0/16', purpose: 'IKN Central Command + AI compute cluster' },
      MIDDLEWARE:  { block: '10.80.0.0/16', purpose: 'Kafka/Redis regional aggregation hubs' },
      EDGE_AI:     { block: '10.70.0.0/16', purpose: 'Jetson Orin AGX frontier sites' }
    },
    regions: {
      JAWA:       { block: '10.60.0.0/16', kodamCount: 5 },
      SUMATERA:   { block: '10.61.0.0/16', kodamCount: 7 },
      KALIMANTAN: { block: '10.62.0.0/16', kodamCount: 3 },
      BALI_NUSA:  { block: '10.63.0.0/16', kodamCount: 3 },
      SULAWESI:   { block: '10.64.0.0/16', kodamCount: 3 },
      MALUKU:     { block: '10.65.0.0/16', kodamCount: 2 },
      PAPUA:      { block: '10.66.0.0/16', kodamCount: 4 },
      RESERVE:    { block: '10.67.0.0/16', kodamCount: 0 }
    },
    vlans: {
      MGMT:      { id: 100, purpose: 'Management plane (SSH/HTTPS/SNMP)' },
      OPS:       { id: 200, purpose: 'Operational data plane' },
      CCTV:      { id: 300, purpose: 'Video / RTSP plane' },
      SENSOR:    { id: 400, purpose: 'Sensor / telemetry plane' },
      HONEYPOT:  { id: 999, purpose: 'Honeypot / blackhole' }
    },
    routing: {
      intraRegion: 'OSPF',
      interRegion: 'BGP',
      baseASN: 65000
    }
  };

  // ============================================
  // SITES REGISTRY
  // ============================================
  const SITES = [
    // ==================================================
    // 27 KODAM  — sequential /24 per region
    // ==================================================

    // ---------- JAWA (10.60.0.0/16) ----------
    { id: 'kodam-jayakarta',    name: 'Kodam Jayakarta',             shortName: 'Kodam Jaya',    type: 'KODAM', region: 'JAWA',       lat: -6.175, lon: 106.827, hq: 'Jakarta',        tier: 'CORE',
      ip: '10.60.1.10',  subnet: '10.60.1.0/24',  gateway: '10.60.1.1',  vlan: 100, uplink: 'ikn-ai',   routing: 'OSPF', asn: 65101 },
    { id: 'kodam-siliwangi',    name: 'Kodam III/Siliwangi',         shortName: 'Kodam III/SLW', type: 'KODAM', region: 'JAWA',       lat: -6.914, lon: 107.609, hq: 'Bandung',        tier: 'CORE',
      ip: '10.60.2.10',  subnet: '10.60.2.0/24',  gateway: '10.60.2.1',  vlan: 100, uplink: 'ikn-ai',   routing: 'OSPF', asn: 65101 },
    { id: 'kodam-diponegoro',   name: 'Kodam IV/Diponegoro',         shortName: 'Kodam IV/DIP',  type: 'KODAM', region: 'JAWA',       lat: -6.966, lon: 110.419, hq: 'Semarang',       tier: 'CORE',
      ip: '10.60.3.10',  subnet: '10.60.3.0/24',  gateway: '10.60.3.1',  vlan: 100, uplink: 'ikn-ai',   routing: 'OSPF', asn: 65101 },
    { id: 'kodam-brawijaya',    name: 'Kodam V/Brawijaya',           shortName: 'Kodam V/BJW',   type: 'KODAM', region: 'JAWA',       lat: -7.257, lon: 112.752, hq: 'Surabaya',       tier: 'CORE',
      ip: '10.60.4.10',  subnet: '10.60.4.0/24',  gateway: '10.60.4.1',  vlan: 100, uplink: 'ikn-ai',   routing: 'OSPF', asn: 65101 },
    { id: 'kodam-mataram',      name: 'Kodam XXVI/Mataram',          shortName: 'Kodam XXVI/MTR',type: 'KODAM', region: 'JAWA',       lat: -7.797, lon: 110.370, hq: 'Yogyakarta',     tier: 'EDGE', isNew: true,
      ip: '10.60.5.10',  subnet: '10.60.5.0/24',  gateway: '10.60.5.1',  vlan: 100, uplink: 'ikn-ai',   routing: 'OSPF', asn: 65101 },

    // ---------- SUMATERA (10.61.0.0/16) ----------
    { id: 'kodam-iskandar-muda',   name: 'Kodam Iskandar Muda',        shortName: 'Kodam IM',      type: 'KODAM', region: 'SUMATERA', lat: 5.548,  lon: 95.317,  hq: 'Banda Aceh',    tier: 'EDGE',
      ip: '10.61.1.10',  subnet: '10.61.1.0/24',  gateway: '10.61.1.1',  vlan: 100, uplink: 'mw-medan', routing: 'OSPF', asn: 65102 },
    { id: 'kodam-bukit-barisan',   name: 'Kodam I/Bukit Barisan',      shortName: 'Kodam I/BB',    type: 'KODAM', region: 'SUMATERA', lat: 3.595,  lon: 98.672,  hq: 'Medan',         tier: 'CORE',
      ip: '10.61.2.10',  subnet: '10.61.2.0/24',  gateway: '10.61.2.1',  vlan: 100, uplink: 'mw-medan', routing: 'OSPF', asn: 65102 },
    { id: 'kodam-sriwijaya',       name: 'Kodam II/Sriwijaya',         shortName: 'Kodam II/SWJ',  type: 'KODAM', region: 'SUMATERA', lat: -2.976, lon: 104.775, hq: 'Palembang',     tier: 'CORE',
      ip: '10.61.3.10',  subnet: '10.61.3.0/24',  gateway: '10.61.3.1',  vlan: 100, uplink: 'mw-medan', routing: 'OSPF', asn: 65102 },
    { id: 'kodam-tuanku-tambusai', name: 'Kodam XIX/Tuanku Tambusai',  shortName: 'Kodam XIX/TT',  type: 'KODAM', region: 'SUMATERA', lat: 0.507,  lon: 101.448, hq: 'Pekanbaru',     tier: 'EDGE', isNew: true,
      ip: '10.61.4.10',  subnet: '10.61.4.0/24',  gateway: '10.61.4.1',  vlan: 100, uplink: 'mw-medan', routing: 'OSPF', asn: 65102 },
    { id: 'kodam-tuanku-imam-bonjol', name: 'Kodam XX/Tuanku Imam Bonjol', shortName: 'Kodam XX/TIB', type: 'KODAM', region: 'SUMATERA', lat: -0.947, lon: 100.417, hq: 'Padang', tier: 'EDGE', isNew: true,
      ip: '10.61.5.10',  subnet: '10.61.5.0/24',  gateway: '10.61.5.1',  vlan: 100, uplink: 'mw-medan', routing: 'OSPF', asn: 65102 },
    { id: 'kodam-radin-inten',     name: 'Kodam XXI/Radin Inten',      shortName: 'Kodam XXI/RI',  type: 'KODAM', region: 'SUMATERA', lat: -5.429, lon: 105.262, hq: 'Bandar Lampung', tier: 'EDGE', isNew: true,
      ip: '10.61.6.10',  subnet: '10.61.6.0/24',  gateway: '10.61.6.1',  vlan: 100, uplink: 'mw-medan', routing: 'OSPF', asn: 65102 },
    { id: 'kodam-mahmud-riayat-syah', name: 'Kodam XXV/Mahmud Riayat Syah', shortName: 'Kodam XXV/MRS', type: 'KODAM', region: 'SUMATERA', lat: 0.918, lon: 104.446, hq: 'Tanjungpinang', tier: 'EDGE', isNew: true,
      ip: '10.61.7.10',  subnet: '10.61.7.0/24',  gateway: '10.61.7.1',  vlan: 100, uplink: 'mw-medan', routing: 'OSPF', asn: 65102 },

    // ---------- KALIMANTAN (10.62.0.0/16) ----------
    { id: 'kodam-mulawarman',    name: 'Kodam VI/Mulawarman',         shortName: 'Kodam VI/MLW',  type: 'KODAM', region: 'KALIMANTAN', lat: -1.267, lon: 116.831, hq: 'Balikpapan',  tier: 'CORE',
      ip: '10.62.1.10',  subnet: '10.62.1.0/24',  gateway: '10.62.1.1',  vlan: 100, uplink: 'mw-balikpapan', routing: 'OSPF', asn: 65103 },
    { id: 'kodam-tanjungpura',   name: 'Kodam XII/Tanjungpura',       shortName: 'Kodam XII/TPR', type: 'KODAM', region: 'KALIMANTAN', lat: -0.026, lon: 109.342, hq: 'Pontianak',   tier: 'EDGE',
      ip: '10.62.2.10',  subnet: '10.62.2.0/24',  gateway: '10.62.2.1',  vlan: 100, uplink: 'mw-balikpapan', routing: 'OSPF', asn: 65103 },
    { id: 'kodam-tambun-bungai', name: 'Kodam XXII/Tambun Bungai',    shortName: 'Kodam XXII/TB', type: 'KODAM', region: 'KALIMANTAN', lat: -2.208, lon: 113.916, hq: 'Palangkaraya', tier: 'EDGE', isNew: true,
      ip: '10.62.3.10',  subnet: '10.62.3.0/24',  gateway: '10.62.3.1',  vlan: 100, uplink: 'mw-balikpapan', routing: 'OSPF', asn: 65103 },

    // ---------- BALI_NUSA (10.63.0.0/16) ----------
    { id: 'kodam-udayana',      name: 'Kodam IX/Udayana',             shortName: 'Kodam IX/UDAY', type: 'KODAM', region: 'BALI_NUSA', lat: -8.652, lon: 115.219, hq: 'Denpasar',  tier: 'CORE',
      ip: '10.63.1.10',  subnet: '10.63.1.0/24',  gateway: '10.63.1.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65104 },
    { id: 'kodam-sobe-sonbai',  name: 'Kodam XXVII/Sobe Sonbai',      shortName: 'Kodam XXVII/SSB', type: 'KODAM', region: 'BALI_NUSA', lat: -10.163, lon: 123.603, hq: 'Kupang', tier: 'EDGE', isNew: true,
      ip: '10.63.2.10',  subnet: '10.63.2.0/24',  gateway: '10.63.2.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65104 },
    { id: 'kodam-rinambora',    name: 'Kodam XXX/Rinambora',          shortName: 'Kodam XXX/RNB', type: 'KODAM', region: 'BALI_NUSA', lat: -8.583, lon: 116.117, hq: 'Mataram', tier: 'EDGE', isNew: true,
      ip: '10.63.3.10',  subnet: '10.63.3.0/24',  gateway: '10.63.3.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65104 },

    // ---------- SULAWESI (10.64.0.0/16) ----------
    { id: 'kodam-merdeka',      name: 'Kodam XIII/Merdeka',           shortName: 'Kodam XIII/MDK', type: 'KODAM', region: 'SULAWESI', lat: 1.474,  lon: 124.842, hq: 'Manado',   tier: 'CORE',
      ip: '10.64.1.10',  subnet: '10.64.1.0/24',  gateway: '10.64.1.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65105 },
    { id: 'kodam-hasanuddin',   name: 'Kodam XIV/Hasanuddin',         shortName: 'Kodam XIV/HSD',  type: 'KODAM', region: 'SULAWESI', lat: -5.147, lon: 119.432, hq: 'Makassar', tier: 'CORE',
      ip: '10.64.2.10',  subnet: '10.64.2.0/24',  gateway: '10.64.2.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65105 },
    { id: 'kodam-palaka-wira',  name: 'Kodam XXIII/Palaka Wira',      shortName: 'Kodam XXIII/PW', type: 'KODAM', region: 'SULAWESI', lat: -0.891, lon: 119.870, hq: 'Palu', tier: 'EDGE', isNew: true,
      ip: '10.64.3.10',  subnet: '10.64.3.0/24',  gateway: '10.64.3.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65105 },

    // ---------- MALUKU (10.65.0.0/16) ----------
    { id: 'kodam-pattimura',       name: 'Kodam XVI/Pattimura',       shortName: 'Kodam XVI/PTM',  type: 'KODAM', region: 'MALUKU', lat: -3.695, lon: 128.181, hq: 'Ambon',   tier: 'CORE',
      ip: '10.65.1.10',  subnet: '10.65.1.0/24',  gateway: '10.65.1.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65106 },
    { id: 'kodam-moloku-kie-raha', name: 'Kodam XXVIII/Moloku Kie Raha', shortName: 'Kodam XXVIII/MKR', type: 'KODAM', region: 'MALUKU', lat: 0.808, lon: 127.375, hq: 'Ternate', tier: 'EDGE', isNew: true,
      ip: '10.65.2.10',  subnet: '10.65.2.0/24',  gateway: '10.65.2.1',  vlan: 100, uplink: 'mw-makassar', routing: 'OSPF', asn: 65106 },

    // ---------- PAPUA (10.66.0.0/16) ----------
    { id: 'kodam-cenderawasih',    name: 'Kodam XVII/Cenderawasih',   shortName: 'Kodam XVII/CIJ', type: 'KODAM', region: 'PAPUA', lat: -2.533, lon: 140.717, hq: 'Jayapura',  tier: 'CORE',
      ip: '10.66.1.10',  subnet: '10.66.1.0/24',  gateway: '10.66.1.1',  vlan: 100, uplink: 'mw-jayapura', routing: 'OSPF', asn: 65107 },
    { id: 'kodam-kasuari',         name: 'Kodam XVIII/Kasuari',       shortName: 'Kodam XVIII/KSR', type: 'KODAM', region: 'PAPUA', lat: -0.861, lon: 134.062, hq: 'Manokwari', tier: 'EDGE',
      ip: '10.66.2.10',  subnet: '10.66.2.0/24',  gateway: '10.66.2.1',  vlan: 100, uplink: 'mw-jayapura', routing: 'OSPF', asn: 65107 },
    { id: 'kodam-mandala-trikora', name: 'Kodam XXIV/Mandala Trikora', shortName: 'Kodam XXIV/MT', type: 'KODAM', region: 'PAPUA', lat: -8.493, lon: 140.401, hq: 'Merauke', tier: 'EDGE', isNew: true,
      ip: '10.66.3.10',  subnet: '10.66.3.0/24',  gateway: '10.66.3.1',  vlan: 100, uplink: 'mw-jayapura', routing: 'OSPF', asn: 65107 },
    { id: 'kodam-mambruk',         name: 'Kodam XXIX/Mambruk',        shortName: 'Kodam XXIX/MBR', type: 'KODAM', region: 'PAPUA', lat: -4.547, lon: 136.888, hq: 'Timika', tier: 'EDGE', isNew: true,
      ip: '10.66.4.10',  subnet: '10.66.4.0/24',  gateway: '10.66.4.1',  vlan: 100, uplink: 'mw-jayapura', routing: 'OSPF', asn: 65107 },

    // ==================================================
    // 8 EDGE AI SITES — frontier Jetson Orin AGX
    // Subnetted by geographic proximity to region
    // ==================================================
    { id: 'edge-sabang',   name: 'Edge AI Sabang',          shortName: 'Edge Sabang',  type: 'EDGE_AI', region: 'SUMATERA',   lat: 5.893,  lon: 95.321,  tier: 'SENSOR_EDGE',
      ip: '10.70.1.10',  subnet: '10.70.1.0/24',  gateway: '10.70.1.1',  vlan: 400, uplink: 'mw-medan',     routing: 'BGP', asn: 65201, hardware: 'Jetson Orin AGX 64GB' },
    { id: 'edge-natuna',   name: 'Edge AI Natuna',          shortName: 'Edge Natuna',  type: 'EDGE_AI', region: 'SUMATERA',   lat: 3.950,  lon: 108.383, tier: 'SENSOR_EDGE',
      ip: '10.70.2.10',  subnet: '10.70.2.0/24',  gateway: '10.70.2.1',  vlan: 400, uplink: 'mw-medan',     routing: 'BGP', asn: 65202, hardware: 'Jetson Orin AGX 64GB' },
    { id: 'edge-malaka',   name: 'Edge AI Malaka Strait',   shortName: 'Edge Malaka',  type: 'EDGE_AI', region: 'SUMATERA',   lat: 3.783,  lon: 98.683,  tier: 'SENSOR_EDGE',
      ip: '10.70.3.10',  subnet: '10.70.3.0/24',  gateway: '10.70.3.1',  vlan: 400, uplink: 'mw-medan',     routing: 'BGP', asn: 65203, hardware: 'Jetson Orin AGX 64GB' },
    { id: 'edge-malaysia', name: 'Edge AI Malaysia Border', shortName: 'Edge MY',      type: 'EDGE_AI', region: 'KALIMANTAN', lat: 4.136,  lon: 117.483, tier: 'SENSOR_EDGE',
      ip: '10.70.11.10', subnet: '10.70.11.0/24', gateway: '10.70.11.1', vlan: 400, uplink: 'mw-balikpapan', routing: 'BGP', asn: 65211, hardware: 'Jetson Orin AGX 64GB' },
    { id: 'edge-timor',    name: 'Edge AI Timor Leste',     shortName: 'Edge Timor',   type: 'EDGE_AI', region: 'BALI_NUSA',  lat: -9.106, lon: 124.892, tier: 'SENSOR_EDGE',
      ip: '10.70.21.10', subnet: '10.70.21.0/24', gateway: '10.70.21.1', vlan: 400, uplink: 'mw-makassar',   routing: 'BGP', asn: 65221, hardware: 'Jetson Orin AGX 64GB' },
    { id: 'edge-png',      name: 'Edge AI PNG Border',      shortName: 'Edge PNG',     type: 'EDGE_AI', region: 'PAPUA',      lat: -2.533, lon: 140.717, tier: 'SENSOR_EDGE',
      ip: '10.70.51.10', subnet: '10.70.51.0/24', gateway: '10.70.51.1', vlan: 400, uplink: 'mw-jayapura',   routing: 'BGP', asn: 65251, hardware: 'Jetson Orin AGX 64GB' },
    { id: 'edge-arafuru',  name: 'Edge AI Arafuru',         shortName: 'Edge Arafuru', type: 'EDGE_AI', region: 'PAPUA',      lat: -8.493, lon: 140.401, tier: 'SENSOR_EDGE',
      ip: '10.70.52.10', subnet: '10.70.52.0/24', gateway: '10.70.52.1', vlan: 400, uplink: 'mw-jayapura',   routing: 'BGP', asn: 65252, hardware: 'Jetson Orin AGX 64GB' },
    { id: 'edge-biaksuk',  name: 'Edge AI Biak',            shortName: 'Edge Biak',    type: 'EDGE_AI', region: 'PAPUA',      lat: -1.000, lon: 136.000, tier: 'SENSOR_EDGE',
      ip: '10.70.53.10', subnet: '10.70.53.0/24', gateway: '10.70.53.1', vlan: 400, uplink: 'mw-jayapura',   routing: 'BGP', asn: 65253, hardware: 'Jetson Orin AGX 64GB' },

    // ==================================================
    // 4 MIDDLEWARE HUBS — Kafka / Redis aggregation
    // ==================================================
    { id: 'mw-medan',      name: 'Regional Hub Medan',      shortName: 'Hub Medan',      type: 'MIDDLEWARE', region: 'SUMATERA',   lat: 3.595,  lon: 98.672,  tier: 'REGIONAL_HUB',
      ip: '10.80.1.10', subnet: '10.80.1.0/24', gateway: '10.80.1.1', vlan: 200, uplink: 'ikn-ai', routing: 'BGP', asn: 65301 },
    { id: 'mw-makassar',   name: 'Regional Hub Makassar',   shortName: 'Hub Makassar',   type: 'MIDDLEWARE', region: 'SULAWESI',   lat: -5.147, lon: 119.432, tier: 'REGIONAL_HUB',
      ip: '10.80.2.10', subnet: '10.80.2.0/24', gateway: '10.80.2.1', vlan: 200, uplink: 'ikn-ai', routing: 'BGP', asn: 65302 },
    { id: 'mw-balikpapan', name: 'Regional Hub Balikpapan', shortName: 'Hub Balikpapan', type: 'MIDDLEWARE', region: 'KALIMANTAN', lat: -1.237, lon: 116.852, tier: 'REGIONAL_HUB',
      ip: '10.80.3.10', subnet: '10.80.3.0/24', gateway: '10.80.3.1', vlan: 200, uplink: 'ikn-ai', routing: 'BGP', asn: 65303 },
    { id: 'mw-jayapura',   name: 'Regional Hub Jayapura',   shortName: 'Hub Jayapura',   type: 'MIDDLEWARE', region: 'PAPUA',      lat: -2.533, lon: 140.717, tier: 'REGIONAL_HUB',
      ip: '10.80.4.10', subnet: '10.80.4.0/24', gateway: '10.80.4.1', vlan: 200, uplink: 'ikn-ai', routing: 'BGP', asn: 65304 },

    // ==================================================
    // 1 IKN CENTRAL — Strategic AI Command
    // ==================================================
    { id: 'ikn-ai', name: 'IKN Central AI Server', shortName: 'IKN Central', type: 'CENTRAL', region: 'KALIMANTAN', lat: -0.500, lon: 117.000, tier: 'STRATEGIC',
      ip: '10.90.1.10', subnet: '10.90.1.0/24', gateway: '10.90.1.1', vlan: 100, uplink: null, routing: 'BGP', asn: 65000 }
  ];

  // ============================================
  // HEALTH SIMULATION
  // ============================================
  function deterministicRandom(seed) {
    const hash = seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((hash * 9301 + 49297) % 233280) / 233280;
  }

  function getSiteHealth(site) {
    const r  = deterministicRandom(site.id);
    const r2 = deterministicRandom(site.id + '-2');
    const r3 = deterministicRandom(site.id + '-3');

    let status   = 'ONLINE';
    let pingMs   = 15 + Math.round(r * 50);
    let uptimePct = 99 + Math.round(r2 * 99) / 100;

    if (r > 0.92) {
      status = 'DEGRADED';
      pingMs = 100 + Math.round(r * 200);
      uptimePct = 95 + Math.round(r2 * 400) / 100;
    } else if (r > 0.97) {
      status = 'OFFLINE';
      pingMs = null;
      uptimePct = 85 + Math.round(r2 * 1000) / 100;
    }

    return {
      status,
      pingMs,
      uptimePct: Math.round(uptimePct * 100) / 100,
      bandwidthPct: Math.round(r2 * 80 + 20),
      lastHeartbeat: Date.now() - Math.round(r3 * 60 * 1000),
      temperature:  Math.round(35 + r3 * 20),
      cpuPct:       Math.round(20 + r2 * 60),
      ramPct:       Math.round(30 + r3 * 50),
      lastBackup:   Date.now() - Math.round(r * 24 * 3600 * 1000),
      diskPct:      Math.round(40 + r2 * 45)
    };
  }

  // ============================================
  // STATS
  // ============================================
  function getStats() {
    const healths  = SITES.map(getSiteHealth);
    const online   = healths.filter(h => h.status === 'ONLINE').length;
    const degraded = healths.filter(h => h.status === 'DEGRADED').length;
    const offline  = healths.filter(h => h.status === 'OFFLINE').length;

    const activePings = healths.filter(h => h.pingMs);
    const avgPing = activePings.length > 0
      ? Math.round(activePings.reduce((a, h) => a + h.pingMs, 0) / activePings.length)
      : 0;

    const avgUptime = Math.round(
      healths.reduce((a, h) => a + h.uptimePct, 0) / healths.length * 100
    ) / 100;

    return {
      total: SITES.length,
      online,
      degraded,
      offline,
      healthPct: Math.round((online / SITES.length) * 100),
      avgPing,
      avgUptime,
      byType: {
        KODAM:      SITES.filter(s => s.type === 'KODAM').length,
        EDGE_AI:    SITES.filter(s => s.type === 'EDGE_AI').length,
        MIDDLEWARE: SITES.filter(s => s.type === 'MIDDLEWARE').length,
        CENTRAL:    SITES.filter(s => s.type === 'CENTRAL').length
      }
    };
  }

  function getSitesWithHealth() {
    return SITES.map(s => ({ ...s, health: getSiteHealth(s) }));
  }

  function getSiteById(id) {
    return SITES.find(s => s.id === id);
  }

  function getSitesByRegion(region) {
    return SITES.filter(s => s.region === region);
  }

  function getSitesByType(type) {
    return SITES.filter(s => s.type === type);
  }

  function getSitesByUplink(uplinkId) {
    return SITES.filter(s => s.uplink === uplinkId);
  }

  function getTypeColor(type) {
    return {
      KODAM:      '#059669',
      EDGE_AI:    '#3b82f6',
      MIDDLEWARE: '#a855f7',
      CENTRAL:    '#eab308'
    }[type] || '#64748b';
  }

  function getTypeIcon(type) {
    return {
      KODAM:      '★',
      EDGE_AI:    '🧠',
      MIDDLEWARE: '🔄',
      CENTRAL:    '🎯'
    }[type] || '◉';
  }

  function getTierColor(tier) {
    return {
      STRATEGIC:    '#eab308',
      REGIONAL_HUB: '#a855f7',
      CORE:         '#059669',
      EDGE:         '#10b981',
      SENSOR_EDGE:  '#3b82f6'
    }[tier] || '#64748b';
  }

  return {
    NETWORK_SCHEME,
    SITES,
    getSiteHealth,
    getStats,
    getSitesWithHealth,
    getSiteById,
    getSitesByRegion,
    getSitesByType,
    getSitesByUplink,
    getTypeColor,
    getTypeIcon,
    getTierColor
  };
})();

if (typeof window !== 'undefined') window.RemoteInfraData = RemoteInfraData;
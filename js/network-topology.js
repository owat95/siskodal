/* ============================================================
 * NETWORK-TOPOLOGY.JS â€” v1.0
 * Node + link definition based on C6ISR Master Config
 * ============================================================ */

const NETWORK_TOPOLOGY = {
  // ============================================
  // FIXED NODES (Command + Gateway + Outer Ring)
  // ============================================
  nodes: [
    // === COMMAND CENTERS ===
    { id: 'cmd-jakarta',   name: 'Mabes AD Jakarta',       lat: -6.175,  lon: 106.827, type: 'command', layer: 'command' },
    { id: 'cmd-ikn',       name: 'Mabes AD IKN',           lat: -0.500,  lon: 117.000, type: 'command', layer: 'command' },
    { id: 'dr-makassar',   name: 'DR Site Makassar',       lat: -5.147,  lon: 119.432, type: 'dr',      layer: 'command' },

    // === GATEWAY AD (per pulau) ===
    { id: 'gw-ad-medan',     name: 'Gateway AD Medan',     lat: 3.595,   lon: 98.672,  type: 'ad', layer: 'gateway' },
    { id: 'gw-ad-jakarta',   name: 'Gateway AD Jakarta',   lat: -6.175,  lon: 106.827, type: 'ad', layer: 'gateway' },
    { id: 'gw-ad-ikn',       name: 'Gateway AD IKN',       lat: -0.500,  lon: 117.000, type: 'ad', layer: 'gateway' },
    { id: 'gw-ad-makassar',  name: 'Gateway AD Makassar',  lat: -5.147,  lon: 119.432, type: 'ad', layer: 'gateway' },
    { id: 'gw-ad-jayapura',  name: 'Gateway AD Jayapura',  lat: -2.533,  lon: 140.717, type: 'ad', layer: 'gateway' },

    // === GATEWAY AU (Lanud) ===
    { id: 'gw-au-halim',       name: 'Lanud Halim PK',         lat: -6.266, lon: 106.891, type: 'au', layer: 'gateway' },
    { id: 'gw-au-iswahjudi',   name: 'Lanud Iswahjudi',        lat: -7.616, lon: 111.434, type: 'au', layer: 'gateway' },
    { id: 'gw-au-hasanuddin',  name: 'Lanud Sultan Hasanuddin', lat: -5.061, lon: 119.554, type: 'au', layer: 'gateway' },

    // === GATEWAY AL (Lantamal) ===
    { id: 'gw-al-belawan',   name: 'Lantamal I Belawan',   lat: 3.783,   lon: 98.683,  type: 'al', layer: 'gateway' },
    { id: 'gw-al-padang',    name: 'Lantamal II Padang',   lat: -0.876,  lon: 100.351, type: 'al', layer: 'gateway' },
    { id: 'gw-al-surabaya',  name: 'Lantamal V Surabaya',  lat: -7.206,  lon: 112.735, type: 'al', layer: 'gateway' },
    { id: 'gw-al-kupang',    name: 'Lantamal VII Kupang',  lat: -10.163, lon: 123.603, type: 'al', layer: 'gateway' },

    // === OUTER RING â€” 7 Provinsi Lingkar Luar ===
    { id: 'ring-sabang',   name: 'Ring Sabang',    lat: 5.893,  lon: 95.321,  type: 'ring', layer: 'ring' },
    { id: 'ring-natuna',   name: 'Ring Natuna',    lat: 3.950,  lon: 108.383, type: 'ring', layer: 'ring' },
    { id: 'ring-tarakan',  name: 'Ring Tarakan',   lat: 3.327,  lon: 117.576, type: 'ring', layer: 'ring' },
    { id: 'ring-tahuna',   name: 'Ring Tahuna',    lat: 3.612,  lon: 125.499, type: 'ring', layer: 'ring' },
    { id: 'ring-morotai',  name: 'Ring Morotai',   lat: 2.200,  lon: 128.417, type: 'ring', layer: 'ring' },
    { id: 'ring-biak',     name: 'Ring Biak',      lat: -1.000, lon: 136.000, type: 'ring', layer: 'ring' },
    { id: 'ring-merauke',  name: 'Ring Merauke',   lat: -8.493, lon: 140.401, type: 'ring', layer: 'ring' }
  ],

  // ============================================
  // LINKS â€” PACE Strategy
  // types: fiber, vsat, manet, hf, ring-mesh
  // state: up, degraded, down
  // ============================================
  links: [
    // === PRIMARY FIBER (Solid Green) ===
    { id: 'l-fo-01', from: 'cmd-jakarta',   to: 'gw-ad-jakarta',   type: 'fiber', state: 'up', label: 'Fiber Jakarta' },
    { id: 'l-fo-02', from: 'cmd-jakarta',   to: 'gw-ad-medan',     type: 'fiber', state: 'up', label: 'Telkom FO' },
    { id: 'l-fo-03', from: 'cmd-jakarta',   to: 'gw-ad-makassar',  type: 'fiber', state: 'up', label: 'Moratel FO' },
    { id: 'l-fo-04', from: 'cmd-jakarta',   to: 'gw-ad-ikn',       type: 'fiber', state: 'up', label: 'Moratel FO' },
    { id: 'l-fo-05', from: 'gw-ad-ikn',     to: 'gw-ad-makassar',  type: 'fiber', state: 'up', label: 'FO East Ring' },
    { id: 'l-fo-06', from: 'gw-ad-makassar', to: 'gw-ad-jayapura', lat: '', type: 'fiber', state: 'up', label: 'FO Papua' },
    { id: 'l-fo-07', from: 'cmd-jakarta',   to: 'cmd-ikn',         type: 'fiber', state: 'up', label: 'Sync 1:1' },
    { id: 'l-fo-08', from: 'gw-ad-jakarta', to: 'gw-au-halim',     type: 'fiber', state: 'up', label: 'Base FO' },
    { id: 'l-fo-09', from: 'gw-ad-medan',   to: 'gw-al-belawan',   type: 'fiber', state: 'up', label: 'Naval FO' },

    // === ALTERNATE VSAT (Dashed Blue) ===
    { id: 'l-vs-01', from: 'cmd-jakarta',   to: 'gw-ad-jayapura',  type: 'vsat', state: 'up', label: 'VSAT Backup' },
    { id: 'l-vs-02', from: 'cmd-jakarta',   to: 'gw-au-hasanuddin', type: 'vsat', state: 'up', label: 'VSAT AU' },
    { id: 'l-vs-03', from: 'cmd-jakarta',   to: 'gw-al-kupang',    type: 'vsat', state: 'up', label: 'VSAT AL' },
    { id: 'l-vs-04', from: 'gw-ad-medan',   to: 'gw-al-padang',    type: 'vsat', state: 'up', label: 'VSAT Maritime' },

    // === OUTER RING MESH (Cyan Dashed) ===
    { id: 'l-rm-01', from: 'ring-sabang',   to: 'ring-natuna',     type: 'ring', state: 'up', label: 'Ring Mesh' },
    { id: 'l-rm-02', from: 'ring-natuna',   to: 'ring-tarakan',    type: 'ring', state: 'up', label: 'Ring Mesh' },
    { id: 'l-rm-03', from: 'ring-tarakan',  to: 'ring-tahuna',     type: 'ring', state: 'up', label: 'Ring Mesh' },
    { id: 'l-rm-04', from: 'ring-tahuna',   to: 'ring-morotai',    type: 'ring', state: 'up', label: 'Ring Mesh' },
    { id: 'l-rm-05', from: 'ring-morotai',  to: 'ring-biak',       type: 'ring', state: 'up', label: 'Ring Mesh' },
    { id: 'l-rm-06', from: 'ring-biak',     to: 'ring-merauke',    type: 'ring', state: 'up', label: 'Ring Mesh' },

    // === RING TO MAINLAND (Backup FO/VSAT) ===
    { id: 'l-rm-07', from: 'ring-sabang',   to: 'gw-ad-medan',     type: 'fiber', state: 'up', label: 'FO Backup' },
    { id: 'l-rm-08', from: 'ring-natuna',   to: 'gw-ad-medan',     type: 'fiber', state: 'up', label: 'FO Backup' },
    { id: 'l-rm-09', from: 'ring-tarakan',  to: 'gw-ad-ikn',       type: 'fiber', state: 'up', label: 'FO Backup' },
    { id: 'l-rm-10', from: 'ring-tahuna',   to: 'gw-ad-makassar',  type: 'vsat', state: 'up', label: 'VSAT Ring' },
    { id: 'l-rm-11', from: 'ring-morotai',  to: 'gw-ad-jayapura',  type: 'vsat', state: 'up', label: 'VSAT Ring' },
    { id: 'l-rm-12', from: 'ring-biak',     to: 'gw-ad-jayapura',  type: 'fiber', state: 'up', label: 'FO Ring' },
    { id: 'l-rm-13', from: 'ring-merauke',  to: 'gw-ad-jayapura',  type: 'vsat', state: 'up', label: 'VSAT Ring' }
  ],

  // ============================================
  // COVERAGE â€” Per Sensor Type
  // ============================================
  coverage: [
    { type: 'lora',      radiusKm: 15,  color: '#eab308', label: 'LoRa Sensor (15 km)' },
    { type: 'buoy',      radiusKm: 20,  color: '#06b6d4', label: 'Buoy Akustik (20 km)' },
    { type: 'ais',       radiusKm: 50,  color: '#22c55e', label: 'Smart AIS (50 km)' },
    { type: 'radar-gci', radiusKm: 200, color: '#3b82f6', label: 'Radar GCI (200 km)' },
    { type: 'radar-sea', radiusKm: 100, color: '#059669', label: 'Radar Pantai (100 km)' }
  ],

  // Sensor anchors (posisi sensor)
  sensorAnchors: [
    // LoRa di perbatasan
    { id: 'sensor-lora-01', type: 'lora', lat: 3.0, lon: 109.0, name: 'LoRa Natuna' },
    { id: 'sensor-lora-02', type: 'lora', lat: 1.5, lon: 118.0, name: 'LoRa Kalimantan' },
    { id: 'sensor-lora-03', type: 'lora', lat: -3.0, lon: 141.0, name: 'LoRa Papua' },
    // Buoy
    { id: 'buoy-01', type: 'buoy', lat: 4.5, lon: 108.0, name: 'Buoy Natuna' },
    { id: 'buoy-02', type: 'buoy', lat: -8.0, lon: 133.0, name: 'Buoy Arafuru' },
    // Radar
    { id: 'radar-gci-01', type: 'radar-gci', lat: 4.0, lon: 108.0, name: 'Radar GCI Natuna' },
    { id: 'radar-sea-01', type: 'radar-sea', lat: 2.5, lon: 101.0, name: 'Radar Pantai Malaka' }
  ]
};

// Freeze
Object.freeze(NETWORK_TOPOLOGY);

// Export
if (typeof window !== 'undefined') window.NETWORK_TOPOLOGY = NETWORK_TOPOLOGY;
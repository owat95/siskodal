/* ============================================================
 * ICR-SENSOR-TOPOLOGY.JS — Sensor placement at borders
 * CCTV · Radar · FLIR · LoRa · AIS + Edge AI sites
 * ============================================================ */

const ICRSensorTopology = (() => {
  'use strict';

  // ============================================
  // EDGE AI SITES (Jetson Orin)
  // ============================================
  const EDGE_SITES = [
    {
      id: 'edge-malaysia',
      name: 'Edge AI — Perbatasan Malaysia',
      location: 'Kalimantan Utara (Nunukan)',
      lat: 4.136, lon: 117.483,
      matra: 'ad',
      sensors: ['cctv', 'radar', 'flir', 'lora'],
      coverage: { radius: 50, type: 'LAND' },
      jetsonModel: 'Jetson Orin AGX 64GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-custom',
      bufferHours: 24,
      uplinkBandwidth: '10 Mbps'
    },
    {
      id: 'edge-png',
      name: 'Edge AI — Perbatasan PNG',
      location: 'Papua (Jayapura - Skouw)',
      lat: -2.533, lon: 140.717,
      matra: 'ad',
      sensors: ['cctv', 'flir', 'lora'],
      coverage: { radius: 40, type: 'LAND' },
      jetsonModel: 'Jetson Orin NX 16GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-custom',
      bufferHours: 24,
      uplinkBandwidth: '8 Mbps'
    },
    {
      id: 'edge-natuna',
      name: 'Edge AI — Laut Natuna Utara',
      location: 'Natuna (Ranai)',
      lat: 3.950, lon: 108.383,
      matra: 'al',
      sensors: ['cctv', 'radar', 'flir', 'ais', 'lora'],
      coverage: { radius: 150, type: 'MARITIME' },
      jetsonModel: 'Jetson Orin AGX 64GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-maritime',
      bufferHours: 48,
      uplinkBandwidth: '20 Mbps'
    },
    {
      id: 'edge-malaka',
      name: 'Edge AI — Selat Malaka',
      location: 'Belawan (Sumatera Utara)',
      lat: 3.783, lon: 98.683,
      matra: 'al',
      sensors: ['cctv', 'radar', 'flir', 'ais'],
      coverage: { radius: 100, type: 'MARITIME' },
      jetsonModel: 'Jetson Orin NX 16GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-maritime',
      bufferHours: 24,
      uplinkBandwidth: '15 Mbps'
    },
    {
      id: 'edge-arafuru',
      name: 'Edge AI — Laut Arafuru',
      location: 'Merauke',
      lat: -8.493, lon: 140.401,
      matra: 'al',
      sensors: ['cctv', 'radar', 'flir', 'ais'],
      coverage: { radius: 120, type: 'MARITIME' },
      jetsonModel: 'Jetson Orin AGX 64GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-maritime',
      bufferHours: 48,
      uplinkBandwidth: '15 Mbps'
    },
    {
      id: 'edge-timor',
      name: 'Edge AI — Perbatasan Timor Leste',
      location: 'Atambua',
      lat: -9.106, lon: 124.892,
      matra: 'ad',
      sensors: ['cctv', 'flir', 'lora'],
      coverage: { radius: 40, type: 'LAND' },
      jetsonModel: 'Jetson Orin NX 16GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-custom',
      bufferHours: 24,
      uplinkBandwidth: '8 Mbps'
    },
    {
      id: 'edge-biaksuk',
      name: 'Edge AI — Biak & Supiori',
      location: 'Biak',
      lat: -1.000, lon: 136.000,
      matra: 'au',
      sensors: ['radar', 'flir', 'lora'],
      coverage: { radius: 200, type: 'AIRSPACE' },
      jetsonModel: 'Jetson Orin AGX 64GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-air',
      bufferHours: 48,
      uplinkBandwidth: '20 Mbps'
    },
    {
      id: 'edge-sabang',
      name: 'Edge AI — Sabang (Pintu Barat)',
      location: 'Sabang (Aceh)',
      lat: 5.893, lon: 95.321,
      matra: 'al',
      sensors: ['cctv', 'radar', 'flir', 'ais'],
      coverage: { radius: 100, type: 'MARITIME' },
      jetsonModel: 'Jetson Orin NX 16GB',
      processedFPS: 30,
      yoloModel: 'YOLOv8n-maritime',
      bufferHours: 24,
      uplinkBandwidth: '10 Mbps'
    }
  ];

  // ============================================
  // SENSOR TYPES (untuk ikon & metadata)
  // ============================================
  const SENSOR_TYPES = {
    cctv: {
      code: 'CCTV',
      name: 'CCTV Camera',
      icon: '📹',
      color: '#3b82f6',
      format: 'RTSP / H.265',
      dataRate: '4 Mbps',
      edgeProcessing: 'YOLOv8n object detection',
      disciplines: ['IMINT']
    },
    radar: {
      code: 'RADAR',
      name: 'Surveillance Radar',
      icon: '📡',
      color: '#a855f7',
      format: 'ASTERIX CAT-048',
      dataRate: '100 kbps',
      edgeProcessing: 'Track filtering + clustering',
      disciplines: ['IMINT', 'MASINT']
    },
    flir: {
      code: 'FLIR',
      name: 'Thermal Camera',
      icon: '🌡️',
      color: '#f97316',
      format: 'MISB 0601 KLV + H.264',
      dataRate: '2 Mbps',
      edgeProcessing: 'Thermal anomaly detection',
      disciplines: ['IMINT', 'MASINT']
    },
    lora: {
      code: 'LORA',
      name: 'LoRa Sensor Mesh',
      icon: '📶',
      color: '#eab308',
      format: 'MQTT / CBOR',
      dataRate: '5 kbps',
      edgeProcessing: 'Threshold + anomaly',
      disciplines: ['MASINT']
    },
    ais: {
      code: 'AIS',
      name: 'AIS Receiver',
      icon: '⚓',
      color: '#06b6d4',
      format: 'NMEA 0183 / AIVDM',
      dataRate: '10 kbps',
      edgeProcessing: 'Track validation + spoof detect',
      disciplines: ['OSINT', 'MASINT']
    }
  };

  // ============================================
  // MIDDLEWARE HUBS (Regional)
  // ============================================
  const MIDDLEWARE_HUBS = [
    { id: 'mw-medan',    name: 'Regional Hub Medan',    lat: 3.595,  lon: 98.672,  covers: ['edge-sabang', 'edge-malaka'] },
    { id: 'mw-makassar', name: 'Regional Hub Makassar', lat: -5.147, lon: 119.432, covers: ['edge-arafuru', 'edge-timor', 'edge-natuna'] },
    { id: 'mw-jayapura', name: 'Regional Hub Jayapura', lat: -2.533, lon: 140.717, covers: ['edge-png', 'edge-biaksuk'] },
    { id: 'mw-balikpapan',name:'Regional Hub Balikpapan', lat: -1.237, lon: 116.852, covers: ['edge-malaysia'] }
  ];

  // ============================================
  // IKN AI SERVER (Central)
  // ============================================
  const IKN_SERVER = {
    id: 'ikn-ai',
    name: 'IKN Central AI Server',
    location: 'Kalimantan Timur (IKN)',
    lat: -0.500, lon: 117.000,
    model: 'MiniMax M3 / DeepSeek V4',
    gpu: 'NVIDIA L40S x4',
    capabilities: [
      'Multi-INT Fusion',
      'Strategic Advisor (OODA)',
      'Common Operational Picture',
      'Long-term pattern recognition',
      'Predictive analytics'
    ]
  };

  // ============================================
  // HELPERS
  // ============================================
  function getSitesByMatra(matra) {
    return EDGE_SITES.filter(s => s.matra === matra);
  }

  function getSiteById(id) {
    return EDGE_SITES.find(s => s.id === id);
  }

  function getSensorType(code) {
    return SENSOR_TYPES[code] || null;
  }

  function getTotalSensors() {
    let total = 0;
    EDGE_SITES.forEach(s => { total += s.sensors.length; });
    return total;
  }

  function getStats() {
    return {
      edgeSites: EDGE_SITES.length,
      totalSensors: getTotalSensors(),
      middlewareHubs: MIDDLEWARE_HUBS.length,
      iknServer: 1,
      byMatra: {
        ad: getSitesByMatra('ad').length,
        al: getSitesByMatra('al').length,
        au: getSitesByMatra('au').length
      }
    };
  }

  return {
    EDGE_SITES,
    SENSOR_TYPES,
    MIDDLEWARE_HUBS,
    IKN_SERVER,
    getSitesByMatra,
    getSiteById,
    getSensorType,
    getTotalSensors,
    getStats
  };
})();

if (typeof window !== 'undefined') window.ICRSensorTopology = ICRSensorTopology;
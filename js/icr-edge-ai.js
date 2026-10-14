/* ============================================================
 * ICR-EDGE-AI.JS â€” Edge AI Pipeline Simulation
 * Sensor â†’ Edge (Jetson) â†’ Middleware â†’ IKN
 * ============================================================ */

const ICREdgeAI = (() => {
  'use strict';

  let running = false;
  let eventBuffer = [];        // Raw events (belum difilter)
  let transmittedEvents = [];  // Event yang lulus filter edge
  let stats = {
    rawEventsTotal: 0,
    filteredEventsTotal: 0,
    transmittedTotal: 0,
    bandwidthSaved: 0,        // bytes
    alertsGenerated: 0,
    byMatra: { ad: 0, al: 0, au: 0 },
    byDiscipline: {}
  };
  let interval = null;
  let onEventCallback = null;

  // ============================================
  // SAMPLE EVENT TEMPLATES
  // ============================================
  const EVENT_TEMPLATES = {
    cctv: [
      { type: 'VEHICLE_DETECTED',      confidence: [0.72, 0.98], classification: 'CONFIDENTIAL', discipline: 'IMINT',    msg: 'Kendaraan milititer unidentified' },
      { type: 'PERSONNEL_MOVEMENT',    confidence: [0.65, 0.92], classification: 'RESTRICTED',   discipline: 'IMINT',    msg: 'Pergerakan personel di area terlarang' },
      { type: 'CAMOUFLAGE_ACTIVITY',   confidence: [0.70, 0.95], classification: 'SECRET',       discipline: 'IMINT',    msg: 'Aktivitas kamuflase terdeteksi' },
      { type: 'NORMAL_TRAFFIC',        confidence: [0.80, 0.99], classification: 'UNCLASS',      discipline: 'IMINT',    msg: 'Lalu lintas normal' }
    ],
    radar: [
      { type: 'AIRCRAFT_TRACK',        confidence: [0.85, 0.99], classification: 'CONFIDENTIAL', discipline: 'MASINT',   msg: 'Track udara unidentified' },
      { type: 'VESSEL_TRACK',          confidence: [0.80, 0.98], classification: 'CONFIDENTIAL', discipline: 'MASINT',   msg: 'Track kapal permukaan' },
      { type: 'EMISSION_DETECT',       confidence: [0.60, 0.90], classification: 'SECRET',       discipline: 'SIGINT',   msg: 'Emisi radar asing terdeteksi' }
    ],
    flir: [
      { type: 'THERMAL_ANOMALY',       confidence: [0.75, 0.96], classification: 'CONFIDENTIAL', discipline: 'IMINT',    msg: 'Anomali thermal di wilayah perbatasan' },
      { type: 'HEAT_SIGNATURE',        confidence: [0.70, 0.94], classification: 'RESTRICTED',   discipline: 'MASINT',   msg: 'Heat signature kendaraan' },
      { type: 'NORMAL_THERMAL',        confidence: [0.85, 0.99], classification: 'UNCLASS',      discipline: 'IMINT',    msg: 'Kondisi thermal normal' }
    ],
    lora: [
      { type: 'SEISMIC_ANOMALY',       confidence: [0.70, 0.95], classification: 'CONFIDENTIAL', discipline: 'MASINT',   msg: 'Anomali seismik â€” kemungkinan kendaraan berat' },
      { type: 'MAGNETIC_DETECT',       confidence: [0.65, 0.92], classification: 'RESTRICTED',   discipline: 'MASINT',   msg: 'Anomali magnetik terdeteksi' },
      { type: 'NORMAL_SEISMIC',        confidence: [0.88, 0.99], classification: 'UNCLASS',      discipline: 'MASINT',   msg: 'Seismik normal' }
    ],
    ais: [
      { type: 'VESSEL_NO_AIS',         confidence: [0.80, 0.98], classification: 'CONFIDENTIAL', discipline: 'OSINT',    msg: 'Kapal tanpa AIS terdeteksi' },
      { type: 'AIS_POSITION_JUMP',     confidence: [0.75, 0.95], classification: 'SECRET',       discipline: 'OSINT',    msg: 'Anomali posisi AIS â€” indikasi spoofing' },
      { type: 'MMSI_INVALID',          confidence: [0.70, 0.90], classification: 'CONFIDENTIAL', discipline: 'OSINT',    msg: 'MMSI tidak valid â€” foreign vessel' },
      { type: 'NORMAL_VESSEL',         confidence: [0.85, 0.99], classification: 'UNCLASS',      discipline: 'OSINT',    msg: 'Kapal normal' }
    ]
  };

  // ============================================
  // SIMULATE SENSOR DETECTION
  // ============================================
  function generateRawEvent() {
    // Pick random edge site
    const sites = ICRSensorTopology.EDGE_SITES;
    const site = sites[Math.floor(Math.random() * sites.length)];

    // Pick random sensor at site
    const sensorType = site.sensors[Math.floor(Math.random() * site.sensors.length)];
    const templates = EVENT_TEMPLATES[sensorType] || EVENT_TEMPLATES.cctv;
    const template = templates[Math.floor(Math.random() * templates.length)];

    // Random confidence
    const conf = template.confidence[0] + Math.random() * (template.confidence[1] - template.confidence[0]);

    return {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      siteId: site.id,
      siteName: site.name,
      sensorType,
      sensorName: ICRSensorTopology.SENSOR_TYPES[sensorType]?.name || sensorType,
      matra: site.matra,
      type: template.type,
      confidence: Math.round(conf * 1000) / 1000,
      classification: template.classification,
      discipline: template.discipline,
      message: template.msg,
      lat: site.lat + (Math.random() - 0.5) * 0.5,
      lon: site.lon + (Math.random() - 0.5) * 0.5,
      timestamp: Date.now(),
      rawBandwidthBytes: Math.random() * 5000000 + 1000000, // 1-6 MB (video/imagery)
      edgeProcessingMs: Math.random() * 80 + 20              // 20-100ms
    };
  }

  // ============================================
  // EDGE FILTER
  // ============================================
  function processAtEdge(event) {
    stats.rawEventsTotal++;

    // Threshold confidence
    const passConfidence = event.confidence >= ICRCore.EDGE_CONFIG.confidenceThreshold;

    // Skip NORMAL events (no alert)
    const isNormal = event.type.startsWith('NORMAL');

    if (passConfidence && !isNormal) {
      // EVENT PASSES â€” enrich & compress
      event.edgeProcessed = true;
      event.edgeLatencyMs = event.edgeProcessingMs;
      event.transmittedPayloadBytes = 1024 + Math.random() * 2048; // 1-3 KB (metadata + crop)
      event.bandwidthReduction = 1 - (event.transmittedPayloadBytes / event.rawBandwidthBytes);

      stats.filteredEventsTotal++;
      stats.transmittedTotal++;
      stats.bandwidthSaved += (event.rawBandwidthBytes - event.transmittedPayloadBytes);
      stats.byMatra[event.matra]++;
      stats.byDiscipline[event.discipline] = (stats.byDiscipline[event.discipline] || 0) + 1;

      // Alert level berdasarkan classification
      if (event.classification === 'SECRET' || event.classification === 'TOP_SECRET') {
        stats.alertsGenerated++;
      }

      transmittedEvents.push(event);
      if (transmittedEvents.length > 100) transmittedEvents.shift();

      // Callback
      if (onEventCallback) onEventCallback(event);

      return event;
    }

    return null; // filtered out
  }

  // ============================================
  // HEARTBEAT â€” Uplink status
  // ============================================
  function generateHeartbeat(site) {
    return {
      type: 'HEARTBEAT',
      siteId: site.id,
      siteName: site.name,
      status: 'ONLINE',
      jetsonTemp: 45 + Math.random() * 15,
      cpuUsage: 30 + Math.random() * 40,
      gpuUsage: 40 + Math.random() * 45,
      bufferUsage: Math.random() * 0.5,
      uplinkLatencyMs: 20 + Math.random() * 80,
      timestamp: Date.now()
    };
  }

  // ============================================
  // PUBLIC: START
  // ============================================
  function start(callback, intervalMs = 2000) {
    if (running) return;
    running = true;
    onEventCallback = callback;

    interval = setInterval(() => {
      const event = generateRawEvent();
      processAtEdge(event);
    }, intervalMs);

    console.log(`[ICR-EDGE] Started â€” interval ${intervalMs}ms`);
  }

  function stop() {
    if (interval) clearInterval(interval);
    running = false;
    console.log('[ICR-EDGE] Stopped');
  }

  // ============================================
  // MANUAL TRIGGER (untuk demo)
  // ============================================
  function triggerScenario(type) {
    const site = ICRSensorTopology.EDGE_SITES.find(s =>
      type === 'maritime' ? s.matra === 'al' :
      type === 'air' ? s.matra === 'au' : s.matra === 'ad'
    ) || ICRSensorTopology.EDGE_SITES[0];

    const scenarios = {
      intrusion: {
        sensorType: 'cctv',
        type: 'CAMOUFLAGE_ACTIVITY',
        confidence: 0.95,
        classification: 'SECRET',
        discipline: 'IMINT',
        message: 'Pergerakan militer asing di perbatasan â€” high confidence'
      },
      hostile_radar: {
        sensorType: 'radar',
        type: 'EMISSION_DETECT',
        confidence: 0.92,
        classification: 'SECRET',
        discipline: 'SIGINT',
        message: 'Emisi radar asing terdeteksi di area terbatas'
      },
      vessel_anomaly: {
        sensorType: 'ais',
        type: 'AIS_POSITION_JUMP',
        confidence: 0.88,
        classification: 'SECRET',
        discipline: 'OSINT',
        message: 'AIS spoofing terdeteksi â€” foreign vessel suspected'
      },
      thermal_contact: {
        sensorType: 'flir',
        type: 'THERMAL_ANOMALY',
        confidence: 0.90,
        classification: 'CONFIDENTIAL',
        discipline: 'IMINT',
        message: 'Thermal signature konsisten dengan kendaraan tempur'
      }
    };

    const s = scenarios[type];
    if (!s) return;

    const event = {
      id: `evt-scenario-${Date.now()}`,
      siteId: site.id,
      siteName: site.name,
      sensorType: s.sensorType,
      sensorName: ICRSensorTopology.SENSOR_TYPES[s.sensorType]?.name,
      matra: site.matra,
      type: s.type,
      confidence: s.confidence,
      classification: s.classification,
      discipline: s.discipline,
      message: s.message,
      lat: site.lat,
      lon: site.lon,
      timestamp: Date.now(),
      rawBandwidthBytes: 8000000,
      edgeProcessingMs: 65,
      isScenario: true
    };

    processAtEdge(event);
    return event;
  }

  // ============================================
  // GETTERS
  // ============================================
  function getStats() {
    return {
      ...stats,
      bandwidthSavedMB: Math.round(stats.bandwidthSaved / 1024 / 1024 * 10) / 10,
      reductionRatio: stats.rawEventsTotal > 0
        ? Math.round((1 - stats.transmittedTotal / stats.rawEventsTotal) * 100) / 100
        : 0
    };
  }

  function getRecentEvents(limit = 20) {
    return transmittedEvents.slice(-limit).reverse();
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    start,
    stop,
    triggerScenario,
    getStats,
    getRecentEvents,
    isRunning: () => running
  };
})();

if (typeof window !== 'undefined') window.ICREdgeAI = ICREdgeAI;
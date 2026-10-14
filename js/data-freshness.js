/* ============================================================
 * DATA-FRESHNESS.JS â€” Data Source Health & Sync Monitor
 * Semua visualisasi wajib register di sini untuk tracking
 * ============================================================ */

const DataFreshness = (() => {
  'use strict';

  // ============================================
  // DATA SOURCE REGISTRY
  // ============================================
  const SOURCES = new Map();
  // {
  //   id: {
  //     name, category, expectedIntervalSec, lastUpdate,
  //     status (FRESH|STALE|OFFLINE), dataPoints, sourceType
  //   }
  // }

  // ============================================
  // THRESHOLDS
  // ============================================
  const THRESHOLDS = {
    FRESH: 1.5,    // < 1.5x expected interval = fresh
    STALE: 3.0     // < 3x = stale, > 3x = offline
  };

  // ============================================
  // REGISTER DATA SOURCE
  // ============================================
  function register(id, config) {
    SOURCES.set(id, {
      id,
      name: config.name,
      category: config.category || 'general',
      expectedIntervalSec: config.expectedIntervalSec || 60,
      sourceType: config.sourceType || 'sensor',
      lastUpdate: config.lastUpdate || Date.now(),
      dataPoints: config.dataPoints || 0,
      errorCount: 0,
      priority: config.priority || 'MEDIUM'
    });
    console.log(`[FRESHNESS] Registered: ${id}`);
  }

  // ============================================
  // HEARTBEAT â€” update source
  // ============================================
  function heartbeat(id, count = 1) {
    const s = SOURCES.get(id);
    if (!s) return;
    s.lastUpdate = Date.now();
    s.dataPoints += count;
    s.errorCount = 0;
  }

  function reportError(id) {
    const s = SOURCES.get(id);
    if (!s) return;
    s.errorCount++;
  }

  // ============================================
  // GET STATUS
  // ============================================
  function getStatus(id) {
    const s = SOURCES.get(id);
    if (!s) return null;

    const ageSec = (Date.now() - s.lastUpdate) / 1000;
    const ratio = ageSec / s.expectedIntervalSec;

    let status = 'FRESH';
    let color = '#22c55e';
    let label = 'FRESH';

    if (ratio > THRESHOLDS.STALE) {
      status = 'OFFLINE';
      color = '#ef4444';
      label = 'OFFLINE';
    } else if (ratio > THRESHOLDS.FRESH) {
      status = 'STALE';
      color = '#eab308';
      label = 'STALE';
    }

    return {
      ...s,
      ageSec: Math.round(ageSec),
      ageText: formatAge(ageSec),
      status,
      color,
      label,
      ratio: Math.round(ratio * 10) / 10
    };
  }

  function formatAge(sec) {
    if (sec < 60) return `${Math.round(sec)}s ago`;
    if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
    return `${Math.floor(sec / 86400)}d ago`;
  }

  // ============================================
  // GET ALL + SUMMARY
  // ============================================
  function getAll() {
    return Array.from(SOURCES.keys()).map(getStatus);
  }

  function getSummary() {
    const all = getAll();
    return {
      total: all.length,
      fresh: all.filter(s => s.status === 'FRESH').length,
      stale: all.filter(s => s.status === 'STALE').length,
      offline: all.filter(s => s.status === 'OFFLINE').length,
      overallHealth: all.length > 0
        ? Math.round((all.filter(s => s.status === 'FRESH').length / all.length) * 100)
        : 0
    };
  }

  // ============================================
  // RENDER INDICATOR (komponen kecil)
  // ============================================
  function renderIndicator(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const summary = getSummary();
    const all = getAll();

    const healthColor = summary.overallHealth >= 90 ? '#22c55e'
                      : summary.overallHealth >= 70 ? '#eab308'
                      : '#ef4444';

    container.innerHTML = `
      <div class="freshness-indicator" title="Klik untuk detail">
        <span class="fi-icon" style="color:${healthColor};">â—</span>
        <span class="fi-text">
          DATA SYNC: <strong style="color:${healthColor};">${summary.overallHealth}%</strong>
        </span>
        <span class="fi-detail">
          ${summary.fresh}âœ“ ${summary.stale > 0 ? summary.stale + 'âš  ' : ''}${summary.offline > 0 ? summary.offline + 'âœ—' : ''}
        </span>
      </div>
    `;

    // Auto-update setiap 5 detik
    if (container._fiInterval) clearInterval(container._fiInterval);
    container._fiInterval = setInterval(() => renderIndicator(containerId), 5000);
  }

  // ============================================
  // REGISTER DEFAULT SOURCES
  // ============================================
  function registerDefaults() {
    // Tactical sources
    register('sensor-radar',     { name: 'Radar GCI',         category: 'SENSOR',   expectedIntervalSec: 4,   sourceType: 'ASTERIX', priority: 'HIGH' });
    register('sensor-ais',       { name: 'AIS Receiver',      category: 'SENSOR',   expectedIntervalSec: 10,  sourceType: 'NMEA',    priority: 'HIGH' });
    register('sensor-lora',      { name: 'LoRa Mesh',         category: 'SENSOR',   expectedIntervalSec: 30,  sourceType: 'MQTT',    priority: 'MEDIUM' });
    register('sensor-cctv',      { name: 'Edge AI CCTV',      category: 'SENSOR',   expectedIntervalSec: 5,   sourceType: 'RTSP',    priority: 'HIGH' });
    register('sensor-flir',      { name: 'FLIR Feed',         category: 'SENSOR',   expectedIntervalSec: 5,   sourceType: 'KLV',     priority: 'HIGH' });

    // Intelligence sources
    register('intel-imint',      { name: 'IMINT Feed',        category: 'INTEL',    expectedIntervalSec: 60,  sourceType: 'NITF',    priority: 'HIGH' });
    register('intel-sigint',     { name: 'SIGINT Feed',       category: 'INTEL',    expectedIntervalSec: 120, sourceType: 'COMINT',  priority: 'HIGH' });
    register('intel-osint',      { name: 'OSINT Feed',        category: 'INTEL',    expectedIntervalSec: 300, sourceType: 'OPEN',    priority: 'MEDIUM' });

    // Cyber sources
    register('cyber-siem',       { name: 'SIEM Wazuh',        category: 'CYBER',    expectedIntervalSec: 10,  sourceType: 'LOG',     priority: 'HIGH' });
    register('cyber-ndr',        { name: 'NDR Sensor',        category: 'CYBER',    expectedIntervalSec: 15,  sourceType: 'PCAP',    priority: 'HIGH' });

    // Logistics sources
    register('log-fuel',         { name: 'Fuel Sensor',       category: 'LOGISTICS',expectedIntervalSec: 300, sourceType: 'IoT',     priority: 'MEDIUM' });
    register('log-gudang',       { name: 'Gudang Inventory',  category: 'LOGISTICS',expectedIntervalSec: 600, sourceType: 'API',     priority: 'LOW' });

    // Personnel sources
    register('pers-absen',       { name: 'Absensi Personel',  category: 'PERSONNEL',expectedIntervalSec: 1800,sourceType: 'RFID',    priority: 'LOW' });

    console.log(`[FRESHNESS] Registered ${SOURCES.size} default sources`);
  }

  // ============================================
  // AUTO HEARTBEAT (mock untuk demo)
  // ============================================
  function startMockHeartbeats() {
    // Simulate various data arriving
    setInterval(() => {
      const sources = ['sensor-radar', 'sensor-ais', 'sensor-cctv', 'cyber-siem', 'intel-imint'];
      sources.forEach(sid => heartbeat(sid, Math.floor(Math.random() * 5) + 1));
    }, 3000);

    setInterval(() => heartbeat('sensor-lora', Math.floor(Math.random() * 3) + 1), 8000);
    setInterval(() => heartbeat('sensor-flir', Math.floor(Math.random() * 3) + 1), 6000);
    setInterval(() => heartbeat('intel-sigint', Math.floor(Math.random() * 2) + 1), 30000);
    setInterval(() => heartbeat('intel-osint', Math.floor(Math.random() * 3) + 1), 120000);
    setInterval(() => heartbeat('cyber-ndr', Math.floor(Math.random() * 5) + 1), 12000);
    setInterval(() => heartbeat('log-fuel', 1), 60000);
    setInterval(() => heartbeat('log-gudang', 1), 180000);
    setInterval(() => heartbeat('pers-absen', 1), 600000);
  }

  // ============================================
  // OFFLINE MODE DETECTION
  // ============================================
  let isOfflineMode = false;
  const offlineListeners = [];

  function checkConnection() {
    const online = navigator.onLine;
    if (!online && !isOfflineMode) {
      enterOfflineMode('navigator.offline');
    } else if (online && isOfflineMode) {
      exitOfflineMode();
    }
  }

  function enterOfflineMode(reason) {
    isOfflineMode = true;
    document.body.classList.add('offline-mode');
    console.warn(`[FRESHNESS] OFFLINE MODE â€” ${reason}`);
    notifyOfflineListeners({ mode: 'offline', reason });
    renderOfflineBanner();
  }

  function exitOfflineMode() {
    isOfflineMode = false;
    document.body.classList.remove('offline-mode');
    console.log('[FRESHNESS] Online mode restored');
    notifyOfflineListeners({ mode: 'online' });
    removeOfflineBanner();
  }

  function onOfflineChange(callback) {
    offlineListeners.push(callback);
  }

  function notifyOfflineListeners(evt) {
    offlineListeners.forEach(cb => {
      try { cb(evt); } catch(e) {}
    });
  }

  function renderOfflineBanner() {
    let banner = document.getElementById('offline-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'offline-banner';
      banner.className = 'offline-banner';
      banner.innerHTML = `
        <span class="ob-icon">ðŸ“¡</span>
        <span class="ob-text">
          <strong>MODE OFFLINE</strong> â€” Koneksi taktis terputus.
          Menggunakan <em>cached data</em>. Data baru akan di-sync saat koneksi pulih.
        </span>
      `;
      document.body.appendChild(banner);
    }
  }

  function removeOfflineBanner() {
    const banner = document.getElementById('offline-banner');
    if (banner) banner.remove();
  }

  function getOfflineMode() {
    return isOfflineMode;
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    registerDefaults();
    startMockHeartbeats();

    // Monitor online/offline
    window.addEventListener('online', checkConnection);
    window.addEventListener('offline', checkConnection);
    checkConnection();

    console.log('[FRESHNESS] Initialized');
  }

  return {
    init,
    register,
    heartbeat,
    reportError,
    getStatus,
    getAll,
    getSummary,
    renderIndicator,
    onOfflineChange,
    getOfflineMode,
    enterOfflineMode,
    exitOfflineMode
  };
})();

if (typeof window !== 'undefined') window.DataFreshness = DataFreshness;
/* ============================================================
 * ASSET-MANAGER.JS — v2.4 CLEAN
 * + AIS Simulator
 * + ASTERIX Simulator
 * + Network Emulator
 * ============================================================ */

class AssetManager {
  constructor() {
    this.assets = new Map();
    this.entities = new Map();
    this.layers = {
      au_assets: true, al_assets: true, ad_assets: true,
      laut_assets: true, lora_sensors: true,
      network_links: true, coverage: false
    };
    this.escalationLevel = 1;
  }

  addAsset(asset) {
    this.assets.set(asset.id, asset);
    const entity = MilSymbolLayer.createAssetEntity(asset);
    this.entities.set(asset.id, entity);
    this.updateAssetList(asset);
    this.applyLayerVisibility();
    return entity;
  }

  updateAsset(id, newPosition) {
    const asset = this.assets.get(id);
    const entity = this.entities.get(id);
    if (!asset || !entity) return;
    Object.assign(asset, newPosition);
    entity.position = Cesium.Cartesian3.fromDegrees(
      asset.lon, asset.lat, asset.alt || 0
    );
    window.CesiumApp.getViewer().scene.requestRender();
  }

  removeAsset(id) {
    const entity = this.entities.get(id);
    if (entity) window.CesiumApp.getViewer().entities.remove(entity);
    this.entities.delete(id);
    this.assets.delete(id);
  }

  setLayerVisibility(layerName, visible) {
    this.layers[layerName] = visible;
    this.applyLayerVisibility();
  }

  applyLayerVisibility() {
    this.entities.forEach((entity, id) => {
      const asset = this.assets.get(id);
      if (!asset) return;
      const domainLayerMap = {
        'au': 'au_assets', 'al': 'al_assets',
        'ad': 'ad_assets', 'laut': 'laut_assets',
        'sensor': 'lora_sensors'
      };
      const layerKey = domainLayerMap[asset.domain];
      entity.show = layerKey ? this.layers[layerKey] : true;
    });
    window.CesiumApp.getViewer().scene.requestRender();
  }

  updateAssetList(asset) {
    const listEl = document.getElementById(`list-${asset.domain}`);
    const countEl = document.getElementById(`count-${asset.domain}`);
    if (!listEl) return;

    const li = document.createElement('li');
    li.dataset.assetId = asset.id;
    li.innerHTML = `<span class="status-dot"></span><span>${asset.name || asset.callsign || asset.id}</span>`;
    li.addEventListener('click', () => {
      flyToLocation(asset.lat, asset.lon, 50000, 1.5);
    });
    listEl.appendChild(li);
    if (countEl) countEl.textContent = listEl.children.length;
  }

  setEscalationLevel(level) {
    this.escalationLevel = level;
    const badge = document.getElementById('escalation-badge');
    const levelEl = document.getElementById('escalation-level');
    const speedEl = document.getElementById('sim-speed');
    if (badge) badge.classList.remove('elevated', 'critical');

    const config = {
      1: { name: 'NORMAL',   speed: '1x',  cls: '' },
      2: { name: 'ELEVATED', speed: '5x',  cls: 'elevated' },
      3: { name: 'CRITICAL', speed: '20x', cls: 'critical' }
    }[level] || { name: 'NORMAL', speed: '1x', cls: '' };

    if (levelEl) levelEl.textContent = config.name;
    if (speedEl) speedEl.textContent = config.speed;
    if (config.cls && badge) badge.classList.add(config.cls);

    document.querySelectorAll('.esc-btn').forEach(btn => {
      btn.classList.toggle('active', parseInt(btn.dataset.level) === level);
    });

    this.onEscalationChange(level);

    // Trigger network emulator
    if (window.NetworkEmulator) {
      window.NetworkEmulator.setLevel(level);
    }
  }

  onEscalationChange(level) {
    const msgs = {
      1: 'Status NORMAL — Semua sistem operasional',
      2: 'Status ELEVATED — Peningkatan aktivitas terdeteksi',
      3: 'Status CRITICAL — Fiber cut, VSAT down, MANET aktif'
    };
    this.logEvent(msgs[level], level === 3 ? 'critical' : 'info');
  }

  logEvent(message, severity = 'info') {
    const ticker = document.getElementById('ticker-content');
    if (!ticker) return;
    const time = new Date().toISOString().substr(11, 8);
    const el = document.createElement('span');
    el.className = `event-info ${severity}`;
    el.textContent = `[${time}] ${message}`;
    ticker.appendChild(el);
    ticker.scrollLeft = ticker.scrollWidth;
  }
}

// ============================================
// FUNGSI PENDUKUNG
// ============================================
function loadSampleAssets() {
  const samples = [
    { id: 'al-01', domain: 'al', type: 'frigate',
      sidc: MilSymbolLayer.SIDC.FRIGATE,
      name: 'KRI Diponegoro', lat: 2.5, lon: 101.0, alt: 0,
      affiliation: 'friend' },
    { id: 'al-02', domain: 'al', type: 'submarine',
      sidc: MilSymbolLayer.SIDC.SUBMARINE,
      name: 'KRI Nagapasa', lat: -6.0, lon: 112.0, alt: -50,
      affiliation: 'friend' },
    { id: 'ad-01', domain: 'ad', type: 'tank',
      sidc: MilSymbolLayer.SIDC.TANK,
      name: 'Leopard 2A6-01', lat: -2.533, lon: 140.717, alt: 0,
      affiliation: 'friend' },
    { id: 'ad-02', domain: 'ad', type: 'radar',
      sidc: MilSymbolLayer.SIDC.RADAR,
      name: 'Radar GCI-01', lat: 4.0, lon: 108.0, alt: 0,
      affiliation: 'friend' },
    { id: 'laut-01', domain: 'laut', type: 'merchant',
      sidc: MilSymbolLayer.SIDC.MERCHANT,
      name: 'MV Ocean Star', lat: 1.2, lon: 103.5, alt: 0,
      affiliation: 'neutral' },
    { id: 'laut-02', domain: 'laut', type: 'fishing',
      sidc: MilSymbolLayer.SIDC.FISHING,
      name: 'KM Nelayan 07', lat: -5.5, lon: 119.5, alt: 0,
      affiliation: 'neutral' }
  ];
  samples.forEach(a => assetManager.addAsset(a));
}

function wireControls() {
  const layerMap = {
    'layer-au': 'au_assets', 'layer-al': 'al_assets',
    'layer-ad': 'ad_assets', 'layer-laut': 'laut_assets',
    'layer-lora': 'lora_sensors', 'layer-net': 'network_links',
    'layer-cov': 'coverage'
  };

  Object.entries(layerMap).forEach(([elId, layerName]) => {
    const el = document.getElementById(elId);
    if (!el) return;

    if (layerName === 'coverage') {
      el.addEventListener('change', (e) => {
        if (window.NetworkViz) window.NetworkViz.toggleCoverage(e.target.checked);
      });
    } else if (layerName === 'network_links') {
      el.addEventListener('change', (e) => {
        if (window.NetworkViz) window.NetworkViz.toggleNetwork(e.target.checked);
      });
    } else {
      el.addEventListener('change', (e) => {
        assetManager.setLayerVisibility(layerName, e.target.checked);
      });
    }
  });

  // === LOGISTICS TOGGLE (di dalam function) ===
  const logistikLayers = {
    'layer-gudang-ad': 'gudang-ad',
    'layer-gudang-al': 'gudang-al',
    'layer-gudang-au': 'gudang-au',
    'layer-routes':    'routes',
    'layer-alutsista': 'alutsista'
  };

  Object.entries(logistikLayers).forEach(([elId, layerKey]) => {
    const el = document.getElementById(elId);
    if (el && window.LogisticsViz) {
      el.addEventListener('change', (e) => {
        window.LogisticsViz.toggleLayer(layerKey, e.target.checked);
      });
    }
  });

  document.querySelectorAll('.esc-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      assetManager.setEscalationLevel(parseInt(btn.dataset.level));
    });
  });

  assetManager.setEscalationLevel(1);

  setInterval(() => {
    const now = new Date();
    const t = now.toISOString().substr(11, 8);
    const utcEl = document.getElementById('utc-time');
    const simEl = document.getElementById('sim-time');
    if (utcEl) utcEl.textContent = t;
    if (simEl) simEl.textContent = t;
  }, 1000);
}

// ============================================
// BOOTSTRAP
// ============================================
let assetManager;

async function bootstrap() {
  try {
    console.log('[BOOTSTRAP] Starting...');
    await initCesium();
    assetManager = new AssetManager();
    window.assetManager = assetManager;
    loadSampleAssets();

    // Init network layer DULU (sebelum wireControls)
    if (window.NetworkEmulator && window.NetworkViz) {
      NetworkEmulator.init();
      NetworkViz.init();
      console.log('[BOOTSTRAP] Network layer initialized');
    } else {
      console.warn('[BOOTSTRAP] Network layer missing');
    }

    // Init fusion engine
    if (window.FusionEngine) {
      FusionEngine.init((alert) => {
        console.log(`[FUSION:${alert.level}] ${alert.message}`);
      });
      console.log('[BOOTSTRAP] Fusion engine initialized');
    }
    // Init Logistics overlay
    if (window.LogisticsViz && window.LogisticsData) {
      LogisticsViz.init();
      console.log('[BOOTSTRAP] Logistics overlay initialized');
    }
    wireControls();

    assetManager.logEvent('SYSTEM READY — NKRI COP initialized', 'info');
    console.log('[BOOTSTRAP] All systems ready');

    // Init strategic advisor
    if (window.StrategicAdvisor) {
      StrategicAdvisor.start(10000);
      console.log('[BOOTSTRAP] Strategic advisor started');
    }

    // Init SIEM mock
    if (window.SIEMMock) {
      SIEMMock.init();
      console.log('[BOOTSTRAP] SIEM mock initialized');
    }

    // Start AIS simulator setelah 2 detik
    setTimeout(() => {
      if (window.AISSimulator) {
        AISSimulator.start();
        assetManager.logEvent(`AIS Simulator started — ${AISSimulator.getShips().length} ships`, 'info');
        console.log(`[AIS-SIM] ${AISSimulator.getShips().length} ships registered`);
      } else {
        console.warn('[AIS-SIM] Simulator not loaded');
      }
    }, 2000);

    // Start ASTERIX simulator setelah 3 detik
    setTimeout(() => {
      if (window.ASTERIXSimulator) {
        ASTERIXSimulator.start();
        assetManager.logEvent(`ASTERIX Simulator started — ${ASTERIXSimulator.getTracks().length} tracks`, 'info');
        console.log(`[ASTERIX-SIM] ${ASTERIXSimulator.getTracks().length} tracks registered`);
      } else {
        console.warn('[ASTERIX-SIM] Not loaded');
      }
    }, 3000);

  } catch (e) {
    console.error('[BOOTSTRAP] Failed:', e);
  }
}

// ============================================
// AUTO-RUN
// ============================================
window.AssetManager = AssetManager;

(function autoRun() {
  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', bootstrap);
  } else {
    bootstrap();
  }
})();
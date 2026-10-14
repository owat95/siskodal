/* ============================================================
 * LOGISTICS-VIZ.JS — Cesium overlay untuk logistik militer
 * Gudang · Supply Routes · Alutsista positions
 * ============================================================ */

const LogisticsViz = (() => {
  'use strict';
  // UTF-8 safe base64 (untuk SVG dengan emoji/unicode)
  function btoaUtf8(str) {
    return btoa(unescape(encodeURIComponent(str)));
  }
  // ============================================
  // PROVINCE COORDINATES (38 provinces Indonesia)
  // ============================================
  const PROVINCE_COORDS = {
    'Aceh':                   { lat: 5.548,  lon: 95.317  },
    'Sumatera Utara':         { lat: 2.115,  lon: 99.545  },
    'Sumatera Barat':         { lat: -0.947, lon: 100.417 },
    'Riau':                   { lat: 0.507,  lon: 101.448 },
    'Kepulauan Riau':         { lat: 3.945,  lon: 108.142 },
    'Jambi':                  { lat: -1.610, lon: 103.613 },
    'Bengkulu':               { lat: -3.800, lon: 102.265 },
    'Sumatera Selatan':       { lat: -3.319, lon: 103.914 },
    'Bangka Belitung':        { lat: -2.741, lon: 106.440 },
    'Lampung':                { lat: -4.559, lon: 105.347 },
    'Banten':                 { lat: -6.405, lon: 105.983 },
    'DKI Jakarta':            { lat: -6.175, lon: 106.827 },
    'Jawa Barat':             { lat: -6.919, lon: 107.609 },
    'Jawa Tengah':            { lat: -7.151, lon: 110.140 },
    'DI Yogyakarta':          { lat: -7.797, lon: 110.370 },
    'Jawa Timur':             { lat: -7.536, lon: 112.238 },
    'Bali':                   { lat: -8.410, lon: 115.188 },
    'Nusa Tenggara Barat':    { lat: -8.652, lon: 117.361 },
    'Nusa Tenggara Timur':    { lat: -8.657, lon: 121.079 },
    'Kalimantan Barat':       { lat: -0.279, lon: 111.475 },
    'Kalimantan Tengah':      { lat: -1.681, lon: 113.382 },
    'Kalimantan Selatan':     { lat: -3.318, lon: 114.594 },
    'Kalimantan Timur':       { lat: 0.538,  lon: 116.419 },
    'Kalimantan Utara':       { lat: 3.073,  lon: 116.041 },
    'Sulawesi Utara':         { lat: 0.624,  lon: 123.975 },
    'Sulawesi Tengah':        { lat: -1.430, lon: 121.445 },
    'Sulawesi Selatan':       { lat: -3.668, lon: 119.974 },
    'Sulawesi Tenggara':      { lat: -4.144, lon: 122.174 },
    'Gorontalo':              { lat: 0.699,  lon: 122.446 },
    'Sulawesi Barat':         { lat: -2.844, lon: 119.232 },
    'Maluku':                 { lat: -3.238, lon: 130.145 },
    'Maluku Utara':           { lat: 1.570,  lon: 127.808 },
    'Papua':                  { lat: -4.269, lon: 138.080 },
    'Papua Barat':            { lat: -1.336, lon: 133.174 },
    'Papua Selatan':          { lat: -7.500, lon: 140.000 },
    'Papua Tengah':           { lat: -4.000, lon: 136.500 },
    'Papua Pegunungan':       { lat: -4.500, lon: 138.500 },
    'Papua Barat Daya':       { lat: -1.000, lon: 132.000 }
  };

  // ============================================
  // MATRA CONFIG
  // ============================================
  const MATRA_CFG = {
    ad: { color: '#22c55e', label: 'AD',  icon: 'A', symbol: 'A' },
    al: { color: '#60a5fa', label: 'AL',  icon: 'N', symbol: 'N' },
    au: { color: '#3b82f6', label: 'AU',  icon: 'F', symbol: 'F' }
  };

  const ROUTE_COLORS = {
    LOW:      '#22c55e',
    MEDIUM:   '#eab308',
    HIGH:     '#ef4444',
    delayed:  '#f97316',
    active:   '#22c55e'
  };

  // ============================================
  // STATE
  // ============================================
  let viewer = null;
  const gudangEntities = { ad: [], al: [], au: [] };
  const routeEntities = [];
  const alutsistaEntities = [];
  const layerState = {
    'gudang-ad': true,
    'gudang-al': true,
    'gudang-au': true,
    'routes': true,
    'alutsista': false
  };

  // ============================================
  // GUDANG ICON (SVG data URI)
  // ============================================
  function createGudangIcon(matra, fillRatio) {
    const cfg = MATRA_CFG[matra];
    const color = fillRatio < 0.4 ? '#ef4444'
                : fillRatio < 0.7 ? '#eab308'
                : cfg.color;

    // Circle with warehouse icon + percentage border
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="16" fill="${color}" fill-opacity="0.25" stroke="${color}" stroke-width="2"/>
        <text x="20" y="26" font-size="18" text-anchor="middle" fill="${color}" font-family="sans-serif">
          ${cfg.symbol}
        </text>
        <circle cx="20" cy="20" r="16" fill="none" stroke="${color}" stroke-width="2"
                stroke-dasharray="${fillRatio * 100.5} 100.5" transform="rotate(-90 20 20)"/>
      </svg>
    `;
    return 'data:image/svg+xml;base64,' + btoaUtf8(svg);
  }

  // ============================================
  // INIT
  // ============================================
  function init() {
    viewer = window.CesiumApp ? window.CesiumApp.getViewer() : null;
    if (!viewer) {
      console.error('[LOG-VIZ] Cesium viewer not ready');
      return;
    }
    if (!window.LogisticsData) {
      console.error('[LOG-VIZ] LogisticsData not loaded');
      return;
    }

    renderAllGudang();
    renderAllRoutes();
    renderAllAlutsista();

    console.log(`[LOG-VIZ] Initialized — ${gudangEntities.ad.length + gudangEntities.al.length + gudangEntities.au.length} gudang · ${routeEntities.length} routes · ${alutsistaEntities.length} alutsista`);
  }

  // ============================================
  // RENDER GUDANG
  // ============================================
  function renderAllGudang() {
    ['ad', 'al', 'au'].forEach(matra => {
      const list = LogisticsData.getGudang(matra);
      list.forEach(g => {
        const coords = PROVINCE_COORDS[g.province];
        if (!coords) {
          console.warn(`[LOG-VIZ] Unknown province: ${g.province}`);
          return;
        }

        const total = Object.values(g.stock).reduce((a, b) => a + b, 0);
        const cap = g.capacity * 4;
        const fillRatio = Math.min(1, total / cap);

        const entity = viewer.entities.add({
          id: `gudang-${g.id}`,
          name: g.name,
          position: Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat, 0),
          billboard: {
            image: createGudangIcon(matra, fillRatio),
            scale: 1.0,
            verticalOrigin: Cesium.VerticalOrigin.CENTER,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: {
            text: `${g.name}\n${Math.round(fillRatio * 100)}% fill`,
            font: '10px "Courier New", monospace',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -28),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 3000000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          properties: {
            type: 'gudang',
            matra,
            gudangId: g.id,
            fillRatio,
            province: g.province
          }
        });

        gudangEntities[matra].push(entity);
      });
    });
  }

  // ============================================
  // RENDER ROUTES
  // ============================================
  function renderAllRoutes() {
    ['ad', 'al', 'au'].forEach(matra => {
      const routes = LogisticsData.getRoutes(matra);
      const gudangList = LogisticsData.getGudang(matra);

      routes.forEach(r => {
        // Find gudang by name
        const fromG = gudangList.find(g => g.name === r.from);
        const toG   = gudangList.find(g => g.name === r.to);
        if (!fromG || !toG) return;

        const fromCoords = PROVINCE_COORDS[fromG.province];
        const toCoords   = PROVINCE_COORDS[toG.province];
        if (!fromCoords || !toCoords) return;

        const color = ROUTE_COLORS[r.risk] || ROUTE_COLORS[r.status] || '#64748b';

        const entity = viewer.entities.add({
          id: `route-${r.id}`,
          name: `${r.from} → ${r.to}`,
          polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights([
              fromCoords.lon, fromCoords.lat, 15000,
              toCoords.lon,   toCoords.lat,   15000
            ]),
            width: 3,
            material: new Cesium.PolylineDashMaterialProperty({
              color: Cesium.Color.fromCssColorString(color),
              dashLength: 24,
              gapColor: Cesium.Color.TRANSPARENT
            }),
            arcType: Cesium.ArcType.GEODESIC
          },
          properties: {
            type: 'route',
            matra,
            routeId: r.id,
            status: r.status,
            risk: r.risk,
            cargo: r.cargo,
            etaHours: r.etaHours
          }
        });

        routeEntities.push(entity);
      });
    });
  }

  // ============================================
  // RENDER ALUTSISTA
  // ============================================
  function renderAllAlutsista() {
    ['ad', 'al', 'au'].forEach(matra => {
      const list = LogisticsData.getAlutsista(matra);
      const cfg = MATRA_CFG[matra];

      list.forEach(a => {
        if (!a.location) return;

        const fuelColor = a.fuelLevel < 20 ? '#ef4444'
                        : a.fuelLevel < 50 ? '#eab308'
                        : '#22c55e';

        const entity = viewer.entities.add({
          id: `alutsista-${a.id}`,
          name: a.name,
          position: Cesium.Cartesian3.fromDegrees(a.location.lon, a.location.lat, 0),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString(cfg.color),
            outlineColor: Cesium.Color.fromCssColorString(fuelColor),
            outlineWidth: 3,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          label: {
            text: `${a.name}\n${a.fuelLevel}% fuel`,
            font: '9px "Courier New", monospace',
            fillColor: Cesium.Color.fromCssColorString(fuelColor),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -16),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 500000),
            disableDisplayDistance: Number.POSITIVE_INFINITY
          },
          properties: {
            type: 'alutsista',
            matra,
            alutsistaId: a.id,
            fuelLevel: a.fuelLevel,
            status: a.status
          }
        });

        entity.show = false; // hidden by default
        alutsistaEntities.push(entity);
      });
    });
  }

  // ============================================
  // LAYER TOGGLE
  // ============================================
  function toggleLayer(layerKey, visible) {
    layerState[layerKey] = visible;

    if (layerKey === 'gudang-ad' || layerKey === 'gudang-al' || layerKey === 'gudang-au') {
      const matra = layerKey.split('-')[1];
      gudangEntities[matra].forEach(e => e.show = visible);
    } else if (layerKey === 'routes') {
      routeEntities.forEach(e => e.show = visible);
    } else if (layerKey === 'alutsista') {
      alutsistaEntities.forEach(e => e.show = visible);
    }

    if (viewer) viewer.scene.requestRender();
  }

  // ============================================
  // DETAIL PANEL (click handler)
  // ============================================
  function showDetail(entity) {
    if (!entity || !entity.properties) return;
    const props = entity.properties.getValue ? entity.properties.getValue() : entity.properties;
    const type = props.type;

    if (type === 'gudang') {
      const matra = props.matra;
      const g = LogisticsData.getGudang(matra).find(x => x.id === props.gudangId);
      if (!g) return;
      showGudangPanel(g, matra);
    } else if (type === 'route') {
      // Could add route detail panel
      console.log('Route clicked:', props);
    }
  }

  function showGudangPanel(g, matra) {
    // Reuse asset detail panel from map
    const detail = document.getElementById('panel-left') || document.querySelector('.detail-panel');
    // For now, just log — user can extend
    console.log(`[GUDANG] ${g.name}`, g.stock);

    // Optional: show custom popup
    if (window.assetManager && window.assetManager.logEvent) {
      window.assetManager.logEvent(
        `${matra.toUpperCase()} Gudang: ${g.name} — Amunisi ${g.stock.amunisi}, Fuel ${g.stock.bahan_bakar}`,
        'info'
      );
    }
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    init,
    toggleLayer,
    showDetail,
    getStats: () => ({
      gudang: gudangEntities.ad.length + gudangEntities.al.length + gudangEntities.au.length,
      routes: routeEntities.length,
      alutsista: alutsistaEntities.length
    }),
    PROVINCE_COORDS
  };
})();

if (typeof window !== 'undefined') window.LogisticsViz = LogisticsViz;
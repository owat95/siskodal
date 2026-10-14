/* ============================================================
 * TERITORIAL-VIZ.JS — Kodam Polygon Renderer untuk Cesium
 * 27 Kodam · 38 Provinsi · Data 2026
 * ============================================================ */

const TeritorialViz = (() => {
  'use strict';

  let viewer = null;
  let kodamData = null;
  let geojsonData = null;

  // Entities per Kodam
  const kodamPolygonEntities = {};  // kodamId -> [polygon entities]
  const kodamHqEntities = {};       // kodamId -> hq marker
  const kodamKoremEntities = {};    // kodamId -> [korem markers]
  const allKoremEntities = [];

  let selectedKodamId = null;
  let onSelectCallback = null;
  let onHoverCallback = null;

  // ============================================
  // PROVINCE → KODAM MAPPING (explicit)
  // ============================================
  const PROVINCE_TO_KODAM = {
    'aceh': 'kodam-iskandar-muda',
    'bali': 'kodam-udayana',
    'banten': 'kodam-siliwangi',
    'bengkulu': 'kodam-radin-inten',
    'gorontalo': 'kodam-merdeka',
    'jakarta raya': 'kodam-jayakarta',
    'jambi': 'kodam-tuanku-imam-bonjol',
    'jawa barat': 'kodam-siliwangi',
    'jawa tengah': 'kodam-diponegoro',
    'jawa timur': 'kodam-brawijaya',
    'kalimantan barat': 'kodam-tanjungpura',
    'kalimantan selatan': 'kodam-tambun-bungai',
    'kalimantan tengah': 'kodam-tambun-bungai',
    'kalimantan timur': 'kodam-mulawarman',
    'kalimantan utara': 'kodam-mulawarman',
    'kepulauan bangka belitung': 'kodam-sriwijaya',
    'kepulauan riau': 'kodam-mahmud-riayat-syah',
    'lampung': 'kodam-radin-inten',
    'maluku': 'kodam-pattimura',
    'maluku utara': 'kodam-moloku-kie-raha',
    'nusa tenggara barat': 'kodam-rinambora',
    'nusa tenggara timur': 'kodam-sobe-sonbai',
    'papua': 'kodam-cenderawasih',
    'papua barat': 'kodam-kasuari',
    'papua barat daya': 'kodam-kasuari',
    'papua pegunungan': 'kodam-cenderawasih',
    'papua selatan': 'kodam-mandala-trikora',
    'papua tengah': 'kodam-mambruk',
    'riau': 'kodam-tuanku-tambusai',
    'sulawesi barat': 'kodam-palaka-wira',
    'sulawesi selatan': 'kodam-hasanuddin',
    'sulawesi tengah': 'kodam-palaka-wira',
    'sulawesi tenggara': 'kodam-hasanuddin',
    'sulawesi utara': 'kodam-merdeka',
    'sumatera barat': 'kodam-tuanku-imam-bonjol',
    'sumatera selatan': 'kodam-sriwijaya',
    'sumatera utara': 'kodam-bukit-barisan',
    'yogyakarta': 'kodam-mataram'
  };

  // ============================================
  // INIT
  // ============================================
  async function init(options = {}) {
    viewer = window.CesiumApp ? window.CesiumApp.getViewer() : null;
    if (!viewer) {
      console.error('[TERITORIAL] Cesium viewer not ready');
      return;
    }

    onSelectCallback = options.onSelect || null;
    onHoverCallback = options.onHover || null;

    // Load data
    kodamData = window.TERITORIAL_DATA;
    if (!kodamData) {
      // Fallback: load via fetch
      const resp = await fetch('./data/teritorial-data.json');
      kodamData = await resp.json();
      window.TERITORIAL_DATA = kodamData;
    }

    // Load GeoJSON
    try {
      const geoResp = await fetch('./data/indonesia-provinces.geojson');
      geojsonData = await geoResp.json();
    } catch (err) {
      console.error('[TERITORIAL] Failed to load GeoJSON:', err);
      return;
    }

    console.log(`[TERITORIAL] Loaded ${kodamData.kodam.length} Kodam, ${geojsonData.features.length} provinces`);

    // Render
    renderPolygons();
    renderHqMarkers();
    renderKoremMarkers();

    // Wire click handler
    wireClickHandler();

    console.log('[TERITORIAL] Viz initialized');
  }

  // ============================================
  // RENDER POLYGONS
  // ============================================
  function renderPolygons() {
    geojsonData.features.forEach(feature => {
      const provinceName = (feature.properties.name || feature.properties.NAME_1 || '').toLowerCase();
      const kodamId = PROVINCE_TO_KODAM[provinceName];
      if (!kodamId) return;

      const kodam = kodamData.kodam.find(k => k.id === kodamId);
      if (!kodam) return;

      const region = kodamData.regions[kodam.region];
      const baseColor = Cesium.Color.fromCssColorString(region.color);
      const accentColor = Cesium.Color.fromCssColorString(region.accent);

      // Initialize array
      if (!kodamPolygonEntities[kodamId]) kodamPolygonEntities[kodamId] = [];

      const geometry = feature.geometry;
      if (geometry.type === 'Polygon') {
        const ent = addPolygon(geometry.coordinates, baseColor, accentColor, kodam);
        if (ent) kodamPolygonEntities[kodamId].push(ent);
      } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polyCoords => {
          const ent = addPolygon(polyCoords, baseColor, accentColor, kodam);
          if (ent) kodamPolygonEntities[kodamId].push(ent);
        });
      }
    });
  }

  function addPolygon(rings, baseColor, accentColor, kodam) {
    if (!rings || rings.length === 0) return null;

    // Only outer ring (index 0) — holes not processed for simplicity
    const outerRing = rings[0];
    if (!outerRing || outerRing.length < 3) return null;

    // Flatten: [[lon,lat], [lon,lat], ...] → [lon, lat, lon, lat, ...]
    const flat = [];
    outerRing.forEach(coord => {
      flat.push(coord[0], coord[1]);
    });

    try {
      const entity = viewer.entities.add({
        name: kodam.name,
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(flat),
          material: baseColor.withAlpha(0.45),
          outline: true,
          outlineColor: accentColor,
          outlineWidth: 2,
          height: 0,
          classificationType: Cesium.ClassificationType.TERRAIN
        },
        properties: {
          type: 'kodam-polygon',
          kodamId: kodam.id,
          kodamName: kodam.name,
          region: kodam.region
        }
      });
      return entity;
    } catch (err) {
      console.warn(`[TERITORIAL] Failed to add polygon for ${kodam.name}:`, err.message);
      return null;
    }
  }

  // ============================================
  // RENDER HQ MARKERS
  // ============================================
  function renderHqMarkers() {
    kodamData.kodam.forEach(kodam => {
      const region = kodamData.regions[kodam.region];
      const color = Cesium.Color.fromCssColorString(region.accent);

      const entity = viewer.entities.add({
        name: kodam.name + ' HQ',
        position: Cesium.Cartesian3.fromDegrees(kodam.hqCoords.lon, kodam.hqCoords.lat, 0),
        point: {
          pixelSize: 12,
          color: color,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          scaleByDistance: new Cesium.NearFarScalar(1.5e5, 1.5, 1.5e7, 0.5)
        },
        label: {
          text: kodam.shortName,
          font: 'bold 11px "Courier New", monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 3,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -20),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2500000),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        properties: {
          type: 'kodam-hq',
          kodamId: kodam.id,
          kodamName: kodam.name
        }
      });

      kodamHqEntities[kodam.id] = entity;
    });
  }

  // ============================================
  // RENDER KOREM MARKERS
  // ============================================
  function renderKoremMarkers() {
    kodamData.kodam.forEach(kodam => {
      if (!kodam.korem || kodam.korem.length === 0) return;
      if (!kodamKoremEntities[kodam.id]) kodamKoremEntities[kodam.id] = [];

      // Approximate korem coords — spread around HQ using index
      kodam.korem.forEach((korem, idx) => {
        const offsetLat = (idx - (kodam.korem.length - 1) / 2) * 0.4;
        const offsetLon = Math.sin(idx * 1.5) * 0.6;
        const lat = kodam.hqCoords.lat + offsetLat;
        const lon = kodam.hqCoords.lon + offsetLon;

        const region = kodamData.regions[kodam.region];
        const color = Cesium.Color.fromCssColorString(region.color);

        const entity = viewer.entities.add({
          name: korem.name,
          position: Cesium.Cartesian3.fromDegrees(lon, lat, 0),
          point: {
            pixelSize: 7,
            color: color,
            outlineColor: Cesium.Color.fromCssColorString('#0a1628'),
            outlineWidth: 1.5,
            heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
            scaleByDistance: new Cesium.NearFarScalar(1.5e5, 1.5, 1.5e7, 0.3)
          },
          label: {
            text: korem.code,
            font: '9px "Courier New", monospace',
            fillColor: Cesium.Color.fromCssColorString('#cbd5e1'),
            outlineColor: Cesium.Color.BLACK,
            outlineWidth: 2,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -14),
            distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 800000),
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          },
          properties: {
            type: 'korem-marker',
            kodamId: kodam.id,
            koremCode: korem.code,
            koremName: korem.name
          }
        });

        kodamKoremEntities[kodam.id].push(entity);
        allKoremEntities.push(entity);
      });
    });
  }

  // ============================================
  // CLICK / HOVER HANDLER
  // ============================================
  function wireClickHandler() {
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);

    handler.setInputAction((movement) => {
      const picked = viewer.scene.pick(movement.position);
      if (Cesium.defined(picked) && picked.id) {
        const props = picked.id.properties;
        if (props) {
          const kodamId = props.kodamId ? props.kodamId.getValue() : null;
          if (kodamId) {
            selectKodam(kodamId);
            if (onSelectCallback) onSelectCallback(kodamId);
            return;
          }
        }
      }
      // Click on empty space → deselect
      deselectAll();
      if (onSelectCallback) onSelectCallback(null);
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  // ============================================
  // SELECT / HIGHLIGHT
  // ============================================
  function selectKodam(kodamId) {
    // Reset previous
    if (selectedKodamId && selectedKodamId !== kodamId) {
      resetKodamStyle(selectedKodamId);
    }

    selectedKodamId = kodamId;
    if (!kodamId) return;

    // Highlight selected
    const entities = kodamPolygonEntities[kodamId] || [];
    const kodam = kodamData.kodam.find(k => k.id === kodamId);
    if (!kodam) return;

    const region = kodamData.regions[kodam.region];
    const color = Cesium.Color.fromCssColorString(region.color);

    entities.forEach(ent => {
      ent.polygon.material = color.withAlpha(0.65);
      ent.polygon.outlineWidth = 3;
    });

    // Fly to HQ
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        kodam.hqCoords.lon,
        kodam.hqCoords.lat,
        1500000
      ),
      duration: 1.5
    });

    viewer.scene.requestRender();
  }

  function resetKodamStyle(kodamId) {
    const entities = kodamPolygonEntities[kodamId] || [];
    const kodam = kodamData.kodam.find(k => k.id === kodamId);
    if (!kodam) return;

    const region = kodamData.regions[kodam.region];
    const color = Cesium.Color.fromCssColorString(region.color);

    entities.forEach(ent => {
      ent.polygon.material = color.withAlpha(0.35);
      ent.polygon.outlineWidth = 2;
    });
  }

  function deselectAll() {
    if (selectedKodamId) {
      resetKodamStyle(selectedKodamId);
    }
    selectedKodamId = null;
  }

  function flyToKodam(kodamId) {
    const kodam = kodamData.kodam.find(k => k.id === kodamId);
    if (!kodam) return;

    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(
        kodam.hqCoords.lon,
        kodam.hqCoords.lat,
        800000
      ),
      duration: 1.5
    });

    selectKodam(kodamId);
  }

  // ============================================
  // TOGGLE LAYERS
  // ============================================
  function setLayerVisibility(layerName, visible) {
    if (layerName === 'polygons') {
      Object.values(kodamPolygonEntities).forEach(arr => {
        arr.forEach(e => { e.show = visible; });
      });
    } else if (layerName === 'hq') {
      Object.values(kodamHqEntities).forEach(e => { e.show = visible; });
    } else if (layerName === 'korem') {
      allKoremEntities.forEach(e => { e.show = visible; });
    }
    viewer.scene.requestRender();
  }

  function getSelectedKodamId() {
    return selectedKodamId;
  }

  function getKodamData() {
    return kodamData;
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    init,
    selectKodam,
    flyToKodam,
    deselectAll,
    setLayerVisibility,
    getSelectedKodamId,
    getKodamData
  };
})();

if (typeof window !== 'undefined') window.TeritorialViz = TeritorialViz;
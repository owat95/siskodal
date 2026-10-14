/* ============================================================
 * CESIUM-INIT.JS — v3.0 — OSM Tiles (No Token Needed)
 * Server punya internet outbound, pakai tile OSM gratis
 * ============================================================ */

let viewer = null;

async function initCesium() {
  viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayerPicker: false,
    geocoder: false,
    homeButton: false,
    sceneModePicker: false,
    navigationHelpButton: false,
    animation: false,
    timeline: false,
    fullscreenButton: false,
    infoBox: false,
    selectionIndicator: false,
    scene3DOnly: true,
    requestRenderMode: true,
    maximumRenderTimeChange: Infinity,

    // Base color globe (untuk area yang tidak ter-cover OSM zoom max)
    baseLayer: Cesium.ImageryLayer.fromProviderAsync(
      Promise.resolve(
        new Cesium.OpenStreetMapImageryProvider({
          url: 'https://tile.openstreetmap.org/',
          credit: '© OpenStreetMap contributors',
          maximumLevel: 19
        })
      )
    )
  });

  // ============================================
  // GLOBE STYLING
  // ============================================
  viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0a1628');
  viewer.scene.globe.showGroundAtmosphere = true;
  viewer.scene.skyAtmosphere.show = true;
  viewer.scene.globe.enableLighting = false;
  viewer.scene.globe.depthTestAgainstTerrain = false;

  // Batasi zoom
  viewer.scene.screenSpaceCameraController.minimumZoomDistance = 500;
  viewer.scene.screenSpaceCameraController.maximumZoomDistance = 20000000;

  // Sembunyikan credit Cesium (OSM credit tetap ada di attribution control)
  const credit = document.querySelector('.cesium-widget-credits');
  if (credit) credit.style.display = 'none';

  // ============================================
  // KAMERA — Fokus ke NKRI
  // ============================================
  viewer.camera.setView({
    destination: Cesium.Cartesian3.fromDegrees(
      NKRI.center.lon,
      NKRI.center.lat,
      NKRI.center.altitude
    ),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-90),
      roll: 0
    }
  });

  console.log('[CESIUM] Viewer initialized — OSM Tiles Mode');
  return viewer;
}

// ============================================
// HELPER: FLY TO
// ============================================
function flyToLocation(lat, lon, altitude = 100000, duration = 2.0) {
  if (!viewer) return;
  viewer.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
    duration: duration,
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    }
  });
}

function flyToChokepoint(name) {
  if (!window.NKRI) return;
  const cp = NKRI.chokepoints.find(c => c.name === name);
  if (cp) flyToLocation(cp.lat, cp.lon, 200000);
}

// ============================================
// EXPORT
// ============================================
window.CesiumApp = {
  initCesium,
  flyToLocation,
  flyToChokepoint,
  getViewer: () => viewer
};
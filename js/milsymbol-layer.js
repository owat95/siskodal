/* ============================================================
 * MILSYMBOL-LAYER.JS â€” MIL-STD-2525 renderer untuk Cesium
 * ============================================================ */

const SIDC = {
  // AU (Air Force)
  FIGHTER:      '100301000011010100000000000000',
  AWACS:        '100301000012010000000000000000',
  UAV_MALE:     '100301000011040000000000000000',
  HELI_ATTACK:  '100301000011050100000000000000',

  // AL (Navy)
  DESTROYER:    '100302000011010100000000000000',
  FRIGATE:      '100302000011010200000000000000',
  SUBMARINE:    '100302000011020000000000000000',
  PATROL_BOAT:  '100302000011030000000000000000',

  // AD (Army)
  TANK:         '100303000011010100000000000000',
  ARTILLERY:    '100303000011020000000000000000',
  RADAR:        '100303000011060000000000000000',

  // MDA (Maritime)
  MERCHANT:     '100302000011050000000000000000',
  FISHING:      '100302000011060000000000000000',
  UNKNOWN_SEA:  '100302000011000000000000000000',
  HOSTILE_SEA:  '150302000011000000000000000000'  // affiliation hostile
};

// Cache symbol SVG
const _symbolCache = new Map();

function generateMilitarySymbol(sidc, options = {}) {
  const cacheKey = `${sidc}_${options.size || 26}_${options.direction || 0}`;
  if (_symbolCache.has(cacheKey)) return _symbolCache.get(cacheKey);

  const symbol = new ms.Symbol(sidc, {
    size: options.size || 26,
    direction: options.direction || 0,
    infoFields: false,
    standard: '2525',
    symbology: '2525d'
  });

  const svg = symbol.asSVG();
  const uri = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
  _symbolCache.set(cacheKey, uri);
  return uri;
}

function createAssetEntity(asset, opts = {}) {
  const v = window.CesiumApp.getViewer();
  if (!v) return null;

  const symbolUri = generateMilitarySymbol(asset.sidc, {
    size: asset.affiliation === 'hostile' ? 32 : 26,
    direction: asset.heading || 0
  });

  const entity = v.entities.add({
    id: asset.id,
    name: asset.name,
    position: Cesium.Cartesian3.fromDegrees(
      asset.lon, asset.lat, asset.alt || 0
    ),
    billboard: {
      image: symbolUri,
      scale: opts.scale || 1.0,
      verticalOrigin: Cesium.VerticalOrigin.CENTER,
      horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
      disableDepthTestDistance: Number.POSITIVE_INFINITY,
      heightReference: (asset.alt && asset.alt > 100)
        ? Cesium.HeightReference.NONE
        : Cesium.HeightReference.CLAMP_TO_GROUND
    },
    label: opts.showLabel !== false ? {
      text: asset.name,
      font: '11px "Courier New", monospace',
      fillColor: Cesium.Color.fromCssColorString('#e0e0e0'),
      outlineColor: Cesium.Color.BLACK,
      outlineWidth: 2,
      style: Cesium.LabelStyle.FILL_AND_OUTLINE,
      pixelOffset: new Cesium.Cartesian2(0, -32),
      distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 5000000),
      disableDepthTestDistance: Number.POSITIVE_INFINITY
    } : undefined,
    properties: {
      domain: asset.domain,
      type: asset.type,
      affiliation: asset.affiliation || 'friend',
      sidc: asset.sidc,
      status: asset.status || 'active'
    }
  });

  return entity;
}

function createNetworkLink(source, target, linkType = 'fiber') {
  const v = window.CesiumApp.getViewer();
  if (!v) return null;

  const styles = {
    fiber: { color: '#22c55e', width: 3, dash: false },
    vsat:  { color: '#3b82f6', width: 2, dash: true  },
    lora:  { color: '#eab308', width: 1, dash: true  },
    manet: { color: '#f97316', width: 2, dash: true  },
    down:  { color: '#ef4444', width: 1, dash: true  }
  };
  const style = styles[linkType] || styles.fiber;

  return v.entities.add({
    polyline: {
      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
        source.lon, source.lat, source.alt || 0,
        target.lon, target.lat, target.alt || 0
      ]),
      width: style.width,
      material: style.dash
        ? new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString(style.color),
            dashLength: 16
          })
        : Cesium.Color.fromCssColorString(style.color)
    }
  });
}

function createCoverageCircle(center, radiusKm, color = '#22c55e') {
  const v = window.CesiumApp.getViewer();
  if (!v) return null;

  return v.entities.add({
    position: Cesium.Cartesian3.fromDegrees(center.lon, center.lat, 0),
    ellipse: {
      semiMajorAxis: radiusKm * 1000,
      semiMinorAxis: radiusKm * 1000,
      material: Cesium.Color.fromCssColorString(color).withAlpha(0.15),
      outline: true,
      outlineColor: Cesium.Color.fromCssColorString(color).withAlpha(0.6),
      outlineWidth: 2,
      height: 0
    }
  });
}

// Export
window.MilSymbolLayer = {
  SIDC,
  generateMilitarySymbol,
  createAssetEntity,
  createNetworkLink,
  createCoverageCircle
};
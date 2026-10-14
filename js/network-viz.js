/* ============================================================
 * NETWORK-VIZ.JS — v1.0
 * Cesium visualization: links, nodes, coverage circles
 * ============================================================ */

const NetworkViz = (() => {
  'use strict';

  let viewer = null;
  let linkEntities = new Map();     // linkId → entity
  let nodeEntities = new Map();     // nodeId → entity
  let coverageEntities = [];        // Array entities
  let coverageVisible = false;

  // ============================================
  // INIT
  // ============================================
  function init() {
    viewer = window.CesiumApp.getViewer();
    if (!viewer) {
      console.error('[NET-VIZ] Cesium viewer not ready');
      return;
    }

    renderNodes();
    renderLinks();
    renderCoverage();

    console.log('[NET-VIZ] Initialized');
  }

  // ============================================
  // RENDER NODES
  // ============================================
  function renderNodes() {
    NETWORK_TOPOLOGY.nodes.forEach(node => {
      const colors = {
        command: '#4ade80',
        dr:      '#a3e635',
        ad:      '#22c55e',
        au:      '#3b82f6',
        al:      '#1e40af',
        ring:    '#06b6d4'
      };

      const color = colors[node.type] || '#94a3b8';

      const entity = viewer.entities.add({
        id: `node-${node.id}`,
        name: node.name,
        position: Cesium.Cartesian3.fromDegrees(node.lon, node.lat, 0),
        point: {
          pixelSize: node.type === 'command' ? 14 : 10,
          color: Cesium.Color.fromCssColorString(color),
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
          heightReference: Cesium.HeightReference.CLAMP_TO_GROUND
        },
        label: {
          text: node.name,
          font: '10px "Courier New", monospace',
          fillColor: Cesium.Color.WHITE,
          outlineColor: Cesium.Color.BLACK,
          outlineWidth: 2,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE,
          pixelOffset: new Cesium.Cartesian2(0, -18),
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(0, 2000000),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        properties: { domain: node.layer || 'network', type: 'network-node' }
      });

      nodeEntities.set(node.id, entity);
    });
  }

  // ============================================
  // RENDER LINKS
  // ============================================
  function renderLinks() {
    NETWORK_TOPOLOGY.links.forEach(link => {
      const fromNode = NETWORK_TOPOLOGY.nodes.find(n => n.id === link.from);
      const toNode   = NETWORK_TOPOLOGY.nodes.find(n => n.id === link.to);
      if (!fromNode || !toNode) return;

      const positions = [
        fromNode.lon, fromNode.lat, 0,
        toNode.lon,   toNode.lat,   0
      ];

      const style = getLinkStyle(link.type, 'up');

      const entity = viewer.entities.add({
        id: `link-${link.id}`,
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArrayHeights(positions),
          width: style.width,
          material: style.material,
          clampToGround: true
        },
        properties: { type: 'network-link', linkType: link.type, linkId: link.id }
      });

      linkEntities.set(link.id, entity);
    });
  }

  // ============================================
  // LINK STYLE — Visual Style C
  // ============================================
  function getLinkStyle(type, state) {
    // Base colors per type
    const baseColors = {
      fiber: '#22c55e',
      vsat:  '#3b82f6',
      manet: '#f97316',
      hf:    '#6b7280',
      ring:  '#06b6d4'
    };

    // Override color by state
    let color = baseColors[type] || '#94a3b8';
    if (state === 'degraded') color = '#eab308';
    if (state === 'down')     color = '#ef4444';

    const colorObj = Cesium.Color.fromCssColorString(color);

    switch (type) {
      case 'fiber':
      case 'ring':
        // Solid line (fiber realistic)
        return {
          width: state === 'down' ? 2 : 3,
          material: colorObj.withAlpha(state === 'down' ? 0.4 : 0.85)
        };
      case 'vsat':
        // Dashed (wireless)
        return {
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: colorObj.withAlpha(0.9),
            dashLength: 16
          })
        };
      case 'manet':
        // Animated dashes (wireless emergency)
        return {
          width: 3,
          material: new Cesium.PolylineDashMaterialProperty({
            color: colorObj,
            dashLength: 20,
            dashPattern: 0xFF00  // distinctive pattern
          })
        };
      case 'hf':
        return {
          width: 1,
          material: new Cesium.PolylineDashMaterialProperty({
            color: colorObj.withAlpha(0.6),
            dashLength: 8
          })
        };
      default:
        return { width: 2, material: colorObj };
    }
  }

  // ============================================
  // RENDER COVERAGE CIRCLES
  // ============================================
  function renderCoverage() {
    NETWORK_TOPOLOGY.sensorAnchors.forEach(sensor => {
      const cov = NETWORK_TOPOLOGY.coverage.find(c => c.type === sensor.type);
      if (!cov) return;

      const entity = viewer.entities.add({
        id: `cov-${sensor.id}`,
        position: Cesium.Cartesian3.fromDegrees(sensor.lon, sensor.lat, 0),
        ellipse: {
          semiMajorAxis: cov.radiusKm * 1000,
          semiMinorAxis: cov.radiusKm * 1000,
          material: Cesium.Color.fromCssColorString(cov.color).withAlpha(0.12),
          outline: true,
          outlineColor: Cesium.Color.fromCssColorString(cov.color).withAlpha(0.6),
          outlineWidth: 2,
          height: 0
        },
        properties: { type: 'coverage', sensorType: sensor.type }
      });

      entity.show = coverageVisible;
      coverageEntities.push({ entity, sensorType: sensor.type });
    });
  }

  // ============================================
  // TOGGLE COVERAGE
  // ============================================
  function toggleCoverage(visible) {
    coverageVisible = visible;
    coverageEntities.forEach(({ entity }) => {
      entity.show = visible;
    });
    viewer.scene.requestRender();
  }

  // ============================================
  // UPDATE ALL — Called on escalation change
  // ============================================
  function updateAll(linkStates, level) {
    if (!viewer) {
      console.warn('[NET-VIZ] updateAll skipped — viewer not ready');
      return;
    }
    linkStates.forEach((state, linkId) => {
      const entity = linkEntities.get(linkId);
      const link = NETWORK_TOPOLOGY.links.find(l => l.id === linkId);
      if (!entity || !link) return;

      const style = getLinkStyle(link.type, state);
      entity.polyline.width = style.width;
      entity.polyline.material = style.material;
    });

    viewer.scene.requestRender();
    console.log(`[NET-VIZ] Updated ${linkEntities.size} links — level ${level}`);
  }

  // ============================================
  // ADD NEW LINK (for MANET dynamic)
  // ============================================
  function addLink(link) {
    if (linkEntities.has(link.id)) return;

    const fromNode = NETWORK_TOPOLOGY.nodes.find(n => n.id === link.from);
    const toNode   = NETWORK_TOPOLOGY.nodes.find(n => n.id === link.to);
    if (!fromNode || !toNode) return;

    const style = getLinkStyle(link.type, link.state);

    const entity = viewer.entities.add({
      id: `link-${link.id}`,
      polyline: {
        positions: Cesium.Cartesian3.fromDegreesArrayHeights([
          fromNode.lon, fromNode.lat, 0,
          toNode.lon,   toNode.lat,   0
        ]),
        width: style.width,
        material: style.material,
        clampToGround: true
      },
      properties: { type: 'network-link', linkType: link.type, linkId: link.id }
    });

    linkEntities.set(link.id, entity);
    viewer.scene.requestRender();
  }

  // ============================================
  // TOGGLE NETWORK LAYER
  // ============================================
  function toggleNetwork(visible) {
    linkEntities.forEach(e => { e.show = visible; });
    nodeEntities.forEach(e => { e.show = visible; });
    viewer.scene.requestRender();
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    init,
    updateAll,
    addLink,
    toggleCoverage,
    toggleNetwork
  };
})();

if (typeof window !== 'undefined') window.NetworkViz = NetworkViz;
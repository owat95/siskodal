/* ============================================================
 * FUSION-ENGINE.JS — v1.1 CLEAN
 * ============================================================ */

const FusionEngine = (() => {
  'use strict';

  const CONFIG = {
    windowSec: 30,
    spatialThresholdKm: 2,
    temporalThresholdSec: 10,
    fuseIntervalMs: 2000,
    conflictThresholdKm: 1
  };

  let observations = [];
  let fusedTracks = new Map();
  let alerts = [];
  let running = false;
  let fuseInterval = null;
  let onAlertCallback = null;

  function init(alertCallback) {
    running = true;
    onAlertCallback = alertCallback;
    observations = [];
    fusedTracks.clear();
    alerts = [];
    fuseInterval = setInterval(performFusion, CONFIG.fuseIntervalMs);
    setInterval(cleanupObservations, 5000);
    console.log('[FUSION] Engine initialized');
  }

  function observe(data, source) {
    if (!running) return;
    if (!data || typeof data.lat !== 'number' || typeof data.lon !== 'number') return;
    observations.push({
      source: source,
      id: data.id || data.mmsi || data.modeS || data.callsign,
      lat: data.lat,
      lon: data.lon,
      timestamp: Date.now(),
      meta: {
        name: data.name || data.callsign || data.id,
        affiliation: data.affiliation || 'unknown',
        callsign: data.callsign || null,
        mmsi: data.mmsi || null,
        modeS: data.modeS || null
      }
    });
  }

  function cleanupObservations() {
    const cutoff = Date.now() - CONFIG.windowSec * 1000;
    observations = observations.filter(o => o.timestamp >= cutoff);
  }

  function performFusion() {
    if (!running) return;
    const cutoff = Date.now() - CONFIG.temporalThresholdSec * 1000;
    fusedTracks.clear();
    const processed = new Set();

    observations.forEach((obsA, idxA) => {
      if (processed.has(idxA)) return;
      if (obsA.timestamp < cutoff) return;

      const cluster = [obsA];
      processed.add(idxA);

      observations.forEach((obsB, idxB) => {
        if (processed.has(idxB)) return;
        if (obsB.timestamp < cutoff) return;
        if (Math.abs(obsA.timestamp - obsB.timestamp) > CONFIG.temporalThresholdSec * 1000) return;
        const dKm = haversineKm(obsA.lat, obsA.lon, obsB.lat, obsB.lon);
        if (dKm < CONFIG.spatialThresholdKm) {
          cluster.push(obsB);
          processed.add(idxB);
        }
      });

      const fusedId = buildFusedId(cluster);
      const fused = buildFusedTrack(cluster);
      fusedTracks.set(fusedId, fused);

      fused.conflicts.forEach(conflict => {
        emitAlert(conflict);
      });
    });
  }

  function buildFusedTrack(cluster) {
    let latSum = 0, lonSum = 0;
    cluster.forEach(o => { latSum += o.lat; lonSum += o.lon; });
    const lat = latSum / cluster.length;
    const lon = lonSum / cluster.length;
    const sources = [...new Set(cluster.map(o => o.source))];
    const conflicts = detectConflicts(cluster);

    return {
      id: buildFusedId(cluster),
      lat: lat,
      lon: lon,
      sourceCount: sources.length,
      sources: sources,
      conflicts: conflicts,
      observations: cluster.length,
      timestamp: Date.now()
    };
  }

  function buildFusedId(cluster) {
    const aisObs = cluster.find(o => o.source === 'AIS');
    if (aisObs) return `fused-ais-${aisObs.id}`;
    const radarObs = cluster.find(o => o.source === 'ASTERIX');
    if (radarObs) return `fused-radar-${radarObs.id}`;
    return `fused-${cluster[0].id}`;
  }

  function detectConflicts(cluster) {
    const conflicts = [];

    // CHECK 1: MMSI aneh (tidak butuh 2 sensor)
    cluster.forEach(o => {
      if (o.source === 'AIS' && o.meta.mmsi) {
        const mmsi = String(o.meta.mmsi);
        if (!mmsi.startsWith('525')) {
          conflicts.push({
            level: 'INFO',
            type: 'FOREIGN_VESSEL',
            message: `Kapal asing: MMSI ${mmsi} (${o.meta.name})`,
            data: o,
            timestamp: Date.now()
          });
        }
      }
    });

    // CHECK 2: AIS vs Radar (butuh 2+ sensor)
    if (cluster.length >= 2) {
      const ais = cluster.find(o => o.source === 'AIS');
      const radar = cluster.find(o => o.source === 'ASTERIX');

      if (ais && radar) {
        const aisName = (ais.meta.callsign || ais.meta.name || '').toUpperCase().trim();
        const radarName = (radar.meta.callsign || '').toUpperCase().trim();

        if (aisName && radarName && aisName !== radarName) {
          conflicts.push({
            level: 'WARNING',
            type: 'IDENTITY_MISMATCH',
            message: `AIS "${aisName}" != Radar "${radarName}"`,
            data: { ais: ais, radar: radar },
            timestamp: Date.now()
          });
        }

        const dKm = haversineKm(ais.lat, ais.lon, radar.lat, radar.lon);
        if (dKm > CONFIG.conflictThresholdKm) {
          conflicts.push({
            level: 'CRITICAL',
            type: 'POSITION_MISMATCH',
            message: `Pos AIS vs Radar beda ${dKm.toFixed(2)} km`,
            data: { ais: ais, radar: radar, distanceKm: dKm },
            timestamp: Date.now()
          });
        }
      }
    }

    return conflicts;
  }

  function emitAlert(conflict) {
    const dupKey = `${conflict.type}_${conflict.message}`;
    if (alerts.find(a => a.key === dupKey && (Date.now() - a.timestamp) < 30000)) return;

    conflict.key = dupKey;
    alerts.push(conflict);
    if (alerts.length > 100) alerts.shift();

    if (onAlertCallback) onAlertCallback(conflict);
    if (window.assetManager) {
      window.assetManager.logEvent(conflict.message, conflict.level.toLowerCase());
    }
  }

  function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function triggerSpoofAIS() {
    const spoofLocations = [
      { lat: 5.5, lon: 110.0, mmsi: 999888777, name: 'GHOST SHIP 1' },
      { lat: -3.0, lon: 145.0, mmsi: 999888778, name: 'GHOST SHIP 2' },
      { lat: 8.0, lon: 95.0, mmsi: 999888779, name: 'GHOST SHIP 3' }
    ];

    spoofLocations.forEach(s => {
      observe({
        id: s.mmsi,
        lat: s.lat,
        lon: s.lon,
        affiliation: 'unknown',
        name: s.name,
        mmsi: s.mmsi
      }, 'AIS');
    });

    if (window.assetManager) {
      window.assetManager.logEvent('SCENARIO: 3 spoofed AIS injected', 'warning');
    }
    console.log('[FUSION] Spoof AIS scenario triggered');
  }

  function triggerGhostTrack() {
    const ghosts = [
      { lat: 4.0, lon: 112.0, modeS: 0xAAAA01, callsign: 'GHOST01' },
      { lat: -5.0, lon: 125.0, modeS: 0xAAAA02, callsign: 'GHOST02' }
    ];

    ghosts.forEach(g => {
      observe({
        id: g.modeS,
        lat: g.lat,
        lon: g.lon,
        affiliation: 'unknown',
        callsign: g.callsign,
        modeS: g.modeS
      }, 'ASTERIX');
    });

    if (window.assetManager) {
      window.assetManager.logEvent('SCENARIO: 2 ghost radar tracks injected', 'warning');
    }
    console.log('[FUSION] Ghost track scenario triggered');
  }

  function getFusedTracks() { return Array.from(fusedTracks.values()); }
  function getAlerts() { return alerts; }
  function getStats() {
    return {
      observations: observations.length,
      fusedTracks: fusedTracks.size,
      alerts: alerts.length
    };
  }

  function stop() {
    running = false;
    if (fuseInterval) clearInterval(fuseInterval);
  }

  return {
    init: init,
    stop: stop,
    observe: observe,
    getFusedTracks: getFusedTracks,
    getAlerts: getAlerts,
    getStats: getStats,
    triggerSpoofAIS: triggerSpoofAIS,
    triggerGhostTrack: triggerGhostTrack,
    CONFIG: CONFIG
  };
})();

if (typeof window !== 'undefined') window.FusionEngine = FusionEngine;
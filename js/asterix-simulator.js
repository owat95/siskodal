/* ============================================================
 * ASTERIX-SIMULATOR.JS â€” v1.0
 * Simulasi 3 Radar GCI + 20 track udara Indonesia
 * ============================================================ */

const ASTERIXSimulator = (() => {
  'use strict';

  // ============================================
  // RADAR GCI (Data Sources)
  // ============================================
  const RADARS = [
    { id: 'gci-halim',       name: 'GCI Halim PK',       sac: 0x19, sic: 0x01, lat: -6.266,  lon: 106.891, rangeKm: 200 },
    { id: 'gci-iswahjudi',   name: 'GCI Iswahjudi',      sac: 0x19, sic: 0x02, lat: -7.616,  lon: 111.434, rangeKm: 200 },
    { id: 'gci-hasanuddin',  name: 'GCI Hasanuddin',     sac: 0x19, sic: 0x03, lat: -5.061,  lon: 119.554, rangeKm: 200 }
  ];

  // ============================================
  // AIRCRAFT DEFINITIONS
  // ============================================
  const AIRCRAFT_DEFS = [
    // === F-16 Falcon (AU) â€” 6 unit ===
    { callsign: 'FALCON01', type: 'fighter', modeS: 0x525001, sidc: '100301000011010100000000000000',
      route: [[-6.266, 106.891], [2.0, 108.0], [5.0, 110.0], [2.0, 115.0], [-6.266, 106.891]],
      speed: 450, fl: 250 },
    { callsign: 'FALCON02', type: 'fighter', modeS: 0x525002, sidc: '100301000011010100000000000000',
      route: [[-6.266, 106.891], [-8.0, 115.0], [-6.0, 120.0], [-3.0, 118.0], [-6.266, 106.891]],
      speed: 450, fl: 250 },
    { callsign: 'FALCON03', type: 'fighter', modeS: 0x525003, sidc: '100301000011010100000000000000',
      route: [[-7.616, 111.434], [-5.0, 118.0], [-3.0, 120.0], [-6.0, 112.0], [-7.616, 111.434]],
      speed: 430, fl: 260 },
    { callsign: 'FALCON04', type: 'fighter', modeS: 0x525004, sidc: '100301000011010100000000000000',
      route: [[-7.616, 111.434], [-8.0, 115.0], [-7.0, 118.0], [-8.0, 113.0], [-7.616, 111.434]],
      speed: 430, fl: 260 },
    { callsign: 'FALCON05', type: 'fighter', modeS: 0x525005, sidc: '100301000011010100000000000000',
      route: [[-5.061, 119.554], [-2.0, 120.0], [0.0, 122.0], [-3.0, 122.0], [-5.061, 119.554]],
      speed: 440, fl: 270 },
    { callsign: 'FALCON06', type: 'fighter', modeS: 0x525006, sidc: '100301000011010100000000000000',
      route: [[-5.061, 119.554], [-6.0, 122.0], [-8.0, 124.0], [-6.0, 121.0], [-5.061, 119.554]],
      speed: 440, fl: 270 },

    // === Su-30 (AU) â€” 2 unit ===
    { callsign: 'FLANKER01', type: 'fighter', modeS: 0x525010, sidc: '100301000011010100000000000000',
      route: [[-6.266, 106.891], [3.0, 108.0], [4.5, 110.0], [1.0, 112.0], [-6.266, 106.891]],
      speed: 480, fl: 280 },
    { callsign: 'FLANKER02', type: 'fighter', modeS: 0x525011, sidc: '100301000011010100000000000000',
      route: [[-5.061, 119.554], [-3.0, 122.0], [0.0, 124.0], [-2.0, 122.0], [-5.061, 119.554]],
      speed: 480, fl: 280 },

    // === Rafale (AU) â€” 2 unit ===
    { callsign: 'RAFAEL01', type: 'fighter', modeS: 0x525020, sidc: '100301000011010100000000000000',
      route: [[-6.266, 106.891], [1.0, 104.0], [3.0, 105.0], [1.0, 108.0], [-6.266, 106.891]],
      speed: 460, fl: 300 },
    { callsign: 'RAFAEL02', type: 'fighter', modeS: 0x525021, sidc: '100301000011010100000000000000',
      route: [[-7.616, 111.434], [-8.5, 114.0], [-9.0, 117.0], [-8.0, 115.0], [-7.616, 111.434]],
      speed: 460, fl: 300 },

    // === UAV MALE (AU) â€” 4 unit ===
    { callsign: 'RAVEN01', type: 'uav', modeS: 0x525030, sidc: '100301000011040000000000000000',
      route: [[-6.266, 106.891], [2.0, 108.0], [5.0, 110.0], [2.0, 108.0], [-6.266, 106.891]],
      speed: 180, fl: 200 },
    { callsign: 'RAVEN02', type: 'uav', modeS: 0x525031, sidc: '100301000011040000000000000000',
      route: [[-5.061, 119.554], [-3.0, 122.0], [0.0, 120.0], [-5.061, 119.554]],
      speed: 180, fl: 200 },
    { callsign: 'RAVEN03', type: 'uav', modeS: 0x525032, sidc: '100301000011040000000000000000',
      route: [[-7.616, 111.434], [-8.5, 114.0], [-7.0, 113.0], [-7.616, 111.434]],
      speed: 180, fl: 200 },
    { callsign: 'RAVEN04', type: 'uav', modeS: 0x525033, sidc: '100301000011040000000000000000',
      route: [[-2.533, 140.717], [-4.0, 138.0], [-6.0, 140.0], [-2.533, 140.717]],
      speed: 180, fl: 200 },

    // === Helicopter (AU) â€” 3 unit ===
    { callsign: 'VIPER01', type: 'heli', modeS: 0x525040, sidc: '100301000011050100000000000000',
      route: [[-6.266, 106.891], [-7.0, 110.0], [-6.0, 112.0], [-6.266, 106.891]],
      speed: 150, fl: 50 },
    { callsign: 'VIPER02', type: 'heli', modeS: 0x525041, sidc: '100301000011050100000000000000',
      route: [[-5.061, 119.554], [-4.0, 121.0], [-6.0, 121.0], [-5.061, 119.554]],
      speed: 150, fl: 50 },
    { callsign: 'VIPER03', type: 'heli', modeS: 0x525042, sidc: '100301000011050100000000000000',
      route: [[-7.616, 111.434], [-8.0, 114.0], [-7.0, 115.0], [-7.616, 111.434]],
      speed: 150, fl: 50 },

    // === Unknown / Hostile (untuk skenario) â€” 3 unit ===
    { callsign: 'UNKNOWN1', type: 'unknown', modeS: 0x000001, sidc: '100301000011000000000000000000',
      route: [[5.0, 110.0], [4.0, 112.0], [3.0, 114.0], [4.0, 112.0], [5.0, 110.0]],
      speed: 400, fl: 300, affiliation: 'unknown' },
    { callsign: 'HOSTILE1', type: 'hostile', modeS: 0x000002, sidc: '150301000011010100000000000000',
      route: [[5.0, 108.0], [4.0, 110.0], [3.5, 112.0], [4.5, 110.0], [5.0, 108.0]],
      speed: 500, fl: 320, affiliation: 'hostile' },
    { callsign: 'HOSTILE2', type: 'hostile', modeS: 0x000003, sidc: '150301000011010100000000000000',
      route: [[-3.0, 122.0], [-2.0, 124.0], [-1.0, 126.0], [-2.0, 124.0], [-3.0, 122.0]],
      speed: 500, fl: 320, affiliation: 'hostile' }
  ];

  let tracks = [];
  let running = false;
  let broadcastInterval = null;
  let movementInterval = null;
  let onASTERIXCallback = null;

  // ============================================
  // CREATE TRACK
  // ============================================
  function createTrack(def) {
    const route = def.route;
    const wpIdx = Math.floor(Math.random() * (route.length - 1));
    const wp1 = route[wpIdx];
    const wp2 = route[wpIdx + 1];
    const t = Math.random();
    const lat = wp1[0] + (wp2[0] - wp1[0]) * t;
    const lon = wp1[1] + (wp2[1] - wp1[1]) * t;

    const heading = Math.atan2(wp2[1] - wp1[1], wp2[0] - wp1[0]) * 180 / Math.PI;

    return {
      id: `trk-${def.callsign}`,
      callsign: def.callsign,
      type: def.type,
      modeS: def.modeS,
      sidc: def.sidc,
      domain: 'au',
      affiliation: def.affiliation || 'friend',
      lat, lon,
      alt: def.fl * 100 * 0.3048,  // FL Ã— 100 ft â†’ meter
      fl: def.fl,
      speed: def.speed,             // knots
      heading: (heading + 360) % 360,
      route: def.route,
      routeIdx: wpIdx,
      nextBroadcast: 1000 + Math.random() * 3000
    };
  }

  // ============================================
  // MOVEMENT
  // ============================================
  function moveTrack(track, dtSec) {
    const route = track.route;
    const nextIdx = (track.routeIdx + 1) % route.length;
    const target = route[nextIdx];

    const dLat = target[0] - track.lat;
    const dLon = target[1] - track.lon;
    const distDeg = Math.sqrt(dLat * dLat + dLon * dLon);
    const distKm = distDeg * 111.32;

    const speedKmH = track.speed * 1.852;
    const distPerSec = speedKmH / 3600;
    const distM = distPerSec * dtSec;
    const distMTarget = distKm * 1000;

    if (distMTarget < distM * 2) {
      track.lat = target[0];
      track.lon = target[1];
      track.routeIdx = nextIdx;
    } else {
      const ratio = distM / distMTarget;
      track.lat += dLat * ratio;
      track.lon += dLon * ratio;
    }

    const headingDeg = Math.atan2(dLon, dLat) * 180 / Math.PI;
    track.heading = (headingDeg + 360) % 360;
  }

  // ============================================
  // BROADCAST ASTERIX
  // ============================================
  function broadcastASTERIX(track) {
    // Feed ke fusion engine
    if (window.FusionEngine) {
      window.FusionEngine.observe(track, 'ASTERIX');
    }

    let nearestRadar = RADARS[0];
    let minDist = Infinity;
    RADARS.forEach(r => {
      const d = Math.sqrt(Math.pow(r.lat - track.lat, 2) + Math.pow(r.lon - track.lon, 2));
      if (d < minDist) {
        minDist = d;
        nearestRadar = r;
      }
    });

    // Hitung polar (RHO = jarak NM, THETA = sudut dari radar)
    const dLat = track.lat - nearestRadar.lat;
    const dLon = track.lon - nearestRadar.lon;
    const rho = Math.sqrt(dLat * dLat + dLon * dLon) * 60; // 1 deg â‰ˆ 60 NM
    const theta = (Math.atan2(dLon, dLat) * 180 / Math.PI + 360) % 360;

    // Encode ASTERIX
    const record = {
      sac: nearestRadar.sac,
      sic: nearestRadar.sic,
      typ: 4,
      rho: rho,
      theta: theta,
      squawk: 7000 + Math.floor(Math.random() * 500),
      fl: track.fl,
      trackNumber: parseInt(track.modeS.toString(16).substring(3), 16),
      modeS: track.modeS,
      callsign: track.callsign
    };

    const encoded = ASTERIXCore.encodeCat048(record);

    if (onASTERIXCallback) {
      onASTERIXCallback({
        track: track,
        radar: nearestRadar,
        record: record,
        bytes: encoded,
        hex: ASTERIXCore.toHex(encoded)
      });
    }

    if (window.DEBUG_ASTERIX) {
      console.log(`[ASTERIX] ${track.callsign} via ${nearestRadar.name}`,
        `RHO:${rho.toFixed(1)}NM THETA:${theta.toFixed(1)}Â° FL:${track.fl}`,
        `HEX:${ASTERIXCore.toHex(encoded).substring(0, 40)}...`);
    }
  }

  // ============================================
  // START
  // ============================================
  function start(callback) {
    if (running) return;

    tracks = AIRCRAFT_DEFS.map(createTrack);
    console.log(`[ASTERIX-SIM] Created ${tracks.length} tracks`);

    // Register ke AssetManager
    if (window.assetManager) {
      tracks.forEach(track => {
        window.assetManager.addAsset(track);
      });
    }

    onASTERIXCallback = callback;
    running = true;

    // Movement loop
    let lastTime = Date.now();
    movementInterval = setInterval(() => {
      const now = Date.now();
      const dtSec = (now - lastTime) / 1000;
      lastTime = now;

      tracks.forEach(t => moveTrack(t, dtSec));

      if (window.assetManager) {
        tracks.forEach(t => {
          window.assetManager.updateAsset(t.id, {
            lat: t.lat, lon: t.lon, alt: t.alt
          });
        });
      }
    }, 1000);

    // Broadcast loop (every 100ms check)
    broadcastInterval = setInterval(() => {
      tracks.forEach(t => {
        t.nextBroadcast -= 100;
        if (t.nextBroadcast <= 0) {
          broadcastASTERIX(t);
          t.nextBroadcast = 3000 + Math.random() * 2000; // 3-5s
        }
      });
    }, 100);

    console.log('[ASTERIX-SIM] Started');
  }

  function stop() {
    if (movementInterval) clearInterval(movementInterval);
    if (broadcastInterval) clearInterval(broadcastInterval);
    running = false;
    console.log('[ASTERIX-SIM] Stopped');
  }

  function getTracks() { return tracks; }
  function getRadars() { return RADARS; }

  return {
    start, stop, getTracks, getRadars,
    RADARS, AIRCRAFT_DEFS
  };
})();

if (typeof window !== 'undefined') window.ASTERIXSimulator = ASTERIXSimulator;
/* ============================================================
 * AIS-SIMULATOR.JS â€” v1.0
 * Simulasi 40+ kapal Indonesia dengan AIS broadcasting
 * ============================================================ */

const AISSimulator = (() => {
  'use strict';

  // ============================================
  // SHIP DATABASE
  // ============================================
  const SHIP_TYPES = {
    FRIGATE:  { sidc: '100302000011010200000000000000', icon: 'al', speedMax: 30, label: 'KRI' },
    PATROL:   { sidc: '100302000011030000000000000000', icon: 'al', speedMax: 25, label: 'KAL' },
    MERCHANT: { sidc: '100302000011050000000000000000', icon: 'laut', speedMax: 15, label: 'MV' },
    TANKER:   { sidc: '100302000011050000000000000000', icon: 'laut', speedMax: 12, label: 'MT' },
    FISHING:  { sidc: '100302000011060000000000000000', icon: 'laut', speedMax: 8,  label: 'KM' }
  };

  // ============================================
  // WAYPOINTS â€” Chokepoints NKRI
  // ============================================
  const ROUTES = {
    MALAKA_NORTH: [
      [5.5, 98.0], [4.0, 99.5], [3.0, 100.5], [2.0, 101.5],
      [1.5, 103.0], [1.2, 104.0], [1.5, 105.0], [2.5, 106.5]
    ],
    MALAKA_SOUTH: [
      [-1.0, 105.0], [1.0, 103.5], [2.5, 101.0], [4.0, 99.0], [6.0, 97.0]
    ],
    SUNDA: [
      [-6.0, 104.5], [-6.2, 105.0], [-6.5, 106.0], [-7.0, 107.0], [-8.0, 109.0]
    ],
    NATUNA: [
      [5.0, 105.0], [4.5, 107.0], [4.0, 108.5], [3.0, 109.5], [2.0, 108.0], [3.5, 106.0]
    ],
    MAKASSAR: [
      [2.0, 117.5], [0.5, 118.5], [-1.5, 118.8], [-3.5, 119.0], [-5.5, 119.5]
    ],
    LOMBOK: [
      [-8.0, 115.5], [-8.5, 116.0], [-8.7, 117.0], [-9.0, 119.0], [-9.5, 121.0]
    ],
    ARAFURU: [
      [-8.0, 130.0], [-9.0, 133.0], [-9.5, 136.0], [-10.0, 139.0], [-11.0, 141.0]
    ]
  };

  // ============================================
  // SHIP ROSTER (40+ kapal)
  // ============================================
  const SHIP_DEFS = [
    // === KRI (Frigate) â€” 6 kapal ===
    { name: 'KRI Diponegoro',    type: 'FRIGATE', mmsi: 525015810, route: 'MALAKA_NORTH' },
    { name: 'KRI Sultan Hasanuddin', type: 'FRIGATE', mmsi: 525015811, route: 'MAKASSAR' },
    { name: 'KRI John Lie',      type: 'FRIGATE', mmsi: 525015812, route: 'NATUNA' },
    { name: 'KRI Ahmad Yani',    type: 'FRIGATE', mmsi: 525015813, route: 'SUNDA' },
    { name: 'KRI Yos Sudarso',   type: 'FRIGATE', mmsi: 525015814, route: 'ARAFURU' },
    { name: 'KRI Frans Kaisiepo',type: 'FRIGATE', mmsi: 525015815, route: 'LOMBOK' },

    // === KAL (Patrol) â€” 6 kapal ===
    { name: 'KAL Natuna',        type: 'PATROL',  mmsi: 525016810, route: 'NATUNA' },
    { name: 'KAL Marore',        type: 'PATROL',  mmsi: 525016811, route: 'MALAKA_NORTH' },
    { name: 'KAL Arafuru',       type: 'PATROL',  mmsi: 525016812, route: 'ARAFURU' },
    { name: 'KAL Sunda',         type: 'PATROL',  mmsi: 525016813, route: 'SUNDA' },
    { name: 'KAL Sulawesi',      type: 'PATROL',  mmsi: 525016814, route: 'MAKASSAR' },
    { name: 'KAL Lombok',        type: 'PATROL',  mmsi: 525016815, route: 'LOMBOK' },

    // === Merchant â€” 12 kapal ===
    { name: 'MV Ocean Star',     type: 'MERCHANT', mmsi: 525017810, route: 'MALAKA_NORTH' },
    { name: 'MV Samudra Jaya',   type: 'MERCHANT', mmsi: 525017811, route: 'MAKASSAR' },
    { name: 'MV Bahari Indah',   type: 'MERCHANT', mmsi: 525017812, route: 'SUNDA' },
    { name: 'MV Nusantara 01',   type: 'MERCHANT', mmsi: 525017813, route: 'NATUNA' },
    { name: 'MV Nusantara 02',   type: 'MERCHANT', mmsi: 525017814, route: 'LOMBOK' },
    { name: 'MV Khatulistiwa',   type: 'MERCHANT', mmsi: 525017815, route: 'MALAKA_SOUTH' },
    { name: 'MV Bintang Samudra',type: 'MERCHANT', mmsi: 525017816, route: 'ARAFURU' },
    { name: 'MV Sinar Mas',      type: 'MERCHANT', mmsi: 525017817, route: 'MAKASSAR' },
    { name: 'MV Anugerah 88',    type: 'MERCHANT', mmsi: 525017818, route: 'SUNDA' },
    { name: 'MV Cahaya Timur',   type: 'MERCHANT', mmsi: 525017819, route: 'MALAKA_NORTH' },
    { name: 'MV Prima Nusantara',type: 'MERCHANT', mmsi: 525017820, route: 'NATUNA' },
    { name: 'MV Merdeka 45',     type: 'MERCHANT', mmsi: 525017821, route: 'LOMBOK' },

    // === Tanker â€” 6 kapal ===
    { name: 'MT Pertamina 01',   type: 'TANKER',  mmsi: 525018810, route: 'MALAKA_NORTH' },
    { name: 'MT Pertamina 02',   type: 'TANKER',  mmsi: 525018811, route: 'MAKASSAR' },
    { name: 'MT Gas Nusantara',  type: 'TANKER',  mmsi: 525018812, route: 'NATUNA' },
    { name: 'MT Bahari Tanker',  type: 'TANKER',  mmsi: 525018813, route: 'SUNDA' },
    { name: 'MT LNG Badak',      type: 'TANKER',  mmsi: 525018814, route: 'LOMBOK' },
    { name: 'MT Arun Gas',       type: 'TANKER',  mmsi: 525018815, route: 'MALAKA_SOUTH' },

    // === Fishing â€” 12 kapal ===
    { name: 'KM Nelayan 07',     type: 'FISHING', mmsi: 525019810, route: 'NATUNA' },
    { name: 'KM Mina Jaya',      type: 'FISHING', mmsi: 525019811, route: 'MALAKA_NORTH' },
    { name: 'KM Samudera 01',    type: 'FISHING', mmsi: 525019812, route: 'ARAFURU' },
    { name: 'KM Bahari Makmur',  type: 'FISHING', mmsi: 525019813, route: 'SUNDA' },
    { name: 'KM Ikan Kembar',    type: 'FISHING', mmsi: 525019814, route: 'MAKASSAR' },
    { name: 'KM Selatan 21',     type: 'FISHING', mmsi: 525019815, route: 'LOMBOK' },
    { name: 'KM Muara 33',       type: 'FISHING', mmsi: 525019816, route: 'MALAKA_SOUTH' },
    { name: 'KM Pantai Indah',   type: 'FISHING', mmsi: 525019817, route: 'NATUNA' },
    { name: 'KM Cakalang 55',    type: 'FISHING', mmsi: 525019818, route: 'MAKASSAR' },
    { name: 'KM Tuna 88',        type: 'FISHING', mmsi: 525019819, route: 'ARAFURU' },
    { name: 'KM Teri 12',        type: 'FISHING', mmsi: 525019820, route: 'SUNDA' },
    { name: 'KM Udang 09',       type: 'FISHING', mmsi: 525019821, route: 'MALAKA_NORTH' }
  ];

  // ============================================
  // SIMULATOR STATE
  // ============================================
  let ships = [];
  let running = false;
  let broadcastInterval = null;
  let movementInterval = null;
  let onAISCallback = null;

  // ============================================
  // KONVERSI KM â†’ DERAJAT (approx)
  // ============================================
  function kmToLatDeg(km) { return km / 111.32; }
  function kmToLonDeg(km, lat) { return km / (111.32 * Math.cos(lat * Math.PI / 180)); }

  // ============================================
  // INISIALISASI KAPAL
  // ============================================
  function createShip(def) {
    const route = ROUTES[def.route];
    const type = SHIP_TYPES[def.type];

    // Posisi awal: random di antara 2 waypoint pertama
    const wpIdx = Math.floor(Math.random() * (route.length - 1));
    const wp1 = route[wpIdx];
    const wp2 = route[wpIdx + 1];
    const t = Math.random();
    const lat = wp1[0] + (wp2[0] - wp1[0]) * t;
    const lon = wp1[1] + (wp2[1] - wp1[1]) * t;

    // Heading menuju waypoint berikutnya
    const heading = Math.atan2(wp2[1] - wp1[1], wp2[0] - wp1[0]) * 180 / Math.PI;
    const cog = (heading + 360) % 360;

    return {
      id: `ais-${def.mmsi}`,
      mmsi: def.mmsi,
      name: def.name,
      type: def.type,
      sidc: type.sidc,
      domain: type.icon,
      affiliation: 'friend',
      lat: lat,
      lon: lon,
      alt: 0,
      sog: type.speedMax * (0.5 + Math.random() * 0.5),
      cog: cog,
      heading: cog,
      route: def.route,
      routeIdx: wpIdx,
      routeT: t,
      lastAIS: 0,
      nextAIS: 2000 + Math.random() * 8000 // 2-10 detik
    };
  }

  // ============================================
  // MOVEMENT ENGINE
  // ============================================
  function moveShip(ship, dtSec) {
    const route = ROUTES[ship.route];

    // Kecepatan dalam derajat per detik (approx)
    const sogMs = ship.sog * 0.5144; // knot â†’ m/s
    const distM = sogMs * dtSec;

    // Target waypoint berikutnya
    const nextIdx = (ship.routeIdx + 1) % route.length;
    const target = route[nextIdx];

    // Hitung jarak ke target
    const dLat = target[0] - ship.lat;
    const dLon = target[1] - ship.lon;
    const distDeg = Math.sqrt(dLat * dLat + dLon * dLon);
    const distKmActual = distDeg * 111.32;
    const distMTarget = distKmActual * 1000;

    if (distMTarget < distM) {
      // Sampai waypoint â†’ lanjut ke berikutnya
      ship.lat = target[0];
      ship.lon = target[1];
      ship.routeIdx = nextIdx;
    } else {
      // Bergerak menuju target
      const ratio = distM / distMTarget;
      ship.lat += dLat * ratio;
      ship.lon += dLon * ratio;
    }

    // Update heading/COG
    const headingDeg = Math.atan2(dLon, dLat) * 180 / Math.PI;
    ship.cog = (headingDeg + 360) % 360;
    ship.heading = ship.cog;
  }

  // ============================================
  // AIS BROADCAST
  // ============================================
  function broadcastAIS(ship) {
    // Feed ke fusion engine
    if (window.FusionEngine) {
      window.FusionEngine.observe(ship, 'AIS');
    }

    // Encode Type 1 (position)
    const positionPayload = AISCore.encodeType1({
      mmsi: ship.mmsi,
      lon: ship.lon,
      lat: ship.lat,
      sog: ship.sog,
      cog: ship.cog,
      heading: Math.round(ship.heading),
      navStatus: 0
    });

    const nmea1 = AISCore.buildNMEA(positionPayload, 'A', 0);

    // Encode Type 5 (static) â€” dipecah 2 fragmen
    const staticPayload = AISCore.encodeType5({
      mmsi: ship.mmsi,
      vesselName: ship.name.substring(0, 20),
      callsign: 'PM' + ship.mmsi.toString().substring(3),
      shipType: 70,
      destination: ship.route
    });

    const half = Math.ceil(staticPayload.length / 2);
    const frag1 = staticPayload.substring(0, half);
    const frag2 = staticPayload.substring(half);

    const nmea2a = `!AIVDM,2,1,${Math.floor(ship.mmsi % 10)},A,${frag1},0*00`;
    const nmea2b = `!AIVDM,2,2,${Math.floor(ship.mmsi % 10)},A,${frag2},2*00`;

    // Callback
    if (onAISCallback) {
      onAISCallback({
        ship: ship,
        type1: nmea1,
        type5: [nmea2a, nmea2b]
      });
    }

    // Console log (debug)
    if (window.DEBUG_AIS) {
      console.log(`[AIS] ${ship.name} (${ship.mmsi})`,
        `LAT: ${ship.lat.toFixed(4)}`,
        `LON: ${ship.lon.toFixed(4)}`,
        `SOG: ${ship.sog.toFixed(1)}`,
        `COG: ${ship.cog.toFixed(1)}`);
    }
  }

  // ============================================
  // MAIN LOOP
  // ============================================
  function start(aisCallback) {
    if (running) return;

    // Buat semua kapal
    ships = SHIP_DEFS.map(createShip);
    console.log(`[AIS-SIM] Created ${ships.length} ships`);

    // Daftarkan ke AssetManager
    if (window.assetManager) {
      ships.forEach(ship => {
        window.assetManager.addAsset(ship);
      });
    }

    onAISCallback = aisCallback;
    running = true;

    // Movement loop â€” 1 Hz
    let lastTime = Date.now();
    movementInterval = setInterval(() => {
      const now = Date.now();
      const dtSec = (now - lastTime) / 1000;
      lastTime = now;

      ships.forEach(ship => moveShip(ship, dtSec));

      // Update entities di Cesium
      if (window.assetManager) {
        ships.forEach(ship => {
          window.assetManager.updateAsset(ship.id, {
            lat: ship.lat,
            lon: ship.lon,
            alt: 0
          });
        });
      }
    }, 1000);

    // AIS broadcast loop â€” 10 Hz (check per ship)
    broadcastInterval = setInterval(() => {
      ships.forEach(ship => {
        ship.nextAIS -= 100;
        if (ship.nextAIS <= 0) {
          broadcastAIS(ship);
          ship.nextAIS = 3000 + Math.random() * 7000;
        }
      });
    }, 100);

    console.log('[AIS-SIM] Simulator started');
  }

  function stop() {
    if (movementInterval) clearInterval(movementInterval);
    if (broadcastInterval) clearInterval(broadcastInterval);
    running = false;
    console.log('[AIS-SIM] Simulator stopped');
  }

  function getShips() { return ships; }

  // ============================================
  // EXPORT
  // ============================================
  return {
    start,
    stop,
    getShips,
    SHIP_TYPES,
    ROUTES
  };
})();

// Browser export
if (typeof window !== 'undefined') window.AISSimulator = AISSimulator;
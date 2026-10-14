/* ============================================================
 * NKRI-CONFIG.JS â€” Konfigurasi geografis NKRI
 * ============================================================ */

const NKRI = {
  center: { lat: -2.5, lon: 118.0, altitude: 5000000 },
  bounds: { north: 6.0, south: -11.0, west: 95.0, east: 141.0 },

  chokepoints: [
    { name: 'Selat Malaka',   lat: 2.5,   lon: 101.0,  priority: 'HIGH'     },
    { name: 'Selat Sunda',    lat: -6.0,  lon: 105.5,  priority: 'HIGH'     },
    { name: 'Selat Lombok',   lat: -8.5,  lon: 115.8,  priority: 'MEDIUM'   },
    { name: 'Laut Natuna',    lat: 4.0,   lon: 108.0,  priority: 'CRITICAL' },
    { name: 'Laut Arafuru',   lat: -9.5,  lon: 135.0,  priority: 'MEDIUM'   },
    { name: 'Selat Makassar', lat: -1.0,  lon: 118.5,  priority: 'HIGH'     }
  ],

  bases: {
    au: [
      { name: 'Lanud Halim PK',           lat: -6.266, lon: 106.891 },
      { name: 'Lanud Iswahjudi',          lat: -7.616, lon: 111.434 },
      { name: 'Lanud Sultan Hasanuddin',  lat: -5.061, lon: 119.554 }
    ],
    al: [
      { name: 'Lantamal I Belawan',   lat: 3.783,   lon: 98.683  },
      { name: 'Lantamal II Padang',   lat: -0.876,  lon: 100.351 },
      { name: 'Lantamal V Surabaya',  lat: -7.206,  lon: 112.735 },
      { name: 'Lantamal VII Kupang',  lat: -10.163, lon: 123.603 }
    ],
    ad: [
      { name: 'Kodam Jaya',              lat: -6.175, lon: 106.827 },
      { name: 'Kodam III Siliwangi',     lat: -6.914, lon: 107.609 },
      { name: 'Kodam XVII Cenderawasih', lat: -2.533, lon: 140.717 }
    ]
  }
};

// Freeze
Object.freeze(NKRI);

// Browser export
if (typeof window !== 'undefined') window.NKRI = NKRI;
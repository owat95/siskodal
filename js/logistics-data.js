/* ============================================================
 * LOGISTICS-DATA.JS — Mock data logistik per matra
 * ============================================================ */

const LogisticsData = (() => {
  'use strict';

  // ============================================
  // GUDANG / DEPO PER MATRA
  // ============================================
  const GUDANG = {
    ad: [
      { id: 'gd-ad-01', name: 'Gudlogad Jakarta', province: 'DKI Jakarta', capacity: 10000, stock: { amunisi: 8500, bahan_bakar: 6200, makanan: 9400, spare_parts: 3200 } },
      { id: 'gd-ad-02', name: 'Gudlogad Surabaya', province: 'Jawa Timur', capacity: 9000, stock: { amunisi: 7100, bahan_bakar: 5800, makanan: 8200, spare_parts: 2800 } },
      { id: 'gd-ad-03', name: 'Gudlogad Makassar', province: 'Sulawesi Selatan', capacity: 7000, stock: { amunisi: 4200, bahan_bakar: 3100, makanan: 6100, spare_parts: 1900 } },
      { id: 'gd-ad-04', name: 'Gudlogad Jayapura', province: 'Papua', capacity: 5000, stock: { amunisi: 2800, bahan_bakar: 1900, makanan: 4200, spare_parts: 950 } },
      { id: 'gd-ad-05', name: 'Gudlogad Medan', province: 'Sumatera Utara', capacity: 6000, stock: { amunisi: 4800, bahan_bakar: 3900, makanan: 5500, spare_parts: 2100 } }
    ],
    al: [
      { id: 'gd-al-01', name: 'Gudlogal Surabaya', province: 'Jawa Timur', capacity: 12000, stock: { amunisi: 9800, bahan_bakar: 8900, makanan: 10200, spare_parts: 4100 } },
      { id: 'gd-al-02', name: 'Gudlogal Jakarta', province: 'DKI Jakarta', capacity: 8000, stock: { amunisi: 6400, bahan_bakar: 5200, makanan: 7100, spare_parts: 2900 } },
      { id: 'gd-al-03', name: 'Gudlogal Makassar', province: 'Sulawesi Selatan', capacity: 7000, stock: { amunisi: 5200, bahan_bakar: 4100, makanan: 6300, spare_parts: 2200 } },
      { id: 'gd-al-04', name: 'Gudlogal Biak', province: 'Papua', capacity: 4000, stock: { amunisi: 2100, bahan_bakar: 1600, makanan: 3500, spare_parts: 850 } },
      { id: 'gd-al-05', name: 'Gudlogal Belawan', province: 'Sumatera Utara', capacity: 5000, stock: { amunisi: 3800, bahan_bakar: 3200, makanan: 4400, spare_parts: 1700 } }
    ],
    au: [
      { id: 'gd-au-01', name: 'Gudlogau Halim PK', province: 'DKI Jakarta', capacity: 8000, stock: { amunisi: 6200, bahan_bakar: 7400, makanan: 6800, spare_parts: 3900 } },
      { id: 'gd-au-02', name: 'Gudlogau Iswahjudi', province: 'Jawa Timur', capacity: 7000, stock: { amunisi: 5100, bahan_bakar: 6300, makanan: 5900, spare_parts: 3200 } },
      { id: 'gd-au-03', name: 'Gudlogau Hasanuddin', province: 'Sulawesi Selatan', capacity: 6000, stock: { amunisi: 4100, bahan_bakar: 4800, makanan: 5100, spare_parts: 2400 } },
      { id: 'gd-au-04', name: 'Gudlogau Biak', province: 'Papua', capacity: 4000, stock: { amunisi: 2200, bahan_bakar: 2600, makanan: 3400, spare_parts: 1100 } },
      { id: 'gd-au-05', name: 'Gudlogau Supadio', province: 'Kalimantan Barat', capacity: 5000, stock: { amunisi: 3600, bahan_bakar: 4100, makanan: 4300, spare_parts: 1900 } }
    ]
  };

  // ============================================
  // ALUTSISTA / ARMADA
  // ============================================
  const ALUTSISTA = {
    ad: [
      { id: 'ad-tank-01', name: 'Leopard 2A6-001', type: 'MBT', unit: 'Yonkav 4', fuelLevel: 45, fuelCapacity: 1200, hoursOperational: 1240, lastMaintenance: '2026-06-15', status: 'ready', location: { lat: -2.5, lon: 140.7, province: 'Papua' } },
      { id: 'ad-tank-02', name: 'Leopard 2A6-002', type: 'MBT', unit: 'Yonkav 4', fuelLevel: 78, fuelCapacity: 1200, hoursOperational: 890, lastMaintenance: '2026-08-20', status: 'ready', location: { lat: -2.5, lon: 140.7, province: 'Papua' } },
      { id: 'ad-tank-03', name: 'Leopard 2A6-003', type: 'MBT', unit: 'Yonkav 4', fuelLevel: 12, fuelCapacity: 1200, hoursOperational: 2100, lastMaintenance: '2026-03-10', status: 'maintenance', location: { lat: -2.5, lon: 140.7, province: 'Papua' } },
      { id: 'ad-apc-01', name: 'Marder 1A3-001', type: 'IFV', unit: 'Yonif 315', fuelLevel: 88, fuelCapacity: 650, hoursOperational: 1450, lastMaintenance: '2026-07-05', status: 'ready', location: { lat: -2.5, lon: 140.7, province: 'Papua' } },
      { id: 'ad-apc-02', name: 'Marder 1A3-002', type: 'IFV', unit: 'Yonif 315', fuelLevel: 55, fuelCapacity: 650, hoursOperational: 980, lastMaintenance: '2026-09-01', status: 'ready', location: { lat: -2.5, lon: 140.7, province: 'Papua' } },
      { id: 'ad-how-01', name: 'CAESAR 155mm-001', type: 'Artillery', unit: 'Yonarmed 15', fuelLevel: 30, fuelCapacity: 400, hoursOperational: 620, lastMaintenance: '2026-05-20', status: 'ready', location: { lat: -3.5, lon: 138.5, province: 'Papua' } },
      { id: 'ad-how-02', name: 'CAESAR 155mm-002', type: 'Artillery', unit: 'Yonarmed 15', fuelLevel: 8, fuelCapacity: 400, hoursOperational: 1450, lastMaintenance: '2026-04-12', status: 'maintenance', location: { lat: -3.5, lon: 138.5, province: 'Papua' } }
    ],
    al: [
      { id: 'al-kri-01', name: 'KRI Diponegoro-365', type: 'Frigate', unit: 'Koarmada I', fuelLevel: 72, fuelCapacity: 45000, hoursOperational: 3200, lastMaintenance: '2026-07-15', status: 'ready', location: { lat: 2.5, lon: 101.0, province: 'Kepulauan Riau' } },
      { id: 'al-kri-02', name: 'KRI Sultan Hasanuddin-366', type: 'Frigate', unit: 'Koarmada II', fuelLevel: 38, fuelCapacity: 45000, hoursOperational: 4100, lastMaintenance: '2026-05-20', status: 'ready', location: { lat: -5.0, lon: 119.0, province: 'Sulawesi Selatan' } },
      { id: 'al-kri-03', name: 'KRI John Lie-358', type: 'Frigate', unit: 'Koarmada III', fuelLevel: 15, fuelCapacity: 45000, hoursOperational: 5200, lastMaintenance: '2026-02-10', status: 'maintenance', location: { lat: -2.5, lon: 140.7, province: 'Papua' } },
      { id: 'al-sub-01', name: 'KRI Nagapasa-403', type: 'Submarine', unit: 'Koarmada II', fuelLevel: 65, fuelCapacity: 25000, hoursOperational: 2100, lastMaintenance: '2026-08-05', status: 'ready', location: { lat: -6.0, lon: 112.0, province: 'Jawa Timur' } },
      { id: 'al-lc-01', name: 'KRI Teluk Bintuni-520', type: 'Landing Craft', unit: 'Koarmada III', fuelLevel: 88, fuelCapacity: 12000, hoursOperational: 1800, lastMaintenance: '2026-09-15', status: 'ready', location: { lat: -2.5, lon: 140.7, province: 'Papua' } }
    ],
    au: [
      { id: 'au-f16-01', name: 'F-16C TS-1601', type: 'Fighter', unit: 'Skadron Udara 3', fuelLevel: 82, fuelCapacity: 3200, hoursOperational: 4200, lastMaintenance: '2026-08-10', status: 'ready', location: { lat: -7.616, lon: 111.434, province: 'Jawa Timur' } },
      { id: 'au-f16-02', name: 'F-16C TS-1602', type: 'Fighter', unit: 'Skadron Udara 3', fuelLevel: 45, fuelCapacity: 3200, hoursOperational: 3800, lastMaintenance: '2026-07-20', status: 'ready', location: { lat: -7.616, lon: 111.434, province: 'Jawa Timur' } },
      { id: 'au-f16-03', name: 'F-16C TS-1603', type: 'Fighter', unit: 'Skadron Udara 3', fuelLevel: 18, fuelCapacity: 3200, hoursOperational: 5100, lastMaintenance: '2026-04-05', status: 'maintenance', location: { lat: -7.616, lon: 111.434, province: 'Jawa Timur' } },
      { id: 'au-suk-01', name: 'Su-30MK2 TS-3001', type: 'Fighter', unit: 'Skadron Udara 11', fuelLevel: 68, fuelCapacity: 9600, hoursOperational: 3400, lastMaintenance: '2026-06-15', status: 'ready', location: { lat: -5.061, lon: 119.554, province: 'Sulawesi Selatan' } },
      { id: 'au-suk-02', name: 'Su-30MK2 TS-3002', type: 'Fighter', unit: 'Skadron Udara 11', fuelLevel: 92, fuelCapacity: 9600, hoursOperational: 2800, lastMaintenance: '2026-09-01', status: 'ready', location: { lat: -5.061, lon: 119.554, province: 'Sulawesi Selatan' } },
      { id: 'au-herc-01', name: 'C-130H A-1310', type: 'Transport', unit: 'Skadron Udara 31', fuelLevel: 55, fuelCapacity: 25000, hoursOperational: 6200, lastMaintenance: '2026-05-10', status: 'ready', location: { lat: -6.266, lon: 106.891, province: 'DKI Jakarta' } },
      { id: 'au-herc-02', name: 'C-130H A-1311', type: 'Transport', unit: 'Skadron Udara 31', fuelLevel: 25, fuelCapacity: 25000, hoursOperational: 7100, lastMaintenance: '2026-03-20', status: 'maintenance', location: { lat: -6.266, lon: 106.891, province: 'DKI Jakarta' } }
    ]
  };

  // ============================================
  // SUPPLY ROUTES
  // ============================================
  const ROUTES = {
    ad: [
      { id: 'rt-ad-01', from: 'Gudlogad Jakarta', to: 'Gudlogad Jayapura', vehicle: 'C-130', status: 'active', cargo: 'Amunisi + Spare Parts', risk: 'MEDIUM', etaHours: 8, distanceKm: 3800 },
      { id: 'rt-ad-02', from: 'Gudlogad Surabaya', to: 'Gudlogad Makassar', vehicle: 'KRI', status: 'active', cargo: 'Bahan Bakar', risk: 'LOW', etaHours: 24, distanceKm: 800 },
      { id: 'rt-ad-03', from: 'Gudlogad Medan', to: 'Gudlogad Jakarta', vehicle: 'Truck Convoy', status: 'delayed', cargo: 'Makanan', risk: 'HIGH', etaHours: 72, distanceKm: 1800 }
    ],
    al: [
      { id: 'rt-al-01', from: 'Gudlogal Surabaya', to: 'Gudlogal Biak', vehicle: 'KRI Bima Suci', status: 'active', cargo: 'Amunisi + Spare Parts', risk: 'MEDIUM', etaHours: 96, distanceKm: 2800 },
      { id: 'rt-al-02', from: 'Gudlogal Jakarta', to: 'Gudlogal Belawan', vehicle: 'KRI', status: 'active', cargo: 'Bahan Bakar', risk: 'LOW', etaHours: 36, distanceKm: 1600 },
      { id: 'rt-al-03', from: 'Gudlogal Makassar', to: 'Gudlogal Biak', vehicle: 'KRI', status: 'active', cargo: 'Makanan', risk: 'MEDIUM', etaHours: 48, distanceKm: 1800 }
    ],
    au: [
      { id: 'rt-au-01', from: 'Gudlogau Halim PK', to: 'Gudlogau Biak', vehicle: 'C-130H', status: 'active', cargo: 'Jet Fuel + Amunisi', risk: 'LOW', etaHours: 6, distanceKm: 3800 },
      { id: 'rt-au-02', from: 'Gudlogau Iswahjudi', to: 'Gudlogau Hasanuddin', vehicle: 'C-130H', status: 'active', cargo: 'Spare Parts', risk: 'LOW', etaHours: 4, distanceKm: 900 },
      { id: 'rt-au-03', from: 'Gudlogau Supadio', to: 'Gudlogau Biak', vehicle: 'C-130H', status: 'active', cargo: 'Aviation Fuel', risk: 'MEDIUM', etaHours: 8, distanceKm: 2400 }
    ]
  };

  // ============================================
  // AI ANOMALIES (cyber threat mock)
  // ============================================
  const ANOMALIES = {
    ad: [
      { id: 'an-ad-01', severity: 'HIGH', type: 'GPS_SPOOFING', message: 'Anomali sinyal GPS pada konvoi logistik Medan-Jakarta', timestamp: Date.now() - 3600000 },
      { id: 'an-ad-02', severity: 'MEDIUM', type: 'DATA_TAMPERING', message: 'Manifest kargo Gudlogad Makassar tidak konsisten', timestamp: Date.now() - 7200000 }
    ],
    al: [
      { id: 'an-al-01', severity: 'HIGH', type: 'AIS_SPOOFING', message: 'KRI logistik terdeteksi ganda di dua lokasi berbeda', timestamp: Date.now() - 1800000 }
    ],
    au: [
      { id: 'an-au-01', severity: 'MEDIUM', type: 'MANIFEST_TAMPERING', message: 'Manifest Gudlogau Biak tidak sinkron dengan pusat', timestamp: Date.now() - 5400000 }
    ]
  };

  // ============================================
  // RBAC ROLES
  // ============================================
  const ROLES = {
    JENDRAL_AD:  { matra: 'ad', label: 'Jendral TNI AD', access: ['ad'], level: 3, color: '#059669' },
    JENDRAL_AL:  { matra: 'al', label: 'Jendral TNI AL', access: ['al'], level: 3, color: '#1e40af' },
    JENDRAL_AU:  { matra: 'au', label: 'Jendral TNI AU', access: ['au'], level: 3, color: '#2563eb' },
    OPS_LOG:     { matra: null, label: 'Operator Logistik', access: ['ad','al','au'], level: 2, color: '#a855f7' },
    WATCHER:     { matra: null, label: 'Watcher (Read-Only)', access: ['ad','al','au'], level: 1, color: '#64748b', readOnly: true }
  };

  // ============================================
  // EXPORT
  // ============================================
  return {
    GUDANG, ALUTSISTA, ROUTES, ANOMALIES, ROLES,
    getGudang: (matra) => GUDANG[matra] || [],
    getAlutsista: (matra) => ALUTSISTA[matra] || [],
    getRoutes: (matra) => ROUTES[matra] || [],
    getAnomalies: (matra) => ANOMALIES[matra] || [],
    getRole: (roleKey) => ROLES[roleKey] || null,
    getAllRoles: () => Object.entries(ROLES).map(([key, val]) => ({ key, ...val }))
  };
})();

if (typeof window !== 'undefined') window.LogisticsData = LogisticsData;
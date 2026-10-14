/* ============================================================
 * KOMUNIKASI-DATA.JS — Devices, Users, Channels, Messages
 * ============================================================ */

const KomunikasiData = (() => {
  'use strict';

  // ============================================
  // USERS / CALL SIGNS
  // ============================================
  const USERS = [
    // AD — Darat
    { id: 'U001', callSign: 'ALPHA-01',   name: 'Letkol Budi Santoso',    nrp: '149751543', unit: 'Kodam Jaya',              matra: 'ad', role: 'COMMANDER', clearance: 'SECRET',       online: true  },
    { id: 'U002', callSign: 'ALPHA-02',   name: 'Mayor Agus Wijaya',      nrp: '145566358', unit: 'Kodam III/Siliwangi',     matra: 'ad', role: 'OFFICER',   clearance: 'CONFIDENTIAL', online: true  },
    { id: 'U003', callSign: 'BRAVO-01',   name: 'Kapten Hendra Hutapea',  nrp: '120274305', unit: 'Kodam XVII/Cenderawasih', matra: 'ad', role: 'OFFICER',   clearance: 'CONFIDENTIAL', online: false },
    { id: 'U004', callSign: 'BRAVO-02',   name: 'Lettu Cahyo Utama',      nrp: '121186728', unit: 'Batalyon Infanteri 315',  matra: 'ad', role: 'OFFICER',   clearance: 'RESTRICTED',   online: true  },
    { id: 'U005', callSign: 'CHARLIE-01', name: 'Serma Iwan Handoko',     nrp: '145738040', unit: 'Kopassus',                matra: 'ad', role: 'OPERATOR',  clearance: 'SECRET',       online: true  },

    // AL — Laut
    { id: 'U101', callSign: 'DELTA-01',   name: 'Kolonel Laut Vino Nugroho', nrp: '231621141', unit: 'Lantamal I Belawan',   matra: 'al', role: 'COMMANDER', clearance: 'SECRET',       online: true  },
    { id: 'U102', callSign: 'DELTA-02',   name: 'Letkol Laut Hendra Wardana', nrp: '217107638', unit: 'Lantamal II Padang',  matra: 'al', role: 'OFFICER',   clearance: 'CONFIDENTIAL', online: true  },
    { id: 'U103', callSign: 'ECHO-01',    name: 'Mayor Laut Zaki Situmorang', nrp: '280626929', unit: 'Denjaka',             matra: 'al', role: 'OFFICER',   clearance: 'SECRET',       online: true  },
    { id: 'U104', callSign: 'ECHO-02',    name: 'Kapten Laut Bayu Wijaya',   nrp: '289320987', unit: 'Koarmada II',          matra: 'al', role: 'OFFICER',   clearance: 'RESTRICTED',   online: false },

    // AU — Udara
    { id: 'U201', callSign: 'GOLF-01',    name: 'Kolonel Pnb. Iwan Sihombing', nrp: '377160493', unit: 'Skadron Udara 15', matra: 'au', role: 'COMMANDER', clearance: 'SECRET',       online: true  },
    { id: 'U202', callSign: 'GOLF-02',    name: 'Letkol Pnb. Fajar Wijaya',    nrp: '347359182', unit: 'Skadron Udara 11', matra: 'au', role: 'OFFICER',   clearance: 'CONFIDENTIAL', online: true  },
    { id: 'U203', callSign: 'HOTEL-01',   name: 'Mayor Pnb. Andi Kurniawan',   nrp: '323410108', unit: 'Lanud Hasanuddin', matra: 'au', role: 'OFFICER',   clearance: 'CONFIDENTIAL', online: true  },
    { id: 'U204', callSign: 'HOTEL-02',   name: 'Kapten Pnb. Wahyu Santoso',   nrp: '336458719', unit: 'Skadron Udara 31', matra: 'au', role: 'OFFICER',   clearance: 'RESTRICTED',   online: true  },

    // JOC — Command
    { id: 'U901', callSign: 'WHISKEY-01', name: 'Jendral TNI (Command)', nrp: 'CMD-001', unit: 'Mabes AD', matra: 'joc', role: 'COMMANDER', clearance: 'TOP_SECRET', online: true },
    { id: 'U902', callSign: 'XRAY-01',    name: 'Ops Officer JOC',       nrp: 'CMD-002', unit: 'Mabes AD', matra: 'joc', role: 'OPERATOR',  clearance: 'SECRET',     online: true }
  ];

  // ============================================
  // DEVICES (MAC Whitelist)
  // ============================================
  const DEVICES = [
    // Approved
    { id: 'D001', mac: 'AA:BB:CC:11:22:01', platform: 'Android', model: 'Samsung Galaxy S23',  user: 'U001', status: 'approved', cert: { serial: 'TNI-D001-A1', validTo: Date.now() + 300*24*3600*1000 }, lastSeen: Date.now() - 120000 },
    { id: 'D002', mac: 'AA:BB:CC:11:22:02', platform: 'iOS',     model: 'iPhone 15 Pro',      user: 'U101', status: 'approved', cert: { serial: 'TNI-D002-A1', validTo: Date.now() + 300*24*3600*1000 }, lastSeen: Date.now() - 30000  },
    { id: 'D003', mac: 'AA:BB:CC:11:22:03', platform: 'Desktop', model: 'Windows 11 Pro',     user: 'U901', status: 'approved', cert: { serial: 'TNI-D003-A1', validTo: Date.now() + 300*24*3600*1000 }, lastSeen: Date.now() - 10000  },
    { id: 'D004', mac: 'AA:BB:CC:11:22:04', platform: 'Android', model: 'Xiaomi 13 Pro',      user: 'U005', status: 'approved', cert: { serial: 'TNI-D004-A1', validTo: Date.now() + 300*24*3600*1000 }, lastSeen: Date.now() - 60000  },
    { id: 'D005', mac: 'AA:BB:CC:11:22:05', platform: 'iOS',     model: 'iPhone 14',          user: 'U201', status: 'approved', cert: { serial: 'TNI-D005-A1', validTo: Date.now() + 300*24*3600*1000 }, lastSeen: Date.now() - 45000  },
    { id: 'D006', mac: 'AA:BB:CC:11:22:06', platform: 'Desktop', model: 'Ubuntu Workstation', user: 'U902', status: 'approved', cert: { serial: 'TNI-D006-A1', validTo: Date.now() + 300*24*3600*1000 }, lastSeen: Date.now() - 5000   },

    // Pending (belum di-approve)
    { id: 'D101', mac: 'AA:BB:CC:11:33:01', platform: 'Android', model: 'Samsung Galaxy A54', user: 'U003', status: 'pending', cert: null, lastSeen: Date.now() - 180000 },
    { id: 'D102', mac: 'AA:BB:CC:11:33:02', platform: 'iOS',     model: 'iPhone 13',          user: 'U104', status: 'pending', cert: null, lastSeen: Date.now() - 300000 },
    { id: 'D103', mac: 'AA:BB:CC:11:33:03', platform: 'Android', model: 'Google Pixel 8',     user: 'U004', status: 'pending', cert: null, lastSeen: Date.now() - 120000 },

    // Revoked
    { id: 'D901', mac: 'AA:BB:CC:11:99:01', platform: 'Android', model: 'Samsung Galaxy S20', user: 'U005', status: 'revoked', cert: null, reason: 'LOST_DEVICE', lastSeen: Date.now() - 5*24*3600*1000 }
  ];

  // ============================================
  // CHANNELS (Radio / Comms)
  // ============================================
  const CHANNELS = [
    { id: 'CH-01', type: 'CHAT',    name: 'Net Komando',          members: 15, classification: 'SECRET',       status: 'active',   encrypted: true },
    { id: 'CH-02', type: 'CHAT',    name: 'Operasi Alpha',        members: 8,  classification: 'CONFIDENTIAL', status: 'active',   encrypted: true },
    { id: 'CH-03', type: 'CHAT',    name: 'Logistik Support',     members: 12, classification: 'RESTRICTED',   status: 'active',   encrypted: true },
    { id: 'CH-04', type: 'VOICE',   name: 'VHF-01 (155.500 MHz)', members: 22, classification: 'SECRET',       status: 'active',   encrypted: true },
    { id: 'CH-05', type: 'VOICE',   name: 'UHF-03 (432.100 MHz)', members: 18, classification: 'CONFIDENTIAL', status: 'active',   encrypted: true },
    { id: 'CH-06', type: 'VOICE',   name: 'HF-07 (14.250 MHz)',   members: 6,  classification: 'RESTRICTED',   status: 'standby',  encrypted: true },
    { id: 'CH-07', type: 'VIDEO',   name: 'VICON Command',        members: 6,  classification: 'SECRET',       status: 'active',   encrypted: true },
    { id: 'CH-08', type: 'VIDEO',   name: 'VICON Ops Brief',      members: 4,  classification: 'CONFIDENTIAL', status: 'active',   encrypted: true }
  ];

  // ============================================
  // MESSAGES (initial seed)
  // ============================================
  const MESSAGES = [
    { id: 'M001', from: 'U901', to: 'CH-01', text: 'Selamat pagi semua. Hari ini fokus pada monitoring Natuna.', classification: 'SECRET', timestamp: Date.now() - 3600000, ttl: 3600 },
    { id: 'M002', from: 'U001', to: 'CH-01', text: 'ROGER. Alpha-01 standby di Kodam Jaya.', classification: 'SECRET', timestamp: Date.now() - 3500000, ttl: 3600 },
    { id: 'M003', from: 'U101', to: 'CH-01', text: 'Delta-01 standby di Lantamal Belawan. KRI siap deploy.', classification: 'SECRET', timestamp: Date.now() - 3400000, ttl: 3600 },
    { id: 'M004', from: 'U201', to: 'CH-01', text: 'Golf-01 standby. 2x F-16 ready di Skadron 15.', classification: 'SECRET', timestamp: Date.now() - 3300000, ttl: 3600 }
  ];

  // ============================================
  // MANET NETWORK NODES (untuk graph animasi)
  // ============================================
  const MANET_NODES = [
    { id: 'N001', label: 'ALPHA-01', matra: 'ad', lat: -6.175, lon: 106.827, mode: 'COMMAND' },
    { id: 'N002', label: 'BRAVO-02', matra: 'ad', lat: -2.533, lon: 140.717, mode: 'MANET'   },
    { id: 'N003', label: 'DELTA-01', matra: 'al', lat: 3.783,  lon: 98.683,  mode: 'COMMAND' },
    { id: 'N004', label: 'ECHO-01',  matra: 'al', lat: -6.0,   lon: 112.0,   mode: 'MANET'   },
    { id: 'N005', label: 'GOLF-01',  matra: 'au', lat: -7.616, lon: 111.434, mode: 'COMMAND' },
    { id: 'N006', label: 'HOTEL-01', matra: 'au', lat: -5.061, lon: 119.554, mode: 'MANET'   },
    { id: 'N007', label: 'WHISKEY-01',matra:'joc',lat: -6.175, lon: 106.827, mode: 'COMMAND' },
    { id: 'N008', label: 'ALPHA-02', matra: 'ad', lat: -6.914, lon: 107.609, mode: 'COMMAND' }
  ];

  // ============================================
  // HELPERS
  // ============================================
  function getUser(id) { return USERS.find(u => u.id === id); }
  function getUserByCallSign(cs) { return USERS.find(u => u.callSign === cs); }
  function getDevice(id) { return DEVICES.find(d => d.id === id); }
  function getDevicesByStatus(status) { return DEVICES.filter(d => d.status === status); }
  function getDevicesByUser(userId) { return DEVICES.filter(d => d.user === userId); }
  function getChannel(id) { return CHANNELS.find(c => c.id === id); }
  function getMessages(channelId) {
    return MESSAGES.filter(m => m.to === channelId).sort((a, b) => a.timestamp - b.timestamp);
  }

  function getStats() {
    const online = USERS.filter(u => u.online).length;
    return {
      totalUsers: USERS.length,
      onlineUsers: online,
      totalDevices: DEVICES.length,
      approvedDevices: getDevicesByStatus('approved').length,
      pendingDevices: getDevicesByStatus('pending').length,
      revokedDevices: getDevicesByStatus('revoked').length,
      channels: CHANNELS.length,
      activeChannels: CHANNELS.filter(c => c.status === 'active').length
    };
  }

  function addMessage(msg) {
    const newMsg = {
      id: `M${Date.now()}`,
      timestamp: Date.now(),
      ttl: 3600,
      ...msg
    };
    MESSAGES.push(newMsg);
    return newMsg;
  }

  function approveDevice(deviceId) {
    const d = getDevice(deviceId);
    if (!d) return null;
    d.status = 'approved';
    d.cert = KomunikasiCore.generateDeviceCert(d);
    d.approvedAt = Date.now();
    return d;
  }

  function rejectDevice(deviceId, reason = 'REJECTED_BY_ADMIN') {
    const d = getDevice(deviceId);
    if (!d) return null;
    d.status = 'revoked';
    d.reason = reason;
    d.revokedAt = Date.now();
    return d;
  }

  return {
    USERS,
    DEVICES,
    CHANNELS,
    MESSAGES,
    MANET_NODES,
    getUser,
    getUserByCallSign,
    getDevice,
    getDevicesByStatus,
    getDevicesByUser,
    getChannel,
    getMessages,
    getStats,
    addMessage,
    approveDevice,
    rejectDevice
  };
})();

if (typeof window !== 'undefined') window.KomunikasiData = KomunikasiData;
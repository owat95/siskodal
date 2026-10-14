/* ============================================================
 * KOMUNIKASI-CORE.JS â€” Mode, MAC Auth, Encryption Engine
 * ============================================================ */

const KomunikasiCore = (() => {
  'use strict';

  // ============================================
  // MODE STATE MACHINE
  // ============================================
  const MODES = {
    COMMAND: {
      code: 'COMMAND',
      label: 'COMMAND CENTER',
      icon: 'ðŸ”’',
      color: '#22c55e',
      bg: 'rgba(34,197,94,0.15)',
      latency: [20, 80],
      bandwidth: 'FULL',
      description: 'Terhubung ke Mabes AD Chat Homeserver',
      channels: ['text', 'voice', 'video', 'file']
    },
    MANET: {
      code: 'MANET',
      label: 'MANET MODE',
      icon: 'ðŸ“¡',
      color: '#eab308',
      bg: 'rgba(234,179,8,0.15)',
      latency: [200, 2000],
      bandwidth: 'LIMITED',
      description: 'Mesh peer-to-peer (LoRa/WiFi Direct/BT)',
      channels: ['text', 'voice']
    },
    HF: {
      code: 'HF',
      label: 'HF FALLBACK',
      icon: 'ðŸ“»',
      color: '#ef4444',
      bg: 'rgba(239,68,68,0.15)',
      latency: [2000, 8000],
      bandwidth: 'MINIMAL',
      description: 'HF SSB 3-30 MHz via ROIP bridge',
      channels: ['text']
    }
  };

  let currentMode = 'COMMAND';
  let modeListeners = [];
  let modeHistory = [];

  // ============================================
  // ENCRYPTION
  // ============================================
  const ENCRYPTION = {
    ALGORITHM: 'AES-256-GCM',
    KEY_EXCHANGE: 'X25519-ECDH',
    HASH: 'SHA-256',
    SIGNATURE: 'Ed25519',
    SIGNAL_PROTOCOL: 'Olm/Megolm (Matrix)'
  };

  function generateFingerprint() {
    return Array.from({ length: 8 }, () =>
      Math.floor(Math.random() * 256).toString(16).padStart(2, '0').toUpperCase()
    ).join(':');
  }

  function simulateEncryption(text) {
    // Mock encryption â€” real implementation pakai libolm
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash) + text.charCodeAt(i);
      hash |= 0;
    }
    return {
      cipher: `enc:${Math.abs(hash).toString(16).padStart(16, '0')}`,
      algorithm: ENCRYPTION.ALGORITHM,
      fingerprint: generateFingerprint()
    };
  }

  // ============================================
  // MODE SWITCHING
  // ============================================
  function switchMode(newMode, reason = 'manual') {
    if (!MODES[newMode]) return currentMode;
    if (newMode === currentMode) return currentMode;

    const prev = currentMode;
    currentMode = newMode;

    modeHistory.push({
      from: prev,
      to: newMode,
      reason,
      timestamp: Date.now()
    });
    if (modeHistory.length > 20) modeHistory.shift();

    // Notify listeners
    modeListeners.forEach(cb => cb({
      from: prev,
      to: newMode,
      mode: MODES[newMode],
      reason,
      timestamp: Date.now()
    }));

    console.log(`[KOM] Mode: ${prev} â†’ ${newMode} (${reason})`);
    return currentMode;
  }

  function onModeChange(callback) {
    modeListeners.push(callback);
  }

  function getCurrentMode() {
    return { code: currentMode, ...MODES[currentMode] };
  }

  function getModeHistory() {
    return modeHistory.slice(-10);
  }

  // ============================================
  // AUTO MODE SWITCH (network aware)
  // ============================================
  function autoDetectMode(networkState) {
    // networkState: 'online' | 'partial' | 'offline'
    if (networkState === 'online') {
      if (currentMode !== 'COMMAND') switchMode('COMMAND', 'network-restored');
    } else if (networkState === 'partial') {
      if (currentMode !== 'MANET') switchMode('MANET', 'network-degraded');
    } else {
      if (currentMode !== 'HF') switchMode('HF', 'network-lost');
    }
  }

  // ============================================
  // MAC AUTH
  // ============================================
  function validateMAC(mac) {
    // Format: XX:XX:XX:XX:XX:XX
    const regex = /^([0-9A-F]{2}:){5}[0-9A-F]{2}$/i;
    return regex.test(mac);
  }

  function generateDeviceCert(device) {
    return {
      serial: `TNI-${device.id}-${Date.now().toString(36).toUpperCase()}`,
      issuer: 'TNI CA Root v1',
      subject: device.nrp,
      validFrom: Date.now(),
      validTo: Date.now() + (365 * 24 * 3600 * 1000), // 1 tahun
      algorithm: 'RSA-4096',
      fingerprint: generateFingerprint()
    };
  }

  function verifyDeviceSession(device) {
    if (!device) return { allowed: false, reason: 'DEVICE_NOT_FOUND' };
    if (device.status === 'revoked') return { allowed: false, reason: 'DEVICE_REVOKED' };
    if (device.status === 'pending') return { allowed: false, reason: 'PENDING_APPROVAL' };
    if (!validateMAC(device.mac)) return { allowed: false, reason: 'INVALID_MAC' };
    if (device.cert && device.cert.validTo < Date.now()) {
      return { allowed: false, reason: 'CERT_EXPIRED' };
    }
    return { allowed: true, reason: 'OK' };
  }

  // ============================================
  // HELPERS
  // ============================================
  function getLatency() {
    const m = MODES[currentMode];
    return Math.round(m.latency[0] + Math.random() * (m.latency[1] - m.latency[0]));
  }

  function canSend(mediaType) {
    const m = MODES[currentMode];
    return m.channels.includes(mediaType);
  }

  function getAllModes() {
    return Object.entries(MODES).map(([k, v]) => ({ code: k, ...v }));
  }

  return {
    MODES,
    ENCRYPTION,
    switchMode,
    onModeChange,
    getCurrentMode,
    getModeHistory,
    autoDetectMode,
    validateMAC,
    generateDeviceCert,
    verifyDeviceSession,
    simulateEncryption,
    generateFingerprint,
    getLatency,
    canSend,
    getAllModes
  };
})();

if (typeof window !== 'undefined') window.KomunikasiCore = KomunikasiCore;
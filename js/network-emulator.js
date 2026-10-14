/* ============================================================
 * NETWORK-EMULATOR.JS â€” v1.0
 * Failover logic, event system, PACE state machine
 * ============================================================ */

const NetworkEmulator = (() => {
  'use strict';

  // ============================================
  // STATE MACHINE
  // ============================================
  const STATES = {
    1: { name: 'NORMAL',   latency: 5,    loss: 0,  color: '#22c55e' },
    2: { name: 'ELEVATED', latency: 600,  loss: 2,  color: '#eab308' },
    3: { name: 'CRITICAL', latency: 2000, loss: 10, color: '#ef4444' }
  };

  let currentLevel = 1;
  let linkStates = new Map();  // linkId â†’ 'up' | 'degraded' | 'down'
  let onEventCallback = null;
  let stats = { up: 0, degraded: 0, down: 0 };

  // ============================================
  // INIT
  // ============================================
  function init() {
    // Reset link states dari topology
    NETWORK_TOPOLOGY.links.forEach(link => {
      linkStates.set(link.id, link.state || 'up');
    });
    recalcStats();
    console.log(`[NET-EMU] Initialized â€” ${NETWORK_TOPOLOGY.links.length} links`);
  }

  // ============================================
  // ESCALATION LEVEL CHANGE
  // ============================================
  function setLevel(level) {
    const oldLevel = currentLevel;
    currentLevel = level;

    if (level === 1) {
      // NORMAL â€” semua kembali up
      NETWORK_TOPOLOGY.links.forEach(link => {
        linkStates.set(link.id, 'up');
      });
      logEvent('NORMAL â€” Semua link aktif', 'info');
    }

    if (level === 2) {
      // ELEVATED â€” degradasi fiber
      NETWORK_TOPOLOGY.links.forEach(link => {
        if (link.type === 'fiber') {
          linkStates.set(link.id, 'degraded');
        }
      });
      logEvent('ELEVATED â€” Fiber degraded, VSAT standby', 'warning');
    }

    if (level === 3) {
      // CRITICAL â€” fiber cut, VSAT down, MANET aktif
      NETWORK_TOPOLOGY.links.forEach(link => {
        if (link.type === 'fiber') linkStates.set(link.id, 'down');
        if (link.type === 'vsat')  linkStates.set(link.id, 'down');
        if (link.type === 'ring')  linkStates.set(link.id, 'up'); // Ring tetap
      });
      activateMANET();
      logEvent('CRITICAL â€” Fiber CUT, VSAT DOWN, MANET AKTIF', 'critical');
      logEvent('AI Advisor: Alihkan UAV ke area gap', 'info');
    }

    recalcStats();

    // Emit
    if (onEventCallback) {
      onEventCallback({ type: 'level-change', from: oldLevel, to: level, stats });
    }

    // Trigger visual update
    if (window.NetworkViz) {
      window.NetworkViz.updateAll(linkStates, level);
    }

    return currentLevel;
  }

  // ============================================
  // MANET ACTIVATION (CRITICAL mode)
  // ============================================
  function activateMANET() {
    // Simulasi 3 link MANET baru antar node terdekat
    const manetLinks = [
      { id: 'l-manet-01', from: 'gw-ad-jayapura', to: 'ring-biak',    type: 'manet', state: 'up' },
      { id: 'l-manet-02', from: 'gw-ad-jayapura', to: 'ring-merauke', type: 'manet', state: 'up' },
      { id: 'l-manet-03', from: 'gw-ad-makassar', to: 'ring-tahuna',  type: 'manet', state: 'up' }
    ];

    manetLinks.forEach(link => {
      linkStates.set(link.id, 'up');
      // Register ke topology (jika belum ada)
      if (!NETWORK_TOPOLOGY.links.find(l => l.id === link.id)) {
        NETWORK_TOPOLOGY.links.push(link);
      }
    });

    logEvent(`MANET: ${manetLinks.length} link aktif (OLSR self-healing)`, 'info');
  }

  // ============================================
  // RECALC STATS
  // ============================================
  function recalcStats() {
    stats = { up: 0, degraded: 0, down: 0 };
    linkStates.forEach(state => {
      stats[state]++;
    });
  }

  // ============================================
  // GETTERS
  // ============================================
  function getStats()        { return { ...stats, level: currentLevel, state: STATES[currentLevel] }; }
  function getLinkStates()   { return linkStates; }
  function getCurrentLevel() { return currentLevel; }

  // ============================================
  // EVENT LOG
  // ============================================
  function logEvent(message, severity = 'info') {
    if (window.assetManager) {
      window.assetManager.logEvent(message, severity);
    } else {
      console.log(`[NET-EVENT:${severity}] ${message}`);
    }
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    init,
    setLevel,
    getStats,
    getLinkStates,
    getCurrentLevel,
    on: (cb) => { onEventCallback = cb; }
  };
})();

if (typeof window !== 'undefined') window.NetworkEmulator = NetworkEmulator;
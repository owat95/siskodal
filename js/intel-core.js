/* ============================================================
 * INTEL-CORE.JS — Source Credibility + Verification Workflow
 * ============================================================ */

const IntelCore = (() => {
  'use strict';

  let verificationLog = [];
  const listeners = [];

  // ============================================
  // SOURCE REGISTRY (with credibility tracking)
  // ============================================
  const SOURCES = {
    'NSA-TNI Station': {
      type: 'SIGINT',
      reliability: 'A',
      lastSubmission: Date.now(),
      totalSubmissions: 1247,
      verifiedCount: 1180,
      dismissedCount: 67,
      accuracy: 0.945
    },
    'BSSN Feed': {
      type: 'CYBERINT',
      reliability: 'A',
      lastSubmission: Date.now(),
      totalSubmissions: 3892,
      verifiedCount: 3654,
      dismissedCount: 238,
      accuracy: 0.939
    },
    'Global Maritime News': {
      type: 'OSINT',
      reliability: 'B',
      lastSubmission: Date.now(),
      totalSubmissions: 234,
      verifiedCount: 198,
      dismissedCount: 36,
      accuracy: 0.846
    },
    'Field Agent (Papua)': {
      type: 'HUMINT',
      reliability: 'C',
      lastSubmission: Date.now(),
      totalSubmissions: 67,
      verifiedCount: 48,
      dismissedCount: 19,
      accuracy: 0.716
    },
    'Twitter / X (open source)': {
      type: 'OSINT',
      reliability: 'D',
      lastSubmission: Date.now(),
      totalSubmissions: 892,
      verifiedCount: 412,
      dismissedCount: 480,
      accuracy: 0.462
    },
    'Satellite Imagery (Commercial)': {
      type: 'IMINT',
      reliability: 'B',
      lastSubmission: Date.now(),
      totalSubmissions: 156,
      verifiedCount: 142,
      dismissedCount: 14,
      accuracy: 0.910
    },
    'Diplomatic Source': {
      type: 'HUMINT',
      reliability: 'B',
      lastSubmission: Date.now(),
      totalSubmissions: 89,
      verifiedCount: 71,
      dismissedCount: 18,
      accuracy: 0.798
    }
  };

  // ============================================
  // SOURCE STATS
  // ============================================
  function getSource(name) {
    return SOURCES[name];
  }

  function getAllSources() {
    return Object.entries(SOURCES).map(([name, s]) => ({ name, ...s }));
  }

  function getSourceCredibility(name) {
    const s = SOURCES[name];
    if (!s) return null;

    const admiralty = {
      A: 5, B: 4, C: 3, D: 2, E: 1, F: 0
    }[s.reliability] || 0;

    return {
      ...s,
      reliabilityScore: admiralty,
      accuracyPct: Math.round(s.accuracy * 100),
      color: s.accuracy >= 0.9 ? '#22c55e'
           : s.accuracy >= 0.75 ? '#eab308'
           : s.accuracy >= 0.5 ? '#f97316'
           : '#ef4444'
    };
  }

  // ============================================
  // COMPUTE INTEL SCORE (weighted)
  // ============================================
  function computeIntelScore(intel) {
    const adm = IntelData.getAdmiralty(
      intel.admiralty[0],
      parseInt(intel.admiralty[1])
    );

    if (!adm.reliability || !adm.accuracy) return null;

    const reliabilityScore = adm.reliability.score;
    const accuracyScore = adm.accuracy.score;

    // Severity boost
    const severityBoost = {
      CRITICAL: 1.0,
      HIGH: 0.8,
      MEDIUM: 0.6,
      LOW: 0.4
    }[intel.severity] || 0.5;

    const combined = (reliabilityScore * 0.5 + accuracyScore * 0.5) * 20;
    const final = Math.round(combined * (0.7 + severityBoost * 0.3));

    return {
      reliability: adm.reliability,
      accuracy: adm.accuracy,
      combined,
      final: Math.min(100, final),
      color: final >= 80 ? '#22c55e'
           : final >= 60 ? '#eab308'
           : final >= 40 ? '#f97316'
           : '#ef4444',
      level: final >= 80 ? 'HIGH'
           : final >= 60 ? 'MEDIUM'
           : 'LOW'
    };
  }

  // ============================================
  // VERIFICATION WORKFLOW
  // ============================================
  function verify(intelId, analyst = 'Analis SOC', note = '') {
    const r = IntelData.verifyIntel(intelId, analyst);
    if (!r.ok) return r;

    verificationLog.push({
      intelId,
      action: 'VERIFY',
      analyst,
      note,
      timestamp: Date.now()
    });

    // Update source stats
    const intel = IntelData.getIntel(intelId);
    if (intel && SOURCES[intel.source]) {
      SOURCES[intel.source].verifiedCount++;
    }

    notifyListeners({ type: 'VERIFIED', intelId });
    return { ok: true };
  }

  function dismiss(intelId, reason = '', analyst = 'Analis SOC') {
    const r = IntelData.dismissIntel(intelId, reason, analyst);
    if (!r.ok) return r;

    verificationLog.push({
      intelId,
      action: 'DISMISS',
      analyst,
      reason,
      timestamp: Date.now()
    });

    const intel = IntelData.getIntel(intelId);
    if (intel && SOURCES[intel.source]) {
      SOURCES[intel.source].dismissedCount++;
    }

    notifyListeners({ type: 'DISMISSED', intelId, reason });
    return { ok: true };
  }

  function getVerificationLog() {
    return verificationLog.slice(-50).reverse();
  }

  function onEvent(callback) {
    listeners.push(callback);
  }

  function notifyListeners(evt) {
    listeners.forEach(cb => {
      try { cb(evt); } catch(e) {}
    });
  }

  // ============================================
  // AUTO-VERIFY (AI-assisted)
  // ============================================
  function autoVerifyByRules() {
    const pending = IntelData.getIntelByStatus('PENDING');
    let autoVerified = 0;
    let autoDismissed = 0;

    pending.forEach(intel => {
      // Rule 1: A1, A2, B1, B2 with CRITICAL/HIGH severity → auto verify
      const highCred = ['A1', 'A2', 'B1', 'B2'].includes(intel.admiralty);
      const highSev = ['CRITICAL', 'HIGH'].includes(intel.severity);
      if (highCred && highSev) {
        verify(intel.id, 'AI-Auto-Verifier', `${intel.admiralty} + ${intel.severity}`);
        autoVerified++;
        return;
      }

      // Rule 2: D, E, F reliability → auto dismiss
      if (['D', 'E', 'F'].includes(intel.admiralty[0])) {
        dismiss(intel.id, 'Source reliability too low', 'AI-Auto-Verifier');
        autoDismissed++;
        return;
      }
    });

    console.log(`[INTEL-CORE] Auto-verify: ${autoVerified} verified, ${autoDismissed} dismissed`);
    return { autoVerified, autoDismissed };
  }

  // ============================================
  // STATS
  // ============================================
  function getStats() {
    const sources = getAllSources();
    return {
      totalSources: sources.length,
      avgAccuracy: Math.round(
        sources.reduce((s, src) => s + src.accuracy, 0) / sources.length * 100
      ),
      reliabilityA: sources.filter(s => s.reliability === 'A').length,
      reliabilityB: sources.filter(s => s.reliability === 'B').length,
      reliabilityC: sources.filter(s => s.reliability === 'C').length,
      reliabilityD: sources.filter(s => s.reliability === 'D').length,
      verificationLogCount: verificationLog.length
    };
  }

  return {
    SOURCES,
    getSource,
    getAllSources,
    getSourceCredibility,
    computeIntelScore,
    verify,
    dismiss,
    getVerificationLog,
    onEvent,
    autoVerifyByRules,
    getStats
  };
})();

if (typeof window !== 'undefined') window.IntelCore = IntelCore;
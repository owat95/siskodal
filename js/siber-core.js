/* ============================================================
 * SIBER-CORE.JS — Cyber Threat Engine (MITRE ATT&CK aligned)
 * ============================================================ */

const SiberCore = (() => {
  'use strict';

  // ============================================
  // MITRE ATT&CK TACTICS
  // ============================================
  const MITRE_TACTICS = {
    TA0043: { code: 'TA0043', name: 'Reconnaissance',         color: '#94a3b8', icon: '🔍' },
    TA0042: { code: 'TA0042', name: 'Resource Development',   color: '#64748b', icon: '⚙️' },
    TA0001: { code: 'TA0001', name: 'Initial Access',         color: '#f97316', icon: '🚪' },
    TA0002: { code: 'TA0002', name: 'Execution',              color: '#ef4444', icon: '⚡' },
    TA0003: { code: 'TA0003', name: 'Persistence',            color: '#dc2626', icon: '📌' },
    TA0004: { code: 'TA0004', name: 'Privilege Escalation',   color: '#b91c1c', icon: '⬆️' },
    TA0005: { code: 'TA0005', name: 'Defense Evasion',        color: '#991b1b', icon: '🥷' },
    TA0006: { code: 'TA0006', name: 'Credential Access',      color: '#7c2d12', icon: '🔑' },
    TA0007: { code: 'TA0007', name: 'Discovery',              color: '#a855f7', icon: '👁️' },
    TA0008: { code: 'TA0008', name: 'Lateral Movement',       color: '#7e22ce', icon: '➡️' },
    TA0009: { code: 'TA0009', name: 'Collection',             color: '#6b21a8', icon: '📦' },
    TA0011: { code: 'TA0011', name: 'Command and Control',    color: '#eab308', icon: '📡' },
    TA0010: { code: 'TA0010', name: 'Exfiltration',           color: '#facc15', icon: '📤' },
    TA0040: { code: 'TA0040', name: 'Impact',                 color: '#ef4444', icon: '💥' }
  };

  // ============================================
  // SEVERITY LEVELS
  // ============================================
  const SEVERITY = {
    CRITICAL: { level: 4, label: 'CRITICAL', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
    HIGH:     { level: 3, label: 'HIGH',     color: '#f97316', bg: 'rgba(249,115,22,0.15)' },
    MEDIUM:   { level: 2, label: 'MEDIUM',   color: '#eab308', bg: 'rgba(234,179,8,0.15)' },
    LOW:      { level: 1, label: 'LOW',      color: '#22c55e', bg: 'rgba(34,197,94,0.15)' },
    INFO:     { level: 0, label: 'INFO',     color: '#64748b', bg: 'rgba(100,116,139,0.15)' }
  };

  // ============================================
  // DEFENSE STATE
  // ============================================
  let defenseState = {
    firewallEnabled: true,
    idsEnabled: true,
    ipsEnabled: true,
    autoBlockEnabled: true,
    blockedIPs: new Set(),
    rulesActive: 247,
    rulesTotal: 312
  };

  // ============================================
  // THREAT SCORING
  // ============================================
  function computeThreatScore(event) {
    let score = 50;

    // Severity weight
    if (event.severity === 'CRITICAL') score += 40;
    else if (event.severity === 'HIGH') score += 25;
    else if (event.severity === 'MEDIUM') score += 10;
    else if (event.severity === 'LOW') score -= 10;

    // Target weight
    if (event.targetCritical) score += 15;

    // Confidence
    if (event.confidence) score += Math.round(event.confidence * 10 - 5);

    // Repeat offender
    if (event.attackerReputation && event.attackerReputation < 30) score += 20;

    return Math.max(0, Math.min(100, score));
  }

  // ============================================
  // AUTO BLOCK (IPS response)
  // ============================================
  function shouldAutoBlock(event) {
    if (!defenseState.autoBlockEnabled) return false;
    if (defenseState.blockedIPs.has(event.attackerIP)) return false;

    const score = computeThreatScore(event);
    return score >= 85 || event.severity === 'CRITICAL';
  }

  function blockIP(ip, reason = 'AUTO_BLOCK') {
    defenseState.blockedIPs.add(ip);
    console.log(`[SIBER] Blocked: ${ip} (${reason})`);
    return true;
  }

  function unblockIP(ip) {
    defenseState.blockedIPs.delete(ip);
  }

  // ============================================
  // HELPERS
  // ============================================
  function getTactic(code) {
    return MITRE_TACTICS[code] || null;
  }

  function getSeverity(level) {
    return SEVERITY[level] || SEVERITY.INFO;
  }

  function getAllTactics() {
    return Object.values(MITRE_TACTICS);
  }

  function getDefenseState() {
    return { ...defenseState, blockedIPs: Array.from(defenseState.blockedIPs) };
  }

  function toggleDefense(key) {
    if (key in defenseState) {
      defenseState[key] = !defenseState[key];
      console.log(`[SIBER] ${key}: ${defenseState[key] ? 'ON' : 'OFF'}`);
    }
  }
  // ============================================
  // AI ASSESSMENT
  // ============================================
  function assessAI(event) {
    let score = 0;
    const reasons = [];

    // Severity base
    const sevScore = { CRITICAL: 40, HIGH: 30, MEDIUM: 20, LOW: 10 }[event.severity] || 0;
    score += sevScore;

    // Confidence
    const conf = event.confidence || 0.5;
    score += conf * 20;

    // Target criticality
    if (event.targetCritical) {
      score += 15;
      reasons.push('critical target');
    }

    // Attacker reputation (lower = higher risk)
    if (event.attackerReputation !== undefined) {
      score += (100 - event.attackerReputation) / 6;
    }

    // Protocol risk
    const highRiskPorts = [22, 23, 3389, 445, 1433, 3306, 554];
    if (highRiskPorts.includes(event.port)) {
      score += 10;
      reasons.push('high-risk port');
    }

    // Tactic risk
    const criticalTactics = ['TA0011', 'TA0010', 'TA0040', 'TA0006'];
    if (criticalTactics.includes(event.tactic)) {
      score += 5;
      reasons.push('critical tactic');
    }

    // Determine level
    let level = 'LOW';
    if (score >= 70) level = 'HIGH';
    else if (score >= 45) level = 'MEDIUM';

    score = Math.round(score);

    const reason = reasons.length > 0 ? reasons.join(', ') : 'baseline threat';

    return { level, score, reason };
  }
  return {
    MITRE_TACTICS,
    SEVERITY,
    computeThreatScore,
    shouldAutoBlock,
    blockIP,
    unblockIP,
    getTactic,
    getSeverity,
    getAllTactics,
    getDefenseState,
    toggleDefense,
    assessAI                     
  };
})();

if (typeof window !== 'undefined') window.SiberCore = SiberCore;
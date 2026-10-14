/* ============================================================
 * STRATEGIC-ADVISOR.JS — v1.0
 * Rule-Based Tactical Advisor (Mock AI)
 * OODA Loop recommendation engine
 * ============================================================ */

const StrategicAdvisor = (() => {
  'use strict';

  let running = false;
  let analyzeInterval = null;
  let lastAssessment = null;
  let assessmentHistory = [];

  // ============================================
  // ANALYZE — Main entry
  // ============================================
  function analyze() {
    if (!window.FusionEngine) return null;

    const stats = FusionEngine.getStats();
    const alerts = FusionEngine.getAlerts();
    const netStats = window.NetworkEmulator ? NetworkEmulator.getStats() : null;
    const ships = window.AISSimulator ? AISSimulator.getShips() : [];
    const tracks = window.ASTERIXSimulator ? ASTERIXSimulator.getTracks() : [];

    // Klasifikasi ancaman
    const threats = classifyThreats(alerts);
    const posture = assessPosture(threats, netStats);
    const recommendation = buildRecommendation(threats, posture, netStats);

    const assessment = {
      timestamp: Date.now(),
      stats: {
        observations: stats.observations,
        fused: stats.fusedTracks,
        ships: ships.length,
        aircraft: tracks.length,
        links: netStats ? `UP:${netStats.up} DEG:${netStats.degraded} DOWN:${netStats.down}` : 'N/A',
        escalation: netStats ? netStats.level : 1
      },
      threats,
      posture,
      recommendation
    };

    lastAssessment = assessment;
    assessmentHistory.push(assessment);
    if (assessmentHistory.length > 20) assessmentHistory.shift();

    return assessment;
  }

  // ============================================
  // CLASSIFY THREATS
  // ============================================
  function classifyThreats(alerts) {
    const counts = {
      FOREIGN_VESSEL: 0,
      IDENTITY_MISMATCH: 0,
      POSITION_MISMATCH: 0,
      OTHER: 0
    };

    alerts.forEach(a => {
      if (counts[a.type] !== undefined) counts[a.type]++;
      else counts.OTHER++;
    });

    // Severity score
    let severity = 'LOW';
    const criticalCount = counts.POSITION_MISMATCH;
    const warningCount = counts.IDENTITY_MISMATCH;
    const infoCount = counts.FOREIGN_VESSEL;

    if (criticalCount > 0) severity = 'CRITICAL';
    else if (warningCount > 1) severity = 'HIGH';
    else if (warningCount > 0 || infoCount > 2) severity = 'MEDIUM';

    return {
      counts,
      severity,
      total: alerts.length,
      recent: alerts.slice(-5)
    };
  }

  // ============================================
  // ASSESS POSTURE
  // ============================================
  function assessPosture(threats, netStats) {
    let status = 'GREEN'; // Normal
    let reason = 'Semua sistem operasional';

    if (!netStats) return { status, reason };

    // Network degraded
    if (netStats.degraded > 0) {
      status = 'YELLOW';
      reason = `${netStats.degraded} link degraded`;
    }

    // Network down atau threat severity tinggi
    if (netStats.down > 0) {
      status = 'ORANGE';
      reason = `${netStats.down} link down, failover aktif`;
    }

    if (threats.severity === 'CRITICAL') {
      status = 'RED';
      reason = 'Ancaman kritis terdeteksi — butuh respons taktis';
    } else if (threats.severity === 'HIGH') {
      status = 'ORANGE';
      reason = 'Ancaman tinggi terdeteksi';
    }

    return { status, reason };
  }

  // ============================================
  // BUILD RECOMMENDATION (OODA)
  // ============================================
  function buildRecommendation(threats, posture, netStats) {
    const ooda = {
      observe: [],
      orient: [],
      decide: [],
      act: []
    };

    // OBSERVE
    ooda.observe.push(`Sensor observations: ${lastAssessment?.stats.observations || 'N/A'}`);
    ooda.observe.push(`Fused tracks: ${lastAssessment?.stats.fused || 'N/A'}`);
    if (threats.counts.FOREIGN_VESSEL > 0) {
      ooda.observe.push(`${threats.counts.FOREIGN_VESSEL} kapal asing terdeteksi`);
    }
    if (threats.counts.POSITION_MISMATCH > 0) {
      ooda.observe.push(`${threats.counts.POSITION_MISMATCH} position mismatch — indikasi spoofing`);
    }

    // ORIENT
    if (threats.severity === 'CRITICAL') {
      ooda.orient.push('Situasi berpotensi ancaman keamanan siber maritim');
      ooda.orient.push('Butuh verifikasi multi-sensor (radar + visual)');
    } else if (threats.severity === 'HIGH') {
      ooda.orient.push('Peningkatan aktivitas asing di perairan NKRI');
    } else if (threats.severity === 'MEDIUM') {
      ooda.orient.push('Situasi terkontrol, monitoring diperketat');
    } else {
      ooda.orient.push('Situasi normal, tidak ada indikasi ancaman');
    }

    if (netStats && netStats.level >= 2) {
      ooda.orient.push(`Network ${netStats.state.name} — PACE failover aktif`);
    }

    // DECIDE
    if (threats.severity === 'CRITICAL') {
      ooda.decide.push('Escalate ke status CRITICAL');
      ooda.decide.push('Aktifkan MANET sebagai backup komunikasi');
      ooda.decide.push('Notify Mabes AD & AL untuk joint response');
    } else if (threats.severity === 'HIGH') {
      ooda.decide.push('Naikkan status ke ELEVATED');
      ooda.decide.push('Perkuat patroli di area terdeteksi');
    } else if (threats.severity === 'MEDIUM') {
      ooda.decide.push('Monitor kontinu, siap eskalasi');
    } else {
      ooda.decide.push('Pertahankan status NORMAL');
    }

    // ACT
    if (threats.counts.FOREIGN_VESSEL > 0) {
      ooda.act.push('Kirim KRI terdekat untuk verifikasi visual');
    }
    if (threats.counts.POSITION_MISMATCH > 0) {
      ooda.act.push('Cross-check dengan AIS regional (VTIS Singapore)');
    }
    if (threats.counts.IDENTITY_MISMATCH > 0) {
      ooda.act.push('Scramble FALCON untuk intercept dan ID');
    }
    if (netStats && netStats.down > 0) {
      ooda.act.push('Aktifkan backup HF radio');
      ooda.act.push('Kirim teknisi ke site yang down');
    }
    if (ooda.act.length === 0) {
      ooda.act.push('Tidak ada aksi diperlukan saat ini');
    }

    // Priority
    let priority = 'LOW';
    if (threats.severity === 'CRITICAL') priority = 'P1 - IMMEDIATE';
    else if (threats.severity === 'HIGH') priority = 'P2 - URGENT';
    else if (threats.severity === 'MEDIUM') priority = 'P3 - ROUTINE';

    return { ooda, priority };
  }

  // ============================================
  // FORMAT FOR DISPLAY
  // ============================================
  function formatAssessment(a) {
    if (!a) return 'No assessment yet.';
    const lines = [];
    lines.push(`═══ SITUATION ASSESSMENT ═══`);
    lines.push(`Time: ${new Date(a.timestamp).toLocaleTimeString('id-ID')}`);
    lines.push(`Posture: ${a.posture.status} — ${a.posture.reason}`);
    lines.push(`Threat Level: ${a.threats.severity}`);
    lines.push('');
    lines.push(`Sensor Overview:`);
    lines.push(`  Ships: ${a.stats.ships}  Aircraft: ${a.stats.aircraft}`);
    lines.push(`  Fused Tracks: ${a.stats.fused}  Observations: ${a.stats.observations}`);
    lines.push(`  Network: ${a.stats.links}`);
    lines.push('');
    lines.push(`OODA Loop — Priority: ${a.recommendation.priority}`);
    lines.push(`  [OBSERVE]`);
    a.recommendation.ooda.observe.forEach(x => lines.push(`    • ${x}`));
    lines.push(`  [ORIENT]`);
    a.recommendation.ooda.orient.forEach(x => lines.push(`    • ${x}`));
    lines.push(`  [DECIDE]`);
    a.recommendation.ooda.decide.forEach(x => lines.push(`    • ${x}`));
    lines.push(`  [ACT]`);
    a.recommendation.ooda.act.forEach(x => lines.push(`    • ${x}`));
    return lines.join('\n');
  }

  // ============================================
  // START / STOP
  // ============================================
  function start(intervalMs = 10000) {
    if (running) return;
    running = true;
    analyze(); // initial
    analyzeInterval = setInterval(() => {
      const a = analyze();
      if (window.assetManager && a.threats.severity !== 'LOW') {
        window.assetManager.logEvent(
          `AI Advisor: Posture ${a.posture.status} — ${a.posture.reason}`,
          a.threats.severity === 'CRITICAL' ? 'critical' : 'warning'
        );
      }
    }, intervalMs);
    console.log(`[ADVISOR] Started (interval ${intervalMs}ms)`);
  }

  function stop() {
    if (analyzeInterval) clearInterval(analyzeInterval);
    running = false;
    console.log('[ADVISOR] Stopped');
  }

  function getLastAssessment() { return lastAssessment; }
  function getHistory() { return assessmentHistory; }

  return {
    start, stop, analyze,
    getLastAssessment, getHistory,
    formatAssessment
  };
})();

if (typeof window !== 'undefined') window.StrategicAdvisor = StrategicAdvisor;
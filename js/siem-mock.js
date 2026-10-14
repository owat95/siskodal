/* ============================================================
 * SIEM-MOCK.JS â€” v1.0
 * Simulasi Zero Trust + SIEM untuk dashboard
 * ============================================================ */

const SIEMMock = (() => {
  'use strict';

  // ============================================
  // CONFIG
  // ============================================
  const CONFIG = {
    maxEvents: 200,
    correlationWindowSec: 60,
    autoBlockThreshold: 5   // 5 failed logins â†’ auto-block
  };

  // ============================================
  // STATE
  // ============================================
  let events = [];
  let blockedIPs = new Map();  // ip â†’ { reason, timestamp }
  let activeSessions = new Map(); // user â†’ { ip, tier, loginTime, lastActivity }
  let rules = [];
  let running = false;
  let eventGenInterval = null;

  // ============================================
  // RBAC TIERS (dari master config)
  // ============================================
  const TIERS = {
    TIER_1_WATCHER: { level: 1, label: 'Watcher',   color: '#22c55e', canWrite: false },
    TIER_2_OPERATOR:{ level: 2, label: 'Operator',  color: '#eab308', canWrite: true  },
    TIER_3_ENGINEER:{ level: 3, label: 'Engineer',  color: '#ef4444', canWrite: true, canRoot: true }
  };

  // ============================================
  // USER DATABASE (mock)
  // ============================================
  const USERS = [
    { username: 'watch.jakarta',  tier: 'TIER_1_WATCHER' },
    { username: 'watch.surabaya', tier: 'TIER_1_WATCHER' },
    { username: 'opr.budi',       tier: 'TIER_2_OPERATOR' },
    { username: 'opr.siti',       tier: 'TIER_2_OPERATOR' },
    { username: 'eng.hendra',     tier: 'TIER_3_ENGINEER' },
    { username: 'eng.wawan',      tier: 'TIER_3_ENGINEER' }
  ];

  // ============================================
  // INIT
  // ============================================
  function init() {
    running = true;
    events = [];
    blockedIPs.clear();
    activeSessions.clear();
    loadRules();

    // Generate events setiap 3 detik (simulasi log)
    eventGenInterval = setInterval(generateRandomEvent, 3000);

    logEvent('SIEM', 'System initialized â€” Wazuh mock active', 'info');
    console.log('[SIEM] Mock initialized');
  }

  // ============================================
  // RULES (correlation logic)
  // ============================================
  function loadRules() {
    rules = [
      {
        id: 'RULE-001',
        name: 'Brute Force Login',
        severity: 'HIGH',
        condition: (events) => {
          const recent = events.filter(e => 
            e.type === 'AUTH_FAIL' && 
            (Date.now() - e.timestamp) < CONFIG.correlationWindowSec * 1000
          );
          const byIP = {};
          recent.forEach(e => byIP[e.ip] = (byIP[e.ip] || 0) + 1);
          return Object.entries(byIP).filter(([ip, count]) => count >= CONFIG.autoBlockThreshold)
            .map(([ip, count]) => ({ ip, count }));
        }
      },
      {
        id: 'RULE-002',
        name: 'Port Scan Detected',
        severity: 'MEDIUM',
        condition: (events) => {
          const recent = events.filter(e => 
            e.type === 'PORT_SCAN' && 
            (Date.now() - e.timestamp) < CONFIG.correlationWindowSec * 1000
          );
          return recent.length > 3 ? [{ count: recent.length }] : [];
        }
      },
      {
        id: 'RULE-003',
        name: 'After-Hours Access',
        severity: 'LOW',
        condition: (events) => {
          const hour = new Date().getHours();
          if (hour >= 22 || hour <= 5) {
            return events.filter(e => 
              e.type === 'AUTH_SUCCESS' && 
              (Date.now() - e.timestamp) < 60000
            );
          }
          return [];
        }
      }
    ];
  }

  // ============================================
  // EVENT LOGGER
  // ============================================
  function logEvent(source, message, severity = 'info', metadata = {}) {
    const event = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      timestamp: Date.now(),
      source, message, severity,
      ...metadata
    };
    events.push(event);
    if (events.length > CONFIG.maxEvents) events.shift();

    // Run correlation rules
    runCorrelation();

    return event;
  }

  // ============================================
  // CORRELATION ENGINE
  // ============================================
  function runCorrelation() {
    rules.forEach(rule => {
      const matches = rule.condition(events);
      if (matches.length > 0) {
        // Dedup: jangan spam alert yang sama
        const alertKey = `alert-${rule.id}`;
        if (alerts_emitted.has(alertKey) && 
            (Date.now() - alerts_emitted.get(alertKey)) < 30000) return;
        alerts_emitted.set(alertKey, Date.now());

        // Emit SIEM alert
        emitAlert({
          ruleId: rule.id,
          ruleName: rule.name,
          severity: rule.severity,
          matches: matches,
          timestamp: Date.now()
        });

        // Auto-response untuk HIGH
        if (rule.severity === 'HIGH' && rule.id === 'RULE-001') {
          matches.forEach(m => {
            if (m.ip && !blockedIPs.has(m.ip)) {
              blockIP(m.ip, `Auto-block: ${rule.name} (${m.count} attempts)`);
            }
          });
        }
      }
    });
  }

  const alerts_emitted = new Map();

  function emitAlert(alert) {
    const msg = `[SIEM:${alert.severity}] ${alert.ruleName} â€” ${JSON.stringify(alert.matches)}`;
    console.log(msg);
    if (window.assetManager) {
      window.assetManager.logEvent(
        `SIEM: ${alert.ruleName}`,
        alert.severity === 'HIGH' ? 'critical' : 'warning'
      );
    }
  }

  // ============================================
  // BLOCK IP (auto-response)
  // ============================================
  function blockIP(ip, reason) {
    blockedIPs.set(ip, { reason, timestamp: Date.now() });
    logEvent('FIREWALL', `Blocked IP ${ip}: ${reason}`, 'warning', { ip });
  }

  // ============================================
  // RANDOM EVENT GENERATOR (untuk visualisasi)
  // ============================================
  function generateRandomEvent() {
    if (!running) return;
    const roll = Math.random();

    // 70% normal traffic
    if (roll < 0.7) {
      const user = USERS[Math.floor(Math.random() * USERS.length)];
      logEvent('AUTH', `${user.username} login`, 'info', {
        type: 'AUTH_SUCCESS',
        username: user.username,
        ip: generateInternalIP(),
        tier: user.tier
      });
      return;
    }

    // 15% failed login
    if (roll < 0.85) {
      const attackerIP = generateExternalIP();
      logEvent('AUTH', `Failed login from ${attackerIP}`, 'warning', {
        type: 'AUTH_FAIL',
        ip: attackerIP,
        username: 'admin'
      });
      return;
    }

    // 10% port scan
    if (roll < 0.95) {
      logEvent('NETWORK', 'Port scan detected', 'warning', {
        type: 'PORT_SCAN',
        ip: generateExternalIP()
      });
      return;
    }

    // 5% suspicious activity
    const suspicious = ['Data exfiltration attempt', 'Unusual outbound traffic', 
                        'Malware signature detected', 'C2 callback blocked'];
    const msg = suspicious[Math.floor(Math.random() * suspicious.length)];
    logEvent('EDR', msg, 'critical', {
      type: 'SUSPICIOUS',
      ip: generateExternalIP()
    });
  }

  function generateInternalIP() {
    return `192.168.77.${Math.floor(Math.random() * 200) + 10}`;
  }

  function generateExternalIP() {
    return `${Math.floor(Math.random() * 200) + 20}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  // ============================================
  // SCENARIO: BRUTE FORCE ATTACK
  // ============================================
  function triggerBruteForce() {
    const attackerIP = '203.0.113.42';
    console.log(`[SIEM] Brute force scenario triggered from ${attackerIP}`);
    
    for (let i = 0; i < 6; i++) {
      setTimeout(() => {
        logEvent('AUTH', `Failed login attempt ${i+1}/6`, 'warning', {
          type: 'AUTH_FAIL',
          ip: attackerIP,
          username: 'admin'
        });
      }, i * 200);
    }

    if (window.assetManager) {
      window.assetManager.logEvent('âš  SCENARIO: Brute force attack simulated', 'warning');
    }
  }

  // ============================================
  // SCENARIO: EXFILTRATION
  // ============================================
  function triggerExfiltration() {
    logEvent('EDR', 'Large file transfer to unknown destination', 'critical', {
      type: 'SUSPICIOUS',
      ip: '198.51.100.99',
      size: '2.3 GB'
    });
    if (window.assetManager) {
      window.assetManager.logEvent('âš  SCENARIO: Data exfiltration detected', 'critical');
    }
  }

  // ============================================
  // STATS
  // ============================================
  function getStats() {
    const byType = {};
    events.forEach(e => {
      const key = e.type || 'UNKNOWN';
      byType[key] = (byType[key] || 0) + 1;
    });
    return {
      total: events.length,
      blocked: blockedIPs.size,
      activeSessions: activeSessions.size,
      byType,
      recentAlerts: events.filter(e => e.severity === 'critical' || e.severity === 'warning').slice(-5)
    };
  }

  function getEvents(limit = 20) {
    return events.slice(-limit);
  }

  function getBlockedIPs() {
    return Array.from(blockedIPs.entries()).map(([ip, info]) => ({ ip, ...info }));
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    init,
    logEvent,
    getStats,
    getEvents,
    getBlockedIPs,
    triggerBruteForce,
    triggerExfiltration,
    TIERS,
    USERS
  };
})();

if (typeof window !== 'undefined') window.SIEMMock = SIEMMock;
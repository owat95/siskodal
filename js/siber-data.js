/* ============================================================
 * SIBER-DATA.JS â€” Mock data: attacker IPs, threat events, incidents
 * ============================================================ */

const SiberData = (() => {
  'use strict';

  // ============================================
  // ATTACKER GEOGRAPHY (top threat origins)
  // ============================================
  const ATTACKER_SOURCES = [
    { country: 'CN', name: 'China',        lat: 39.9,   lon: 116.4,  reputation: 25 },
    { country: 'RU', name: 'Russia',       lat: 55.75,  lon: 37.62,  reputation: 28 },
    { country: 'KP', name: 'North Korea',  lat: 39.03,  lon: 125.75, reputation: 15 },
    { country: 'IR', name: 'Iran',         lat: 35.69,  lon: 51.39,  reputation: 30 },
    { country: 'US', name: 'United States',lat: 38.9,   lon: -77.04, reputation: 65 },
    { country: 'NL', name: 'Netherlands',  lat: 52.37,  lon: 4.9,    reputation: 70 },
    { country: 'DE', name: 'Germany',      lat: 52.52,  lon: 13.4,   reputation: 72 },
    { country: 'SG', name: 'Singapore',    lat: 1.35,   lon: 103.82, reputation: 68 },
    { country: 'MY', name: 'Malaysia',     lat: 3.14,   lon: 101.69, reputation: 60 },
    { country: 'VN', name: 'Vietnam',     lat: 21.03,  lon: 105.85, reputation: 55 },
    { country: 'PH', name: 'Philippines', lat: 14.60,  lon: 120.98, reputation: 60 },
    { country: 'IN', name: 'India',        lat: 28.61,  lon: 77.21,  reputation: 62 },
    { country: 'BR', name: 'Brazil',       lat: -15.79, lon: -47.88, reputation: 60 }
  ];

  // ============================================
  // TARGET ASSETS (from ICR edge + Mabes + IKN)
  // ============================================
  const TARGET_ASSETS = [
    { id: 'tgt-jakarta',   name: 'Mabes AD Jakarta',      lat: -6.175,  lon: 106.827, critical: true,  type: 'COMMAND' },
    { id: 'tgt-ikn',       name: 'IKN Central AI',        lat: -0.500,  lon: 117.000, critical: true,  type: 'AI_SERVER' },
    { id: 'tgt-dr-mks',    name: 'DR Site Makassar',      lat: -5.147,  lon: 119.432, critical: true,  type: 'DR_SITE' },
    { id: 'tgt-edge-mly',  name: 'Edge AI Malaysia',      lat: 4.136,   lon: 117.483, critical: false, type: 'EDGE_AI' },
    { id: 'tgt-edge-png',  name: 'Edge AI PNG',           lat: -2.533,  lon: 140.717, critical: false, type: 'EDGE_AI' },
    { id: 'tgt-edge-nat',  name: 'Edge AI Natuna',        lat: 3.950,   lon: 108.383, critical: true,  type: 'EDGE_AI' },
    { id: 'tgt-lanud-hlm', name: 'Lanud Halim PK',        lat: -6.266,  lon: 106.891, critical: true,  type: 'AU_BASE' },
    { id: 'tgt-lantamal',  name: 'Lantamal V Surabaya',   lat: -7.206,  lon: 112.735, critical: true,  type: 'AL_BASE' }
  ];

  // ============================================
  // THREAT EVENT TEMPLATES
  // ============================================
  const THREAT_TEMPLATES = [
    // Reconnaissance
    { tactic: 'TA0043', technique: 'T1595', name: 'Port Scan',              severity: 'MEDIUM',   description: 'Scanning target ports untuk reconnaissance',      protocol: 'TCP',  port: 0 },
    { tactic: 'TA0043', technique: 'T1592', name: 'Host Discovery',         severity: 'LOW',      description: 'Ping sweep untuk identifikasi host aktif',        protocol: 'ICMP', port: 0 },
    { tactic: 'TA0043', technique: 'T1590', name: 'Network Scan',           severity: 'MEDIUM',   description: 'Memetakan topologi jaringan target',              protocol: 'TCP',  port: 0 },

    // Initial Access
    { tactic: 'TA0001', technique: 'T1190', name: 'Exploit Public-Facing App', severity: 'HIGH',  description: 'Eksploitasi web app / service terbuka',          protocol: 'HTTPS',port: 443 },
    { tactic: 'TA0001', technique: 'T1078', name: 'Valid Accounts',         severity: 'HIGH',     description: 'Login menggunakan kredensial valid curian',       protocol: 'SSH',  port: 22 },
    { tactic: 'TA0001', technique: 'T1566', name: 'Phishing',               severity: 'HIGH',     description: 'Spear phishing ke operator SOC',                  protocol: 'SMTP', port: 587 },

    // Execution
    { tactic: 'TA0002', technique: 'T1059', name: 'Command Injection',      severity: 'CRITICAL', description: 'Injeksi perintah OS via aplikasi rentan',         protocol: 'HTTP', port: 80 },
    { tactic: 'TA0002', technique: 'T1203', name: 'Exploit Client Exec',    severity: 'HIGH',     description: 'Eksekusi via client-side exploit',                protocol: 'TCP',  port: 445 },

    // Persistence
    { tactic: 'TA0003', technique: 'T1136', name: 'Create Account',         severity: 'HIGH',     description: 'Membuat backdoor account untuk persistensi',      protocol: 'RDP',  port: 3389 },
    { tactic: 'TA0003', technique: 'T1053', name: 'Scheduled Task',         severity: 'MEDIUM',   description: 'Scheduled task untuk persistensi',                protocol: 'SMB',  port: 445 },

    // Privilege Escalation
    { tactic: 'TA0004', technique: 'T1548', name: 'Abuse Elevation',        severity: 'HIGH',     description: 'Eksploitasi misconfig untuk elevasi',             protocol: 'SSH',  port: 22 },

    // Defense Evasion
    { tactic: 'TA0005', technique: 'T1070', name: 'Indicator Removal',      severity: 'HIGH',     description: 'Menghapus log untuk menghilangkan jejak',         protocol: 'SSH',  port: 22 },
    { tactic: 'TA0005', technique: 'T1027', name: 'Obfuscation',            severity: 'MEDIUM',   description: 'Obfuscate payload untuk hindari AV',              protocol: 'HTTP', port: 8080 },

    // Credential Access
    { tactic: 'TA0006', technique: 'T1110', name: 'Brute Force',            severity: 'HIGH',     description: 'Brute force SSH/RDP/Web login',                   protocol: 'SSH',  port: 22 },
    { tactic: 'TA0006', technique: 'T1557', name: 'MITM Attack',            severity: 'CRITICAL', description: 'Man-in-the-middle untuk intercept credential',   protocol: 'TLS',  port: 443 },

    // Discovery
    { tactic: 'TA0007', technique: 'T1083', name: 'File Discovery',         severity: 'MEDIUM',   description: 'Enumerasi file system target',                    protocol: 'SMB',  port: 445 },
    { tactic: 'TA0007', technique: 'T1018', name: 'Remote System Disc',     severity: 'MEDIUM',   description: 'Discovery sistem remote dalam network',           protocol: 'WMI',  port: 135 },

    // Lateral Movement
    { tactic: 'TA0008', technique: 'T1021', name: 'Remote Services',        severity: 'HIGH',     description: 'RDP/SMB lateral movement',                        protocol: 'RDP',  port: 3389 },
    { tactic: 'TA0008', technique: 'T1080', name: 'Taint Shared Content',   severity: 'HIGH',     description: 'Injeksi malware ke shared folder',                protocol: 'SMB',  port: 445 },

    // C2
    { tactic: 'TA0011', technique: 'T1071', name: 'App Layer Protocol',     severity: 'CRITICAL', description: 'C2 via HTTPS/DNS tunnelling',                    protocol: 'HTTPS',port: 443 },
    { tactic: 'TA0011', technique: 'T1573', name: 'Encrypted Channel',      severity: 'HIGH',     description: 'C2 channel terenkripsi',                          protocol: 'TLS',  port: 8443 },

    // Exfiltration
    { tactic: 'TA0010', technique: 'T1041', name: 'C2 Exfiltration',        severity: 'CRITICAL', description: 'Exfiltrate data via C2 channel',                 protocol: 'HTTPS',port: 443 },
    { tactic: 'TA0010', technique: 'T1567', name: 'Web Service Exfil',      severity: 'CRITICAL', description: 'Exfiltrate via web service pihak ketiga',         protocol: 'HTTP', port: 80 },
    { tactic: 'TA0010', technique: 'T1048', name: 'Streaming Service Exfil',severity: 'CRITICAL', description: 'Exfiltrate via media streaming (RTSP/RTMP)',      protocol: 'RTSP', port: 554 },

    // Impact
    { tactic: 'TA0040', technique: 'T1486', name: 'Data Encrypted',         severity: 'CRITICAL', description: 'Ransomware encryption',                           protocol: 'SMB',  port: 445 },
    { tactic: 'TA0040', technique: 'T1489', name: 'Service Stop',           severity: 'HIGH',     description: 'Stop service untuk disrupt operasi',              protocol: 'TCP',  port: 0 }
  ];

  // ============================================
  // SEED EVENTS
  // ============================================
  const SEED_EVENTS = [
    {
      id: 'evt-seed-01',
      attackerIP: '203.0.113.42',
      attackerCountry: 'CN',
      attackerCountryName: 'China',
      attackerReputation: 25,
      attackerLocation: { lat: 39.9, lon: 116.4 },
      target: 'tgt-jakarta',
      targetName: 'Mabes AD Jakarta',
      targetLocation: { lat: -6.175, lon: 106.827 },
      targetCritical: true,
      tactic: 'TA0006',
      technique: 'T1110',
      name: 'Brute Force Login',
      severity: 'HIGH',
      description: 'SSH brute force dari IP China',
      confidence: 0.88,
      protocol: 'SSH', port: 22,
      protocol: 'HTTPS', port: 443,
      timestamp: Date.now() - 3600000,
      blocked: true
    },
    {
      id: 'evt-seed-02',
      attackerIP: '198.51.100.99',
      attackerCountry: 'RU',
      attackerCountryName: 'Russia',
      attackerReputation: 28,
      attackerLocation: { lat: 55.75, lon: 37.62 },
      target: 'tgt-edge-nat',
      targetName: 'Edge AI Natuna',
      targetLocation: { lat: 3.950, lon: 108.383 },
      targetCritical: true,
      tactic: 'TA0011',
      technique: 'T1071',
      name: 'C2 Beacon Detected',
      severity: 'CRITICAL',
      description: 'C2 callback ke server Rusia via DNS tunnelling',
      confidence: 0.92,
      timestamp: Date.now() - 1800000,
      blocked: true
    }
  ];

  // ============================================
  // INCIDENTS (kronologi)
  // ============================================
  const INCIDENTS = [
    {
      id: 'INC-2026-0001',
      title: 'Coordinated Brute Force â€” Selat Malaka Edge AI',
      severity: 'HIGH',
      status: 'RESOLVED',
      openedAt: Date.now() - 86400000,
      resolvedAt: Date.now() - 82800000,
      events: 47,
      source: 'CN',
      summary: 'Botnet terkoordinasi menyerang Edge AI Sabang & Malaka. Auto-block 47 IP.'
    },
    {
      id: 'INC-2026-0002',
      title: 'C2 Beacon â€” IKN Central AI',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      openedAt: Date.now() - 7200000,
      events: 8,
      source: 'RU',
      summary: 'DNS beacon terdeteksi dari subnet RU. Forensik sedang dilakukan.'
    },
    {
      id: 'INC-2026-0003',
      title: 'Data Exfiltration Attempt',
      severity: 'CRITICAL',
      status: 'MITIGATED',
      openedAt: Date.now() - 43200000,
      resolvedAt: Date.now() - 36000000,
      events: 3,
      source: 'UNKNOWN',
      summary: 'Exfiltrate 2.3 GB dari DR Site Makassar. Berhasil dicegah IPS.'
    }
  ];

  // ============================================
  // HELPERS
  // ============================================
  function randomAttacker() {
    return ATTACKER_SOURCES[Math.floor(Math.random() * ATTACKER_SOURCES.length)];
  }

  function randomTarget() {
    return TARGET_ASSETS[Math.floor(Math.random() * TARGET_ASSETS.length)];
  }

  function randomThreatTemplate() {
    return THREAT_TEMPLATES[Math.floor(Math.random() * THREAT_TEMPLATES.length)];
  }

  function generateAttackerIP(country) {
    const prefix = {
      CN: [114, 116, 121, 123], RU: [5, 46, 95, 176], KP: [175, 203],
      IR: [78, 91, 151], US: [45, 104, 198], NL: [145, 185],
      DE: [80, 91, 138], SG: [103, 165], MY: [42, 118],
      AU: [13, 101], IN: [14, 49], BR: [131, 177]
    };
    const p = prefix[country] || [203];
    return `${p[Math.floor(Math.random() * p.length)]}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }

  function generateEvent() {
    const attacker = randomAttacker();
    const target = randomTarget();
    const template = randomThreatTemplate();

    const conf = 0.7 + Math.random() * 0.3;

    const evt = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      attackerIP: generateAttackerIP(attacker.country),
      attackerCountry: attacker.country,
      attackerCountryName: attacker.name,
      attackerReputation: attacker.reputation + Math.random() * 30 - 15,
      attackerLocation: { lat: attacker.lat, lon: attacker.lon },
      target: target.id,
      targetName: target.name,
      targetLocation: { lat: target.lat, lon: target.lon },
      targetCritical: target.critical,
      tactic: template.tactic,
      technique: template.technique,
      name: template.name,
      severity: template.severity,
      description: template.description,
      protocol: template.protocol || 'TCP',
      port: template.port || 0,
      confidence: conf,
      timestamp: Date.now(),
      blocked: false
    };

    // Compute AI assessment
    try {
      if (typeof window !== 'undefined' && window.SiberCore && typeof window.SiberCore.assessAI === 'function') {
        evt.ai = window.SiberCore.assessAI(evt);
      } else {
        evt.ai = { level: 'MEDIUM', score: 50, reason: 'pending' };
      }
    } catch (err) {
      evt.ai = { level: 'MEDIUM', score: 50, reason: 'error' };
    }

    return evt;
  }

  function getStats() {
    return {
      eventsToday: 1247 + Math.floor(Math.random() * 100),
      blockedToday: 892 + Math.floor(Math.random() * 50),
      uniqueAttackers: 342,
      activeIncidents: INCIDENTS.filter(i => i.status !== 'RESOLVED').length,
      criticalEvents: 23,
      threatLevel: 'ELEVATED'
    };
  }
  SEED_EVENTS.forEach(e => {
    try {
      if (typeof window !== 'undefined' && window.SiberCore && typeof window.SiberCore.assessAI === 'function') {
        e.ai = window.SiberCore.assessAI(e);
      } else {
        e.ai = { level: 'MEDIUM', score: 50, reason: 'pending' };
      }
    } catch (err) {
      e.ai = { level: 'MEDIUM', score: 50, reason: 'error' };
    }
  });

  return {
    ATTACKER_SOURCES,
    TARGET_ASSETS,
    THREAT_TEMPLATES,
    SEED_EVENTS,
    INCIDENTS,
    generateEvent,
    getStats,
    randomAttacker,
    randomTarget
  };
})();

if (typeof window !== 'undefined') window.SiberData = SiberData;
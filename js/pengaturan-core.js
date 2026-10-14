/* ============================================================
 * PENGATURAN-CORE.JS â€” System Settings & Robustness Layer
 * Session Â· Retention Â· Backup Â· Emergency Purge
 * ============================================================ */

const PengaturanCore = (() => {
  'use strict';

  // ============================================
  // CONFIG SCHEMA (with defaults)
  // ============================================
  let config = {
    session: {
      idleTimeoutMin: 15,           // 1-60 min
      warnBeforeMin: 2,             // warning N min before logout
      autoLogoutEnabled: true,
      requireReauthOnReturn: true,
      maxConcurrentSessions: 3
    },
    retention: {
      auditLogDays: 90,             // 7, 30, 90, 180, 365
      cyberEventDays: 30,
      intelDataDays: 365,
      personnelDataDays: 365,
      autoPurgeEnabled: true,
      purgeSchedule: 'daily',       // daily, weekly, monthly
      purgeTimeUTC: '03:00'
    },
    backup: {
      autoBackupEnabled: true,
      schedule: 'daily',            // hourly, daily, weekly
      scheduleTime: '02:00',
      retentionBackups: 30,         // keep N most recent
      targetLocation: 'local',      // local, s3, nfs
      encryption: 'AES-256-GCM',
      verifyAfterBackup: true
    },
    security: {
      emergencyPurgeEnabled: true,
      requireTwoPersonRule: true,   // butuh 2 approval untuk purge
      purgeWipeMethod: 'DOD-5220.22-M', // secure erase standard
      panicHotkey: 'Ctrl+Shift+X',
      passwordReauthForPurge: true
    },
    system: {
      classificationDefault: 'RESTRICTED',
      theme: 'dark-tactical',
      language: 'id',
      timezone: 'Asia/Jakarta'
    }
  };

  // ============================================
  // SESSION MANAGER
  // ============================================
  let sessionState = {
    userId: 'r2admin',
    userName: 'Analis SOC',
    userRole: 'Operator',
    clearance: 'SECRET',
    startTime: Date.now(),
    lastActivity: Date.now(),
    sessionId: 'SES-' + Date.now().toString(36).toUpperCase(),
    active: true
  };

  const SESSION_LOG = [];
  let sessionTimer = null;
  let idleWarningShown = false;

  function startSessionMonitor(onWarning, onLogout) {
    if (sessionTimer) clearInterval(sessionTimer);

    sessionTimer = setInterval(() => {
      if (!sessionState.active || !config.session.autoLogoutEnabled) return;

      const idleMs = Date.now() - sessionState.lastActivity;
      const idleMin = idleMs / 60000;
      const timeout = config.session.idleTimeoutMin;
      const warnAt = timeout - config.session.warnBeforeMin;

      // Warning threshold
      if (idleMin >= warnAt && !idleWarningShown) {
        idleWarningShown = true;
        const remaining = Math.max(0, timeout - idleMin);
        if (onWarning) onWarning(remaining);
        logSession('IDLE_WARNING', { idleMin: idleMin.toFixed(1) });
      }

      // Auto logout
      if (idleMin >= timeout) {
        if (onLogout) onLogout();
        endSession('IDLE_TIMEOUT');
      }
    }, 10000); // check every 10s
  }

  function touchSession() {
    sessionState.lastActivity = Date.now();
    idleWarningShown = false;
  }

  function endSession(reason = 'MANUAL') {
    sessionState.active = false;
    if (sessionTimer) clearInterval(sessionTimer);
    sessionTimer = null;
    logSession('END', { reason });
    console.log(`[PENGATURAN] Session ended: ${reason}`);
  }

  function logSession(eventType, meta = {}) {
    SESSION_LOG.push({
      timestamp: Date.now(),
      eventType,
      sessionId: sessionState.sessionId,
      userId: sessionState.userId,
      ...meta
    });
    if (SESSION_LOG.length > 500) SESSION_LOG.shift();
  }

  function getSessionInfo() {
    const idleMs = Date.now() - sessionState.lastActivity;
    const timeout = config.session.idleTimeoutMin * 60 * 1000;
    const remainingMs = Math.max(0, timeout - idleMs);

    return {
      ...sessionState,
      idleMs,
      idleSec: Math.floor(idleMs / 1000),
      idleText: formatDuration(idleMs),
      remainingMs,
      remainingSec: Math.floor(remainingMs / 1000),
      remainingText: formatDuration(remainingMs),
      uptime: Date.now() - sessionState.startTime,
      uptimeText: formatDuration(Date.now() - sessionState.startTime)
    };
  }

  function getSessionLog() {
    return SESSION_LOG.slice(-50).reverse();
  }

  // ============================================
  // RETENTION POLICY
  // ============================================
  function calculateStorageEstimate() {
    // Simulasi storage
    const baseData = {
      auditLog: { bytesPerDay: 1024 * 1024 * 15, label: 'Audit Log' },      // 15 MB/hari
      cyberEvent: { bytesPerDay: 1024 * 1024 * 45, label: 'Cyber Events' }, // 45 MB/hari
      intelData: { bytesPerDay: 1024 * 1024 * 8, label: 'Intel Data' },     // 8 MB/hari
      personnelData: { bytesPerDay: 1024 * 512, label: 'Personnel' }        // 0.5 MB/hari
    };

    const estimates = {};

    Object.entries(baseData).forEach(([key, val]) => {
      const days = {
        auditLog: config.retention.auditLogDays,
        cyberEvent: config.retention.cyberEventDays,
        intelData: config.retention.intelDataDays,
        personnelData: config.retention.personnelDataDays
      }[key];

      const totalBytes = val.bytesPerDay * days;
      estimates[key] = {
        label: val.label,
        days,
        bytes: totalBytes,
        sizeText: formatBytes(totalBytes),
        bytesPerDay: val.bytesPerDay
      };
    });

    const totalBytes = Object.values(estimates).reduce((s, e) => s + e.bytes, 0);
    return {
      perType: estimates,
      totalBytes,
      totalSize: formatBytes(totalBytes),
      averageDaily: formatBytes(Object.values(baseData).reduce((s, v) => s + v.bytesPerDay, 0))
    };
  }

  function previewPurge() {
    const est = calculateStorageEstimate();
    const purged = {
      auditLog: {
        days: config.retention.auditLogDays,
        bytes: est.perType.auditLog.bytes,
        count: Math.round(est.perType.auditLog.days * 1250) // ~1250 events/hari
      },
      cyberEvent: {
        days: config.retention.cyberEventDays,
        bytes: est.perType.cyberEvent.bytes,
        count: Math.round(est.perType.cyberEvent.days * 3800)
      },
      intelData: {
        days: config.retention.intelDataDays,
        bytes: est.perType.intelData.bytes,
        count: Math.round(est.perType.intelData.days * 12)
      }
    };

    const totalBytes = Object.values(purged).reduce((s, p) => s + p.bytes, 0);
    return {
      items: purged,
      totalBytes,
      totalSize: formatBytes(totalBytes)
    };
  }

  function executeRetentionPurge(dryRun = false) {
    const preview = previewPurge();
    if (dryRun) {
      console.log('[PENGATURAN] DRY RUN â€” Purge preview:', preview);
      return { ok: true, dryRun: true, preview };
    }

    // Log the action
    logSession('RETENTION_PURGE', {
      totalBytes: preview.totalBytes,
      policy: config.retention
    });

    console.log(`[PENGATURAN] Purge executed: ${preview.totalSize} freed`);
    return { ok: true, purged: preview };
  }

  // ============================================
  // BACKUP ENGINE
  // ============================================
  const BACKUP_HISTORY = [
    {
      id: 'BKP-2026-10-04-001',
      timestamp: Date.now() - 24 * 3600 * 1000,
      type: 'AUTO',
      size: 1024 * 1024 * 240,
      status: 'SUCCESS',
      duration: 45,
      location: 'local'
    },
    {
      id: 'BKP-2026-10-03-002',
      timestamp: Date.now() - 48 * 3600 * 1000,
      type: 'AUTO',
      size: 1024 * 1024 * 235,
      status: 'SUCCESS',
      duration: 42,
      location: 'local'
    },
    {
      id: 'BKP-2026-10-02-003',
      timestamp: Date.now() - 72 * 3600 * 1000,
      type: 'MANUAL',
      size: 1024 * 1024 * 238,
      status: 'SUCCESS',
      duration: 48,
      location: 'local'
    },
    {
      id: 'BKP-2026-09-30-004',
      timestamp: Date.now() - 5 * 24 * 3600 * 1000,
      type: 'AUTO',
      size: 1024 * 1024 * 230,
      status: 'FAILED',
      duration: 12,
      location: 'local',
      error: 'Disk quota exceeded'
    }
  ];

  function triggerBackup(type = 'MANUAL', onProgress = null) {
    const id = 'BKP-' + new Date().toISOString().slice(0, 10) + '-' + String(BACKUP_HISTORY.length + 1).padStart(3, '0');
    const size = 1024 * 1024 * (230 + Math.round(Math.random() * 20));

    const backup = {
      id,
      timestamp: Date.now(),
      type,
      size,
      status: 'RUNNING',
      duration: 0,
      location: config.backup.targetLocation
    };

    BACKUP_HISTORY.unshift(backup);

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += 5 + Math.random() * 10;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        backup.status = 'SUCCESS';
        backup.duration = Math.round(40 + Math.random() * 20);
        logSession('BACKUP_SUCCESS', { id, size });
        console.log(`[PENGATURAN] Backup success: ${id}`);
      }
      if (onProgress) onProgress(Math.min(100, progress), backup);
    }, 200);

    return backup;
  }

  function getBackupHistory() {
    return BACKUP_HISTORY.slice(0, 20);
  }

  function getBackupStats() {
    const success = BACKUP_HISTORY.filter(b => b.status === 'SUCCESS');
    const failed = BACKUP_HISTORY.filter(b => b.status === 'FAILED');
    const latestSuccess = success[0];

    return {
      total: BACKUP_HISTORY.length,
      success: success.length,
      failed: failed.length,
      lastSuccess: latestSuccess,
      lastSuccessAgo: latestSuccess ? formatDuration(Date.now() - latestSuccess.timestamp) : 'Never',
      totalSize: formatBytes(success.reduce((s, b) => s + b.size, 0))
    };
  }

  // ============================================
  // EMERGENCY PURGE
  // ============================================
  let purgeWorkflow = null;

  function initiateEmergencyPurge(reason = '', initiatedBy = 'r2admin') {
    purgeWorkflow = {
      id: 'PURGE-' + Date.now().toString(36).toUpperCase(),
      initiatedBy,
      reason,
      initiatedAt: Date.now(),
      status: 'AWAITING_APPROVAL',
      approvals: [],
      requiredApprovals: config.security.requireTwoPersonRule ? 2 : 1
    };
    logSession('EMERGENCY_PURGE_INITIATED', { id: purgeWorkflow.id, reason });
    console.warn(`[PENGATURAN] Emergency purge initiated: ${purgeWorkflow.id}`);
    return purgeWorkflow;
  }

  function approvePurge(approver = 'r2admin') {
    if (!purgeWorkflow) return { ok: false, reason: 'NO_WORKFLOW' };
    if (purgeWorkflow.status !== 'AWAITING_APPROVAL') {
      return { ok: false, reason: 'INVALID_STATE' };
    }

    if (!purgeWorkflow.approvals.includes(approver)) {
      purgeWorkflow.approvals.push(approver);
    }

    if (purgeWorkflow.approvals.length >= purgeWorkflow.requiredApprovals) {
      purgeWorkflow.status = 'READY';
      console.log(`[PENGATURAN] Purge READY â€” ${purgeWorkflow.approvals.length} approvals`);
    }

    return { ok: true, workflow: purgeWorkflow };
  }

  function executeEmergencyPurge() {
    if (!purgeWorkflow || purgeWorkflow.status !== 'READY') {
      return { ok: false, reason: 'NOT_READY' };
    }

    purgeWorkflow.status = 'EXECUTING';
    purgeWorkflow.executedAt = Date.now();

    // Simulate secure wipe
    const wipeResults = {
      auditLog:   { items: 1247, method: config.security.purgeWipeMethod, status: 'WIPED' },
      cyberEvent: { items: 3892, method: config.security.purgeWipeMethod, status: 'WIPED' },
      intelData:  { items: 8,    method: config.security.purgeWipeMethod, status: 'WIPED' },
      cacheData:  { items: 456,  method: config.security.purgeWipeMethod, status: 'WIPED' },
      tempFiles:  { items: 89,   method: config.security.purgeWipeMethod, status: 'WIPED' }
    };

    purgeWorkflow.status = 'COMPLETED';
    purgeWorkflow.result = wipeResults;
    purgeWorkflow.completedAt = Date.now();

    logSession('EMERGENCY_PURGE_COMPLETED', { id: purgeWorkflow.id });
    console.warn(`[PENGATURAN] Emergency purge COMPLETED: ${purgeWorkflow.id}`);

    return { ok: true, workflow: purgeWorkflow };
  }

  function cancelPurge(reason = 'CANCELLED_BY_ADMIN') {
    if (!purgeWorkflow) return { ok: false };
    purgeWorkflow.status = 'CANCELLED';
    purgeWorkflow.cancelReason = reason;
    logSession('EMERGENCY_PURGE_CANCELLED', { id: purgeWorkflow.id, reason });
    purgeWorkflow = null;
    return { ok: true };
  }

  function getPurgeWorkflow() {
    return purgeWorkflow;
  }

  // ============================================
  // SYSTEM INFO
  // ============================================
  function getSystemInfo() {
    return {
      version: 'v1.0.0-siskodal',
      buildDate: '2026-10-05',
      environment: 'PRODUCTION',
      classification: config.system.classificationDefault,
      uptime: formatDuration(Date.now() - sessionState.startTime),
      uptimeMs: Date.now() - sessionState.startTime,
      activeModules: 11,
      totalUsers: 15,
      storageUsed: '2.4 GB',
      storageCapacity: '97.8 GB',
      storagePercent: 2.5,
      lastBackup: getBackupStats().lastSuccessAgo,
      licenseStatus: 'ENTERPRISE',
      supportContact: 'support@rajacyber.net'
    };
  }

  // ============================================
  // HELPERS
  // ============================================
  function formatDuration(ms) {
    if (ms < 1000) return '0s';
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ${s % 60}s`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ${m % 60}m`;
    const d = Math.floor(h / 24);
    return `${d}d ${h % 24}h`;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + ' MB';
    return (bytes / 1024 / 1024 / 1024).toFixed(2) + ' GB';
  }

  // ============================================
  // CONFIG MANAGEMENT
  // ============================================
  function updateConfig(section, key, value) {
    if (!config[section]) return { ok: false, reason: 'SECTION_NOT_FOUND' };
    if (!(key in config[section])) return { ok: false, reason: 'KEY_NOT_FOUND' };

    const old = config[section][key];
    config[section][key] = value;

    logSession('CONFIG_CHANGE', { section, key, old, new: value });
    console.log(`[PENGATURAN] Config: ${section}.${key} = ${value} (was ${old})`);

    // Side effects
    if (section === 'session' && key === 'idleTimeoutMin') {
      // Re-init timer kalau perlu
    }

    return { ok: true, old, new: value };
  }

  function getConfig() {
    return JSON.parse(JSON.stringify(config));
  }

  function resetConfig() {
    // Reset ke default (ideal: reload dari defaults)
    logSession('CONFIG_RESET');
    return { ok: true };
  }

  function exportConfig() {
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: getSystemInfo().version,
      config
    };
    return JSON.stringify(exportData, null, 2);
  }

  return {
    // Session
    startSessionMonitor,
    touchSession,
    endSession,
    getSessionInfo,
    getSessionLog,

    // Retention
    calculateStorageEstimate,
    previewPurge,
    executeRetentionPurge,

    // Backup
    triggerBackup,
    getBackupHistory,
    getBackupStats,

    // Emergency Purge
    initiateEmergencyPurge,
    approvePurge,
    executeEmergencyPurge,
    cancelPurge,
    getPurgeWorkflow,

    // System
    getSystemInfo,

    // Config
    getConfig,
    updateConfig,
    resetConfig,
    exportConfig,

    // Helpers
    formatBytes,
    formatDuration
  };
})();

if (typeof window !== 'undefined') window.PengaturanCore = PengaturanCore;
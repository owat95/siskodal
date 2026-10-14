/* ============================================================
 * PENGATURAN-DASHBOARD.JS â€” Settings UI Logic
 * ============================================================ */

const PengaturanDashboard = (() => {
  'use strict';

  let sessionTimerInterval = null;
  let clockInterval = null;

  // ============================================
  // INIT
  // ============================================
  function init() {
    if (!window.PengaturanCore) {
      console.error('[PENG-DASH] Core missing');
      return;
    }

    wireTabs();
    wireSettings();
    renderSessionLog();
    renderStorage();
    renderBackupStats();
    renderBackupHistory();
    renderSystemInfo();
    startSessionTimer();
    startClock();
    previewRetentionPurge();
    // â† TAMBAH
    renderRemoteStats();
    renderRemoteTable();
    wireRemoteFilters();
    
    // Auto-refresh remote every 30s
    setInterval(() => {
      if (document.getElementById('tab-remote')?.classList.contains('active')) {
        refreshRemote();
      }
    }, 30000);
    // Start session monitor
    PengaturanCore.startSessionMonitor(
      (remaining) => showSessionWarning(remaining),
      () => handleAutoLogout()
    );

    // Track user activity
    ['click', 'keydown', 'mousemove'].forEach(evt => {
      document.addEventListener(evt, () => PengaturanCore.touchSession(), { passive: true });
    });

    // Purge confirm input
    document.getElementById('purge-confirm-input')?.addEventListener('input', (e) => {
      document.getElementById('btn-purge-confirm').disabled = e.target.value.trim() !== 'PURGE';
    });

    console.log('[PENG-DASH] Ready');
  }

  // ============================================
  // TABS
  // ============================================
  function wireTabs() {
    document.querySelectorAll('.sb-item[data-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(el.dataset.tab);
      });
    });
  }

  function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(t => {
      t.classList.toggle('active', t.id === `tab-${tab}`);
    });
    document.querySelectorAll('.sb-item[data-tab]').forEach(n => {
      n.classList.toggle('active', n.dataset.tab === tab);
    });
  }

  // ============================================
  // SESSION TIMER
  // ============================================
  function startSessionTimer() {
    if (sessionTimerInterval) clearInterval(sessionTimerInterval);

    sessionTimerInterval = setInterval(() => {
      const info = PengaturanCore.getSessionInfo();

      const remainingEl = document.getElementById('session-remaining');
      const idEl = document.getElementById('session-id');
      const hdrEl = document.getElementById('hdr-session');
      const uptimeEl = document.getElementById('hdr-uptime');

      if (remainingEl) remainingEl.textContent = info.remainingText;
      if (idEl) idEl.textContent = info.sessionId;
      if (hdrEl) hdrEl.textContent = info.remainingText;
      if (uptimeEl) uptimeEl.textContent = info.uptimeText;

      // Update color by urgency
      const timer = document.getElementById('session-timer');
      if (timer) {
        timer.classList.remove('warning', 'critical');
        if (info.remainingSec < 60) timer.classList.add('critical');
        else if (info.remainingSec < 180) timer.classList.add('warning');
      }
    }, 1000);
  }

  function showSessionWarning(remainingMin) {
    // Hapus warning lama
    document.querySelectorAll('.session-warning-toast').forEach(el => el.remove());

    const toast = document.createElement('div');
    toast.className = 'session-warning-toast';
    toast.innerHTML = `
      <div class="swt-icon">â±ï¸</div>
      <div class="swt-text">
        <strong>IDLE WARNING</strong> â€” Session akan berakhir dalam
        <strong>${Math.ceil(remainingMin)} menit</strong>.
        Klik atau gerakkan mouse untuk tetap aktif.
      </div>
    `;
    document.body.appendChild(toast);

    // Auto-remove
    setTimeout(() => toast.remove(), 60000);
  }

  function handleAutoLogout() {
    console.warn('[PENG-DASH] AUTO LOGOUT due to idle timeout');
    alert('Session berakhir karena idle timeout.\nSilakan login kembali.');

    // Visual overlay
    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(10,15,30,0.98);z-index:99999;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:20px;color:#f87171;font-family:monospace;';
    overlay.innerHTML = `
      <div style="font-size:4rem;">ðŸ”’</div>
      <div style="font-size:1.5rem;letter-spacing:2px;font-weight:900;">SESSION ENDED</div>
      <div style="color:#94a3b8;font-size:0.9rem;">Idle timeout â€” please re-authenticate</div>
      <button onclick="location.reload()" style="margin-top:20px;padding:12px 32px;background:linear-gradient(135deg,#3b82f6,#22c55e);color:#fff;border:none;border-radius:10px;font-family:inherit;font-weight:700;cursor:pointer;font-size:1rem;">
        RE-AUTHENTICATE
      </button>
    `;
    document.body.appendChild(overlay);
  }

  // ============================================
  // SESSION LOG
  // ============================================
  function renderSessionLog() {
    const container = document.getElementById('session-log');
    if (!container) return;

    const log = PengaturanCore.getSessionLog();

    if (log.length === 0) {
      // Seed sample logs
      PengaturanCore.touchSession();
      container.innerHTML = `
        <div class="session-log-item">
          <span class="sl-time">${new Date().toLocaleTimeString('id-ID')}</span>
          <span class="sl-type INFO">SESSION START</span>
          <span class="sl-meta">Session dimulai oleh Analis SOC</span>
        </div>
        <div class="session-log-item">
          <span class="sl-time">${new Date(Date.now() - 30000).toLocaleTimeString('id-ID')}</span>
          <span class="sl-type INFO">CONFIG LOAD</span>
          <span class="sl-meta">Configuration loaded from defaults</span>
        </div>
        <div class="session-log-item">
          <span class="sl-time">${new Date(Date.now() - 60000).toLocaleTimeString('id-ID')}</span>
          <span class="sl-type BACKUP_SUCCESS">BACKUP</span>
          <span class="sl-meta">Auto-backup completed (240 MB)</span>
        </div>
      `;
      return;
    }

    container.innerHTML = log.slice(0, 20).map(l => `
      <div class="session-log-item">
        <span class="sl-time">${new Date(l.timestamp).toLocaleTimeString('id-ID')}</span>
        <span class="sl-type ${l.eventType}">${l.eventType.replace(/_/g, ' ')}</span>
        <span class="sl-meta">${formatLogMeta(l)}</span>
      </div>
    `).join('');
  }

  function formatLogMeta(l) {
    const meta = { ...l };
    delete meta.timestamp;
    delete meta.eventType;
    delete meta.sessionId;
    delete meta.userId;
    return Object.entries(meta).map(([k, v]) => `${k}: ${v}`).join(' Â· ') || 'â€”';
  }

  // ============================================
  // STORAGE
  // ============================================
  function renderStorage() {
    const container = document.getElementById('storage-bar');
    if (!container) return;

    const est = PengaturanCore.calculateStorageEstimate();

    const maxBytes = Math.max(...Object.values(est.perType).map(e => e.bytes));

    container.innerHTML = Object.entries(est.perType).map(([key, e]) => {
      const pct = Math.round((e.bytes / maxBytes) * 100);
      return `
        <div class="storage-row">
          <span class="sr-label">${e.label}</span>
          <div class="sr-bar-wrap">
            <div class="sr-bar" style="width:${pct}%;"></div>
          </div>
          <span class="sr-value">${e.sizeText}</span>
        </div>
      `;
    }).join('');

    document.getElementById('storage-total').textContent = est.totalSize;
    document.getElementById('storage-total-2').textContent = est.totalSize;
    document.getElementById('storage-daily').textContent = est.averageDaily;
  }

  // ============================================
  // RETENTION PURGE
  // ============================================
  function previewRetentionPurge() {
    const preview = PengaturanCore.previewPurge();
    const textEl = document.getElementById('purge-preview-text');
    if (textEl) {
      textEl.innerHTML = `
        Total: <strong style="color:#facc15;">${preview.totalSize}</strong> akan dihapus<br>
        <span style="font-family:'Courier New',monospace;font-size:0.7rem;">
          â€¢ Audit Log: ${preview.items.auditLog.count.toLocaleString('id-ID')} events Â· ${PengaturanCore.formatBytes(preview.items.auditLog.bytes)}<br>
          â€¢ Cyber Events: ${preview.items.cyberEvent.count.toLocaleString('id-ID')} events Â· ${PengaturanCore.formatBytes(preview.items.cyberEvent.bytes)}<br>
          â€¢ Intel Data: ${preview.items.intelData.count.toLocaleString('id-ID')} items Â· ${PengaturanCore.formatBytes(preview.items.intelData.bytes)}
        </span>
      `;
    }
    console.log('[PENG-DASH] Preview:', preview);
  }

  function executeRetentionPurge() {
    if (!confirm('âš  Yakin execute retention purge?\n\nSemua data kedaluwarsa akan dihapus permanen.')) return;

    const r = PengaturanCore.executeRetentionPurge(false);
    if (r.ok) {
      alert(`âœ“ Purge berhasil\n\n${r.purged.totalSize} telah dibebaskan.`);
      renderStorage();
      renderSessionLog();
    }
  }

  // ============================================
  // BACKUP
  // ============================================
  function renderBackupStats() {
    const stats = PengaturanCore.getBackupStats();

    document.getElementById('bkp-last').textContent = stats.lastSuccessAgo;
    document.getElementById('bkp-success').textContent = stats.success;
    document.getElementById('bkp-failed').textContent = stats.failed;
    document.getElementById('bkp-size').textContent = stats.totalSize;
  }

  function renderBackupHistory() {
    const tbody = document.getElementById('backup-history-body');
    if (!tbody) return;

    const history = PengaturanCore.getBackupHistory();

    tbody.innerHTML = history.map(b => `
      <tr>
        <td class="mono">${b.id}</td>
        <td class="mono" style="font-size:0.7rem;">${new Date(b.timestamp).toLocaleString('id-ID')}</td>
        <td><span style="color:#60a5fa;font-size:0.75rem;">${b.type}</span></td>
        <td class="mono">${PengaturanCore.formatBytes(b.size)}</td>
        <td class="mono">${b.duration}s</td>
        <td><span class="bkp-status ${b.status.toLowerCase()}">${b.status}</span></td>
      </tr>
    `).join('');
  }

  function triggerManualBackup() {
    const area = document.getElementById('backup-progress-area');
    if (!area) return;

    area.innerHTML = `
      <div class="backup-progress">
        <div class="bp-label">â—¤ BACKUP IN PROGRESS</div>
        <div class="bp-bar-wrap">
          <div class="bp-bar" id="bkp-progress-bar" style="width: 0%;"></div>
        </div>
        <div class="bp-meta">
          <span id="bkp-progress-id">--</span>
          <span id="bkp-progress-pct">0%</span>
        </div>
      </div>
    `;

    PengaturanCore.triggerBackup('MANUAL', (progress, backup) => {
      const bar = document.getElementById('bkp-progress-bar');
      const pct = document.getElementById('bkp-progress-pct');
      const id = document.getElementById('bkp-progress-id');

      if (bar) bar.style.width = progress + '%';
      if (pct) pct.textContent = Math.round(progress) + '%';
      if (id) id.textContent = backup.id;

      if (progress >= 100) {
        setTimeout(() => {
          area.innerHTML = `
            <div class="backup-progress" style="border-left-color:#22c55e;background:rgba(34,197,94,0.08);">
              <div style="display:flex;align-items:center;gap:10px;">
                <span style="font-size:1.5rem;">âœ“</span>
                <div>
                  <div style="font-size:0.85rem;color:#4ade80;font-weight:700;">BACKUP SUCCESS</div>
                  <div style="font-size:0.72rem;color:#94a3b8;font-family:'Courier New',monospace;margin-top:4px;">
                    ${backup.id} Â· ${PengaturanCore.formatBytes(backup.size)} Â· ${backup.duration}s
                  </div>
                </div>
              </div>
            </div>
          `;
          renderBackupStats();
          renderBackupHistory();
          renderSessionLog();
        }, 500);
      }
    });
  }

  // ============================================
  // SYSTEM INFO
  // ============================================
  function renderSystemInfo() {
    const container = document.getElementById('sys-info-grid');
    if (!container) return;

    const info = PengaturanCore.getSystemInfo();

    const items = [
      { label: 'Version',       value: info.version,       cls: 'info' },
      { label: 'Build Date',    value: info.buildDate,     cls: '' },
      { label: 'Environment',   value: info.environment,   cls: 'ok' },
      { label: 'Classification',value: info.classification,cls: 'warn' },
      { label: 'Uptime',        value: info.uptime,        cls: '' },
      { label: 'Active Modules',value: info.activeModules, cls: 'info' },
      { label: 'Total Users',   value: info.totalUsers,    cls: '' },
      { label: 'Storage Used',  value: info.storageUsed + ' / ' + info.storageCapacity, cls: 'ok' },
      { label: 'Last Backup',   value: info.lastBackup,    cls: 'ok' },
      { label: 'License',       value: info.licenseStatus, cls: 'ok' }
    ];

    container.innerHTML = items.map(i => `
      <div class="sys-info-item ${i.cls}">
        <div class="si-label">${i.label}</div>
        <div class="si-value">${i.value}</div>
      </div>
    `).join('');
  }

  // ============================================
  // CONFIG WIRING
  // ============================================
  function wireSettings() {
    const map = {
      'cfg-autologout':      ['session', 'autoLogoutEnabled', 'checkbox'],
      'cfg-idletimeout':     ['session', 'idleTimeoutMin', 'number'],
      'cfg-warnbefore':      ['session', 'warnBeforeMin', 'number'],
      'cfg-reauth':          ['session', 'requireReauthOnReturn', 'checkbox'],

      'cfg-auditdays':       ['retention', 'auditLogDays', 'number'],
      'cfg-cyberdays':       ['retention', 'cyberEventDays', 'number'],
      'cfg-inteldays':       ['retention', 'intelDataDays', 'number'],
      'cfg-autopurge':       ['retention', 'autoPurgeEnabled', 'checkbox'],

      'cfg-autobackup':      ['backup', 'autoBackupEnabled', 'checkbox'],
      'cfg-backupschedule':  ['backup', 'schedule', 'text'],
      'cfg-backupretention': ['backup', 'retentionBackups', 'number'],

      'cfg-classification':  ['system', 'classificationDefault', 'text'],

      'cfg-twoperson':       ['security', 'requireTwoPersonRule', 'checkbox'],
      'cfg-wipemethod':      ['security', 'purgeWipeMethod', 'text'],
      'cfg-requireauth':     ['security', 'passwordReauthForPurge', 'checkbox']
    };

    Object.entries(map).forEach(([elId, [section, key, type]]) => {
      const el = document.getElementById(elId);
      if (!el) return;

      el.addEventListener('change', (e) => {
        let val;
        if (type === 'checkbox') val = e.target.checked;
        else if (type === 'number') val = parseFloat(e.target.value);
        else val = e.target.value;

        PengaturanCore.updateConfig(section, key, val);
        renderSessionLog();
      });
    });
  }

  // ============================================
  // EMERGENCY PURGE
  // ============================================
  let pendingPurge = null;

  function initiatePurge() {
    const reason = prompt('Alasan emergency purge:');
    if (!reason) return;

    pendingPurge = PengaturanCore.initiateEmergencyPurge(reason, 'r2admin');
    renderPurgeStatus();
    renderSessionLog();
  }

  function renderPurgeStatus() {
    const area = document.getElementById('purge-status-area');
    if (!area) return;

    const wf = PengaturanCore.getPurgeWorkflow();

    if (!wf) {
      area.innerHTML = `
        <div style="padding:16px;text-align:center;color:#64748b;font-size:0.8rem;">
          Tidak ada purge workflow aktif
        </div>
      `;
      return;
    }

    const statusColors = {
      AWAITING_APPROVAL: '#eab308',
      READY: '#22c55e',
      EXECUTING: '#f97316',
      COMPLETED: '#4ade80',
      CANCELLED: '#64748b'
    };
    const color = statusColors[wf.status] || '#64748b';

    area.innerHTML = `
      <div class="purge-workflow">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;">
          <div style="font-family:'Courier New',monospace;font-size:0.85rem;color:#fff;font-weight:700;">${wf.id}</div>
          <span style="padding:3px 12px;border-radius:4px;background:${color}22;color:${color};font-weight:800;font-size:0.7rem;letter-spacing:1px;">${wf.status}</span>
        </div>
        <div style="font-size:0.75rem;color:#94a3b8;margin-bottom:14px;">
          Alasan: <em>${wf.reason}</em><br>
          Initiated by: <strong>${wf.initiatedBy}</strong>
        </div>

        <div class="purge-step ${wf.approvals.length >= 1 ? 'done' : 'active'}">
          <div class="ps-num">1</div>
          <div class="ps-body">
            <div class="ps-title">Initiation</div>
            <div class="ps-desc">Purge diinisiasi oleh ${wf.initiatedBy}</div>
          </div>
        </div>

        <div class="purge-step ${wf.approvals.length >= wf.requiredApprovals ? 'done' : wf.approvals.length >= 1 ? 'active' : 'pending'}">
          <div class="ps-num">2</div>
          <div class="ps-body">
            <div class="ps-title">Two-Person Approval (${wf.approvals.length}/${wf.requiredApprovals})</div>
            <div class="ps-desc">
              ${wf.approvals.length > 0 ? 'Approved by: ' + wf.approvals.join(', ') : 'Menunggu approval kedua'}
            </div>
          </div>
        </div>

        <div class="purge-step ${wf.status === 'COMPLETED' ? 'done' : wf.status === 'READY' || wf.status === 'EXECUTING' ? 'active' : 'pending'}">
          <div class="ps-num">3</div>
          <div class="ps-body">
            <div class="ps-title">Execute Purge</div>
            <div class="ps-desc">${wf.status === 'COMPLETED' ? 'Purge telah dieksekusi' : 'Menunggu aksi'}</div>
          </div>
        </div>

        <div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap;">
          ${wf.status === 'AWAITING_APPROVAL' && wf.approvals.length < wf.requiredApprovals ? `
            <button class="btn-settings" onclick="PengaturanDashboard.approvePurge('admin-2')">
              <i class="fas fa-check"></i> Approve (as admin-2)
            </button>
          ` : ''}
          ${wf.status === 'READY' ? `
            <button class="btn-settings danger solid" onclick="PengaturanDashboard.openPurgeModal()">
              <i class="fas fa-fire"></i> Execute Now
            </button>
          ` : ''}
          <button class="btn-settings" onclick="PengaturanDashboard.cancelPurge()">
            <i class="fas fa-times"></i> Cancel
          </button>
        </div>

        ${wf.status === 'COMPLETED' ? renderPurgeResult(wf) : ''}
      </div>
    `;
  }

  function renderPurgeResult(wf) {
    if (!wf.result) return '';
    return `
      <div style="margin-top:16px;padding:14px;background:rgba(34,197,94,0.08);border-left:3px solid #22c55e;border-radius:0 6px 6px 0;">
        <div style="font-size:0.75rem;color:#4ade80;font-weight:800;letter-spacing:1px;margin-bottom:8px;">âœ“ PURGE COMPLETED</div>
        <div style="font-size:0.7rem;font-family:'Courier New',monospace;color:#cbd5e1;line-height:1.6;">
          ${Object.entries(wf.result).map(([k, v]) => 
            `â€¢ ${k}: ${v.items} items (${v.status})`
          ).join('<br>')}
        </div>
      </div>
    `;
  }

  function approvePurge(approver) {
    const r = PengaturanCore.approvePurge(approver);
    if (r.ok) {
      renderPurgeStatus();
      renderSessionLog();
    }
  }

  function cancelPurge() {
    if (!confirm('Yakin cancel purge workflow?')) return;
    PengaturanCore.cancelPurge();
    renderPurgeStatus();
  }

  function openPurgeModal() {
    document.getElementById('purge-modal').classList.add('active');
    document.getElementById('purge-confirm-input').value = '';
    document.getElementById('btn-purge-confirm').disabled = true;
  }

  function closePurgeModal() {
    document.getElementById('purge-modal').classList.remove('active');
  }

  function confirmPurge() {
    const val = document.getElementById('purge-confirm-input').value.trim();
    if (val !== 'PURGE') return;

    const r = PengaturanCore.executeEmergencyPurge();
    closePurgeModal();

    if (r.ok) {
      renderPurgeStatus();
      renderSessionLog();
      setTimeout(() => {
        alert('ðŸš¨ EMERGENCY PURGE COMPLETED\n\nSemua data sensitif lokal telah dihapus secara aman.');
      }, 300);
    }
  }

  // ============================================
  // CONFIG EXPORT/RESET
  // ============================================
  function exportConfig() {
    const json = PengaturanCore.exportConfig();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `r2-siskodal-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function resetConfig() {
    if (!confirm('âš  Reset configuration ke default?\n\nSemua perubahan akan hilang.')) return;
    PengaturanCore.resetConfig();
    location.reload();
  }

  // ============================================
  // CLOCK
  // ============================================
  function startClock() {
    if (clockInterval) clearInterval(clockInterval);
    clockInterval = setInterval(() => {
      const t = new Date().toISOString().substr(11, 8);
      document.querySelectorAll('.live-clock').forEach(el => el.textContent = t);

      // Update uptime di header + System Info grid (setiap 5s)
      if (Date.now() % 5000 < 1100) {
        const info = PengaturanCore.getSystemInfo();
        const hdrUptime = document.getElementById('hdr-uptime');
        if (hdrUptime) hdrUptime.textContent = info.uptime;

        // Update di grid System Info (cari elemen uptime)
        document.querySelectorAll('.sys-info-item').forEach(el => {
          const label = el.querySelector('.si-label');
          const value = el.querySelector('.si-value');
          if (label && value && label.textContent === 'Uptime') {
            value.textContent = info.uptime;
          }
        });
      }
    }, 1000);
  }

  // ============================================
  // REMOTE INFRASTRUCTURE MONITORING
  // ============================================
  let remoteFilterType = 'ALL';
  let remoteFilterStatus = 'ALL';

  function renderRemoteStats() {
    const container = document.getElementById('remote-stats');
    if (!container || !window.RemoteInfraData) return;

    const s = RemoteInfraData.getStats();

    const stats = [
      { color: '#22c55e', label: 'Online',    value: s.online,    meta: 'Healthy' },
      { color: '#eab308', label: 'Degraded',  value: s.degraded,  meta: 'Need attention' },
      { color: '#ef4444', label: 'Offline',   value: s.offline,   meta: 'Down / timeout' },
      { color: '#3b82f6', label: 'Health',    value: s.healthPct + '%', meta: 'Overall' },
      { color: '#a855f7', label: 'Avg Ping',  value: s.avgPing + 'ms',  meta: 'Network latency' },
      { color: '#06b6d4', label: 'Avg Uptime',value: s.avgUptime + '%', meta: '30-day rolling' }
    ];

    container.innerHTML = stats.map(st => `
      <div class="sys-info-item" style="border-left-color:${st.color};">
        <div class="si-label">${st.label}</div>
        <div class="si-value" style="color:${st.color};">${st.value}</div>
        <div style="font-size:0.65rem;color:#64748b;margin-top:4px;">${st.meta}</div>
      </div>
    `).join('');
  }

  function renderRemoteTable() {
    const tbody = document.getElementById('remote-tbody');
    if (!tbody || !window.RemoteInfraData) return;

    let sites = RemoteInfraData.getSitesWithHealth();

    if (remoteFilterType !== 'ALL') {
      sites = sites.filter(s => s.type === remoteFilterType);
    }
    if (remoteFilterStatus !== 'ALL') {
      sites = sites.filter(s => s.health.status === remoteFilterStatus);
    }

    if (sites.length === 0) {
      tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:20px;color:#64748b;">Tidak ada site</td></tr>';
      return;
    }

    const statusColor = {
      ONLINE: '#4ade80',
      DEGRADED: '#facc15',
      OFFLINE: '#f87171'
    };

    tbody.innerHTML = sites.map(site => {
      const h = site.health;
      const sc = statusColor[h.status];
      const typeColor = RemoteInfraData.getTypeColor(site.type);
      const typeIcon = RemoteInfraData.getTypeIcon(site.type);
      const pingText = h.pingMs ? `${h.pingMs}ms` : '--';
      const pingColor = h.pingMs ? (h.pingMs < 50 ? '#4ade80' : h.pingMs < 150 ? '#facc15' : '#f87171') : '#64748b';

      return `
        <tr>
          <td>
            <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${sc};box-shadow:0 0 8px ${sc};margin-right:6px;"></span>
            <span style="color:${sc};font-size:0.7rem;font-weight:700;">${h.status}</span>
          </td>
          <td>
            <div style="font-size:0.78rem;color:#fff;font-weight:600;">${site.shortName}</div>
            <div style="font-size:0.65rem;color:#64748b;font-family:monospace;">${site.hq || 'â€”'}</div>
          </td>
          <td>
            <span style="font-size:0.65rem;padding:2px 6px;border-radius:3px;background:${typeColor}22;color:${typeColor};border:1px solid ${typeColor}55;font-family:monospace;">
              ${typeIcon} ${site.type}
            </span>
          </td>
          <td class="mono" style="font-size:0.7rem;color:#94a3b8;">${site.ip}</td>
          <td class="mono" style="font-size:0.72rem;color:${pingColor};font-weight:700;">${pingText}</td>
          <td class="mono" style="font-size:0.72rem;color:${h.uptimePct >= 99 ? '#4ade80' : h.uptimePct >= 95 ? '#facc15' : '#f87171'};">${h.uptimePct}%</td>
          <td style="font-size:0.7rem;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span class="mono" style="color:#94a3b8;min-width:28px;">${h.cpuPct}%</span>
              <div style="flex:1;height:3px;background:rgba(51,65,85,0.7);border-radius:2px;overflow:hidden;min-width:40px;">
                <div style="height:100%;width:${h.cpuPct}%;background:${h.cpuPct > 80 ? '#ef4444' : h.cpuPct > 60 ? '#eab308' : '#22c55e'};"></div>
              </div>
            </div>
          </td>
          <td style="font-size:0.7rem;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span class="mono" style="color:#94a3b8;min-width:28px;">${h.ramPct}%</span>
              <div style="flex:1;height:3px;background:rgba(51,65,85,0.7);border-radius:2px;overflow:hidden;min-width:40px;">
                <div style="height:100%;width:${h.ramPct}%;background:${h.ramPct > 80 ? '#ef4444' : h.ramPct > 60 ? '#eab308' : '#22c55e'};"></div>
              </div>
            </div>
          </td>
          <td style="font-size:0.7rem;">
            <div style="display:flex;align-items:center;gap:4px;">
              <span class="mono" style="color:#94a3b8;min-width:28px;">${h.diskPct}%</span>
              <div style="flex:1;height:3px;background:rgba(51,65,85,0.7);border-radius:2px;overflow:hidden;min-width:40px;">
                <div style="height:100%;width:${h.diskPct}%;background:${h.diskPct > 80 ? '#ef4444' : h.diskPct > 60 ? '#eab308' : '#22c55e'};"></div>
              </div>
            </div>
          </td>
          <td class="mono" style="font-size:0.7rem;color:#60a5fa;">${h.bandwidthPct}%</td>
        </tr>
      `;
    }).join('');

    // Update badge
    const badge = document.getElementById('remote-badge');
    if (badge) {
      const s = RemoteInfraData.getStats();
      badge.textContent = s.online + '/' + s.total;
      badge.style.background = s.offline > 0 ? '#ef4444' : s.degraded > 0 ? '#eab308' : '#22c55e';
    }
  }

  function refreshRemote() {
    renderRemoteStats();
    renderRemoteTable();
    console.log('[PENG-DASH] Remote refreshed');
  }

  function wireRemoteFilters() {
    const typeFilter = document.getElementById('remote-filter-type');
    const statusFilter = document.getElementById('remote-filter-status');

    if (typeFilter) {
      typeFilter.addEventListener('change', (e) => {
        remoteFilterType = e.target.value;
        renderRemoteTable();
      });
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        remoteFilterStatus = e.target.value;
        renderRemoteTable();
      });
    }
  }

  // ============================================
  // BOOT
  // ============================================
  window.addEventListener('DOMContentLoaded', init);

  return {
    previewRetentionPurge,
    executeRetentionPurge,
    triggerManualBackup,
    exportConfig,
    resetConfig,
    initiatePurge,
    approvePurge,
    cancelPurge,
    openPurgeModal,
    closePurgeModal,
    confirmPurge,
    switchTab,
    refreshRemote
  };
})();

if (typeof window !== 'undefined') window.PengaturanDashboard = PengaturanDashboard;
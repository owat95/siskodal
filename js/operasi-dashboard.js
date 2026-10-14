/* ============================================================
 * OPERASI-DASHBOARD.JS — C2 UI Logic
 * ============================================================ */

const OperasiDashboard = (() => {
  'use strict';

  let selectedMissionId = null;

  // ============================================
  // INIT
  // ============================================
  function init() {
    if (!window.OperasiData || !window.OperasiCore) {
      console.error('[OPS-DASH] Dependencies missing');
      return;
    }

    OperasiCore.init();
    OperasiCore.onEvent(handleCoreEvent);

    renderStats();
    renderKanban();
    wireControls();
    startClock();

    console.log('[OPS-DASH] Ready');
  }

  // ============================================
  // STATS
  // ============================================
  function renderStats() {
    const s = OperasiCore.getStats();
    document.getElementById('stat-planning').textContent = s.planning;
    document.getElementById('stat-approved').textContent = s.approved;
    document.getElementById('stat-executing').textContent = s.executing;
    document.getElementById('stat-completed').textContent = s.completed;
    document.getElementById('stat-units').textContent = s.totalUnitsDeployed;
    document.getElementById('stat-targets').textContent = s.totalTargetsEngaged;

    document.getElementById('badge-planning').textContent = s.planning;
    document.getElementById('badge-approved').textContent = s.approved;
    document.getElementById('badge-executing').textContent = s.executing;
    document.getElementById('badge-completed').textContent = s.completed;
    document.getElementById('badge-aborted').textContent = s.aborted;
    document.getElementById('stat-executing-2').textContent = s.executing;
  }

  // ============================================
  // KANBAN
  // ============================================
  function renderKanban() {
    ['PLANNING', 'APPROVED', 'EXECUTING', 'COMPLETED', 'ABORTED'].forEach(status => {
      renderColumn(status);
    });
  }

  function renderColumn(status) {
    const column = document.getElementById(`col-${status.toLowerCase()}`);
    if (!column) return;

    const missions = OperasiCore.getMissions().filter(m => m.status === status);
    const body = column.querySelector('.col-body');
    body.innerHTML = '';

    if (missions.length === 0) {
      body.innerHTML = `<div style="padding:16px;text-align:center;color:#475569;font-size:0.7rem;">No missions</div>`;
      return;
    }

    missions.forEach(m => {
      body.appendChild(createMissionCard(m));
    });
  }

  function createMissionCard(m) {
    const type = OperasiData.MISSION_TYPES[m.type];
    const priority = OperasiData.PRIORITY[m.priority];

    const card = document.createElement('div');
    card.className = 'mission-card' + (m.id === selectedMissionId ? ' selected' : '');
    card.style.borderLeftColor = type.color;
    card.dataset.missionId = m.id;

    const progressColor = m.progress >= 75 ? '#22c55e'
                        : m.progress >= 40 ? '#eab308'
                        : '#f97316';

    const unitIcons = m.units.slice(0, 4).map(uid => {
      const u = OperasiData.getUnit(uid);
      if (!u) return '';
      const cat = OperasiData.UNIT_CATEGORIES[u.category];
      return cat ? cat.icon : '●';
    }).join(' ');
    const more = m.units.length > 4 ? ` +${m.units.length - 4}` : '';

    card.innerHTML = `
      <div class="mc-head">
        <span class="mc-id">${m.id}</span>
        <span class="mc-priority" style="background:${priority.color}22; color:${priority.color};">${priority.code}</span>
      </div>
      <div class="mc-name">${m.name}</div>
      <div class="mc-type">${type.icon} ${type.label}</div>
      <div class="mc-stats">
        <span>🎯 ${m.targets.length} target</span>
        <span>◈ ${m.units.length} unit</span>
      </div>
      <div class="mc-progress">
        <div class="mc-progress-fill" style="width:${m.progress}%; background:${progressColor};"></div>
      </div>
      <div class="mc-footer">
        <span>${unitIcons}${more}</span>
        <span>${m.progress}%</span>
      </div>
    `;

    card.addEventListener('click', () => selectMission(m.id));
    return card;
  }

  // ============================================
  // SELECT MISSION
  // ============================================
  function selectMission(missionId) {
    selectedMissionId = missionId;

    // Update selected state
    document.querySelectorAll('.mission-card').forEach(c => {
      c.classList.toggle('selected', c.dataset.missionId === missionId);
    });

    renderDetail(missionId);
  }

  // ============================================
  // DETAIL PANEL
  // ============================================
  function renderDetail(missionId) {
    const panel = document.getElementById('detail-panel');
    const m = OperasiCore.getMission(missionId);

    if (!m) {
      panel.innerHTML = `
        <div class="detail-empty">
          <div class="icon">🎯</div>
          <p>Pilih mission di Kanban untuk melihat detail</p>
        </div>
      `;
      return;
    }

    const type = OperasiData.MISSION_TYPES[m.type];
    const status = OperasiData.MISSION_STATUS[m.status];
    const priority = OperasiData.PRIORITY[m.priority];
    const summary = OperasiCore.getMissionSummary(missionId);

    const classColors = {
      UNCLASS: '#22c55e', RESTRICTED: '#eab308', CONFIDENTIAL: '#f97316',
      SECRET: '#ef4444', TOP_SECRET: '#991b1b'
    };
    const classColor = classColors[m.classification] || '#64748b';

    // Units
    const unitsHtml = m.units.length === 0
      ? '<div style="color:#475569;font-size:0.75rem;padding:8px;">Belum ada unit assigned</div>'
      : m.units.map(uid => {
          const u = OperasiData.getUnit(uid);
          if (!u) return '';
          const cat = OperasiData.UNIT_CATEGORIES[u.category];
          const rc = u.readiness >= 90 ? '#4ade80' : u.readiness >= 80 ? '#facc15' : '#f87171';
          const editable = m.status !== 'COMPLETED' && m.status !== 'ABORTED';
          return `
            <div class="unit-item" style="border-left-color:${type.color};">
              <span class="u-icon">${cat.icon}</span>
              <div class="u-body">
                <div class="u-name">${u.name}</div>
                <div class="u-base">${u.base} · ${u.crew} crew</div>
              </div>
              <span class="u-readiness" style="color:${rc};">${u.readiness}%</span>
              ${editable ? `<button class="u-remove" onclick="OperasiDashboard.unassignUnit('${m.id}','${uid}')">✕</button>` : ''}
            </div>
          `;
        }).join('');

    // Targets
    const targetsHtml = m.targets.length === 0
      ? '<div style="color:#475569;font-size:0.75rem;padding:8px;">Belum ada target assigned</div>'
      : m.targets.map(tid => {
          const t = OperasiData.getTarget(tid);
          if (!t) return '';
          return `
            <div class="target-item">
              <div class="t-name">${t.name}</div>
              <div class="t-meta">
                <span>📍 ${t.area}</span>
                <span>${t.source}</span>
                <span>Conf: ${(t.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
          `;
        }).join('');

    // Phases
    const phasesHtml = m.phases.map((p, i) => {
      const cls = p.status === 'DONE' ? 'done'
                : p.status === 'IN_PROGRESS' ? 'in-progress'
                : 'pending';
      return `
        <div class="phase-item ${cls}">
          <span class="p-status"></span>
          <span class="p-name">${i + 1}. ${p.name}</span>
          <span class="p-pct">${p.duration}%</span>
        </div>
      `;
    }).join('');

    // Actions
    const transitions = OperasiCore.canTransition ? getValidActions(m.status) : [];
    const actionsHtml = transitions.map(t => `
      <button class="btn-ops ${t.className}" onclick="OperasiDashboard.transition('${m.id}','${t.status}')">
        <i class="fas ${t.icon}"></i> ${t.label}
      </button>
    `).join('');

    panel.innerHTML = `
      <div class="detail-header">
        <div class="dh-top">
          <div>
            <div class="dh-id">${m.id}</div>
            <div class="dh-title">${m.name}</div>
          </div>
          <span class="badge" style="background:${priority.color}22; color:${priority.color};">${priority.code}</span>
        </div>
        <div class="dh-badges">
          <span class="badge" style="background:${type.color}22; color:${type.color};">${type.icon} ${type.label}</span>
          <span class="badge" style="background:${status.color}22; color:${status.color};">${status.label}</span>
          <span class="badge" style="background:${classColor}22; color:${classColor};">${m.classification}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4>◤ Objective</h4>
        <div class="detail-objective">${m.objective}</div>
      </div>

      <div class="detail-section">
        <h4>◤ Location &amp; Commander</h4>
        <div class="detail-location">
          <i class="fas fa-map-marker-alt" style="color:${type.color};"></i>
          <span>${m.location.name}</span>
        </div>
        <div class="detail-location">
          <i class="fas fa-user-shield"></i>
          <span>${m.commander}</span>
        </div>
      </div>

      <div class="detail-section">
        <h4>◤ Statistics</h4>
        <div class="detail-stats-grid">
          <div class="detail-stat" style="border-left-color:${type.color};">
            <div class="val">${summary.unitCount}</div>
            <div class="lbl">Units</div>
          </div>
          <div class="detail-stat" style="border-left-color:#22c55e;">
            <div class="val">${summary.totalCrew.toLocaleString('id-ID')}</div>
            <div class="lbl">Total Crew</div>
          </div>
          <div class="detail-stat" style="border-left-color:#eab308;">
            <div class="val">${summary.avgReadiness}%</div>
            <div class="lbl">Avg Readiness</div>
          </div>
          <div class="detail-stat" style="border-left-color:#ef4444;">
            <div class="val">${summary.targetCount}</div>
            <div class="lbl">Targets</div>
          </div>
        </div>
      </div>

      <div class="detail-section">
        <h4>◤ Units (${m.units.length})</h4>
        ${unitsHtml}
      </div>

      <div class="detail-section">
        <h4>◤ Targets (${m.targets.length})</h4>
        ${targetsHtml}
      </div>

      <div class="detail-section">
        <h4>◤ Operation Phases</h4>
        <div class="phase-list">
          ${phasesHtml}
        </div>
      </div>

      <div class="detail-actions">
        ${actionsHtml}
      </div>
    `;
  }

  function getValidActions(currentStatus) {
    const transitions = {
      PLANNING:  [{ status: 'APPROVED', label: 'Approve', icon: 'fa-check', className: '' },
                  { status: 'ABORTED',  label: 'Abort',   icon: 'fa-ban',   className: 'secondary' }],
      APPROVED:  [{ status: 'EXECUTING',label: 'Execute', icon: 'fa-play',  className: '' },
                  { status: 'ABORTED',  label: 'Abort',   icon: 'fa-ban',   className: 'secondary' }],
      EXECUTING: [{ status: 'COMPLETED',label: 'Complete',icon: 'fa-flag-checkered', className: '' },
                  { status: 'ABORTED',  label: 'Abort',   icon: 'fa-ban',   className: 'secondary' }],
      COMPLETED: [],
      ABORTED:   []
    };
    return transitions[currentStatus] || [];
  }

  // ============================================
  // CORE ACTIONS
  // ============================================
  function transition(missionId, newStatus) {
    const r = OperasiCore.transitionMission(missionId, newStatus);
    if (!r.ok) {
      alert('Gagal: ' + r.reason);
      return;
    }
    renderKanban();
    renderStats();
    renderDetail(missionId);
  }

  function unassignUnit(missionId, unitId) {
    OperasiCore.unassignUnit(missionId, unitId);
    renderKanban();
    renderDetail(missionId);
  }

  function handleCoreEvent(evt) {
    console.log('[OPS-DASH] Event:', evt.type, evt);
  }

  // ============================================
  // NEW MISSION MODAL
  // ============================================
  function showNewMissionModal() {
    const modal = document.getElementById('new-mission-modal');
    const typeSelect = document.getElementById('nm-type');
    const prioritySelect = document.getElementById('nm-priority');

    typeSelect.innerHTML = Object.entries(OperasiData.MISSION_TYPES)
      .map(([k, v]) => `<option value="${k}">${v.icon} ${v.label}</option>`)
      .join('');

    prioritySelect.innerHTML = Object.entries(OperasiData.PRIORITY)
      .map(([k, v]) => `<option value="${k}">${v.code} — ${v.label}</option>`)
      .join('');

    modal.classList.add('active');
  }

  function closeNewMissionModal() {
    document.getElementById('new-mission-modal').classList.remove('active');
  }

  function submitNewMission() {
    const data = {
      name: document.getElementById('nm-name').value.trim(),
      type: document.getElementById('nm-type').value,
      priority: document.getElementById('nm-priority').value,
      classification: document.getElementById('nm-classification').value,
      objective: document.getElementById('nm-objective').value.trim(),
      commander: document.getElementById('nm-commander').value.trim(),
      location: {
        name: document.getElementById('nm-location').value.trim(),
        lat: -2.5,
        lon: 118.0
      }
    };

    if (!data.name) {
      alert('Nama mission wajib diisi');
      return;
    }

    const mission = OperasiCore.createMission(data);
    closeNewMissionModal();
    renderKanban();
    renderStats();
    selectMission(mission.id);
  }

  // ============================================
  // CONTROLS
  // ============================================
  function wireControls() {
    document.getElementById('btn-new-mission')?.addEventListener('click', showNewMissionModal);
    document.getElementById('nm-cancel')?.addEventListener('click', closeNewMissionModal);
    document.getElementById('nm-submit')?.addEventListener('click', submitNewMission);

    // Close modal on overlay click
    document.getElementById('new-mission-modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'new-mission-modal') closeNewMissionModal();
    });
  }

  function startClock() {
    setInterval(() => {
      const t = new Date().toISOString().substr(11, 8);
      const el = document.getElementById('live-clock');
      if (el) el.textContent = t;
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', init);

  return {
    transition,
    unassignUnit,
    selectMission,
    showNewMissionModal,
    closeNewMissionModal
  };
})();

if (typeof window !== 'undefined') window.OperasiDashboard = OperasiDashboard;
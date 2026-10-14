/* ============================================================
 * OPERASI-CORE.JS — Mission State Machine + Unit Assignment
 * ============================================================ */

const OperasiCore = (() => {
  'use strict';

  // ============================================
  // STATE
  // ============================================
  let missions = [];
  let listeners = [];

  // ============================================
  // INIT
  // ============================================
  function init() {
    if (!window.OperasiData) {
      console.error('[OPS-CORE] OperasiData not loaded');
      return;
    }
    missions = [...OperasiData.MISSIONS];
    console.log(`[OPS-CORE] Loaded ${missions.length} missions`);
  }

  // ============================================
  // STATE MACHINE — VALID TRANSITIONS
  // ============================================
  const VALID_TRANSITIONS = {
    PLANNING:  ['APPROVED', 'ABORTED'],
    APPROVED:  ['EXECUTING', 'ABORTED'],
    EXECUTING: ['COMPLETED', 'ABORTED'],
    COMPLETED: [],
    ABORTED:   []
  };

  function canTransition(fromStatus, toStatus) {
    return (VALID_TRANSITIONS[fromStatus] || []).includes(toStatus);
  }

  function transitionMission(missionId, newStatus) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return { ok: false, reason: 'NOT_FOUND' };

    if (!canTransition(mission.status, newStatus)) {
      return { ok: false, reason: `INVALID_TRANSITION: ${mission.status} → ${newStatus}` };
    }

    const oldStatus = mission.status;
    mission.status = newStatus;

    if (newStatus === 'EXECUTING' && !mission.actualStartDate) {
      mission.actualStartDate = Date.now();
    }
    if (newStatus === 'COMPLETED') {
      mission.actualEndDate = Date.now();
      mission.progress = 100;
    }

    notifyListeners({ type: 'STATUS_CHANGE', missionId, from: oldStatus, to: newStatus });
    console.log(`[OPS-CORE] ${missionId}: ${oldStatus} → ${newStatus}`);
    return { ok: true, from: oldStatus, to: newStatus };
  }

  // ============================================
  // UNIT ASSIGNMENT
  // ============================================
  function assignUnit(missionId, unitId) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return { ok: false, reason: 'MISSION_NOT_FOUND' };

    // Check if mission is in editable state
    if (mission.status === 'COMPLETED' || mission.status === 'ABORTED') {
      return { ok: false, reason: 'MISSION_LOCKED' };
    }

    // Check if unit exists
    const unit = OperasiData.getUnit(unitId);
    if (!unit) return { ok: false, reason: 'UNIT_NOT_FOUND' };

    // Check if unit already assigned
    if (mission.units.includes(unitId)) {
      return { ok: false, reason: 'UNIT_ALREADY_ASSIGNED' };
    }

    // Check unit readiness
    if (unit.status === 'MAINTENANCE') {
      return { ok: false, reason: 'UNIT_IN_MAINTENANCE' };
    }

    mission.units.push(unitId);
    notifyListeners({ type: 'UNIT_ASSIGNED', missionId, unitId });
    console.log(`[OPS-CORE] Assigned ${unit.name} → ${mission.name}`);
    return { ok: true };
  }

  function unassignUnit(missionId, unitId) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return { ok: false, reason: 'MISSION_NOT_FOUND' };

    if (mission.status === 'COMPLETED' || mission.status === 'ABORTED') {
      return { ok: false, reason: 'MISSION_LOCKED' };
    }

    const idx = mission.units.indexOf(unitId);
    if (idx === -1) return { ok: false, reason: 'UNIT_NOT_ASSIGNED' };

    mission.units.splice(idx, 1);
    notifyListeners({ type: 'UNIT_UNASSIGNED', missionId, unitId });
    console.log(`[OPS-CORE] Unassigned unit ${unitId} from ${mission.name}`);
    return { ok: true };
  }

  function assignTarget(missionId, targetId) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return { ok: false, reason: 'MISSION_NOT_FOUND' };

    if (mission.status === 'COMPLETED' || mission.status === 'ABORTED') {
      return { ok: false, reason: 'MISSION_LOCKED' };
    }

    const target = OperasiData.getTarget(targetId);
    if (!target) return { ok: false, reason: 'TARGET_NOT_FOUND' };

    if (mission.targets.includes(targetId)) {
      return { ok: false, reason: 'TARGET_ALREADY_ASSIGNED' };
    }

    mission.targets.push(targetId);
    notifyListeners({ type: 'TARGET_ASSIGNED', missionId, targetId });
    return { ok: true };
  }

  function unassignTarget(missionId, targetId) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return { ok: false, reason: 'MISSION_NOT_FOUND' };

    const idx = mission.targets.indexOf(targetId);
    if (idx === -1) return { ok: false, reason: 'TARGET_NOT_ASSIGNED' };

    mission.targets.splice(idx, 1);
    notifyListeners({ type: 'TARGET_UNASSIGNED', missionId, targetId });
    return { ok: true };
  }

  // ============================================
  // CREATE NEW MISSION
  // ============================================
  function createMission(data) {
    const year = new Date().getFullYear();
    const count = missions.length + 1;
    const id = `OPS-${year}-${String(count).padStart(3, '0')}`;

    const mission = {
      id,
      name: data.name || 'New Mission',
      type: data.type || 'MARITIME_DEFENSE',
      status: 'PLANNING',
      priority: data.priority || 'P3',
      classification: data.classification || 'RESTRICTED',
      location: data.location || { name: 'Unknown', lat: 0, lon: 0 },
      area: data.area || { radius: 50000, color: '#3b82f6' },
      objective: data.objective || '',
      commander: data.commander || 'TBD',
      startDate: Date.now(),
      endDate: Date.now() + 7 * 24 * 3600 * 1000,
      progress: 0,
      units: [],
      targets: [],
      phases: [
        { name: 'Planning',   status: 'IN_PROGRESS', start: 0,  duration: 30 },
        { name: 'Deployment', status: 'PENDING',     start: 30, duration: 20 },
        { name: 'Execution',  status: 'PENDING',     start: 50, duration: 40 },
        { name: 'Debrief',    status: 'PENDING',     start: 90, duration: 10 }
      ]
    };

    missions.push(mission);
    notifyListeners({ type: 'MISSION_CREATED', missionId: id });
    console.log(`[OPS-CORE] Created ${id}`);
    return mission;
  }

  // ============================================
  // PROGRESS UPDATE (auto-calculated from phases)
  // ============================================
  function updateProgress(missionId) {
    const mission = missions.find(m => m.id === missionId);
    if (!mission) return;

    const totalPhases = mission.phases.length;
    if (totalPhases === 0) return;

    const done = mission.phases.filter(p => p.status === 'DONE').length;
    const inProgress = mission.phases.filter(p => p.status === 'IN_PROGRESS').length;

    mission.progress = Math.round(((done + inProgress * 0.5) / totalPhases) * 100);
    notifyListeners({ type: 'PROGRESS_UPDATE', missionId, progress: mission.progress });
  }

  // ============================================
  // MISSION METRICS
  // ============================================
  function getMissionSummary(missionId) {
    const m = missions.find(x => x.id === missionId);
    if (!m) return null;

    const units = m.units.map(uid => OperasiData.getUnit(uid)).filter(Boolean);
    const targets = m.targets.map(tid => OperasiData.getTarget(tid)).filter(Boolean);

    return {
      mission: m,
      unitCount: units.length,
      totalCrew: units.reduce((s, u) => s + u.crew, 0),
      avgReadiness: units.length > 0
        ? Math.round(units.reduce((s, u) => s + u.readiness, 0) / units.length)
        : 0,
      targetCount: targets.length,
      byMatra: {
        ad: units.filter(u => u.matra === 'ad').length,
        al: units.filter(u => u.matra === 'al').length,
        au: units.filter(u => u.matra === 'au').length
      }
    };
  }

  // ============================================
  // LISTENERS
  // ============================================
  function onEvent(callback) {
    listeners.push(callback);
  }

  function notifyListeners(event) {
    listeners.forEach(cb => {
      try { cb(event); } catch(e) { console.warn('[OPS-CORE] Listener error:', e); }
    });
  }

  // ============================================
  // GETTERS
  // ============================================
  function getMissions() { return missions; }
  function getMission(id) { return missions.find(m => m.id === id); }
  function getStats() {
    return {
      total: missions.length,
      planning: missions.filter(m => m.status === 'PLANNING').length,
      approved: missions.filter(m => m.status === 'APPROVED').length,
      executing: missions.filter(m => m.status === 'EXECUTING').length,
      completed: missions.filter(m => m.status === 'COMPLETED').length,
      aborted: missions.filter(m => m.status === 'ABORTED').length,
      totalUnitsDeployed: missions
        .filter(m => m.status === 'EXECUTING')
        .reduce((s, m) => s + m.units.length, 0),
      totalTargetsEngaged: missions
        .filter(m => m.status === 'EXECUTING')
        .reduce((s, m) => s + m.targets.length, 0)
    };
  }

  return {
    init,
    transitionMission,
    canTransition,
    assignUnit,
    unassignUnit,
    assignTarget,
    unassignTarget,
    createMission,
    updateProgress,
    getMissionSummary,
    onEvent,
    getMissions,
    getMission,
    getStats
  };
})();

if (typeof window !== 'undefined') window.OperasiCore = OperasiCore;
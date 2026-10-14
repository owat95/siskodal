/* ============================================================
 * TERITORIAL-DASHBOARD.JS â€” UI Logic for Teritorial Dashboard
 * ============================================================ */

const TeritorialDashboard = (() => {
  'use strict';

  let kodamData = null;
  let filteredKodam = [];
  let activeRegion = 'ALL';
  let activeSearch = '';
  let selectedId = null;

  // ============================================
  // INIT
  // ============================================
  async function init() {
    console.log('[TER-DASH] Initializing...');

    // Load data
    const resp = await fetch('./data/teritorial-data.json');
    kodamData = await resp.json();
    window.TERITORIAL_DATA = kodamData;

    // Init Cesium first
    if (typeof initCesium === 'function') {
      await initCesium();
    }

    // Set camera to NKRI
    const viewer = window.CesiumApp.getViewer();
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(118.0, -2.5, 5000000),
      orientation: {
        heading: 0,
        pitch: Cesium.Math.toRadians(-90),
        roll: 0
      }
    });

    // Hide Cesium credits
    const credits = document.querySelector('.cesium-widget-credits');
    if (credits) credits.style.display = 'none';

    // Init Viz
    await TeritorialViz.init({
      onSelect: (kodamId) => {
        selectedId = kodamId;
        renderKodamList();
        if (kodamId) showDetail(kodamId);
        else hideDetail();
      }
    });

    // Render UI
    renderStats();
    renderRegionFilter();
    applyFilters();
    wireControls();

    console.log('[TER-DASH] Ready');
  }

  // ============================================
  // STATS
  // ============================================
  function renderStats() {
    const totalKodam = kodamData.kodam.length;
    const totalPersonel = kodamData.kodam.reduce((s, k) => s + k.personnel, 0);
    const totalKorem = kodamData.kodam.reduce((s, k) => s + k.korem.length, 0);

    document.getElementById('stat-kodam').textContent = totalKodam;
    document.getElementById('stat-personel').textContent =
      totalPersonel >= 1000 ? `${Math.round(totalPersonel / 1000)}K` : totalPersonel;
    document.getElementById('stat-korem').textContent = totalKorem;
  }

  // ============================================
  // REGION FILTER
  // ============================================
  function renderRegionFilter() {
    const container = document.getElementById('region-filter');
    if (!container) return;

    const regions = Object.entries(kodamData.regions);

    // ALL chip
    const allChip = document.createElement('button');
    allChip.className = 'region-chip active';
    allChip.textContent = 'ALL';
    allChip.style.borderColor = '#94a3b8';
    allChip.style.background = 'rgba(148,163,184,0.2)';
    allChip.style.color = '#e2e8f0';
    allChip.addEventListener('click', () => setRegion('ALL'));
    container.appendChild(allChip);

    regions.forEach(([code, region]) => {
      const chip = document.createElement('button');
      chip.className = 'region-chip';
      chip.textContent = code;
      chip.style.borderColor = region.color + '80';
      chip.style.color = region.accent;
      chip.dataset.region = code;
      chip.addEventListener('click', () => setRegion(code));
      container.appendChild(chip);
    });
  }

  function setRegion(region) {
    activeRegion = region;

    document.querySelectorAll('.region-chip').forEach(chip => {
      const isAll = chip.textContent === 'ALL';
      const match = isAll ? region === 'ALL' : chip.dataset.region === region;
      chip.classList.toggle('active', match);

      if (match) {
        if (isAll) {
          chip.style.background = 'rgba(148,163,184,0.2)';
        } else {
          const r = kodamData.regions[chip.dataset.region];
          chip.style.background = r.color + '40';
        }
      } else {
        chip.style.background = 'transparent';
      }
    });

    applyFilters();
  }

  // ============================================
  // FILTERS
  // ============================================
  function applyFilters() {
    filteredKodam = kodamData.kodam.filter(k => {
      if (activeRegion !== 'ALL' && k.region !== activeRegion) return false;
      if (activeSearch) {
        const q = activeSearch.toLowerCase();
        const hay = (k.name + ' ' + k.shortName + ' ' + k.code + ' ' + k.hq).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    renderKodamList();
  }

  // ============================================
  // RENDER KODAM LIST
  // ============================================
  function renderKodamList() {
    const container = document.getElementById('kodam-list');
    if (!container) return;

    container.innerHTML = '';

    filteredKodam.sort((a, b) => a.order - b.order).forEach(kodam => {
      const region = kodamData.regions[kodam.region];
      const isActive = selectedId === kodam.id;

      const item = document.createElement('div');
      item.className = 'kodam-item' + (isActive ? ' active' : '');
      item.style.borderLeftColor = region.accent;

      let badge = '';
      if (kodam.isNew) {
        const cls = kodam.formedYear === 2026 ? 'new-2026' : 'new-2025';
        badge = `<span class="ki-badge ${cls}">NEW ${kodam.formedYear}</span>`;
      }

      const readinessColor = kodam.readiness >= 85 ? '#4ade80'
                           : kodam.readiness >= 75 ? '#facc15'
                           : '#f87171';

      item.innerHTML = `
        <div class="ki-head">
          <div style="flex:1; min-width:0;">
            <div class="ki-name">${kodam.shortName}</div>
            <div class="ki-code">${kodam.code} Â· ${kodam.hq}</div>
          </div>
          ${badge}
        </div>
        <div class="ki-meta">
          <span>ðŸ‘¥ ${kodam.personnel.toLocaleString('id-ID')}</span>
          <span>ðŸŽ¯ ${kodam.assets}</span>
          <span>â—ˆ ${kodam.korem.length} Korem</span>
        </div>
        <div class="ki-readiness">
          <span style="min-width:80px;">Readiness</span>
          <div class="ki-readiness-bar">
            <div class="ki-readiness-fill" style="width:${kodam.readiness}%; background:${readinessColor};"></div>
          </div>
          <span style="color:${readinessColor}; font-weight:700;">${kodam.readiness}%</span>
        </div>
      `;

      item.addEventListener('click', () => {
        TeritorialViz.flyToKodam(kodam.id);
      });

      container.appendChild(item);
    });

    if (filteredKodam.length === 0) {
      container.innerHTML = '<div style="padding:20px;text-align:center;color:#64748b;font-size:0.8rem;">Tidak ada Kodam</div>';
    }
  }

  // ============================================
  // DETAIL PANEL
  // ============================================
  function showDetail(kodamId) {
    const kodam = kodamData.kodam.find(k => k.id === kodamId);
    if (!kodam) return;

    const region = kodamData.regions[kodam.region];
    const panel = document.getElementById('kodam-detail');

    const readinessColor = kodam.readiness >= 85 ? '#4ade80'
                         : kodam.readiness >= 75 ? '#facc15'
                         : '#f87171';

    const koremHtml = kodam.korem.length > 0
      ? kodam.korem.map(k => `
          <li style="border-left-color:${region.accent};">
            <div class="korem-code" style="color:${region.accent};">${k.code}</div>
            <div class="korem-name">${k.name}</div>
            <div class="korem-hq"><i class="fas fa-map-marker-alt"></i> ${k.hq}</div>
          </li>
        `).join('')
      : '<div style="padding:12px;color:#64748b;font-size:0.75rem;text-align:center;">Kodam baru â€” Korem belum terbentuk</div>';

    const provinceChips = kodam.provinces.map(p =>
      `<span class="dp-province-chip">${p}</span>`
    ).join('');

    panel.innerHTML = `
      <button class="dp-close" onclick="TeritorialDashboard.closeDetail()">âœ•</button>

      <div class="dp-header" style="--accent:${region.accent};">
        <div class="dp-region-badge" style="background:${region.color}22; color:${region.accent}; border:1px solid ${region.color}55;">
          ${region.label}
        </div>
        <div class="dp-title">${kodam.name}</div>
        <div class="dp-code">${kodam.code} Â· ORDER ${kodam.order}</div>
        <div class="dp-hq"><i class="fas fa-map-marker-alt"></i> ${kodam.hq}</div>
        <div class="dp-panglima"><i class="fas fa-user-shield"></i> ${kodam.panglima}</div>
        ${kodam.isNew ? `<div style="margin-top:8px;"><span class="ki-badge ${kodam.formedYear === 2026 ? 'new-2026' : 'new-2025'}">KODAM BARU ${kodam.formedYear}</span></div>` : ''}
      </div>

      <div class="dp-section">
        <div class="dp-section-title">â—¤ Statistik</div>
        <div class="dp-stats-grid">
          <div class="dp-stat" style="border-left-color:${region.accent};">
            <div class="value">${kodam.personnel.toLocaleString('id-ID')}</div>
            <div class="label">Personel</div>
          </div>
          <div class="dp-stat" style="border-left-color:${region.accent};">
            <div class="value">${kodam.assets}</div>
            <div class="label">Alutsista</div>
          </div>
          <div class="dp-stat" style="border-left-color:${readinessColor};">
            <div class="value" style="color:${readinessColor};">${kodam.readiness}%</div>
            <div class="label">Readiness</div>
          </div>
          <div class="dp-stat" style="border-left-color:${region.accent};">
            <div class="value">${kodam.korem.length}</div>
            <div class="label">Korem</div>
          </div>
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">â—¤ Hierarki</div>
        <div class="dp-hierarchy">
          <div class="dp-hierarchy-row">
            <span class="label">Korem</span>
            <span class="value">${kodam.korem.length}</span>
          </div>
          <div class="dp-hierarchy-row">
            <span class="label">Kodim</span>
            <span class="value">${kodam.kodimCount}</span>
          </div>
          <div class="dp-hierarchy-row">
            <span class="label">Koramil</span>
            <span class="value">${kodam.koramilCount}</span>
          </div>
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">â—¤ Wilayah (${kodam.provinces.length} Provinsi)</div>
        <div class="dp-provinces-list">
          ${provinceChips}
        </div>
      </div>

      <div class="dp-section">
        <div class="dp-section-title">â—¤ Korem (${kodam.korem.length})</div>
        <ul class="dp-korem-list">
          ${koremHtml}
        </ul>
      </div>

      <div class="dp-actions">
        <a href="./dashboard-ad.html" class="dp-action-btn primary">
          <i class="fas fa-users"></i> Lihat Personel
        </a>
        <a href="./dashboard-logistik-ad.html" class="dp-action-btn secondary">
          <i class="fas fa-boxes"></i> Logistik
        </a>
      </div>
    `;

    panel.classList.add('open');
  }

  function hideDetail() {
    document.getElementById('kodam-detail').classList.remove('open');
  }

  function closeDetail() {
    hideDetail();
    TeritorialViz.deselectAll();
    selectedId = null;
    renderKodamList();
  }

  // ============================================
  // CONTROLS
  // ============================================
  function wireControls() {
    document.getElementById('search-kodam').addEventListener('input', (e) => {
      activeSearch = e.target.value.trim();
      applyFilters();
    });

    ['layer-polygons', 'layer-hq', 'layer-korem'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', (e) => {
          const layerName = id.replace('layer-', '');
          TeritorialViz.setLayerVisibility(layerName, e.target.checked);
        });
      }
    });
  }

  // ============================================
  // BOOT
  // ============================================
  window.addEventListener('DOMContentLoaded', init);

  return {
    closeDetail,
    setRegion,
    showDetail
  };
})();

if (typeof window !== 'undefined') window.TeritorialDashboard = TeritorialDashboard;
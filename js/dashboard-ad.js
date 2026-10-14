/* ============================================================
 * DASHBOARD-AD.JS â€” TNI Angkatan Darat
 * ============================================================ */

const DashboardAD = (() => {
  'use strict';

  const MATRA = 'ad';
  let personnel = [];
  let filtered = [];
  let selectedId = null;
  let activeTab = 'overview';

  function init() {
    if (!window.PersonnelData || !window.KPIEngine || !window.SuccessionAI) {
      console.error('[AD] Missing dependencies');
      return;
    }

    personnel = PersonnelData.get(MATRA);
    filtered = [...personnel];

    renderOverview();
    renderSuccession('overview-succession', 3);
    renderSuccession('succession-grid');
    renderPersonnelTable();
    renderProvinceGrid();
    renderEducationStats();
    renderIntlMissions();
    renderKPIAnalytics();
    wireControls();
    wireTabs();
    startClock();

    console.log(`[AD] Dashboard initialized â€” ${personnel.length} personnel`);
  }

  function renderOverview() {
    const total = personnel.length;
    const avgKpi = personnel.reduce((sum, p) =>
      sum + KPIEngine.computeComposite(p.kpi), 0) / total;
    const readyCount = personnel.filter(p => {
      const a = KPIEngine.assessPromotion(p, MATRA);
      return a && a.status === 'READY';
    }).length;
    const openPositions = PersonnelData.OPEN_POSITIONS[MATRA].length;
    const highEdu = personnel.filter(p =>
      p.education.some(e => ['SESKOAD','SESKOTNI','LEMHANNAS'].includes(e.code))
    ).length;
    const intlExp = personnel.filter(p => p.intlAssignments.length > 0).length;

    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-kpi').textContent = avgKpi.toFixed(1);
    document.getElementById('stat-ready').textContent = readyCount;
    document.getElementById('stat-open').textContent = openPositions;
    document.getElementById('stat-edu').textContent = highEdu;
    document.getElementById('stat-intl').textContent = intlExp;
  }

  function renderSuccession(containerId, limit = null) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const positions = PersonnelData.OPEN_POSITIONS[MATRA] || [];
    const list = limit ? positions.slice(0, limit) : positions;

    container.innerHTML = list.map(pos => {
      const candidates = SuccessionAI.recommendForPosition(pos, MATRA, 3);
      const rows = candidates.map((c, idx) => `
        <div class="candidate-row" onclick="DashboardAD.selectPersonnel('${c.person.id}')">
          <div class="candidate-rank">${idx + 1}</div>
          <div class="candidate-info">
            <div class="candidate-name">${c.person.name}</div>
            <div class="candidate-meta">
              ${KPIEngine.getRankName(MATRA, c.person.rank)} Â· ${c.person.specialty}
            </div>
          </div>
          <div class="candidate-score">${c.score.total}</div>
        </div>
      `).join('');

      return `
        <div class="position-card">
          <div class="position-header">
            <div>
              <div class="position-title">${pos.position}</div>
              <div class="position-province"><i class="fas fa-map-marker-alt"></i> ${pos.province}</div>
            </div>
            <span class="ai-badge high"><i class="fas fa-brain"></i> AI</span>
          </div>
          <div class="position-reason">
            <strong>${pos.currentHolder}</strong> â€” ${pos.reason}
          </div>
          <div style="font-size:0.7rem;color:#64748b;margin-bottom:8px;font-family:monospace;">
            Kebutuhan: ${KPIEngine.getRankName(MATRA, pos.neededRank)} Â· Min KPI: ${pos.minKpi}
          </div>
          ${rows}
        </div>
      `;
    }).join('');
  }

  function renderPersonnelTable() {
    const tbody = document.getElementById('personnel-tbody');
    tbody.innerHTML = '';

    filtered.forEach(p => {
      const composite = KPIEngine.computeComposite(p.kpi);
      const kpiClass = composite >= 90 ? 'excellent'
                     : composite >= 75 ? 'good'
                     : composite >= 60 ? 'fair' : 'poor';

      const eduBadges = p.education.slice(0, 2).map(e =>
        `<span class="edu-badge">${e.code}</span>`
      ).join('');
      const eduMore = p.education.length > 2
        ? `<span class="edu-badge" style="background:rgba(100,116,139,0.2);color:#94a3b8;">+${p.education.length - 2}</span>`
        : '';

      const ai = SuccessionAI.generateAIText(p, MATRA);
      const aiHtml = ai.priority === 'LOW'
        ? `<span style="font-size:0.7rem;color:#64748b;">â€”</span>`
        : `<div class="ai-recommendation">
             <span class="ai-badge ${ai.priority.toLowerCase()}">
               <i class="fas fa-brain"></i> ${ai.priority} ${ai.score ? 'Â· ' + ai.score : ''}
             </span>
             <span class="ai-text">${ai.text}</span>
           </div>`;

      const tr = document.createElement('tr');
      tr.dataset.id = p.id;
      if (p.id === selectedId) tr.classList.add('active');

      tr.innerHTML = `
        <td class="mono" style="font-size:0.75rem;">${p.nrp}</td>
        <td><strong>${p.name}</strong></td>
        <td style="font-size:0.8rem;">${KPIEngine.getRankName(MATRA, p.rank)}</td>
        <td style="font-size:0.8rem;">${p.unit}</td>
        <td><span style="color:#4ade80;font-family:monospace;font-size:0.72rem;">${p.specialty}</span></td>
        <td><span class="province-tag">${p.province}</span></td>
        <td>${eduBadges}${eduMore}</td>
        <td><span class="kpi-badge ${kpiClass}">${composite.toFixed(0)}</span></td>
        <td class="ai-cell">${aiHtml}</td>
      `;

      tr.addEventListener('click', () => selectPersonnel(p.id));
      tbody.appendChild(tr);
    });

    document.getElementById('personnel-count').textContent =
      `${filtered.length} / ${personnel.length}`;
  }

  function renderProvinceGrid() {
    const grid = document.getElementById('province-grid');
    if (!grid) return;
    const byProvince = {};
    personnel.forEach(p => byProvince[p.province] = (byProvince[p.province] || 0) + 1);
    const sorted = Object.entries(byProvince).sort((a, b) => b[1] - a[1]);
    grid.innerHTML = sorted.map(([prov, count]) => `
      <div class="overview-card" style="--accent:#059669;">
        <div class="label">${prov}</div>
        <div class="value">${count}</div>
        <div class="meta">personel ditugaskan</div>
      </div>
    `).join('');
  }

  function renderEducationStats() {
    const container = document.getElementById('edu-stats-grid');
    if (!container) return;
    const eduCount = {};
    personnel.forEach(p => p.education.forEach(e => {
      eduCount[e.code] = (eduCount[e.code] || 0) + 1;
    }));

    const eduNames = {
      'AKMIL': 'Akademi Militer',
      'SUSJAB': 'Kursus Jabatan',
      'SELAPA': 'Sekolah Lanjutan Perwira',
      'SESKOAD': 'Sekolah Staf Komando AD',
      'SESKOTNI': 'Sekolah Staf Komando TNI',
      'LEMHANNAS': 'Lemhannas RI',
      'SUSPA_INTEL': 'Suspa Intelijen',
      'SUSPA_KAV': 'Suspa Kavaleri',
      'SUSPA_ART': 'Suspa Artileri',
      'SUSPA_KOPASSUS': 'Komando Pasukan Khusus'
    };

    const sorted = Object.entries(eduCount).sort((a, b) => b[1] - a[1]);
    container.innerHTML = sorted.map(([code, count]) => `
      <div class="overview-card" style="--accent:#a855f7;">
        <div class="label">${code}</div>
        <div class="value">${count}</div>
        <div class="meta">${eduNames[code] || code}</div>
      </div>
    `).join('');
  }

  function renderIntlMissions() {
    const container = document.getElementById('intl-missions-list');
    if (!container) return;
    const withIntl = personnel.filter(p => p.intlAssignments.length > 0);

    if (withIntl.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;">Tidak ada personel dengan penugasan internasional.</p>';
      return;
    }

    const rows = withIntl.map(p => {
      const missions = p.intlAssignments.map(a => `
        <span class="intl-badge ${a.code.startsWith('MONUSCO') || a.code.startsWith('UN') || a.code.startsWith('DPKO') || a.code.startsWith('MINUSMA') ? 'pbb' : ''}">
          ${a.code} Â· ${a.location} (${a.startYear}â€“${a.endYear})
        </span>
      `).join(' ');

      return `
        <tr onclick="DashboardAD.selectPersonnel('${p.id}')" style="cursor:pointer;">
          <td class="mono" style="font-size:0.75rem;">${p.nrp}</td>
          <td><strong>${p.name}</strong></td>
          <td style="font-size:0.8rem;">${KPIEngine.getRankName(MATRA, p.rank)}</td>
          <td style="font-size:0.8rem;">${p.unit}</td>
          <td>${missions}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead><tr>
          <th>NRP</th><th>Nama</th><th>Pangkat</th><th>Unit</th><th>Misi Internasional</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
    `;
  }

  function renderKPIAnalytics() {
    const container = document.getElementById('kpi-analytics');
    if (!container) return;
    const composite = personnel.map(p => KPIEngine.computeComposite(p.kpi));
    const avg = composite.reduce((a, b) => a + b, 0) / composite.length;
    const max = Math.max(...composite);
    const min = Math.min(...composite);
    const top = personnel
      .map(p => ({ p, score: KPIEngine.computeComposite(p.kpi) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    container.innerHTML = `
      <div class="overview-grid" style="margin-bottom:20px;">
        <div class="overview-card" style="--accent:#22c55e;">
          <div class="label">Composite Avg</div>
          <div class="value">${avg.toFixed(1)}</div>
        </div>
        <div class="overview-card" style="--accent:#4ade80;">
          <div class="label">Tertinggi</div>
          <div class="value">${max.toFixed(1)}</div>
        </div>
        <div class="overview-card" style="--accent:#f87171;">
          <div class="label">Terendah</div>
          <div class="value">${min.toFixed(1)}</div>
        </div>
      </div>
      <h4 style="font-size:0.8rem;letter-spacing:1.5px;color:#cbd5e1;margin-bottom:12px;text-transform:uppercase;">
        Top 10 Performers
      </h4>
      <table class="data-table">
        <thead><tr>
          <th>#</th><th>Nama</th><th>Pangkat</th><th>Unit</th><th>KPI</th>
        </tr></thead>
        <tbody>
          ${top.map(({p, score}, idx) => `
            <tr onclick="DashboardAD.selectPersonnel('${p.id}')" style="cursor:pointer;">
              <td class="mono">${idx + 1}</td>
              <td><strong>${p.name}</strong></td>
              <td style="font-size:0.8rem;">${KPIEngine.getRankName(MATRA, p.rank)}</td>
              <td style="font-size:0.8rem;">${p.unit}</td>
              <td><span class="kpi-badge ${score >= 90 ? 'excellent' : score >= 75 ? 'good' : 'fair'}">${score.toFixed(1)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  function selectPersonnel(id) {
    selectedId = id;
    const p = personnel.find(x => x.id === id);
    if (!p) return;

    document.querySelectorAll('#personnel-tbody tr').forEach(tr => {
      tr.classList.toggle('active', tr.dataset.id === id);
    });

    const detail = document.getElementById('detail-panel');
    const promotion = KPIEngine.assessPromotion(p, MATRA);
    const composite = KPIEngine.computeComposite(p.kpi);

    const eduHtml = p.education.length > 0
      ? p.education.map(e => `
          <div style="padding:6px 10px;background:rgba(168,85,247,0.1);border-left:2px solid #a855f7;border-radius:0 6px 6px 0;margin-bottom:4px;">
            <div style="font-size:0.75rem;color:#c084fc;font-weight:700;">${e.code}</div>
            <div style="font-size:0.7rem;color:#94a3b8;">${e.name} â€” Tier ${e.tier}</div>
          </div>
        `).join('')
      : '<p style="color:#64748b;font-size:0.75rem;">Tidak ada data pendidikan</p>';

    const intlHtml = p.intlAssignments.length > 0
      ? p.intlAssignments.map(a => `
          <div style="padding:6px 10px;background:rgba(6,182,212,0.1);border-left:2px solid #06b6d4;border-radius:0 6px 6px 0;margin-bottom:4px;">
            <div style="font-size:0.75rem;color:#22d3ee;font-weight:700;">${a.mission}</div>
            <div style="font-size:0.7rem;color:#94a3b8;">${a.role} Â· ${a.location}</div>
            <div style="font-size:0.65rem;color:#64748b;font-family:monospace;">${a.startYear}â€“${a.endYear} (${a.years} tahun)</div>
          </div>
        `).join('')
      : '<p style="color:#64748b;font-size:0.75rem;">Tidak ada penugasan internasional</p>';

    const ai = SuccessionAI.generateAIText(p, MATRA);
    const aiHtml = ai.priority !== 'LOW'
      ? `<div class="ai-recommendation" style="margin-top:8px;">
           <span class="ai-badge ${ai.priority.toLowerCase()}">
             <i class="fas fa-brain"></i> ${ai.priority} Â· ${ai.score}
           </span>
           <span class="ai-text">${ai.text}</span>
         </div>`
      : '<p style="color:#64748b;font-size:0.75rem;">Tidak ada rekomendasi saat ini</p>';

    detail.innerHTML = `
      <button class="close-btn" onclick="DashboardAD.closeDetail()">âœ•</button>
      <div class="detail-header">
        <h2>${p.name}</h2>
        <div class="rank-name">${KPIEngine.getRankName(MATRA, p.rank)}</div>
        <div class="meta">NRP: ${p.nrp} Â· ${p.unit}</div>
        <div style="margin-top:8px;">
          <span class="province-tag">${p.province}</span>
          <span style="margin-left:8px;font-size:0.72rem;color:#4ade80;font-family:monospace;">${p.specialty}</span>
        </div>
      </div>

      <h4 class="detail-section-title">KPI BREAKDOWN</h4>
      ${renderKPIRow('Skill', p.kpi.skill)}
      ${renderKPIRow('Fitness', p.kpi.fitness)}
      ${renderKPIRow('Leadership', p.kpi.leadership)}
      ${renderKPIRow('Discipline', p.kpi.discipline)}
      ${renderKPIRow('Operations', p.kpi.ops)}
      <div class="kpi-row" style="border-top:1px solid rgba(51,65,85,0.5);margin-top:8px;padding-top:12px;">
        <span class="kpi-label"><strong>COMPOSITE</strong></span>
        <span class="kpi-value" style="font-size:1.2rem;color:${getCompositeColor(composite)};">${composite.toFixed(1)}</span>
      </div>

      <h4 class="detail-section-title" style="margin-top:20px;">PENDIDIKAN MILITER</h4>
      ${eduHtml}

      <h4 class="detail-section-title" style="margin-top:20px;">PENUGASAN INTERNASIONAL</h4>
      ${intlHtml}

      <h4 class="detail-section-title" style="margin-top:20px;">AI RECOMMENDATION</h4>
      ${aiHtml}

      <div class="promotion-block ${getPromotionClass(promotion.status)}" style="margin-top:20px;">
        <h4>â—¤ PROMOTION READINESS</h4>
        <div class="readiness-meter">${promotion.readiness}%</div>
        <div class="next-rank">
          ${promotion.nextRank ? `Next: ${promotion.nextRank.name}` : 'Pangkat tertinggi'}
        </div>
        <div style="font-size:0.75rem;color:#94a3b8;margin-top:8px;line-height:1.5;">
          ${promotion.recommendation}
        </div>
        <div style="font-size:0.7rem;color:#64748b;margin-top:8px;font-family:monospace;">
          Years in rank: ${promotion.yearsInRank} / ${promotion.minYearsRequired}<br>
          Time: ${promotion.timeOK ? 'âœ“' : 'âœ—'} Â·
          KPI: ${promotion.kpiOK ? 'âœ“' : 'âœ—'} Â·
          Discipline: ${promotion.noViolations ? 'âœ“' : 'âœ—'}
        </div>
      </div>

      <div style="margin-top:16px;font-size:0.75rem;color:#64748b;line-height:1.8;">
        <div>Awards: <span style="color:#facc15;">${p.awards} â˜…</span></div>
        <div>Violations: <span style="color:${p.violations > 0 ? '#f87171' : '#4ade80'};">
          ${p.violations}${p.violations > 0 ? ' âš ' : ' âœ“'}</span></div>
        <div>Est. Pensiun: <span style="color:#cbd5e1;">${p.yearsToRetirement} tahun</span></div>
      </div>
    `;

    detail.classList.add('open');
  }

  function renderKPIRow(label, value) {
    const color = value >= 85 ? '#4ade80' : value >= 70 ? '#60a5fa' : value >= 55 ? '#facc15' : '#f87171';
    return `
      <div class="kpi-row">
        <span class="kpi-label">${label}</span>
        <span class="kpi-value" style="color:${color};">${value}</span>
      </div>
      <div class="progress"><div class="progress-fill" style="width:${value}%;"></div></div>
    `;
  }

  function getCompositeColor(c) {
    return c >= 90 ? '#4ade80' : c >= 75 ? '#60a5fa' : c >= 60 ? '#facc15' : '#f87171';
  }

  function getPromotionClass(s) {
    if (s === 'READY') return '';
    if (s === 'PENDING') return 'pending';
    return 'not-ready';
  }

  function closeDetail() {
    document.getElementById('detail-panel').classList.remove('open');
    selectedId = null;
    document.querySelectorAll('#personnel-tbody tr').forEach(tr => tr.classList.remove('active'));
  }

  function applyFilters() {
    const search = document.getElementById('filter-search').value.toLowerCase().trim();
    const rankF = document.getElementById('filter-rank').value;
    const unitF = document.getElementById('filter-unit').value;
    const specF = document.getElementById('filter-specialty').value;
    const provF = document.getElementById('filter-province').value;

    filtered = personnel.filter(p => {
      if (search && !p.name.toLowerCase().includes(search) && !p.nrp.includes(search)) return false;
      if (rankF && p.rank !== rankF) return false;
      if (unitF && p.unit !== unitF) return false;
      if (specF && p.specialty !== specF) return false;
      if (provF && p.province !== provF) return false;
      return true;
    });
    renderPersonnelTable();
  }

  function wireControls() {
    const rankSel = document.getElementById('filter-rank');
    PersonnelData.RANKS[MATRA].forEach(r => {
      const o = document.createElement('option');
      o.value = r; o.textContent = KPIEngine.getRankName(MATRA, r);
      rankSel.appendChild(o);
    });

    const unitSel = document.getElementById('filter-unit');
    PersonnelData.UNITS[MATRA].forEach(u => {
      const o = document.createElement('option');
      o.value = u; o.textContent = u;
      unitSel.appendChild(o);
    });

    const specSel = document.getElementById('filter-specialty');
    PersonnelData.SPECIALTIES[MATRA].forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      specSel.appendChild(o);
    });

    const provSel = document.getElementById('filter-province');
    PersonnelData.PROVINCES.forEach(p => {
      const o = document.createElement('option');
      o.value = p; o.textContent = p;
      provSel.appendChild(o);
    });

    ['filter-search', 'filter-rank', 'filter-unit', 'filter-specialty', 'filter-province']
      .forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener(id === 'filter-search' ? 'input' : 'change', applyFilters);
      });

    document.getElementById('filter-reset').addEventListener('click', () => {
      ['filter-search', 'filter-rank', 'filter-unit', 'filter-specialty', 'filter-province']
        .forEach(id => document.getElementById(id).value = '');
      applyFilters();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeDetail();
    });
  }

  function wireTabs() {
    document.querySelectorAll('.nav-item[data-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        switchTab(el.dataset.tab);
      });
    });
  }

  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.toggle('active', el.id === `tab-${tab}`);
    });
    document.querySelectorAll('.nav-item[data-tab]').forEach(el => {
      el.classList.toggle('active', el.dataset.tab === tab);
    });
    const subtitle = document.getElementById('page-subtitle');
    const titles = {
      overview: 'Personnel & KPI Operations Center',
      personnel: 'Database Personel Lengkap',
      province: 'Distribusi Personel per Provinsi',
      education: 'Riwayat Pendidikan Militer',
      international: 'Penugasan Internasional',
      succession: 'Succession Planning â€” AI Recommendation',
      kpi: 'KPI Analytics & Top Performers',
      assets: 'Aset Darat â€” Batalyon & Kodam',
      reports: 'Laporan & Export'
    };
    if (subtitle) subtitle.textContent = titles[tab] || '';
  }

  function startClock() {
    setInterval(() => {
      const t = new Date().toISOString().substr(11, 8);
      const el = document.getElementById('live-clock');
      if (el) el.textContent = t;
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', init);

  return { closeDetail, selectPersonnel, switchTab };
})();
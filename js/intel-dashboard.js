/* ============================================================
 * INTEL-DASHBOARD.JS — Strategic Intelligence UI
 * ============================================================ */

const IntelDashboard = (() => {
  'use strict';

  let activeTab = 'overview';
  let activeSourceFilter = 'ALL';
  let chartThreatMatrix = null;
  let chartAdmiralty = null;

  // ============================================
  // INIT
  // ============================================
  function init() {
    if (!window.IntelData || !window.IntelCore) {
      console.error('[INTEL-DASH] Dependencies missing');
      return;
    }

    renderStats();
    renderOSINTFeed();
    renderOverviewRecent();
    updateBadges();
    renderCountries();
    renderThreatMatrix();
    renderSources();
    renderOverviewCharts();
    wireTabs();
    wireControls();
    startClock();

    console.log('[INTEL-DASH] Ready');
  }

  // ============================================
  // STATS
  // ============================================
  function renderStats() {
    const stats = IntelData.getStats();
    const coreStats = IntelCore.getStats();

    const container = document.getElementById('intel-stats');
    if (!container) return;

    const statList = [
      { color: '#22d3ee', value: stats.totalIntel,   label: 'Total Intel',    meta: 'All sources' },
      { color: '#4ade80', value: stats.verified,     label: 'Verified',       meta: 'Analyst confirmed' },
      { color: '#facc15', value: stats.pending,      label: 'Pending',        meta: 'Awaiting review' },
      { color: '#94a3b8', value: stats.dismissed,    label: 'Dismissed',      meta: 'False positive' },
      { color: '#ef4444', value: stats.criticalThreats, label: 'Critical',    meta: 'Threat matrix' },
      { color: '#a855f7', value: coreStats.avgAccuracy + '%', label: 'Source Accuracy', meta: coreStats.totalSources + ' sources' }
    ];

    container.innerHTML = statList.map(s => `
      <div class="intel-stat" style="border-left-color:${s.color};">
        <div class="label">${s.label}</div>
        <div class="value" style="color:${s.color};">${s.value}</div>
        <div class="meta">${s.meta}</div>
      </div>
    `).join('');
  }

  // ============================================
  // OSINT FEED
  // ============================================
  function renderOSINTFeed() {
    const tbody = document.getElementById('intel-tbody');
    if (!tbody) return;

    const feed = [...IntelData.OSINT_FEED].sort((a, b) => b.timestamp - a.timestamp);

    tbody.innerHTML = feed.map(intel => {
      const adm = IntelData.getAdmiralty(intel.admiralty[0], parseInt(intel.admiralty[1]));
      const score = IntelCore.computeIntelScore(intel);
      const country = IntelData.getCountry(intel.country);

      const classColors = {
        UNCLASS: '#22c55e', RESTRICTED: '#eab308', CONFIDENTIAL: '#f97316',
        SECRET: '#ef4444', TOP_SECRET: '#991b1b'
      };
      const classColor = classColors[intel.classification] || '#64748b';

      const actions = intel.status === 'PENDING'
        ? `<button class="action-btn verify" onclick="IntelDashboard.verifyIntel('${intel.id}')">✓ Verify</button>
           <button class="action-btn dismiss" onclick="IntelDashboard.dismissIntel('${intel.id}')">✗ Dismiss</button>`
        : `<span style="font-size:0.7rem; color:#64748b;">${intel.status}</span>`;

      return `
        <tr>
          <td class="intel-id">${intel.id}</td>
          <td>
            <span class="admiralty-badge" style="background:${score.color}22; color:${score.color}; border:1px solid ${score.color}55;" title="${adm.reliability.label} · ${adm.accuracy.label}">
              <span class="ab-rel">${adm.reliability.code}</span>
              <span class="ab-slash">/</span>
              <span class="ab-acc">${adm.accuracy.code}</span>
            </span>
          </td>
          <td>
            <div class="intel-title">${intel.title}</div>
            <div class="intel-content">${intel.content}</div>
          </td>
          <td>
            <div style="font-size:0.7rem; color:#22d3ee; font-weight:700;">${intel.sourceType}</div>
            <div style="font-size:0.65rem; color:#64748b;">${intel.source}</div>
          </td>
          <td>
            <span style="font-size:0.75rem;">${country ? country.flag + ' ' + country.name : intel.country}</span>
          </td>
          <td>
            <span class="status-badge ${intel.status.toLowerCase()}">${intel.status}</span>
          </td>
          <td style="font-family:'Courier New',monospace; font-size:0.7rem; color:#64748b;">
            ${new Date(intel.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
          </td>
          <td style="text-align:right;">${actions}</td>
        </tr>
      `;
    }).join('');
  }

  // ============================================
  // COUNTRY PROFILES
  // ============================================
  function renderCountries() {
    const container = document.getElementById('country-grid');
    if (!container) return;

    const threatColors = {
      HIGH: '#ef4444',
      MEDIUM: '#f97316',
      LOW: '#22c55e'
    };

    container.innerHTML = IntelData.COUNTRIES.map(c => {
      const threatColor = threatColors[c.threatLevel] || '#64748b';

      const activityHtml = c.recentActivity.slice(0, 2).map(a => {
        const adm = IntelData.getAdmiralty(a.admiralty[0], parseInt(a.admiralty[1]));
        return `
          <div class="cc-activity" style="border-left-color:${adm.reliability.color};">
            <div class="act-head">
              <span class="act-type" style="color:${adm.reliability.color};">${a.type}</span>
              <span class="act-date">${a.date}</span>
            </div>
            <div class="act-desc">${a.desc}</div>
          </div>
        `;
      }).join('');

      return `
        <div class="country-card" style="border-left-color:${c.color};">
          <div class="cc-head">
            <div class="cc-flag">${c.flag}</div>
            <div>
              <div class="cc-name">${c.name}</div>
              <div class="cc-region">${c.region}</div>
            </div>
            <span class="cc-threat" style="background:${threatColor}22; color:${threatColor}; border:1px solid ${threatColor}55;">
              ${c.threatLevel}
            </span>
          </div>

          <div class="cc-summary">${c.summary}</div>

          <div class="cc-section-title">Capabilities</div>
          <ul class="cc-capabilities">
            ${c.capabilities.slice(0, 3).map(cap => `<li>${cap}</li>`).join('')}
          </ul>

          <div class="cc-section-title">Recent Activity</div>
          ${activityHtml}

          <div class="cc-metrics">
            <div class="cc-metric">
              <div class="m-val" style="color:${c.metrics.maritimeIncursions > 10 ? '#ef4444' : '#cbd5e1'};">${c.metrics.maritimeIncursions}</div>
              <div class="m-lbl">Maritime</div>
            </div>
            <div class="cc-metric">
              <div class="m-val" style="color:${c.metrics.cyberIncidents > 10 ? '#ef4444' : '#cbd5e1'};">${c.metrics.cyberIncidents}</div>
              <div class="m-lbl">Cyber</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // THREAT MATRIX (Chart.js scatter)
  // ============================================
  function renderThreatMatrix() {
    const ctx = document.getElementById('chart-threat-matrix')?.getContext('2d');
    if (!ctx || !window.Chart) return;

    if (chartThreatMatrix) chartThreatMatrix.destroy();

    const severityColors = {
      CRITICAL: '#ef4444',
      HIGH: '#f97316',
      MEDIUM: '#eab308',
      LOW: '#22c55e'
    };

    const datasets = {};

    IntelData.THREAT_MATRIX.forEach(t => {
      const key = t.severity;
      if (!datasets[key]) {
        datasets[key] = {
          label: key,
          data: [],
          backgroundColor: severityColors[key] + 'cc',
          borderColor: severityColors[key],
          borderWidth: 2,
          pointRadius: 10,
          pointHoverRadius: 14
        };
      }
      datasets[key].data.push({
        x: t.probability * 100,
        y: t.impact * 100,
        label: `${t.actor} — ${t.category}`,
        type: t.type,
        region: t.region
      });
    });

    chartThreatMatrix = new Chart(ctx, {
      type: 'scatter',
      data: { datasets: Object.values(datasets) },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end', labels: { color: '#cbd5e1' } },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(51,65,85,0.5)',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: ctx => {
                const d = ctx.raw;
                return [
                  `${d.label}`,
                  `Type: ${d.type}`,
                  `Region: ${d.region}`,
                  `Probability: ${d.x}% · Impact: ${d.y}%`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            min: 0,
            max: 100,
            title: { display: true, text: 'Probability (%)', color: '#94a3b8' },
            grid: { color: 'rgba(51,65,85,0.3)' },
            ticks: { color: '#94a3b8' }
          },
          y: {
            min: 0,
            max: 100,
            title: { display: true, text: 'Impact (%)', color: '#94a3b8' },
            grid: { color: 'rgba(51,65,85,0.3)' },
            ticks: { color: '#94a3b8' }
          }
        }
      }
    });
  }

  // ============================================
  // SOURCES
  // ============================================
  function renderSources() {
    const container = document.getElementById('sources-list');
    if (!container) return;

    const sources = IntelCore.getAllSources();

    container.innerHTML = sources.map(s => {
      const cred = IntelCore.getSourceCredibility(s.name);
      if (!cred) return '';

      return `
        <div class="source-card" style="border-left-color:${cred.color};">
          <div class="sc-head">
            <div>
              <div class="sc-name">${s.name}</div>
              <div class="sc-type">${s.type}</div>
            </div>
            <span class="admiralty-badge" style="background:${cred.color}22; color:${cred.color}; border:1px solid ${cred.color}55;">
              <span class="ab-rel">${s.reliability}</span>
            </span>
          </div>
          <div class="sc-stats">
            <div class="sc-stat">
              <div class="val" style="color:${cred.color};">${cred.accuracyPct}%</div>
              <div class="lbl">Accuracy</div>
            </div>
            <div class="sc-stat">
              <div class="val">${s.totalSubmissions.toLocaleString('id-ID')}</div>
              <div class="lbl">Submissions</div>
            </div>
            <div class="sc-stat">
              <div class="val" style="color:#4ade80;">${s.verifiedCount}</div>
              <div class="lbl">Verified</div>
            </div>
            <div class="sc-stat">
              <div class="val" style="color:#f87171;">${s.dismissedCount}</div>
              <div class="lbl">Dismissed</div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // OVERVIEW CHARTS
  // ============================================
  function renderOverviewCharts() {
    // Admiralty distribution chart
    const ctx = document.getElementById('chart-admiralty')?.getContext('2d');
    if (!ctx || !window.Chart) return;

    if (chartAdmiralty) chartAdmiralty.destroy();

    const sources = IntelCore.getAllSources();
    const reliabilityCount = { A: 0, B: 0, C: 0, D: 0, E: 0, F: 0 };
    sources.forEach(s => reliabilityCount[s.reliability]++);

    chartAdmiralty = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['A', 'B', 'C', 'D', 'E', 'F'],
        datasets: [{
          label: 'Sources',
          data: [reliabilityCount.A, reliabilityCount.B, reliabilityCount.C, reliabilityCount.D, reliabilityCount.E, reliabilityCount.F],
          backgroundColor: [
            'rgba(34,197,94,0.7)',
            'rgba(74,222,128,0.7)',
            'rgba(234,179,8,0.7)',
            'rgba(249,115,22,0.7)',
            'rgba(239,68,68,0.7)',
            'rgba(100,116,139,0.7)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(51,65,85,0.5)',
            borderWidth: 1,
            callbacks: {
              title: ctx => `Reliability ${ctx[0].label}`,
              label: ctx => `${ctx.parsed.y} source${ctx.parsed.y !== 1 ? 's' : ''}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: 'rgba(51,65,85,0.3)' },
            ticks: { color: '#94a3b8', stepSize: 1 }
          },
          x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
      }
    });
  }
  // ============================================
  // OVERVIEW RECENT (3 latest)
  // ============================================
  function renderOverviewRecent() {
    const tbody = document.getElementById('overview-feed');
    if (!tbody) return;

    const feed = [...IntelData.OSINT_FEED]
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 3);

    tbody.innerHTML = feed.map(intel => {
      const adm = IntelData.getAdmiralty(intel.admiralty[0], parseInt(intel.admiralty[1]));
      const score = IntelCore.computeIntelScore(intel);
      const country = IntelData.getCountry(intel.country);

      return `
        <tr>
          <td class="intel-id">${intel.id}</td>
          <td>
            <span class="admiralty-badge" style="background:${score.color}22; color:${score.color}; border:1px solid ${score.color}55;">
              <span class="ab-rel">${adm.reliability.code}</span>
              <span class="ab-slash">/</span>
              <span class="ab-acc">${adm.accuracy.code}</span>
            </span>
          </td>
          <td>
            <div class="intel-title">${intel.title}</div>
            <div class="intel-content">${intel.content}</div>
          </td>
          <td>
            <div style="font-size:0.7rem; color:#22d3ee; font-weight:700;">${intel.sourceType}</div>
            <div style="font-size:0.65rem; color:#64748b;">${intel.source}</div>
          </td>
          <td>
            <span style="font-size:0.75rem;">${country ? country.flag + ' ' + country.name : intel.country}</span>
          </td>
          <td>
            <span class="status-badge ${intel.status.toLowerCase()}">${intel.status}</span>
          </td>
          <td style="font-family:'Courier New',monospace; font-size:0.7rem; color:#64748b;">
            ${new Date(intel.timestamp).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: 'short' })}
          </td>
          <td style="text-align:right;">
            ${intel.status === 'PENDING'
              ? `<button class="action-btn verify" onclick="IntelDashboard.verifyIntel('${intel.id}')">✓</button>
                 <button class="action-btn dismiss" onclick="IntelDashboard.dismissIntel('${intel.id}')">✗</button>`
              : `<span style="font-size:0.7rem; color:#64748b;">—</span>`}
          </td>
        </tr>
      `;
    }).join('');
  }

  // ============================================
  // UPDATE BADGES (sidebar counter)
  // ============================================
  function updateBadges() {
    const stats = IntelData.getStats();
    const pendingBadge = document.getElementById('badge-pending');
    if (pendingBadge) pendingBadge.textContent = stats.pending;
  }
  // ============================================
  // VERIFICATION ACTIONS
  // ============================================
  function verifyIntel(id) {
    const r = IntelCore.verify(id, 'Analis SOC', 'Manual verification');
    if (r.ok) {
      renderOSINTFeed();
      renderStats();
      console.log(`[INTEL-DASH] Verified: ${id}`);
    }
  }

  function dismissIntel(id) {
    const reason = prompt('Alasan dismiss:');
    if (reason === null) return;
    const r = IntelCore.dismiss(id, reason || 'No reason provided', 'Analis SOC');
    if (r.ok) {
      renderOSINTFeed();
      renderStats();
      console.log(`[INTEL-DASH] Dismissed: ${id}`);
    }
  }
  function verifyIntel(id) {
    const r = IntelCore.verify(id, 'Analis SOC', 'Manual verification');
    if (r.ok) {
      renderOSINTFeed();
      renderOverviewRecent();   // ← TAMBAH
      renderStats();
      updateBadges();            // ← TAMBAH
      console.log(`[INTEL-DASH] Verified: ${id}`);
    }
  }

  function dismissIntel(id) {
    const reason = prompt('Alasan dismiss:');
    if (reason === null) return;
    const r = IntelCore.dismiss(id, reason || 'No reason provided', 'Analis SOC');
    if (r.ok) {
      renderOSINTFeed();
      renderOverviewRecent();   // ← TAMBAH
      renderStats();
      updateBadges();            // ← TAMBAH
      console.log(`[INTEL-DASH] Dismissed: ${id}`);
    }
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
    activeTab = tab;
    document.querySelectorAll('.tab-content').forEach(t => {
      t.classList.toggle('active', t.id === `tab-${tab}`);
    });
    document.querySelectorAll('.sb-item[data-tab]').forEach(n => {
      n.classList.toggle('active', n.dataset.tab === tab);
    });

    // Re-render charts saat tab matrix aktif
    if (tab === 'matrix') {
      setTimeout(() => renderThreatMatrix(), 100);
    }
    if (tab === 'overview') {
      setTimeout(() => renderOverviewCharts(), 100);
    }
  }

  // ============================================
  // CONTROLS
  // ============================================
  function wireControls() {
    document.getElementById('btn-auto-verify')?.addEventListener('click', () => {
      const r = IntelCore.autoVerifyByRules();
      renderOSINTFeed();
      renderStats();
      alert(`Auto-verify: ${r.autoVerified} verified, ${r.autoDismissed} dismissed`);
    });
  }

  function startClock() {
    setInterval(() => {
      const t = new Date().toISOString().substr(11, 8);
      document.querySelectorAll('.live-clock').forEach(el => el.textContent = t);
    }, 1000);
  }

  window.addEventListener('DOMContentLoaded', init);

  return {
    verifyIntel,
    dismissIntel,
    switchTab
  };
})();

if (typeof window !== 'undefined') window.IntelDashboard = IntelDashboard;
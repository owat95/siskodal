/* ============================================================
 * ANALITIK-DASHBOARD.JS — Chart.js Renderer + AI Insights
 * ============================================================ */

const AnalitikDashboard = (() => {
  'use strict';

  const CHART_DEFAULTS = {
    color: '#cbd5e1',
    borderColor: 'rgba(51, 65, 85, 0.5)',
    gridColor: 'rgba(51, 65, 85, 0.3)',
    font: { family: "'Courier New', monospace", size: 10 }
  };

  let charts = {};

  // ============================================
  // INIT
  // ============================================
  function init() {
    if (!window.Chart) {
      console.error('[ANA] Chart.js not loaded');
      return;
    }

    // Global defaults
    Chart.defaults.color = CHART_DEFAULTS.color;
    Chart.defaults.borderColor = CHART_DEFAULTS.borderColor;
    Chart.defaults.font.family = CHART_DEFAULTS.font.family;
    Chart.defaults.font.size = CHART_DEFAULTS.font.size;
    Chart.defaults.plugins.legend.labels.usePointStyle = true;
    Chart.defaults.plugins.legend.labels.boxWidth = 8;
    Chart.defaults.plugins.legend.labels.padding = 12;

    renderSummaryStats();
    renderAIInsightTop();
    renderKPITrendChart();
    renderPersonnelDoughnut();
    renderLogisticsBar();
    renderThreatRadar();
    renderPredictiveChart();
    renderRealtimeGauges();
    renderInsightsGrid();
    renderTopPerformers();
    renderFreshnessIndicator();
    wireControls();
    startClock();

    console.log('[ANA] Dashboard initialized');
  }

  // ============================================
  // SUMMARY STATS
  // ============================================
  function renderSummaryStats() {
    const stats = AnalitikData.getSummaryStats();
    const container = document.getElementById('summary-stats');
    if (!container) return;

    const trendIcons = { up: '▲', down: '▼', flat: '▬' };

    container.innerHTML = stats.map(s => `
      <div class="ana-stat" style="border-left-color:${s.color};">
        <div class="label">${s.label}</div>
        <div class="value" style="color:${s.color};">${s.value}</div>
        <div class="trend ${s.trend}">
          ${trendIcons[s.trend]} ${s.delta}
        </div>
      </div>
    `).join('');
  }

  // ============================================
  // AI INSIGHT (Top Panel)
  // ============================================
  function renderAIInsightTop() {
    const panel = document.getElementById('ai-insight-top');
    if (!panel) return;

    const insights = AnalitikData.getAIInsights();
    const top = insights[0];

    const confidence = AIConfidence.computeConfidence(top.model, {
      dataQuality: 0.92,
      dataAgeSec: 15
    });

    panel.innerHTML = `
      <div class="ai-icon">🤖</div>
      <div class="ai-body">
        <div class="ai-title">
          <span>AI STRATEGIC ADVISOR</span>
          <span style="background:${confidence.color}22; color:${confidence.color}; padding:2px 8px; border-radius:4px; font-size:0.6rem;">
            CONFIDENCE ${confidence.confidencePct}%
          </span>
          <span style="background:rgba(51,65,85,0.5); color:#94a3b8; padding:2px 8px; border-radius:4px; font-size:0.6rem;">
            ${confidence.model.name}
          </span>
        </div>
        <div class="ai-text">${top.text}</div>
        <div class="ai-meta">
          <span>◈ Model: ${confidence.model.version}</span>
          <span>◈ Data: FRESH (${new Date().toLocaleTimeString('id-ID')})</span>
          <span>◈ Validated: ${AIConfidence.getValidationStatus(top.model).ageText} ago</span>
          <span style="color:${confidence.color};">◈ ${confidence.level} CONFIDENCE</span>
        </div>
      </div>
    `;
  }

  // ============================================
  // KPI TREND CHART (Line)
  // ============================================
  function renderKPITrendChart() {
    const ctx = document.getElementById('chart-kpi-trend')?.getContext('2d');
    if (!ctx) return;

    const data = AnalitikData.generateKPITrend(7);

    charts.kpi = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Readiness',
            data: data.datasets.readiness,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: 'Personnel',
            data: data.datasets.personnel,
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59,130,246,0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: 'Logistics',
            data: data.datasets.logistics,
            borderColor: '#eab308',
            backgroundColor: 'rgba(234,179,8,0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3
          },
          {
            label: 'Threat',
            data: data.datasets.threat,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.1)',
            tension: 0.4,
            fill: true,
            borderWidth: 2,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(51,65,85,0.5)',
            borderWidth: 1,
            padding: 10,
            callbacks: {
              label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            min: 40,
            max: 100,
            grid: { color: CHART_DEFAULTS.gridColor },
            ticks: { callback: v => v + '%' }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // ============================================
  // PERSONNEL DOUGHNUT
  // ============================================
  function renderPersonnelDoughnut() {
    const ctx = document.getElementById('chart-personnel')?.getContext('2d');
    if (!ctx) return;

    const data = AnalitikData.getPersonnelByRank();

    charts.personnel = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: [
            data.byMatra.ad[0] + data.byMatra.al[0] + data.byMatra.au[0],
            data.byMatra.ad[1] + data.byMatra.al[1] + data.byMatra.au[1],
            data.byMatra.ad[2] + data.byMatra.al[2] + data.byMatra.au[2]
          ],
          backgroundColor: [
            'rgba(59,130,246,0.7)',
            'rgba(34,197,94,0.7)',
            'rgba(234,179,8,0.7)'
          ],
          borderColor: ['#3b82f6', '#22c55e', '#eab308'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: '#cbd5e1', padding: 10 }
          },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(51,65,85,0.5)',
            borderWidth: 1
          }
        }
      }
    });
  }

  // ============================================
  // LOGISTICS BAR
  // ============================================
  function renderLogisticsBar() {
    const ctx = document.getElementById('chart-logistics')?.getContext('2d');
    if (!ctx) return;

    const data = AnalitikData.getLogisticsBreakdown();

    charts.logistics = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [
          { label: 'AD', data: data.ad, backgroundColor: 'rgba(5,150,105,0.7)', borderColor: '#059669', borderWidth: 1 },
          { label: 'AL', data: data.al, backgroundColor: 'rgba(30,64,175,0.7)', borderColor: '#1e40af', borderWidth: 1 },
          { label: 'AU', data: data.au, backgroundColor: 'rgba(37,99,235,0.7)', borderColor: '#2563eb', borderWidth: 1 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(51,65,85,0.5)',
            borderWidth: 1
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: CHART_DEFAULTS.gridColor },
            ticks: { callback: v => v.toLocaleString('id-ID') }
          },
          x: { grid: { display: false } }
        }
      }
    });
  }

  // ============================================
  // THREAT RADAR
  // ============================================
  function renderThreatRadar() {
    const ctx = document.getElementById('chart-threat')?.getContext('2d');
    if (!ctx) return;

    const data = AnalitikData.getThreatRadar();

    charts.threat = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: 'Last 24h',
            data: data.last24h,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239,68,68,0.15)',
            borderWidth: 2,
            pointBackgroundColor: '#ef4444',
            pointRadius: 3
          },
          {
            label: 'Last 7d',
            data: data.last7d,
            borderColor: '#60a5fa',
            backgroundColor: 'rgba(96,165,250,0.1)',
            borderWidth: 2,
            pointBackgroundColor: '#60a5fa',
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom' }
        },
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            grid: { color: 'rgba(51,65,85,0.4)' },
            angleLines: { color: 'rgba(51,65,85,0.4)' },
            pointLabels: { color: '#cbd5e1', font: { size: 10 } },
            ticks: { display: false }
          }
        }
      }
    });
  }

  // ============================================
  // PREDICTIVE CHART (Line with forecast)
  // ============================================
  function renderPredictiveChart() {
    const ctx = document.getElementById('chart-predictive')?.getContext('2d');
    if (!ctx) return;

    const data = AnalitikData.getPredictiveData();
    const labels = [...data.historical.map(d => d.x), ...data.forecast.map(d => d.x)];
    const histValues = [...data.historical.map(d => d.y), ...data.forecast.map(() => null)];
    const forecastValues = [...data.historical.map(() => null), ...data.forecast.map(d => d.y)];

    charts.predictive = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Historical',
            data: histValues,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34,197,94,0.1)',
            borderWidth: 2.5,
            tension: 0.3,
            fill: true,
            pointRadius: 2
          },
          {
            label: 'Forecast',
            data: forecastValues,
            borderColor: '#a855f7',
            backgroundColor: 'rgba(168,85,247,0.1)',
            borderWidth: 2.5,
            borderDash: [6, 4],
            tension: 0.3,
            fill: true,
            pointRadius: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', align: 'end' },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            borderColor: 'rgba(51,65,85,0.5)',
            borderWidth: 1,
            callbacks: {
              label: ctx => ctx.parsed.y !== null
                ? `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%`
                : ''
            }
          }
        },
        scales: {
          y: {
            grid: { color: CHART_DEFAULTS.gridColor },
            ticks: { callback: v => v.toFixed(0) + '%' }
          },
          x: {
            grid: { display: false },
            ticks: { maxRotation: 45, autoSkip: true, maxTicksLimit: 10 }
          }
        }
      }
    });
  }

  // ============================================
  // REALTIME GAUGES
  // ============================================
  function renderRealtimeGauges() {
    const container = document.getElementById('gauges-container');
    if (!container) return;

    const gauges = AnalitikData.getRealtimeGauges();

    container.innerHTML = gauges.map(g => {
      const gap = g.value - g.target;
      const statusColor = g.value >= g.target ? '#22c55e'
                        : g.value >= g.target - 10 ? '#eab308'
                        : '#ef4444';
      return `
        <div style="margin-bottom:14px;">
          <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
            <span style="font-size:0.72rem; color:#cbd5e1;">${g.label}</span>
            <span style="font-family:'Courier New',monospace; font-size:0.8rem; font-weight:700; color:${statusColor};">
              ${g.value}% <span style="font-size:0.6rem; color:#64748b;">/ target ${g.target}%</span>
            </span>
          </div>
          <div style="height:8px; background:rgba(51,65,85,0.7); border-radius:4px; overflow:hidden; position:relative;">
            <div style="height:100%; width:${g.value}%; background:linear-gradient(90deg, ${statusColor}, ${statusColor}99); border-radius:4px; transition:width 0.5s;"></div>
            <div style="position:absolute; left:${g.target}%; top:-2px; bottom:-2px; width:2px; background:#fff; opacity:0.6;"></div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // INSIGHTS GRID
  // ============================================
  function renderInsightsGrid() {
    const container = document.getElementById('insights-grid');
    if (!container) return;

    const insights = AnalitikData.getAIInsights();

    container.innerHTML = insights.map(ins => {
      const conf = AIConfidence.computeConfidence(ins.model, {
        dataQuality: 0.85,
        dataAgeSec: 30
      });
      return `
        <div class="insight-card" style="border-left-color:${ins.color};">
          <div class="ic-icon">${ins.icon}</div>
          <div class="ic-body">
            <div class="ic-title">${ins.title}</div>
            <div class="ic-text">${ins.text}</div>
            <div style="display:flex; gap:8px; margin-top:8px; align-items:center;">
              <span style="font-size:0.6rem; font-family:'Courier New',monospace; color:${conf.color}; font-weight:700;">
                🤖 ${conf.confidencePct}% ${conf.level}
              </span>
              <span style="font-size:0.55rem; color:#475569; font-family:'Courier New',monospace;">
                ${conf.model.name}
              </span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // TOP PERFORMERS
  // ============================================
  function renderTopPerformers() {
    const tbody = document.getElementById('top-performers-body');
    if (!tbody) return;

    const performers = AnalitikData.getTopPerformers();
    const trendIcons = { up: '▲', down: '▼', flat: '▬' };
    const trendColors = { up: '#4ade80', down: '#f87171', flat: '#64748b' };

    tbody.innerHTML = performers.map((p, idx) => `
      <tr>
        <td class="mono" style="text-align:center;">${idx + 1}</td>
        <td><strong>${p.name}</strong></td>
        <td class="mono" style="color:#60a5fa;">${p.kpi}</td>
        <td>
          <div style="display:flex; align-items:center; gap:8px;">
            <span class="mono" style="color:${p.readiness >= 90 ? '#4ade80' : p.readiness >= 80 ? '#facc15' : '#f87171'}; font-weight:700;">${p.readiness}%</span>
            <div class="progress" style="width:60px; margin:0;">
              <div class="progress-fill" style="width:${p.readiness}%; background:${p.readiness >= 90 ? '#4ade80' : p.readiness >= 80 ? '#facc15' : '#f87171'};"></div>
            </div>
          </div>
        </td>
        <td class="mono">${p.units}</td>
        <td style="color:${trendColors[p.trend]}; text-align:center;">${trendIcons[p.trend]}</td>
      </tr>
    `).join('');
  }

  // ============================================
  // FRESHNESS INDICATOR (Header)
  // ============================================
  function renderFreshnessIndicator() {
    if (!window.DataFreshness) return;
    DataFreshness.renderIndicator('freshness-indicator');
  }

  // ============================================
  // CONTROLS
  // ============================================
  function wireControls() {
    document.getElementById('btn-refresh')?.addEventListener('click', () => {
      // Re-render charts
      Object.values(charts).forEach(c => c.destroy());
      charts = {};
      renderKPITrendChart();
      renderPersonnelDoughnut();
      renderLogisticsBar();
      renderThreatRadar();
      renderPredictiveChart();
      console.log('[ANA] Charts refreshed');
    });

    document.getElementById('btn-export')?.addEventListener('click', exportAllCharts);
  }

  // ============================================
  // EXPORT CHARTS (PNG)
  // ============================================
  function exportAllCharts() {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').substring(0, 19);
    Object.entries(charts).forEach(([name, chart], idx) => {
      setTimeout(() => {
        const url = chart.toBase64Image();
        const a = document.createElement('a');
        a.href = url;
        a.download = `R2-Analitik-${name}-${timestamp}.png`;
        a.click();
      }, idx * 300);
    });
    console.log('[ANA] Exported all charts');
  }

  // ============================================
  // LIVE UPDATES (simulated)
  // ============================================
  function startClock() {
    setInterval(() => {
      const t = new Date().toISOString().substr(11, 8);
      document.querySelectorAll('.live-clock').forEach(el => el.textContent = t);
    }, 1000);
  }

  // ============================================
  // BOOT
  // ============================================
  window.addEventListener('DOMContentLoaded', () => {
    setTimeout(init, 200); // Wait for DataFreshness init
  });

  return { init, exportAllCharts };
})();

if (typeof window !== 'undefined') window.AnalitikDashboard = AnalitikDashboard;
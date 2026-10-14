/* ============================================================
 * DASHBOARD-LOGISTIK-AD.JS â€” TNI AD Logistics + AI
 * + RBAC (Zero Trust)
 * ============================================================ */

const DashboardLogistikAD = (() => {
  'use strict';

  const MATRA = 'ad';
  let analysis = null;
  let currentRole = 'JENDRAL_AD';

  // ============================================
  // INIT
  // ============================================
  function init() {
    if (!window.LogisticsData || !window.LogisticsAI) {
      console.error('[LOG-AD] Missing dependencies');
      return;
    }

    // Load current role from localStorage
    const saved = localStorage.getItem('r2_role') || 'JENDRAL_AD';
    switchRole(saved, true);

    // Run AI analysis
    analysis = LogisticsAI.analyzeAll(MATRA);

    renderOverview();
    renderAISummary();
    renderAlutsista();
    renderFuelGrid();
    renderMaintenance();
    renderAutonomous();
    renderSupply();
    renderGudang();
    renderRoutes();
    renderCyber();
    wireControls();
    wireTabs();
    startClock();

    console.log(`[LOG-AD] Initialized â€” ${analysis.summary.totalAlutsista} alutsista`);
  }

  // ============================================
  // RBAC â€” ROLE SWITCHER
  // ============================================
  function switchRole(roleKey, silent = false) {
    const role = LogisticsData.getRole(roleKey);
    if (!role) return;

    currentRole = roleKey;
    localStorage.setItem('r2_role', roleKey);

    // Check access
    const hasAccess = role.access.includes(MATRA);

    const overlay = document.getElementById('access-denied');
    const reasonEl = document.getElementById('denied-reason');

    if (!hasAccess) {
      overlay.classList.add('active');
      if (reasonEl) {
        reasonEl.innerHTML = `
          ROLE: <strong>${role.label}</strong><br>
          REQUESTED: <strong>Logistik TNI AD</strong><br>
          ALLOWED: ${role.access.map(a => 'Logistik ' + a.toUpperCase()).join(', ')}<br>
          <br>
          <em>Zero Trust: cross-matra access requires explicit authorization per UU No. 36/1999 & UU ITE.</em>
        `;
      }
      console.warn(`[RBAC] Access denied for ${role.label} â†’ Logistik AD`);
    } else {
      overlay.classList.remove('active');
      if (!silent) console.log(`[RBAC] Access granted for ${role.label}`);
    }

    // Update select
    const sel = document.getElementById('role-select');
    if (sel && sel.value !== roleKey) sel.value = roleKey;
  }

  // ============================================
  // OVERVIEW
  // ============================================
  function renderOverview() {
    const s = analysis.summary;
    document.getElementById('ov-alutsista').textContent = s.totalAlutsista;
    document.getElementById('ov-ready').textContent = s.readyCount;
    document.getElementById('ov-fuel').textContent = s.criticalFuel;
    document.getElementById('ov-auto').textContent = s.autonomousOps;
    document.getElementById('ov-cyber').textContent = s.cyberThreats;
    document.getElementById('ov-supply').textContent = s.supplyImbalances;
  }

  // ============================================
  // AI SUMMARY
  // ============================================
  function renderAISummary() {
    const s = analysis.summary;
    const lines = [];

    if (s.criticalFuel > 0) {
      const names = analysis.criticalFuel.map(f => f.alutsista).join(', ');
      lines.push(`âš  <strong>${s.criticalFuel} alutsista</strong> butuh refuel segera: ${names}`);
    }
    if (s.criticalParts > 0) {
      lines.push(`ðŸ”§ <strong>${s.criticalParts} spare part</strong> diprediksi rusak dalam 14 hari`);
    }
    if (s.autonomousOps > 0) {
      lines.push(`ðŸ¤– <strong>${s.autonomousOps} misi autonomous resupply</strong> direkomendasikan (UAV/UGV)`);
    }
    if (s.supplyImbalances > 0) {
      lines.push(`ðŸ“¦ <strong>${s.supplyImbalances} gudang</strong> perlu redistribusi stok`);
    }
    if (s.cyberThreats > 0) {
      lines.push(`ðŸ›¡ï¸ <strong>${s.cyberThreats} anomali siber</strong> terdeteksi pada transmisi logistik`);
    }

    if (lines.length === 0) {
      lines.push('âœ“ Semua sistem logistik nominal. Tidak ada tindakan prioritas.');
    }

    document.getElementById('ai-summary').innerHTML =
      lines.map(l => `<div style="margin-bottom:6px;">${l}</div>`).join('');
  }

  // ============================================
  // ALUTSISTA TABLE
  // ============================================
  function renderAlutsista() {
    const tbody = document.getElementById('alutsista-tbody');
    const data = LogisticsData.getAlutsista(MATRA);

    tbody.innerHTML = data.map(a => `
      <tr>
        <td class="mono" style="font-size:0.7rem;">${a.id}</td>
        <td><strong>${a.name}</strong></td>
        <td style="font-size:0.75rem;color:#60a5fa;">${a.type}</td>
        <td style="font-size:0.75rem;">${a.unit}</td>
        <td>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="mono" style="font-size:0.75rem;">${a.fuelLevel}%</span>
            <div class="progress" style="width:60px;margin:0;">
              <div class="progress-fill" style="width:${a.fuelLevel}%;background:${a.fuelLevel < 20 ? '#ef4444' : a.fuelLevel < 50 ? '#eab308' : '#22c55e'};"></div>
            </div>
          </div>
        </td>
        <td class="mono" style="font-size:0.75rem;">${a.hoursOperational} h</td>
        <td>
          <span class="kpi-badge ${a.status === 'ready' ? 'excellent' : 'poor'}">
            ${a.status.toUpperCase()}
          </span>
        </td>
        <td style="font-size:0.75rem;">${a.location.province}</td>
      </tr>
    `).join('');
  }

  // ============================================
  // FUEL GRID
  // ============================================
  function renderFuelGrid() {
    const container = document.getElementById('fuel-grid');
    const sorted = [...analysis.fuelPredictions].sort((a, b) => a.daysRemaining - b.daysRemaining);

    container.innerHTML = sorted.map(p => {
      const sev = p.severity.toLowerCase();
      const color = sev === 'critical' ? '#ef4444' : sev === 'high' ? '#f87171' : sev === 'medium' ? '#eab308' : '#22c55e';

      return `
        <div class="position-card">
          <div class="position-header">
            <div>
              <div class="position-title">${p.alutsista}</div>
              <div class="position-province">Fuel: ${p.currentFuel}% (${p.fuelLiters} L)</div>
            </div>
            <span class="ai-badge ${sev}">${p.severity}</span>
          </div>
          <div style="display:flex;justify-content:space-between;margin:12px 0;">
            <div style="font-size:0.7rem;color:#94a3b8;">
              Konsumsi/hari<br>
              <span style="color:#fff;font-family:monospace;font-size:0.9rem;">${p.dailyConsumption} L</span>
            </div>
            <div style="text-align:right;font-size:0.7rem;color:#94a3b8;">
              Sisa<br>
              <span style="color:${color};font-family:monospace;font-size:1.2rem;font-weight:900;">${p.daysRemaining} hari</span>
            </div>
          </div>
          <div style="font-size:0.75rem;color:${color};font-family:monospace;padding:8px;background:rgba(0,0,0,0.2);border-radius:6px;">
            ${p.recommendation}
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // MAINTENANCE TABLE
  // ============================================
  function renderMaintenance() {
    const tbody = document.getElementById('maintenance-tbody');
    const data = analysis.maintenanceSchedule;

    if (data.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;color:#64748b;padding:20px;">Semua alutsista dalam kondisi optimal</td></tr>';
      return;
    }

    tbody.innerHTML = data.map(m => {
      const prioColor = m.priority === 'URGENT' ? '#ef4444' : m.priority === 'HIGH' ? '#eab308' : '#22c55e';
      return `
        <tr>
          <td><strong>${m.alutsista}</strong></td>
          <td style="font-size:0.75rem;">${m.unit}</td>
          <td>
            <span class="mono" style="color:${m.failureRisk > 75 ? '#ef4444' : m.failureRisk > 50 ? '#eab308' : '#22c55e'};font-size:0.9rem;font-weight:700;">
              ${m.failureRisk}%
            </span>
          </td>
          <td><span class="kpi-badge" style="background:${prioColor}22;color:${prioColor};">${m.priority}</span></td>
          <td class="mono" style="font-size:0.75rem;">${m.recommendedWindow}</td>
          <td class="mono" style="font-size:0.75rem;">${m.estimatedDuration}</td>
          <td style="font-size:0.75rem;">${m.facility}</td>
        </tr>
      `;
    }).join('');
  }

  // ============================================
  // AUTONOMOUS RESUPPLY
  // ============================================
  function renderAutonomous() {
    const container = document.getElementById('autonomous-list');
    const data = analysis.autonomousRecs;

    if (data.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;">Tidak ada misi autonomous yang direkomendasikan saat ini.</p>';
      return;
    }

    container.innerHTML = data.map(r => `
      <div class="ai-panel">
        <div class="ai-header">
          <div class="ai-title">
            <i class="fas fa-robot"></i> ${r.vehicle}
          </div>
          <span class="ai-badge ${r.priority.toLowerCase()}">${r.priority}</span>
        </div>
        <div class="ai-content">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
            <div>
              <div style="font-size:0.7rem;color:#94a3b8;">TARGET</div>
              <div style="color:#fff;font-weight:600;">${r.target}</div>
            </div>
            <div>
              <div style="font-size:0.7rem;color:#94a3b8;">SOURCE</div>
              <div style="color:#fff;font-weight:600;">${r.source} (${r.province})</div>
            </div>
            <div>
              <div style="font-size:0.7rem;color:#94a3b8;">ITEM</div>
              <div style="color:#fff;font-weight:600;">${r.itemType.replace('_', ' ')} Â· ${r.quantity} unit</div>
            </div>
            <div>
              <div style="font-size:0.7rem;color:#94a3b8;">ETA</div>
              <div style="color:#4ade80;font-weight:600;font-family:monospace;">${r.etaHours} jam</div>
            </div>
          </div>
          <div style="margin-top:12px;padding:8px;background:rgba(34,197,94,0.08);border-left:2px solid #22c55e;border-radius:0 6px 6px 0;font-size:0.75rem;color:#cbd5e1;">
            ${r.risk}
          </div>
        </div>
      </div>
    `).join('');
  }

  // ============================================
  // SUPPLY CHAIN
  // ============================================
  function renderSupply() {
    const container = document.getElementById('supply-list');
    const data = analysis.supplyImbalances;

    if (data.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;">Tidak ada imbalance. Semua gudang seimbang.</p>';
      return;
    }

    container.innerHTML = data.map(s => `
      <div class="threat-card ${s.severity.toLowerCase()}" style="margin-bottom:10px;">
        <div style="display:flex;justify-content:space-between;align-items:start;">
          <div>
            <div class="threat-type">${s.category.toUpperCase().replace('_', ' ')}</div>
            <div class="threat-message"><strong>${s.gudang}</strong> â€” ${s.province}</div>
            <div class="threat-meta">
              Current: ${s.ratio}% Â· Avg: ${s.avgRatio}% Â· 
              ${s.surplus > 0 ? `Surplus: ${s.surplus} unit` : `Deficit: ${s.deficit} unit`}
            </div>
          </div>
          <span class="kpi-badge ${s.action === 'PERLU RESTOCK' ? 'poor' : 'fair'}">${s.action}</span>
        </div>
      </div>
    `).join('');
  }

  // ============================================
  // GUDANG
  // ============================================
  function renderGudang() {
    const container = document.getElementById('gudang-grid');
    const data = LogisticsData.getGudang(MATRA);

    container.innerHTML = data.map(g => {
      const total = Object.values(g.stock).reduce((a, b) => a + b, 0);
      const totalCap = g.capacity * 4;
      const fillRatio = Math.round(total / totalCap * 100);

      const stockBars = Object.entries(g.stock).map(([cat, val]) => {
        const pct = Math.round(val / g.capacity * 100);
        const color = pct < 30 ? '#ef4444' : pct < 60 ? '#eab308' : '#22c55e';
        return `
          <div style="margin-top:6px;">
            <div style="display:flex;justify-content:space-between;font-size:0.7rem;">
              <span style="color:#94a3b8;">${cat.replace('_', ' ')}</span>
              <span style="font-family:monospace;color:#cbd5e1;">${val} / ${g.capacity}</span>
            </div>
            <div class="progress"><div class="progress-fill" style="width:${pct}%;background:${color};"></div></div>
          </div>
        `;
      }).join('');

      return `
        <div class="position-card">
          <div class="position-header">
            <div>
              <div class="position-title">${g.name}</div>
              <div class="position-province"><i class="fas fa-map-marker-alt"></i> ${g.province}</div>
            </div>
            <div style="text-align:right;">
              <div style="font-size:1.4rem;font-weight:900;color:${fillRatio < 50 ? '#ef4444' : fillRatio < 75 ? '#eab308' : '#22c55e'};font-family:monospace;">
                ${fillRatio}%
              </div>
              <div style="font-size:0.6rem;color:#64748b;letter-spacing:1px;">FILL</div>
            </div>
          </div>
          ${stockBars}
        </div>
      `;
    }).join('');
  }

  // ============================================
  // ROUTES
  // ============================================
  function renderRoutes() {
    const tbody = document.getElementById('routes-tbody');
    const data = LogisticsData.getRoutes(MATRA);

    tbody.innerHTML = data.map(r => {
      const riskColor = r.risk === 'HIGH' ? '#ef4444' : r.risk === 'MEDIUM' ? '#eab308' : '#22c55e';
      const statusColor = r.status === 'active' ? '#22c55e' : r.status === 'delayed' ? '#eab308' : '#ef4444';
      return `
        <tr>
          <td class="mono" style="font-size:0.7rem;">${r.id}</td>
          <td style="font-size:0.75rem;">${r.from}</td>
          <td style="font-size:0.75rem;">${r.to}</td>
          <td style="font-size:0.75rem;color:#60a5fa;">${r.vehicle}</td>
          <td style="font-size:0.75rem;">${r.cargo}</td>
          <td><span class="kpi-badge" style="background:${riskColor}22;color:${riskColor};">${r.risk}</span></td>
          <td class="mono" style="font-size:0.75rem;">${r.etaHours}h</td>
          <td class="mono" style="font-size:0.75rem;">${r.distanceKm} km</td>
          <td><span style="color:${statusColor};">â— ${r.status.toUpperCase()}</span></td>
        </tr>
      `;
    }).join('');
  }

  // ============================================
  // CYBER THREATS
  // ============================================
  function renderCyber() {
    const container = document.getElementById('cyber-list');
    const data = analysis.cyberThreats;

    if (data.length === 0) {
      container.innerHTML = '<p style="color:#94a3b8;">Tidak ada anomali siber terdeteksi.</p>';
      return;
    }

    container.innerHTML = data.map(t => {
      const sev = t.severity.toLowerCase();
      return `
        <div class="threat-card ${sev}" style="margin-bottom:12px;">
          <div style="display:flex;justify-content:space-between;align-items:start;">
            <div style="flex:1;">
              <div class="threat-type">
                <i class="fas fa-exclamation-triangle"></i> ${t.type}
              </div>
              <div class="threat-message"><strong>${t.message}</strong></div>
              <div class="threat-meta">
                MITRE: ${t.mitre} Â· ${t.timeAgo} Â· Threat Score: ${t.threatScore}/100
              </div>
              <div style="margin-top:8px;padding:8px;background:rgba(34,197,94,0.08);border-left:2px solid #22c55e;border-radius:0 6px 6px 0;font-size:0.75rem;color:#cbd5e1;">
                <strong style="color:#4ade80;">RESPONSE:</strong> ${t.response}
              </div>
            </div>
            <span class="ai-badge ${sev}">${t.severity}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // ============================================
  // CONTROLS
  // ============================================
  function wireControls() {
    const sel = document.getElementById('role-select');
    if (sel) {
      sel.addEventListener('change', (e) => switchRole(e.target.value));
    }
  }

  function wireTabs() {
    document.querySelectorAll('.nav-item[data-tab]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const tab = el.dataset.tab;
        document.querySelectorAll('.tab-content').forEach(t => {
          t.classList.toggle('active', t.id === `tab-${tab}`);
        });
        document.querySelectorAll('.nav-item[data-tab]').forEach(n => {
          n.classList.toggle('active', n.dataset.tab === tab);
        });
        const titles = {
          overview: 'AI-Powered Supply Chain & Maintenance',
          alutsista: 'Daftar Alutsista TNI AD',
          fuel: 'Predictive Fuel Depletion â€” AI Analysis',
          maintenance: 'Digital Twin â€” Maintenance Scheduling',
          autonomous: 'Autonomous Resupply Recommendation',
          supply: 'Supply Chain Optimization',
          gudang: 'Depo & Stok',
          routes: 'Rute Suplai Aktif',
          cyber: 'Cyber Threat Hunting'
        };
        const subtitle = document.getElementById('page-subtitle');
        if (subtitle) subtitle.textContent = titles[tab] || '';
      });
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

  return { switchRole };
})();
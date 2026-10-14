/* ============================================================
 * ANALITIK-DATA.JS — Time-Series Data Generator & Aggregator
 * ============================================================ */

const AnalitikData = (() => {
  'use strict';

  // ============================================
  // GENERATE KPI TREND (7 days)
  // ============================================
  function generateKPITrend(days = 7) {
    const labels = [];
    const datasets = {
      readiness: [],
      personnel: [],
      logistics: [],
      threat: []
    };

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      labels.push(d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }));

      datasets.readiness.push(72 + Math.random() * 15);
      datasets.personnel.push(88 + Math.random() * 8);
      datasets.logistics.push(70 + Math.random() * 20);
      datasets.threat.push(60 + Math.random() * 30);
    }

    return { labels, datasets };
  }

  // ============================================
  // PERSONNEL DISTRIBUTION (rank)
  // ============================================
  function getPersonnelByRank() {
    const ranks = ['Perwira', 'Bintara', 'Tamtama'];
    const byMatra = {
      ad: [12, 28, 10],
      al: [10, 25, 15],
      au: [15, 22, 13]
    };
    return { labels: ranks, byMatra };
  }

  // ============================================
  // LOGISTICS BREAKDOWN
  // ============================================
  function getLogisticsBreakdown() {
    return {
      labels: ['Amunisi', 'Bahan Bakar', 'Makanan', 'Spare Parts', 'Medis'],
      ad: [8500, 6200, 9400, 3200, 1800],
      al: [9800, 8900, 10200, 4100, 2200],
      au: [6200, 7400, 6800, 3900, 1500]
    };
  }

  // ============================================
  // THREAT RADAR (7 dimensions)
  // ============================================
  function getThreatRadar() {
    return {
      labels: ['Maritim', 'Udara', 'Darat', 'Cyber', 'Intel', 'Logistik', 'Personel'],
      last24h: [75, 82, 45, 90, 68, 30, 22],
      last7d:  [65, 70, 52, 80, 60, 40, 35]
    };
  }

  // ============================================
  // PREDICTIVE FORECAST (Linear Regression simplified)
  // ============================================
  function getPredictiveData() {
    const historical = [];
    const forecast = [];

    // 14 days historical
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      historical.push({
        x: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        y: 65 + i * 0.8 + Math.random() * 8
      });
    }

    // 7 days forecast
    const lastVal = historical[historical.length - 1].y;
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      forecast.push({
        x: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }),
        y: lastVal + i * 0.9 + (Math.random() * 3 - 1.5)
      });
    }

    return { historical, forecast };
  }

  // ============================================
  // REALTIME GAUGE DATA
  // ============================================
  function getRealtimeGauges() {
    return [
      { label: 'Readiness',      value: 87, target: 85, color: '#22c55e' },
      { label: 'Fuel Stock',     value: 72, target: 80, color: '#eab308' },
      { label: 'Cyber Defense',  value: 94, target: 90, color: '#4ade80' },
      { label: 'Ammo Stock',     value: 68, target: 75, color: '#f97316' }
    ];
  }

  // ============================================
  // AI INSIGHTS (natural language summaries)
  // ============================================
  function getAIInsights() {
    return [
      {
        id: 'ins-001',
        icon: '📈',
        color: '#22c55e',
        title: 'Personnel Readiness Meningkat',
        text: 'Readiness rata-rata naik <strong>+12%</strong> dalam 7 hari terakhir. Kodam Brawijaya & Siliwangi leading.',
        confidence: 0.92,
        model: 'succession-ai',
        level: 'HIGH'
      },
      {
        id: 'ins-002',
        icon: '⚠️',
        color: '#eab308',
        title: 'Fuel Stock Warning',
        text: 'Gudang Jayapura & Merauke di bawah threshold. Prediksi restock dalam <strong>3 hari</strong> jika tidak ada resupply.',
        confidence: 0.88,
        model: 'fuel-predictor',
        level: 'HIGH'
      },
      {
        id: 'ins-003',
        icon: '🛡️',
        color: '#a855f7',
        title: 'Cyber Threat ELEVATED',
        text: 'Deteksi APT dari 12 negara. Auto-block aktif. <strong>23 critical events</strong> dalam 24 jam terakhir.',
        confidence: 0.87,
        model: 'threat-classifier',
        level: 'HIGH'
      },
      {
        id: 'ins-004',
        icon: '📊',
        color: '#60a5fa',
        title: 'Mission Success Rate 87%',
        text: 'Dari 6 mission aktif, 3 executing dengan progress rata-rata <strong>45%</strong>. ETA completion: 5-10 hari.',
        confidence: 0.78,
        model: 'strategic-advisor',
        level: 'MEDIUM'
      }
    ];
  }

  // ============================================
  // TOP PERFORMERS
  // ============================================
  function getTopPerformers() {
    return [
      { name: 'Kodam V/Brawijaya',   kpi: 92, readiness: 92, units: 172, trend: 'up' },
      { name: 'Kodam Jaya',           kpi: 94, readiness: 94, units: 85,  trend: 'up' },
      { name: 'Kodam III/Siliwangi', kpi: 91, readiness: 91, units: 156, trend: 'flat' },
      { name: 'Kodam IV/Diponegoro', kpi: 89, readiness: 89, units: 138, trend: 'up' },
      { name: 'Kodam XIV/Hasanuddin',kpi: 87, readiness: 87, units: 108, trend: 'down' }
    ];
  }

  // ============================================
  // SUMMARY STATS
  // ============================================
  function getSummaryStats() {
    return [
      { label: 'Overall Readiness', value: '87.3%',   trend: 'up',   delta: '+2.1',  color: '#22c55e' },
      { label: 'Personnel Active',  value: '259K',    trend: 'up',   delta: '+0.8K', color: '#3b82f6' },
      { label: 'Assets Deployed',   value: '1,612',   trend: 'flat', delta: '0',     color: '#a855f7' },
      { label: 'Threat Level',      value: 'ELEVATED',trend: 'up',   delta: '+1',    color: '#ef4444' },
      { label: 'Missions Active',   value: '6',       trend: 'up',   delta: '+1',    color: '#f97316' },
      { label: 'Cyber Alerts',      value: '1,287',   trend: 'down', delta: '-12%',  color: '#eab308' }
    ];
  }

  return {
    generateKPITrend,
    getPersonnelByRank,
    getLogisticsBreakdown,
    getThreatRadar,
    getPredictiveData,
    getRealtimeGauges,
    getAIInsights,
    getTopPerformers,
    getSummaryStats
  };
})();

if (typeof window !== 'undefined') window.AnalitikData = AnalitikData;
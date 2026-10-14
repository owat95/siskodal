/* ============================================================
 * LOGISTICS-AI.JS â€” AI Engine untuk 5 area logistik militer
 * ============================================================ */

const LogisticsAI = (() => {
  'use strict';

  // ============================================
  // 1. PREDICTIVE LOGISTICS
  // ============================================
  function predictFuelDepletion(alutsista, dailyUsageKm = 40) {
    const avgConsumption = 0.5;
    const consumptionByType = {
      'MBT': 3.5, 'IFV': 1.8, 'Artillery': 2.2,
      'Fighter': 15, 'Transport': 8,
      'Frigate': 40, 'Submarine': 20, 'Landing Craft': 25
    };
    // Operational profile: peace-time usage (km/day)
    const usageByType = {
      'MBT': 50, 'IFV': 60, 'Artillery': 30,
      'Fighter': 0.5, 'Transport': 4,   // fighter dalam jam terbang setara
      'Frigate': 200, 'Submarine': 50, 'Landing Craft': 100
    };
    const effectiveKm = usageByType[alutsista.type] || dailyUsageKm;

    const cons = consumptionByType[alutsista.type] || avgConsumption;
    const dailyConsumption = cons * effectiveKm;
    const fuelLiters = alutsista.fuelLevel / 100 * alutsista.fuelCapacity;
    const daysRemaining = fuelLiters / dailyConsumption;

    let severity = 'LOW';
    if (daysRemaining < 1) severity = 'CRITICAL';
    else if (daysRemaining < 3) severity = 'HIGH';
    else if (daysRemaining < 7) severity = 'MEDIUM';

    return {
      alutsista: alutsista.name,
      currentFuel: alutsista.fuelLevel,
      fuelLiters: Math.round(alutsista.fuelLevel / 100 * alutsista.fuelCapacity),
      dailyConsumption: Math.round(dailyConsumption),
      daysRemaining: Math.round(daysRemaining * 10) / 10,
      severity,
      recommendation: severity === 'CRITICAL'
        ? `REFUEL SEGERA â€” sisa ${Math.round(daysRemaining * 10) / 10} hari`
        : severity === 'HIGH'
        ? `Jadwalkan refuel dalam 24 jam`
        : `Aman â€” monitor rutin`
    };
  }

  function predictSparePartFailure(alutsista) {
    // Mock: failure probability naik dengan hours
    const baseHours = 5000;
    const wearRatio = alutsista.hoursOperational / baseHours;

    // Waktu sejak maintenance terakhir
    const daysSinceMaint = Math.round((Date.now() - new Date(alutsista.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24));

    let failureRisk = wearRatio * 50 + (daysSinceMaint / 180) * 50;
    if (failureRisk > 100) failureRisk = 100;

    let severity = 'LOW';
    if (failureRisk > 75) severity = 'CRITICAL';
    else if (failureRisk > 50) severity = 'HIGH';
    else if (failureRisk > 30) severity = 'MEDIUM';

    return {
      alutsista: alutsista.name,
      hoursOperational: alutsista.hoursOperational,
      daysSinceMaintenance: daysSinceMaint,
      failureRisk: Math.round(failureRisk),
      severity,
      prediction: severity === 'CRITICAL'
        ? `Kemungkinan rusak dalam 7-14 hari â€” jadwalkan ganti spare part`
        : severity === 'HIGH'
        ? `Monitor intensif, siapkan spare part`
        : `Kondisi normal`
    };
  }

  // ============================================
  // 2. AUTONOMOUS RESUPPLY
  // ============================================
  function recommendAutonomousResupply(gudang, criticalItems) {
    const recommendations = [];

    criticalItems.forEach(item => {
      if (item.severity === 'CRITICAL' || item.severity === 'HIGH') {
        // Hitung jarak ke gudang terdekat
        const nearest = gudang.reduce((min, g) => {
          const dist = Math.abs(g.stock[item.type] - item.needed);
          return dist < min.dist ? { gudang: g, dist } : min;
        }, { gudang: null, dist: Infinity });

        if (nearest.gudang) {
          recommendations.push({
            target: item.alutsista || item.location,
            source: nearest.gudang.name,
            province: nearest.gudang.province,
            itemType: item.type,
            quantity: item.needed || 100,
            vehicle: item.severity === 'CRITICAL' ? 'UAV MALE (Otonom)' : 'UGV Konvoi',
            priority: item.severity,
            etaHours: item.severity === 'CRITICAL' ? 4 : 12,
            risk: item.severity === 'CRITICAL' ? 'Mengirim UAV tanpa awak â€” zero risiko personel' : 'Konvoi darat â€” medium risk'
          });
        }
      }
    });

    return recommendations;
  }

  // ============================================
  // 3. OPTIMASI RANTAI PASOK
  // ============================================
  function optimizeSupplyChain(gudang) {
    // Deteksi imbalance antar gudang
    const imbalances = [];
    const avgStock = {};

    ['amunisi', 'bahan_bakar', 'makanan', 'spare_parts'].forEach(cat => {
      const values = gudang.map(g => g.stock[cat] / g.capacity);
      avgStock[cat] = values.reduce((a, b) => a + b, 0) / values.length;
    });

    gudang.forEach(g => {
      Object.keys(g.stock).forEach(cat => {
        const ratio = g.stock[cat] / g.capacity;
        const avg = avgStock[cat];
        const diff = ratio - avg;

        if (Math.abs(diff) > 0.15) {
          imbalances.push({
            gudang: g.name,
            province: g.province,
            category: cat,
            ratio: Math.round(ratio * 100),
            avgRatio: Math.round(avg * 100),
            action: diff > 0 ? 'REDISTRIBUSI KELUAR' : 'PERLU RESTOCK',
            surplus: diff > 0 ? Math.round((ratio - avg) * g.capacity) : 0,
            deficit: diff < 0 ? Math.round((avg - ratio) * g.capacity) : 0,
            severity: Math.abs(diff) > 0.25 ? 'HIGH' : 'MEDIUM'
          });
        }
      });
    });

    return imbalances.sort((a, b) => Math.abs(b.ratio - b.avgRatio) - Math.abs(a.ratio - a.avgRatio));
  }

  // ============================================
  // 4. DIGITAL TWIN MAINTENANCE
  // ============================================
  function scheduleMaintenance(alutsista) {
    const schedule = alutsista
      .filter(a => a.status !== 'ready' || predictSparePartFailure(a).severity !== 'LOW')
      .map(a => {
        const failureRisk = predictSparePartFailure(a);
        const daysSinceMaint = Math.round((Date.now() - new Date(a.lastMaintenance).getTime()) / (1000 * 60 * 60 * 24));

        // Rekomendasi slot
        let priority = 'NORMAL';
        let window = '30 hari';
        if (failureRisk.severity === 'CRITICAL') { priority = 'URGENT'; window = '7 hari'; }
        else if (failureRisk.severity === 'HIGH') { priority = 'HIGH'; window = '14 hari'; }
        else if (a.status === 'maintenance') { priority = 'HIGH'; window = '3 hari'; }

        return {
          alutsista: a.name,
          unit: a.unit,
          type: a.type,
          currentStatus: a.status,
          failureRisk: failureRisk.failureRisk,
          daysSinceMaintenance: daysSinceMaint,
          priority,
          recommendedWindow: window,
          estimatedDuration: a.type === 'Fighter' ? '72 jam' : a.type === 'Frigate' ? '168 jam' : '48 jam',
          facility: a.type === 'Fighter' ? 'Depohar AU' : a.type === 'Frigate' ? 'Galangan AL' : 'Bengkel Pusat AD'
        };
      })
      .sort((a, b) => {
        const order = { 'URGENT': 0, 'HIGH': 1, 'NORMAL': 2 };
        return order[a.priority] - order[b.priority];
      });

    return schedule;
  }

  // ============================================
  // 5. KEAMANAN RANTAI PASOK SIBER
  // ============================================
  function analyzeCyberThreats(anomalies) {
    return anomalies.map(a => {
      // Threat score
      let score = 50;
      if (a.severity === 'HIGH') score = 85;
      else if (a.severity === 'MEDIUM') score = 60;
      else score = 30;

      // Rekomendasi response
      const responses = {
        GPS_SPOOFING: 'Aktifkan INS backup, verifikasi posisi via visual/manual',
        AIS_SPOOFING: 'Cross-check dengan radar pantai, lock target',
        DATA_TAMPERING: 'Isolasi node, restore manifest dari backup hash',
        MANIFEST_TAMPERING: 'Verifikasi ulang dengan KOT (Kantor Otoritas Terkait)',
        UNKNOWN: 'Escalate ke Divisi Siber untuk forensik'
      };

      return {
        ...a,
        threatScore: score,
        response: responses[a.type] || responses.UNKNOWN,
        mitre: a.type === 'GPS_SPOOFING' ? 'T1499 - Endpoint DoS' :
               a.type === 'DATA_TAMPERING' ? 'T1565 - Data Manipulation' :
               'T1071 - Application Layer Protocol',
        timeAgo: Math.round((Date.now() - a.timestamp) / 60000) + ' menit lalu'
      };
    }).sort((a, b) => b.threatScore - a.threatScore);
  }

  // ============================================
  // MASTER: ANALYZE ALL (per matra)
  // ============================================
  function analyzeAll(matra) {
    const alutsista = LogisticsData.getAlutsista(matra);
    const gudang = LogisticsData.getGudang(matra);
    const anomalies = LogisticsData.getAnomalies(matra);

    // Predictive logistics
    const fuelPredictions = alutsista.map(a => predictFuelDepletion(a));
    const partPredictions = alutsista.map(a => predictSparePartFailure(a));

    const criticalFuel = fuelPredictions.filter(p => p.severity === 'CRITICAL' || p.severity === 'HIGH');
    const criticalParts = partPredictions.filter(p => p.severity === 'CRITICAL' || p.severity === 'HIGH');

    // Autonomous resupply
    const autonomousRecs = recommendAutonomousResupply(gudang, [
      ...criticalFuel.map(p => ({ ...p, type: 'bahan_bakar', needed: p.dailyConsumption * 7 })),
      ...criticalParts.map(p => ({ ...p, type: 'spare_parts', needed: 1 }))
    ]);

    // Supply chain
    const supplyImbalances = optimizeSupplyChain(gudang);

    // Maintenance schedule
    const maintenanceSchedule = scheduleMaintenance(alutsista);

    // Cyber threats
    const cyberThreats = analyzeCyberThreats(anomalies);

    return {
      matra,
      summary: {
        totalAlutsista: alutsista.length,
        readyCount: alutsista.filter(a => a.status === 'ready').length,
        maintenanceCount: alutsista.filter(a => a.status === 'maintenance').length,
        criticalFuel: criticalFuel.length,
        criticalParts: criticalParts.length,
        autonomousOps: autonomousRecs.length,
        cyberThreats: cyberThreats.length,
        supplyImbalances: supplyImbalances.length
      },
      fuelPredictions,
      partPredictions,
      criticalFuel,
      criticalParts,
      autonomousRecs,
      supplyImbalances,
      maintenanceSchedule,
      cyberThreats
    };
  }

  return {
    predictFuelDepletion,
    predictSparePartFailure,
    recommendAutonomousResupply,
    optimizeSupplyChain,
    scheduleMaintenance,
    analyzeCyberThreats,
    analyzeAll
  };
})();

if (typeof window !== 'undefined') window.LogisticsAI = LogisticsAI;
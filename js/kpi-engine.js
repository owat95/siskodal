/* ============================================================
 * KPI-ENGINE.JS — v1.0
 * Military Personnel KPI + Promotion + Salary Band
 * ============================================================ */

const KPIEngine = (() => {
  'use strict';

  // ============================================
  // KPI CATEGORIES + WEIGHTS
  // ============================================
  const KPI_WEIGHTS = {
    skill:      0.30,  // Kemampuan teknis (marksmanship, seamanship, flight)
    fitness:    0.15,  // Kebugaran fisik (SAMAPTA, test fisik)
    leadership: 0.20,  // Kepemimpinan (penilaian atasan)
    discipline: 0.15,  // Disiplin (kehadiran, pelanggaran)
    ops:        0.20   // Pengalaman operasi (jam operasi, mission count)
  };

  // ============================================
  // RANK PROGRESSION (per matra)
  // ============================================
  const RANKS = {
    ad: [
      { code: 'PRADA',  name: 'Prada',            tier: 1, minYears: 0,  salaryBase: 2400000 },
      { code: 'PRATU',  name: 'Pratu',            tier: 1, minYears: 3,  salaryBase: 2700000 },
      { code: 'KOPDA',  name: 'Kopda',            tier: 1, minYears: 5,  salaryBase: 3000000 },
      { code: 'KOPTU',  name: 'Koptu',            tier: 1, minYears: 7,  salaryBase: 3400000 },
      { code: 'KOPKA',  name: 'Kopka',            tier: 1, minYears: 9,  salaryBase: 3800000 },
      { code: 'SERMA',  name: 'Serma',            tier: 1, minYears: 12, salaryBase: 4400000 },
      { code: 'PELDA',  name: 'Pelda',            tier: 1, minYears: 15, salaryBase: 5000000 },
      { code: 'PELTU',  name: 'Peltu',            tier: 1, minYears: 18, salaryBase: 5800000 },
      { code: 'LETDA',  name: 'Letda',            tier: 2, minYears: 0,  salaryBase: 6500000 },
      { code: 'LETTU',  name: 'Lettu',            tier: 2, minYears: 3,  salaryBase: 7200000 },
      { code: 'KAPTEN', name: 'Kapten',           tier: 2, minYears: 6,  salaryBase: 8000000 },
      { code: 'MAYOR',  name: 'Mayor',            tier: 2, minYears: 10, salaryBase: 9500000 },
      { code: 'LETKOL', name: 'Letkol',           tier: 2, minYears: 14, salaryBase: 12000000 },
      { code: 'KOLONEL',name: 'Kolonel',          tier: 3, minYears: 19, salaryBase: 16000000 },
      { code: 'BRIGJEN',name: 'Brigjen',          tier: 3, minYears: 24, salaryBase: 22000000 },
      { code: 'MAYJEN', name: 'Mayjen',           tier: 3, minYears: 28, salaryBase: 28000000 },
      { code: 'LETJEN', name: 'Letjen',           tier: 3, minYears: 32, salaryBase: 35000000 },
      { code: 'JENDERAL',name: 'Jenderal',        tier: 3, minYears: 36, salaryBase: 42000000 }
    ],
    al: [
      { code: 'KELASI',  name: 'Kelasi',          tier: 1, minYears: 0,  salaryBase: 2400000 },
      { code: 'KOPRAL',  name: 'Kopral',          tier: 1, minYears: 3,  salaryBase: 2700000 },
      { code: 'SERSAN',  name: 'Sersan',          tier: 1, minYears: 8,  salaryBase: 4000000 },
      { code: 'SERKA',   name: 'Serka',           tier: 1, minYears: 12, salaryBase: 5000000 },
      { code: 'SERMA',   name: 'Serma',           tier: 1, minYears: 15, salaryBase: 5800000 },
      { code: 'LETDA',   name: 'Letda',           tier: 2, minYears: 0,  salaryBase: 6500000 },
      { code: 'LETTU',   name: 'Lettu',           tier: 2, minYears: 3,  salaryBase: 7200000 },
      { code: 'KAPTEN',  name: 'Kapten',          tier: 2, minYears: 6,  salaryBase: 8000000 },
      { code: 'MAYOR',   name: 'Mayor',           tier: 2, minYears: 10, salaryBase: 9500000 },
      { code: 'LETKOL',  name: 'Letkol',          tier: 2, minYears: 14, salaryBase: 12000000 },
      { code: 'KOLONEL', name: 'Kolonel',         tier: 3, minYears: 19, salaryBase: 16000000 },
      { code: 'LAKSMA',  name: 'Laksamana Pertama',tier:3, minYears: 24, salaryBase: 22000000 },
      { code: 'LAKSMU',  name: 'Laksamana Muda',  tier: 3, minYears: 28, salaryBase: 28000000 },
      { code: 'LAKSMA_M',name: 'Laksamana Madya', tier: 3, minYears: 32, salaryBase: 35000000 },
      { code: 'LAKSAMANA',name: 'Laksamana',      tier: 3, minYears: 36, salaryBase: 42000000 }
    ],
    au: [
      { code: 'PRADA',  name: 'Prada',            tier: 1, minYears: 0,  salaryBase: 2400000 },
      { code: 'PRATU',  name: 'Pratu',            tier: 1, minYears: 3,  salaryBase: 2700000 },
      { code: 'KOPDA',  name: 'Kopda',            tier: 1, minYears: 5,  salaryBase: 3000000 },
      { code: 'KOPTU',  name: 'Koptu',            tier: 1, minYears: 7,  salaryBase: 3400000 },
      { code: 'KOPKA',  name: 'Kopka',            tier: 1, minYears: 9,  salaryBase: 3800000 },
      { code: 'SERMA',  name: 'Serma',            tier: 1, minYears: 12, salaryBase: 4400000 },
      { code: 'PELDA',  name: 'Pelda',            tier: 1, minYears: 15, salaryBase: 5000000 },
      { code: 'PELTU',  name: 'Peltu',            tier: 1, minYears: 18, salaryBase: 5800000 },
      { code: 'LETDA',  name: 'Letda',            tier: 2, minYears: 0,  salaryBase: 6500000 },
      { code: 'LETTU',  name: 'Lettu',            tier: 2, minYears: 3,  salaryBase: 7200000 },
      { code: 'KAPTEN', name: 'Kapten',           tier: 2, minYears: 6,  salaryBase: 8000000 },
      { code: 'MAYOR',  name: 'Mayor',            tier: 2, minYears: 10, salaryBase: 9500000 },
      { code: 'LETKOL', name: 'Letkol',           tier: 2, minYears: 14, salaryBase: 12000000 },
      { code: 'KOLONEL',name: 'Kolonel',          tier: 3, minYears: 19, salaryBase: 16000000 },
      { code: 'MARSMA', name: 'Marsekal Pertama', tier: 3, minYears: 24, salaryBase: 22000000 },
      { code: 'MARSMU', name: 'Marsekal Muda',    tier: 3, minYears: 28, salaryBase: 28000000 },
      { code: 'MARSMA_M',name:'Marsekal Madya',   tier: 3, minYears: 32, salaryBase: 35000000 },
      { code: 'MARSKAL',name: 'Marsekal',         tier: 3, minYears: 36, salaryBase: 42000000 }
    ]
  };

  // ============================================
  // COMPOSITE KPI SCORE (0-100)
  // ============================================
  function computeComposite(kpi) {
    if (!kpi) return 0;
    let score = 0;
    score += (kpi.skill || 0) * KPI_WEIGHTS.skill;
    score += (kpi.fitness || 0) * KPI_WEIGHTS.fitness;
    score += (kpi.leadership || 0) * KPI_WEIGHTS.leadership;
    score += (kpi.discipline || 0) * KPI_WEIGHTS.discipline;
    score += (kpi.ops || 0) * KPI_WEIGHTS.ops;
    return Math.round(score * 10) / 10;
  }

  // ============================================
  // PROMOTION ELIGIBILITY
  // ============================================
  function assessPromotion(person, matra) {
    const ranks = RANKS[matra];
    const currentIdx = ranks.findIndex(r => r.code === person.rank);
    if (currentIdx === -1) return null;
    if (currentIdx === ranks.length - 1) {
      return { eligible: false, reason: 'Pangkat tertinggi — tidak ada promosi' };
    }

    const current = ranks[currentIdx];
    const next = ranks[currentIdx + 1];

    // Cek syarat waktu
    const yearsInRank = (Date.now() - new Date(person.lastPromotionDate).getTime()) / (365.25 * 24 * 3600 * 1000);
    const minYears = next.minYears - current.minYears;
    const timeOK = yearsInRank >= minYears;

    // Cek KPI
    const composite = computeComposite(person.kpi);
    const kpiOK = composite >= 75; // threshold promosi

    // Cek pelanggaran
    const noViolations = (person.violations || 0) === 0;

    // Readiness score
    let readiness = 0;
    if (timeOK) readiness += 40;
    if (kpiOK) readiness += 40;
    if (noViolations) readiness += 20;

    let status, recommendation;
    if (readiness >= 90) {
      status = 'READY';
      recommendation = `Siap diusulkan ke ${next.name}`;
    } else if (readiness >= 60) {
      status = 'PENDING';
      recommendation = `Perlu perbaikan: ${!timeOK ? 'waktu dinas ' : ''}${!kpiOK ? 'KPI ' : ''}${!noViolations ? 'pelanggaran' : ''}`.trim();
    } else {
      status = 'NOT_READY';
      recommendation = `Belum memenuhi syarat promosi`;
    }

    return {
      currentRank: current,
      nextRank: next,
      yearsInRank: Math.round(yearsInRank * 10) / 10,
      minYearsRequired: minYears,
      composite: composite,
      kpiOK,
      timeOK,
      noViolations,
      readiness,
      status,
      recommendation
    };
  }

  // ============================================
  // SALARY CALCULATION
  // ============================================
  function computeSalary(person, matra) {
    const ranks = RANKS[matra];
    const rank = ranks.find(r => r.code === person.rank);
    if (!rank) return null;

    let base = rank.salaryBase;
    let allowance = 0;
    let bonus = 0;

    // Tunjangan berdasarkan composite KPI
    const composite = computeComposite(person.kpi);
    if (composite >= 90)      allowance = base * 0.25;  // Excellent
    else if (composite >= 80) allowance = base * 0.15;  // Very good
    else if (composite >= 70) allowance = base * 0.08;  // Good

    // Tunjangan wilayah / operasi
    if (person.area === 'PAPUA' || person.area === 'NATUNA' || person.area === 'PERBATASAN') {
      allowance += base * 0.30;
    }

    // Tunjangan spesialis (pilot, kapal selam, dll)
    if (person.specialty === 'PILOT')      allowance += base * 0.40;
    if (person.specialty === 'SUBMARINER') allowance += base * 0.45;
    if (person.specialty === 'KOPASSUS')   allowance += base * 0.35;
    if (person.specialty === 'MARINIR')    allowance += base * 0.30;

    // Bonus prestasi
    if (person.awards && person.awards > 3) bonus = base * 0.10;

    const total = base + allowance + bonus;

    return {
      base,
      allowance: Math.round(allowance),
      bonus: Math.round(bonus),
      total: Math.round(total),
      composite,
      rankName: rank.name
    };
  }

  // ============================================
  // FORMAT HELPERS
  // ============================================
  function formatIDR(amount) {
    return 'Rp ' + amount.toLocaleString('id-ID');
  }

  function getRankName(matra, code) {
    const r = RANKS[matra].find(x => x.code === code);
    return r ? r.name : code;
  }

  function getRankList(matra) {
    return RANKS[matra] || [];
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    KPI_WEIGHTS,
    RANKS,
    computeComposite,
    assessPromotion,
    computeSalary,
    formatIDR,
    getRankName,
    getRankList
  };
})();

if (typeof window !== 'undefined') window.KPIEngine = KPIEngine;
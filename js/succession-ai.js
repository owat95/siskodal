/* ============================================================
 * SUCCESSION-AI.JS — AI Recommendation Engine
 * Mencocokkan personel terbaik dengan posisi yang akan kosong
 * ============================================================ */

const SuccessionAI = (() => {
  'use strict';

  // ============================================
  // SCORING WEIGHTS
  // ============================================
  const WEIGHTS = {
    rankMatch:      0.30,   // Pangkat sesuai kebutuhan
    kpiScore:       0.25,   // Composite KPI
    specialtyMatch: 0.15,   // Sesuai spesialisasi
    provinceExp:    0.10,   // Pengalaman di provinsi yang sama
    education:      0.10,   // Level pendidikan
    intlExp:        0.10    // Pengalaman internasional
  };

  // ============================================
  // HITUNG SKOR KECOCOKAN
  // ============================================
  function scoreCandidate(person, position, matra) {
    const ranks = PersonnelData.RANKS[matra];
    const targetRankIdx = ranks.indexOf(position.neededRank);

    // 1. Rank match (30%)
    let rankScore = 0;
    if (person.rankIdx === targetRankIdx) rankScore = 100;
    else if (person.rankIdx === targetRankIdx - 1) rankScore = 80;  // 1 tingkat di bawah
    else if (person.rankIdx === targetRankIdx + 1) rankScore = 60;  // 1 tingkat di atas (over-qualified)
    else rankScore = Math.max(0, 100 - Math.abs(person.rankIdx - targetRankIdx) * 25);

    // 2. KPI (25%)
    const composite = KPIEngine.computeComposite(person.kpi);
    const kpiScore = Math.min(100, composite * 1.05);

    // 3. Specialty match (15%)
    const specMatch = person.specialty.includes(position.position.split(' ')[1]?.toUpperCase() || '') ? 90 : 50;

    // 4. Province experience (10%)
    const provinceScore = person.province === position.province ? 100 : 60;

    // 5. Education level (10%)
    const eduLevel = person.education.length > 0 ? 
      Math.max(...person.education.map(e => e.tier)) : 1;
    const eduScore = eduLevel * 33;

    // 6. International experience (10%)
    const intlScore = Math.min(100, person.intlAssignments.length * 40 + 40);

    // Composite
    const total = 
      rankScore      * WEIGHTS.rankMatch +
      kpiScore       * WEIGHTS.kpiScore +
      specMatch      * WEIGHTS.specialtyMatch +
      provinceScore  * WEIGHTS.provinceExp +
      eduScore       * WEIGHTS.education +
      intlScore      * WEIGHTS.intlExp;

    return {
      total: Math.round(total * 10) / 10,
      breakdown: {
        rank: Math.round(rankScore),
        kpi: Math.round(kpiScore),
        specialty: Math.round(specMatch),
        province: Math.round(provinceScore),
        education: Math.round(eduScore),
        international: Math.round(intlScore)
      }
    };
  }

  // ============================================
  // REKOMENDASI TOP N KANDIDAT
  // ============================================
  function recommendForPosition(position, matra, topN = 3) {
    const candidates = PersonnelData.get(matra);
    
    const scored = candidates
      .filter(p => p.status === 'active')
      .filter(p => {
        // Filter: pangkat minimal 1 tingkat di bawah target
        const ranks = PersonnelData.RANKS[matra];
        const targetIdx = ranks.indexOf(position.neededRank);
        return p.rankIdx >= targetIdx - 1 && p.rankIdx <= targetIdx + 1;
      })
      .map(p => {
        const score = scoreCandidate(p, position, matra);
        return { person: p, score };
      })
      .sort((a, b) => b.score.total - a.score.total)
      .slice(0, topN);

    return scored;
  }

  // ============================================
  // ANALISA SEMUA POSISI TERBUKA
  // ============================================
  function analyzeAll(matra) {
    const positions = PersonnelData.OPEN_POSITIONS[matra] || [];
    return positions.map(pos => ({
      position: pos,
      candidates: recommendForPosition(pos, matra, 3)
    }));
  }

  // ============================================
  // GENERATE REKOMENDASI TEXT (untuk table)
  // ============================================
  function generateAIText(person, matra) {
    const positions = PersonnelData.OPEN_POSITIONS[matra] || [];
    const composite = KPIEngine.computeComposite(person.kpi);
    
    // Cari posisi yang cocok dengan personel ini
    const recommendations = [];
    
    positions.forEach(pos => {
      const candidates = recommendForPosition(pos, matra, 5);
      const found = candidates.find(c => c.person.id === person.id);
      if (found && found.score.total >= 70) {
        recommendations.push({
          position: pos,
          score: found.score,
          priority: found.score.total >= 85 ? 'HIGH' : 'MEDIUM'
        });
      }
    });

    if (recommendations.length === 0) {
      return {
        text: 'Tidak ada rekomendasi aktif',
        priority: 'LOW',
        candidates: []
      };
    }

    // Sort by score
    recommendations.sort((a, b) => b.score.total - a.score.total);

    const top = recommendations[0];
    const text = `→ ${top.position.position} (${top.position.province}) — menggantikan ${top.position.currentHolder} (${top.position.reason})`;

    return {
      text: text,
      priority: top.priority,
      score: top.score.total,
      recommendation: top,
      all: recommendations
    };
  }

  // ============================================
  // SUMMARY PER PROVINSI
  // ============================================
  function summaryByProvince(matra) {
    const positions = PersonnelData.OPEN_POSITIONS[matra] || [];
    const byProvince = {};
    
    positions.forEach(pos => {
      if (!byProvince[pos.province]) byProvince[pos.province] = [];
      byProvince[pos.province].push(pos);
    });

    return byProvince;
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    WEIGHTS,
    scoreCandidate,
    recommendForPosition,
    analyzeAll,
    generateAIText,
    summaryByProvince
  };
})();

if (typeof window !== 'undefined') window.SuccessionAI = SuccessionAI;
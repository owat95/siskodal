/* ============================================================
 * AI-CONFIDENCE.JS â€” AI Model Confidence & Fallibility Tracking
 * Setiap output AI wajib punya confidence score + disclaimer
 * ============================================================ */

const AIConfidence = (() => {
  'use strict';

  // ============================================
  // MODEL REGISTRY
  // ============================================
  const MODELS = {
    'yolo-detector': {
      name: 'YOLOv8n Object Detector',
      type: 'CV',
      baseAccuracy: 0.89,
      lastValidation: Date.now() - 24 * 3600 * 1000,
      sampleSize: 12450,
      knownIssues: ['Overcast low visibility', 'Small objects >500m'],
      version: 'v8.0-custom'
    },
    'ais-spoof-detector': {
      name: 'AIS Spoofing Detector',
      type: 'ANOMALY',
      baseAccuracy: 0.94,
      lastValidation: Date.now() - 12 * 3600 * 1000,
      sampleSize: 8934,
      knownIssues: ['False positive during AIS station restart'],
      version: 'v2.3'
    },
    'threat-classifier': {
      name: 'Threat Classification AI',
      type: 'NLP',
      baseAccuracy: 0.87,
      lastValidation: Date.now() - 6 * 3600 * 1000,
      sampleSize: 5621,
      knownIssues: ['Sarcasm/irony handling', 'Low-resource languages'],
      version: 'v3.1'
    },
    'fuel-predictor': {
      name: 'Predictive Fuel Analytics',
      type: 'REGRESSION',
      baseAccuracy: 0.91,
      lastValidation: Date.now() - 3 * 3600 * 1000,
      sampleSize: 3421,
      knownIssues: ['Unusual terrain affects accuracy Â±12%'],
      version: 'v1.4'
    },
    'succession-ai': {
      name: 'Military Succession AI',
      type: 'SCORING',
      baseAccuracy: 0.85,
      lastValidation: Date.now() - 2 * 3600 * 1000,
      sampleSize: 890,
      knownIssues: ['Needs human review untuk pangkat tinggi'],
      version: 'v2.0'
    },
    'strategic-advisor': {
      name: 'Strategic Advisor (OODA)',
      type: 'LLM',
      baseAccuracy: 0.78,
      lastValidation: Date.now() - 1 * 3600 * 1000,
      sampleSize: 247,
      knownIssues: ['Rule-based fallback', 'Needs human-in-the-loop'],
      version: 'Mock-Mode'
    }
  };

  // ============================================
  // COMPUTE CONFIDENCE
  // ============================================
  function computeConfidence(modelId, context = {}) {
    const model = MODELS[modelId];
    if (!model) return null;

    let confidence = model.baseAccuracy;

    // Context modifiers
    if (context.dataQuality !== undefined) {
      confidence *= (0.7 + context.dataQuality * 0.3);
    }

    // Freshness: stale data â†’ lower confidence
    if (context.dataAgeSec) {
      if (context.dataAgeSec > 300) confidence *= 0.85;
      else if (context.dataAgeSec > 60) confidence *= 0.95;
    }

    // Weather/difficulty
    if (context.conditions === 'ADVERSE') confidence *= 0.85;
    if (context.conditions === 'NIGHT') confidence *= 0.92;

    // Distance factor
    if (context.distance && context.distance > 500) confidence *= 0.9;

    // Sample maturity
    if (context.sampleSize && context.sampleSize < 50) confidence *= 0.8;

    // Clamp
    confidence = Math.max(0.4, Math.min(0.99, confidence));

    // Confidence level
    let level = 'LOW';
    if (confidence >= 0.85) level = 'HIGH';
    else if (confidence >= 0.7) level = 'MEDIUM';

    return {
      modelId,
      model,
      confidence: Math.round(confidence * 100) / 100,
      confidencePct: Math.round(confidence * 100),
      level,
      color: level === 'HIGH' ? '#22c55e' : level === 'MEDIUM' ? '#eab308' : '#ef4444',
      disclaimer: getDisclaimer(level, model),
      validated: (Date.now() - model.lastValidation) < 7 * 24 * 3600 * 1000,
      version: model.version
    };
  }

  function getDisclaimer(level, model) {
    if (level === 'HIGH') return `Model akurasi tinggi. Human oversight tetap diperlukan untuk keputusan operasional.`;
    if (level === 'MEDIUM') return `Model akurasi sedang. Cross-check dengan sumber lain sebelum mengambil tindakan.`;
    return `âš  Model akurasi rendah. Hasil AI <strong>wajib diverifikasi</strong> oleh analis manusia. Jangan gunakan sebagai satu-satunya dasar keputusan.`;
  }

  // ============================================
  // GET MODEL INFO
  // ============================================
  function getModel(id) {
    return MODELS[id] || null;
  }

  function getAllModels() {
    return Object.entries(MODELS).map(([id, m]) => ({ id, ...m }));
  }

  function getValidationStatus(modelId) {
    const m = MODELS[modelId];
    if (!m) return null;

    const ageH = (Date.now() - m.lastValidation) / 3600 / 1000;
    let status = 'VALIDATED';
    let color = '#22c55e';

    if (ageH > 168) { // 7 days
      status = 'STALE';
      color = '#eab308';
    }
    if (ageH > 720) { // 30 days
      status = 'EXPIRED';
      color = '#ef4444';
    }

    return {
      status,
      color,
      ageH: Math.round(ageH),
      ageText: ageH < 24 ? `${Math.round(ageH)}h` : `${Math.round(ageH / 24)}d`,
      lastValidation: m.lastValidation
    };
  }

  // ============================================
  // RENDER AI BADGE (untuk ditempel di UI)
  // ============================================
  function renderBadge(containerId, modelId, context = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const c = computeConfidence(modelId, context);
    if (!c) return;

    const valStatus = getValidationStatus(modelId);

    container.innerHTML = `
      <div class="ai-confidence-badge" title="${c.disclaimer}">
        <span class="acb-icon">ðŸ¤–</span>
        <span class="acb-model">${c.model.name}</span>
        <span class="acb-score" style="color:${c.color};">
          ${c.confidencePct}%
        </span>
        <span class="acb-level" style="background:${c.color}22; color:${c.color};">
          ${c.level}
        </span>
        <span class="acb-validation" style="color:${valStatus.color};" title="Last validation: ${valStatus.ageText}">
          ${valStatus.status}
        </span>
      </div>
    `;
  }

  // ============================================
  // SAFE RECOMMENDATION WRAPPER
  // ============================================
  function wrapRecommendation(text, modelId, context = {}) {
    const c = computeConfidence(modelId, context);
    if (!c) return text;

    return {
      text,
      confidence: c.confidence,
      level: c.level,
      color: c.color,
      disclaimer: c.disclaimer,
      modelName: c.model.name,
      version: c.version
    };
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    MODELS,
    computeConfidence,
    getModel,
    getAllModels,
    getValidationStatus,
    renderBadge,
    wrapRecommendation
  };
})();

if (typeof window !== 'undefined') window.AIConfidence = AIConfidence;
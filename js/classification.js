/* ============================================================
 * CLASSIFICATION.JS â€” Data Classification Marking (NATO Standard)
 * Setiap halaman WAJIB punya classification banner
 * ============================================================ */

const Classification = (() => {
  'use strict';

  const LEVELS = {
    UNCLASS:      { code: 'UNCLASS',      label: 'UNCLASSIFIED',   color: '#22c55e', bg: 'rgba(34,197,94,0.15)',  order: 0, abbr: 'UNCLAS' },
    RESTRICTED:   { code: 'RESTRICTED',   label: 'TERBATAS',       color: '#eab308', bg: 'rgba(234,179,8,0.15)',  order: 1, abbr: 'REST' },
    CONFIDENTIAL: { code: 'CONFIDENTIAL', label: 'RAHASIA',        color: '#f97316', bg: 'rgba(249,115,22,0.15)', order: 2, abbr: 'CONF' },
    SECRET:       { code: 'SECRET',       label: 'RAHASIA',        color: '#ef4444', bg: 'rgba(239,68,68,0.15)',  order: 3, abbr: 'SECRET' },
    TOP_SECRET:   { code: 'TOP_SECRET',   label: 'SANGAT RAHASIA', color: '#991b1b', bg: 'rgba(153,27,27,0.25)',  order: 4, abbr: 'TOPSEC' }
  };

  let currentLevel = 'RESTRICTED';
  let currentUser = { name: 'Operator SOC', clearance: 'SECRET', role: 'Analis' };

  // ============================================
  // SET CURRENT LEVEL
  // ============================================
  function setLevel(levelKey) {
    if (!LEVELS[levelKey]) return;
    currentLevel = levelKey;
    renderBanners();
    console.log(`[CLASSIFICATION] Set to ${levelKey}`);
  }

  function getLevel() {
    return LEVELS[currentLevel];
  }

  // ============================================
  // RENDER BANNER (TOP + BOTTOM)
  // ============================================
  function renderBanners() {
    const level = LEVELS[currentLevel];

    // TOP banner
    let top = document.getElementById('classification-banner-top');
    if (!top) {
      top = document.createElement('div');
      top.id = 'classification-banner-top';
      document.body.prepend(top);
    }
    top.className = 'classification-banner classification-top';
    top.style.background = level.bg;
    top.style.borderBottom = `2px solid ${level.color}`;
    top.innerHTML = `
      <span class="cb-label" style="color:${level.color};">${level.label}</span>
      <span class="cb-sep">Â·</span>
      <span class="cb-info">
        <span class="cb-item">ðŸ‘¤ ${currentUser.name}</span>
        <span class="cb-item">ðŸ” Clearance: <strong style="color:${level.color};">${currentUser.clearance}</strong></span>
        <span class="cb-item">ðŸ“… ${new Date().toISOString().split('T')[0]}</span>
        <span class="cb-item cb-handling">Handle via NOFORN Â· TNI-AD</span>
      </span>
    `;

    // BOTTOM banner
    let bottom = document.getElementById('classification-banner-bottom');
    if (!bottom) {
      bottom = document.createElement('div');
      bottom.id = 'classification-banner-bottom';
      document.body.appendChild(bottom);
    }
    bottom.className = 'classification-banner classification-bottom';
    bottom.style.background = level.bg;
    bottom.style.borderTop = `2px solid ${level.color}`;
    bottom.innerHTML = `
      <span class="cb-label" style="color:${level.color};">${level.label}</span>
      <span class="cb-sep">Â·</span>
      <span class="cb-info cb-warning">
        âš  Dokumen ini mengandung informasi berklasifikasi. Penanganan tidak sesuai
        dapat berakibat sanksi hukum sesuai UU No. 36/1999 &amp; UU ITE.
      </span>
    `;

    // Add padding ke body supaya tidak overlap
    document.body.style.paddingTop = '36px';
    document.body.style.paddingBottom = '32px';
  }

  // ============================================
  // RENDER CLASSIFICATION TAG (untuk elemen individual)
  // ============================================
  function renderTag(levelKey, text = null) {
    const level = LEVELS[levelKey] || LEVELS.UNCLASS;
    return `<span class="classification-tag" style="background:${level.bg}; color:${level.color}; border:1px solid ${level.color}55;" title="${level.label}">
      ${text || level.abbr}
    </span>`;
  }

  // ============================================
  // HELPERS
  // ============================================
  function getLevels() {
    return Object.entries(LEVELS).map(([k, v]) => ({ key: k, ...v }));
  }

  function canAccess(requiredLevel) {
    const req = LEVELS[requiredLevel];
    const user = LEVELS[currentUser.clearance];
    if (!req || !user) return false;
    return user.order >= req.order;
  }

  function setUser(user) {
    currentUser = { ...currentUser, ...user };
    renderBanners();
  }

  // ============================================
  // INIT
  // ============================================
  function init(options = {}) {
    if (options.level) currentLevel = options.level;
    if (options.user) currentUser = { ...currentUser, ...options.user };
    renderBanners();
    console.log('[CLASSIFICATION] Initialized');
  }

  return {
    LEVELS,
    init,
    setLevel,
    getLevel,
    getLevels,
    renderTag,
    canAccess,
    setUser,
    renderBanners
  };
})();

if (typeof window !== 'undefined') window.Classification = Classification;
// Auto-load mobile notice
if (typeof window !== 'undefined' && !window.__mobileNoticeLoaded) {
  window.__mobileNoticeLoaded = true;
  const s = document.createElement('script');
  s.src = './js/mobile-notice.js?v=1.0';
  s.setAttribute('data-cfasync', 'false');
  document.head.appendChild(s);
}

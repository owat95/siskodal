/* Mobile Notice — SISKODAL
 * Muncul di HP/tablet kecil, bisa di-dismiss & diingat pilihan user
 * v1.1 — tambah resize listener + UA fallback
 */
(function() {
  'use strict';

  const STORAGE_KEY = 'siskodal-mobile-notice-dismissed';
  const MOBILE_BREAKPOINT = 768;

  function isMobile() {
    const narrowScreen = window.innerWidth <= MOBILE_BREAKPOINT;
    const touchDevice = window.matchMedia('(pointer: coarse)').matches;
    const uaMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    return narrowScreen || touchDevice || uaMobile;
  }

  function isDismissed() {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch(e) {
      return false;
    }
  }

  function dismissNotice() {
    try { localStorage.setItem(STORAGE_KEY, 'true'); } catch(e) {}
    const el = document.getElementById('mobile-notice-overlay');
    if (el) el.remove();
  }

  function showNotice() {
    if (!isMobile() || isDismissed()) return;
    if (document.getElementById('mobile-notice-overlay')) return;

    const overlay = document.createElement('div');
    overlay.id = 'mobile-notice-overlay';
    overlay.innerHTML = `
      <div class="mobile-notice-backdrop"></div>
      <div class="mobile-notice-card">
        <div class="mn-icon">📱</div>
        <h2 class="mn-title">Tampilan Optimal di PC/Laptop</h2>
        <p class="mn-body">
          SISKODAL dirancang untuk <strong>layar lebar</strong> —
          command center, peta 3D, dan dashboard operasional.
          Di smartphone, beberapa modul mungkin tidak tampil optimal.
        </p>
        <p class="mn-body-small">
          Untuk pengalaman terbaik, buka di PC/laptop dengan
          resolusi minimal <strong>1280×720</strong>.
        </p>
        <div class="mn-actions">
          <button class="mn-btn mn-btn-primary" id="mn-continue">
            Lanjut Saja
          </button>
          <button class="mn-btn mn-btn-secondary" id="mn-dismiss">
            Jangan Tampilkan Lagi
          </button>
        </div>
        <p class="mn-footer">Clearance: SECRET · TNI-AD · 2026</p>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('mn-continue').addEventListener('click', () => {
      overlay.remove();
    });
    document.getElementById('mn-dismiss').addEventListener('click', dismissNotice);

    overlay.querySelector('.mobile-notice-backdrop').addEventListener('click', () => {
      overlay.remove();
    });
  }

  function injectStyles() {
    if (document.getElementById('mobile-notice-styles')) return;
    const style = document.createElement('style');
    style.id = 'mobile-notice-styles';
    style.textContent = `
      #mobile-notice-overlay {
        position: fixed;
        inset: 0;
        z-index: 99999;
        display: flex;
        align-items: center;
        justify-content: center;
        animation: mnFadeIn 0.3s ease;
      }
      @keyframes mnFadeIn { from { opacity: 0; } to { opacity: 1; } }
      .mobile-notice-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.85);
        backdrop-filter: blur(4px);
      }
      .mobile-notice-card {
        position: relative;
        max-width: 92vw;
        width: 400px;
        background: linear-gradient(180deg, #1e293b, #0f172a);
        border: 2px solid #dc2626;
        border-radius: 12px;
        padding: 24px 20px 18px;
        color: #e2e8f0;
        font-family: 'Segoe UI', system-ui, sans-serif;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6);
        animation: mnSlideUp 0.35s ease;
      }
      @keyframes mnSlideUp {
        from { transform: translateY(30px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
      .mn-icon {
        font-size: 2.5rem;
        text-align: center;
        margin-bottom: 8px;
      }
      .mn-title {
        font-size: 1.05rem;
        text-align: center;
        letter-spacing: 1px;
        margin: 0 0 12px;
        color: #fecaca;
      }
      .mn-body {
        font-size: 0.82rem;
        line-height: 1.5;
        color: #cbd5e1;
        margin: 0 0 10px;
      }
      .mn-body-small {
        font-size: 0.72rem;
        line-height: 1.4;
        color: #94a3b8;
        margin: 0 0 16px;
        padding: 8px 10px;
        background: rgba(59,130,246,0.08);
        border-left: 3px solid #3b82f6;
        border-radius: 4px;
      }
      .mn-actions {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .mn-btn {
        padding: 10px 16px;
        border-radius: 6px;
        font-size: 0.8rem;
        font-weight: 600;
        cursor: pointer;
        border: none;
        transition: all 0.15s;
      }
      .mn-btn-primary {
        background: #dc2626;
        color: #fff;
      }
      .mn-btn-primary:active { background: #b91c1c; }
      .mn-btn-secondary {
        background: transparent;
        color: #94a3b8;
        border: 1px solid rgba(148,163,184,0.3);
      }
      .mn-btn-secondary:active { background: rgba(148,163,184,0.1); }
      .mn-footer {
        text-align: center;
        font-size: 0.6rem;
        color: #475569;
        letter-spacing: 1px;
        margin: 14px 0 0;
        font-family: 'Courier New', monospace;
      }
    `;
    document.head.appendChild(style);
  }

  function init() {
    injectStyles();
    // Delay pertama (biar halaman load dulu)
    setTimeout(showNotice, 500);
    // Re-check saat user resize (DevTools toggle, rotate, dll)
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(showNotice, 300);
    });
    console.log('[MOBILE-NOTICE] Ready — isMobile():', isMobile());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose for debugging
  window.MobileNotice = {
    show: showNotice,
    dismiss: dismissNotice,
    reset: () => { try { localStorage.removeItem(STORAGE_KEY); } catch(e) {} },
    isMobile: isMobile
  };
})();
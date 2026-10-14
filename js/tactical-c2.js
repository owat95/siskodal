/* ============================================================
 * TACTICAL-C2.JS — Mobile C2 App (Mockup)
 * Version: 1.0.0
 * ============================================================ */
(function() {
  'use strict';

  // ============ CLOCK ============
  function updateClock() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const clockEl = document.getElementById('clock');
    const zuluEl = document.getElementById('zulu-time');
    if (clockEl) clockEl.textContent = hh + ':' + mm;
    if (zuluEl) zuluEl.textContent = hh + ':' + mm + ':' + ss + 'Z';
  }
  setInterval(updateClock, 1000);
  updateClock();

  // ============ BOTTOM NAV & SHEETS ============
  const navButtons = document.querySelectorAll('.nav-btn');
  const sheets = document.querySelectorAll('.sheet');

  navButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sheetName = btn.getAttribute('data-sheet');
      if (sheetName === 'map') {
        closeAllSheets();
        navButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        return;
      }
      const targetSheet = document.getElementById('sheet-' + sheetName);
      if (!targetSheet) return;

      if (targetSheet.classList.contains('open')) {
        targetSheet.classList.remove('open');
        btn.classList.remove('active');
        return;
      }

      closeAllSheets();
      targetSheet.classList.add('open');
      navButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  function closeAllSheets() {
    sheets.forEach(s => s.classList.remove('open'));
  }

  // ============ NIGHT VISION ============
  const nvBtn = document.getElementById('nv-btn');
  if (nvBtn) {
    nvBtn.addEventListener('click', () => {
      document.body.classList.toggle('nv');
      const isNV = document.body.classList.contains('nv');
      nvBtn.innerHTML = isNV
        ? '<i class="fas fa-eye-slash"></i> Normal Mode'
        : '<i class="fas fa-eye"></i> Night Vision Mode';
      showToast(isNV ? '🌙 NIGHT VISION ACTIVE' : '☀️ NORMAL MODE ACTIVE', 'info');
    });
  }

  // ============ SIMULATE ALERT ============
  const alertBtn = document.getElementById('alert-btn');
  if (alertBtn) {
    alertBtn.addEventListener('click', () => {
      showToast('⚠ CONTACT DETECTED — SECTOR 3 · 3 PAX · 500M FRONT', 'danger');
      const chatBtn = document.querySelector('[data-sheet="chat"]');
      if (chatBtn) chatBtn.classList.add('active');
    });
  }

  // ============ TOAST ============
  let toastTimeout;
  function showToast(text, type) {
    const toast = document.getElementById('toast');
    const toastText = document.getElementById('toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.style.background = type === 'danger'
      ? 'rgba(239,68,68,0.95)'
      : 'rgba(34,211,238,0.95)';
    toast.style.color = type === 'danger' ? '#fff' : '#0a0f1e';
    toast.classList.add('show');
    clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // ============ CHAT ============
  const chatInput = document.getElementById('chat-input-field');
  const chatSend = document.getElementById('chat-send');
  const chatMessages = document.querySelector('.chat-messages');

  function sendMessage() {
    if (!chatInput || !chatMessages) return;
    const text = chatInput.value.trim();
    if (!text) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    const msg = document.createElement('div');
    msg.className = 'chat-msg own';
    msg.innerHTML = `
      <span class="from">ALPHA-01 (YOU)</span>
      ${text}
      <span class="time">${hh}:${mm}Z</span>
    `;
    chatMessages.appendChild(msg);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    chatInput.value = '';

    setTimeout(() => {
      const reply = document.createElement('div');
      reply.className = 'chat-msg friendly';
      reply.innerHTML = `
        <span class="from">BRAVO-01</span>
        COPY. ROGER.
        <span class="time">${hh}:${mm}Z</span>
      `;
      chatMessages.appendChild(reply);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 2000);
  }

  if (chatSend) chatSend.addEventListener('click', sendMessage);
  if (chatInput) {
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // ============ CHAT CHANNEL TABS ============
  document.querySelectorAll('.chat-channel-tabs button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.chat-channel-tabs button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  // ============ UNIT ITEM CLICK ============
  document.querySelectorAll('.unit-item').forEach(item => {
    item.addEventListener('click', () => {
      const callsign = item.querySelector('.callsign');
      if (callsign) showToast('◈ FOCUS: ' + callsign.textContent, 'info');
    });
  });

  // ============ MAP MARKER CLICK ============
  document.querySelectorAll('.marker-friendly, .marker-hostile, .marker-unknown').forEach(marker => {
    marker.style.cursor = 'pointer';
    marker.addEventListener('click', () => {
      const unit = marker.getAttribute('data-unit');
      if (unit) showToast('◈ TARGET: ' + unit + ' · TAP UNTUK DETAIL', 'info');
    });
  });

  // ============ SIMULATE INCOMING CONTACT ============
  setTimeout(() => {
    showToast('⚠ HOSTILE CONTACT UPDATED · MOVING EAST', 'danger');
  }, 12000);
  // ============ MOBILE FLOATING CONTROLS ============
  // Clone fungsi NV & Alert untuk mobile
  const mobileNvBtn = document.getElementById('mobile-nv-btn');
  const mobileAlertBtn = document.getElementById('mobile-alert-btn');

  if (mobileNvBtn) {
    mobileNvBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      document.body.classList.toggle('nv');
      const isNV = document.body.classList.contains('nv');
      mobileNvBtn.innerHTML = isNV
        ? '<i class="fas fa-eye-slash"></i>'
        : '<i class="fas fa-eye"></i>';
      mobileNvBtn.classList.toggle('nv-active', isNV);
      // Sync dengan desktop button (kalau ada)
      if (nvBtn) {
        nvBtn.innerHTML = isNV
          ? '<i class="fas fa-eye-slash"></i> Normal Mode'
          : '<i class="fas fa-eye"></i> Night Vision Mode';
      }
      showToast(isNV ? '🌙 NIGHT VISION ACTIVE' : '☀️ NORMAL MODE', 'info');
    });
  }

  if (mobileAlertBtn) {
    mobileAlertBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      showToast('⚠ CONTACT DETECTED — SECTOR 3', 'danger');
      const chatBtn = document.querySelector('[data-sheet="chat"]');
      if (chatBtn) chatBtn.click();
    });
  }
  // ============ REPOSITION FLOATING CONTROLS ============
  function repositionFloatingControls() {
    const isMobile = window.innerWidth <= 768;
    const controls = document.getElementById('mobile-controls');
    if (!controls) return;
    
    if (isMobile) {
      // Force ke bawah kanan
      controls.style.position = 'fixed';
      controls.style.top = 'auto';
      controls.style.bottom = '100px';
      controls.style.right = '12px';
      controls.style.display = 'flex';
      controls.style.flexDirection = 'column';
      controls.style.zIndex = '1800';
    } else {
      controls.style.display = 'none';
    }
  }
  repositionFloatingControls();
  
  // Re-call saat resize/rotate
  window.addEventListener('resize', repositionFloatingControls);
  window.addEventListener('orientationchange', () => {
    setTimeout(repositionFloatingControls, 200);
  });
  // Handle viewport changes (rotate, resize)
  function updateMobileControls() {
    const isMobile = window.innerWidth <= 768;
    const controls = document.getElementById('mobile-controls');
    if (controls) {
      controls.style.display = isMobile ? 'flex' : 'none';
    }
  }
  updateMobileControls();
  window.addEventListener('resize', updateMobileControls);
  window.addEventListener('orientationchange', () => {
    setTimeout(updateMobileControls, 100);
  });

  // ============ TAP-TO-CLICK SAFETY (for older mobile browsers) ============
  // Pastikan tap berfungsi untuk nav button di mobile
  document.querySelectorAll('.nav-btn').forEach(btn => {
    // Biar nggak double-fire di iOS
    let touched = false;
    btn.addEventListener('touchstart', function() {
      touched = true;
      // setTimeout reset biar click tetap bisa
      setTimeout(() => { touched = false; }, 500);
    }, { passive: true });
  });

  // ============ DEBUG: Deteksi device ============
  const isMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  console.log('[TACTICAL-C2] Device:', isMobile ? 'MOBILE' : 'DESKTOP',
              '| Viewport:', window.innerWidth + 'x' + window.innerHeight);
  // ============ MOBILE AUTO-FIT LAYOUT ============
  function fitMobileLayout() {
    const isMobileViewport = window.innerWidth <= 768;
    const device = document.querySelector('.device');
    if (!device) return;

    if (isMobileViewport) {
      // Override layout jadi fullscreen
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      
      const stage = document.querySelector('.stage');
      if (stage) {
        stage.style.display = 'block';
        stage.style.padding = '0';
        stage.style.height = '100dvh';
        stage.style.overflow = 'hidden';
      }
      
      device.style.width = '100vw';
      device.style.height = '100dvh';
      device.style.maxWidth = '100%';
      device.style.borderRadius = '0';
      device.style.padding = '0';
      device.style.boxShadow = 'none';
      device.style.position = 'fixed';
      device.style.top = '0';
      device.style.left = '0';
      device.style.zIndex = '999';
      
      const screen = document.querySelector('.screen');
      if (screen) {
        screen.style.borderRadius = '0';
        screen.style.height = '100dvh';
        screen.style.display = 'flex';
        screen.style.flexDirection = 'column';
      }
      
      // Bottom nav fixed
      const bottomNav = document.querySelector('.bottom-nav');
      if (bottomNav) {
        bottomNav.style.position = 'fixed';
        bottomNav.style.bottom = '0';
        bottomNav.style.left = '0';
        bottomNav.style.right = '0';
        bottomNav.style.zIndex = '1000';
        bottomNav.style.paddingBottom = 'max(8px, env(safe-area-inset-bottom))';
      }
      
      // Sheet position
      document.querySelectorAll('.sheet').forEach(s => {
        s.style.bottom = '60px';
      });
    }
  }

  fitMobileLayout();
  window.addEventListener('resize', fitMobileLayout);
  window.addEventListener('orientationchange', () => {
    setTimeout(fitMobileLayout, 200);
  });

  // ============ DIAGNOSTIC OVERLAY (debug di HP) ============
  function showDiagnostic() {
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return; // Cuma di HP
    
    const diag = document.createElement('div');
    diag.id = 'tactical-diag';
    diag.style.cssText = `
      position: fixed;
      bottom: 70px;
      left: 8px;
      right: 8px;
      background: rgba(0,0,0,0.92);
      border: 1px solid #22d3ee;
      border-radius: 8px;
      padding: 10px 12px;
      font-family: 'Courier New', monospace;
      font-size: 10px;
      color: #22d3ee;
      z-index: 99999;
      line-height: 1.5;
      max-height: 30vh;
      overflow-y: auto;
      display: none;
    `;
    
    const info = [
      'VIEWPORT: ' + window.innerWidth + '×' + window.innerHeight,
      'DPR: ' + window.devicePixelRatio,
      'TOUCH: ' + ('ontouchstart' in window ? 'YES' : 'NO'),
      'UA: ' + navigator.userAgent.substring(0, 60),
      'NAV BTNS: ' + document.querySelectorAll('.nav-btn').length,
      'SHEETS: ' + document.querySelectorAll('.sheet').length,
      'MARKERS: ' + document.querySelectorAll('.marker-friendly, .marker-hostile, .marker-unknown').length,
      'SCRIPT: ' + (typeof window !== 'undefined' ? 'LOADED' : 'FAILED'),
    ];
    
    diag.innerHTML = '<div style="font-weight:700;margin-bottom:6px;color:#fff;">◈ TACTICAL-C2 DIAGNOSTIC</div>' +
      info.map(line => '· ' + line).join('<br>') +
      '<br><div style="margin-top:8px;color:#facc15;">Tap anywhere to dismiss</div>';
    
    document.body.appendChild(diag);
    diag.style.display = 'block';
    diag.addEventListener('click', () => diag.remove());
    
    // Auto-hide after 15s
    setTimeout(() => { if (diag.parentNode) diag.remove(); }, 15000);
  }
  
  // Show diagnostic after 1s (biar load selesai dulu)
  setTimeout(showDiagnostic, 1000);

  // ============ TAP HANDLER SAFETY (iOS/Android) ============
  // Beberapa mobile browser butuh touchstart, bukan click
  function addTapHandler(element, handler) {
    let touched = false;
    element.addEventListener('touchstart', function(e) {
      touched = true;
      handler(e);
      setTimeout(() => { touched = false; }, 400);
    }, { passive: true });
    element.addEventListener('click', function(e) {
      if (!touched) handler(e);
    });
  }
  
  // Re-bind nav buttons dengan tap handler
  document.querySelectorAll('.nav-btn').forEach(btn => {
    // Remove old listeners by cloning
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);
  });
  
  // Re-attach handlers dengan tap-safe
  document.querySelectorAll('.nav-btn').forEach(btn => {
    addTapHandler(btn, function() {
      const sheetName = btn.getAttribute('data-sheet');
      if (sheetName === 'map') {
        closeAllSheets();
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        return;
      }
      const targetSheet = document.getElementById('sheet-' + sheetName);
      if (!targetSheet) return;
      
      if (targetSheet.classList.contains('open')) {
        targetSheet.classList.remove('open');
        btn.classList.remove('active');
        return;
      }
      closeAllSheets();
      targetSheet.classList.add('open');
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  console.log('[TACTICAL-C2] Ready · MIL-STD-2525 · offline-first · on-prem IKN');
})();
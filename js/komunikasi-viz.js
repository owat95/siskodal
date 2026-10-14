/* ============================================================
 * KOMUNIKASI-VIZ.JS â€” Network Graph, Chat, Waterfall Visualizer
 * ============================================================ */

const KomunikasiViz = (() => {
  'use strict';

  // ============================================
  // MANET NETWORK GRAPH (SVG animation)
  // ============================================
  function renderManetGraph(containerId, nodes, links) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const W = container.clientWidth || 600;
    const H = container.clientHeight || 400;
    const cx = W / 2;
    const cy = H / 2;
    const radius = Math.min(W, H) / 2 - 60;

    // Positions â€” circle layout
    const positions = {};
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
      positions[n.id] = {
        x: cx + radius * Math.cos(angle),
        y: cy + radius * Math.sin(angle),
        node: n
      };
    });

    // Clear
    container.innerHTML = '';

    // SVG
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', W);
    svg.setAttribute('height', H);
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.style.display = 'block';

    // CSS animasi
    const style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
    style.textContent = `
      .manet-link { stroke: #64748b; stroke-width: 1.5; fill: none; opacity: 0.4; }
      .manet-link.active { stroke: #22c55e; stroke-width: 2.5; opacity: 0.9; animation: linkPulse 2s ease-in-out infinite; }
      .manet-link.degraded { stroke: #eab308; stroke-width: 2; opacity: 0.7; stroke-dasharray: 6 4; animation: linkPulse 3s ease-in-out infinite; }
      .manet-link.down { stroke: #ef4444; stroke-width: 1.5; opacity: 0.3; stroke-dasharray: 3 6; }
      @keyframes linkPulse {
        0%, 100% { opacity: 0.9; }
        50% { opacity: 0.4; }
      }
      .manet-node { cursor: pointer; transition: all 0.2s; }
      .manet-node:hover { filter: brightness(1.4); }
      .manet-node-label {
        font-size: 10px; fill: #e2e8f0; font-family: 'Courier New', monospace;
        font-weight: 700; text-anchor: middle; pointer-events: none;
      }
      .manet-node-mode {
        font-size: 8px; fill: #94a3b8; font-family: 'Courier New', monospace;
        text-anchor: middle; pointer-events: none;
      }
      .packet-flow {
        fill: #22c55e;
        filter: drop-shadow(0 0 4px #22c55e);
      }
    `;
    svg.appendChild(style);

    // Links
    links.forEach(l => {
      const p1 = positions[l.from];
      const p2 = positions[l.to];
      if (!p1 || !p2) return;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', p1.x);
      line.setAttribute('y1', p1.y);
      line.setAttribute('x2', p2.x);
      line.setAttribute('y2', p2.y);
      line.setAttribute('class', `manet-link ${l.state || 'active'}`);
      svg.appendChild(line);
    });

    // Nodes
    nodes.forEach(n => {
      const p = positions[n.id];
      const modeColors = { COMMAND: '#22c55e', MANET: '#eab308', HF: '#ef4444' };
      const color = modeColors[n.mode] || '#64748b';

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.setAttribute('class', 'manet-node');
      g.dataset.nodeId = n.id;

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', p.x);
      circle.setAttribute('cy', p.y);
      circle.setAttribute('r', 14);
      circle.setAttribute('fill', color);
      circle.setAttribute('fill-opacity', '0.2');
      circle.setAttribute('stroke', color);
      circle.setAttribute('stroke-width', '2');

      const innerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      innerCircle.setAttribute('cx', p.x);
      innerCircle.setAttribute('cy', p.y);
      innerCircle.setAttribute('r', 6);
      innerCircle.setAttribute('fill', color);

      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', p.x);
      label.setAttribute('y', p.y - 22);
      label.setAttribute('class', 'manet-node-label');
      label.textContent = n.label;

      const modeLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      modeLabel.setAttribute('x', p.x);
      modeLabel.setAttribute('y', p.y + 30);
      modeLabel.setAttribute('class', 'manet-node-mode');
      modeLabel.textContent = n.mode;

      g.appendChild(circle);
      g.appendChild(innerCircle);
      g.appendChild(label);
      g.appendChild(modeLabel);
      svg.appendChild(g);
    });

    container.appendChild(svg);

    // Start packet animation
    startPacketAnimation(svg, positions, links);
  }

  // ============================================
  // PACKET ANIMATION (dots flowing along links)
  // ============================================
  let packetInterval = null;

  function startPacketAnimation(svg, positions, links) {
    if (packetInterval) clearInterval(packetInterval);

    packetInterval = setInterval(() => {
      const activeLinks = links.filter(l => l.state !== 'down');
      if (activeLinks.length === 0) return;

      const link = activeLinks[Math.floor(Math.random() * activeLinks.length)];
      const p1 = positions[link.from];
      const p2 = positions[link.to];
      if (!p1 || !p2) return;

      const packet = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      packet.setAttribute('class', 'packet-flow');
      packet.setAttribute('r', 3);
      packet.setAttribute('cx', p1.x);
      packet.setAttribute('cy', p1.y);
      svg.appendChild(packet);

      const duration = 800 + Math.random() * 600;
      const start = performance.now();

      function animate(now) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / duration);
        const x = p1.x + (p2.x - p1.x) * t;
        const y = p1.y + (p2.y - p1.y) * t;
        packet.setAttribute('cx', x);
        packet.setAttribute('cy', y);
        packet.setAttribute('opacity', 1 - t * 0.7);

        if (t < 1) {
          requestAnimationFrame(animate);
        } else {
          packet.remove();
        }
      }
      requestAnimationFrame(animate);
    }, 400);
  }

  // ============================================
  // CHAT BUBBLE RENDERER
  // ============================================
  function renderChatMessage(msg, currentUserId) {
    const user = KomunikasiData.getUser(msg.from);
    const cls = KomunikasiCore.ENCRYPTION.ALGORITHM;
    const classMap = {
      UNCLASS: '#22c55e', RESTRICTED: '#eab308', CONFIDENTIAL: '#f97316',
      SECRET: '#ef4444', TOP_SECRET: '#991b1b'
    };
    const clsColor = classMap[msg.classification] || '#64748b';
    const isMine = msg.from === currentUserId;

    const time = new Date(msg.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    // TTL countdown
    const ageSec = (Date.now() - msg.timestamp) / 1000;
    const ttlRemaining = msg.ttl ? Math.max(0, Math.floor(msg.ttl - ageSec)) : 0;
    const ttlText = ttlRemaining > 0 ? `â± ${Math.floor(ttlRemaining / 60)}m` : '';

    return `
      <div class="chat-bubble ${isMine ? 'mine' : 'theirs'}">
        ${!isMine ? `<div class="chat-user">${user?.callSign || msg.from}</div>` : ''}
        <div class="chat-text">${msg.text}</div>
        <div class="chat-meta">
          <span class="class-badge" style="background:${clsColor}22; color:${clsColor}; border:1px solid ${clsColor}55;">
            ${msg.classification}
          </span>
          <span class="enc-badge" title="${cls}">ðŸ”’</span>
          ${ttlText ? `<span class="ttl-badge">${ttlText}</span>` : ''}
          <span class="chat-time">${time}</span>
        </div>
      </div>
    `;
  }

  function renderChatHistory(containerId, channelId, currentUserId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const messages = KomunikasiData.getMessages(channelId);
    container.innerHTML = messages.map(m => renderChatMessage(m, currentUserId)).join('');
    container.scrollTop = container.scrollHeight;
  }

  function appendChatMessage(containerId, msg, currentUserId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.insertAdjacentHTML('beforeend', renderChatMessage(msg, currentUserId));
    container.scrollTop = container.scrollHeight;
  }

  // ============================================
  // FREQUENCY WATERFALL (canvas)
  // ============================================
  let waterfallCtx = null;
  let waterfallRunning = false;

  function startWaterfall(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    waterfallCtx = canvas.getContext('2d');
    waterfallRunning = true;

    const W = canvas.width;
    const H = canvas.height;

    // Init black
    waterfallCtx.fillStyle = '#0a0f1e';
    waterfallCtx.fillRect(0, 0, W, H);

    function draw() {
      if (!waterfallRunning) return;

      // Shift canvas up by 2 pixels
      const imageData = waterfallCtx.getImageData(0, 2, W, H - 2);
      waterfallCtx.putImageData(imageData, 0, 0);

      // Draw new bottom line
      const y = H - 2;
      const baseline = 20 + Math.random() * 30;

      for (let x = 0; x < W; x++) {
        // Multi-peak signal
        const peak1 = Math.exp(-Math.pow((x - W * 0.25) / 30, 2)) * (50 + Math.random() * 30);
        const peak2 = Math.exp(-Math.pow((x - W * 0.55) / 20, 2)) * (40 + Math.random() * 25);
        const peak3 = Math.exp(-Math.pow((x - W * 0.80) / 40, 2)) * (30 + Math.random() * 20);
        const noise = Math.random() * 10;

        const intensity = Math.min(100, baseline + peak1 + peak2 + peak3 + noise);
        const color = intensityToColor(intensity);

        waterfallCtx.fillStyle = color;
        waterfallCtx.fillRect(x, y, 1, 2);
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  function stopWaterfall() {
    waterfallRunning = false;
  }

  function intensityToColor(v) {
    // Color map: black â†’ blue â†’ cyan â†’ yellow â†’ red
    if (v < 20) return `rgb(${v * 2}, ${v * 2}, ${40 + v * 3})`;
    if (v < 50) return `rgb(0, ${80 + v * 3}, ${200 + v})`;
    if (v < 75) return `rgb(${(v - 50) * 10}, 240, ${150 - (v - 50) * 4})`;
    return `rgb(255, ${240 - (v - 75) * 8}, 0)`;
  }

  // ============================================
  // DEVICE REGISTRY RENDERER
  // ============================================
  function renderDeviceRegistry(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const statusFilter = options.status || 'all';
    let devices = KomunikasiData.DEVICES;
    if (statusFilter !== 'all') {
      devices = devices.filter(d => d.status === statusFilter);
    }

    const rows = devices.map(d => {
      const user = KomunikasiData.getUser(d.user);
      const statusColors = {
        approved: '#22c55e', pending: '#eab308', revoked: '#ef4444'
      };
      const c = statusColors[d.status];

      const timeAgo = (ts) => {
        if (!ts) return 'â€”';
        const s = Math.floor((Date.now() - ts) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
      };

      const actions = d.status === 'pending'
        ? `<button class="btn-approve" data-device="${d.id}" data-action="approve">âœ“ Approve</button>
           <button class="btn-reject" data-device="${d.id}" data-action="reject">âœ— Reject</button>`
        : d.status === 'approved'
        ? `<button class="btn-revoke" data-device="${d.id}" data-action="revoke">âŠ˜ Revoke</button>`
        : `<span style="font-size:0.7rem;color:#64748b;">${d.reason || 'No action'}</span>`;

      return `
        <tr>
          <td class="mono" style="font-size:0.75rem;">${d.id}</td>
          <td class="mono" style="font-size:0.7rem;color:#94a3b8;">${d.mac}</td>
          <td>
            <span class="platform-badge platform-${d.platform.toLowerCase()}">
              ${d.platform === 'Android' ? 'ðŸ¤–' : d.platform === 'iOS' ? 'ðŸŽ' : 'ðŸ’»'} ${d.platform}
            </span>
          </td>
          <td style="font-size:0.75rem;">${d.model}</td>
          <td>
            <div style="font-size:0.8rem;color:#e2e8f0;">${user?.callSign || 'â€”'}</div>
            <div style="font-size:0.7rem;color:#64748b;">${user?.nrp || 'â€”'}</div>
          </td>
          <td>
            <span class="status-badge" style="background:${c}22; color:${c}; border:1px solid ${c}55;">
              â— ${d.status.toUpperCase()}
            </span>
          </td>
          <td class="mono" style="font-size:0.7rem;color:#94a3b8;">${timeAgo(d.lastSeen)}</td>
          <td style="text-align:right;">${actions}</td>
        </tr>
      `;
    }).join('');

    container.innerHTML = `
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th><th>MAC</th><th>Platform</th><th>Model</th><th>User</th>
            <th>Status</th><th>Last Seen</th><th style="text-align:right;">Action</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:#64748b;padding:20px;">Tidak ada device</td></tr>'}</tbody>
      </table>
    `;
  }

  return {
    renderManetGraph,
    renderChatMessage,
    renderChatHistory,
    appendChatMessage,
    startWaterfall,
    stopWaterfall,
    renderDeviceRegistry
  };
})();

if (typeof window !== 'undefined') window.KomunikasiViz = KomunikasiViz;
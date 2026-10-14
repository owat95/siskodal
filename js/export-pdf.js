/* ============================================================
 * EXPORT-PDF.JS — Generate PDF reports (Personel + Logistik)
 * Dependencies: jsPDF, jspdf-autotable (via CDN)
 * ============================================================ */

const ExportPDF = (() => {
  'use strict';

  // ============================================
  // THEME
  // ============================================
  const COLORS = {
    primary:    [30, 41, 59],    // dark slate
    accent:     [59, 130, 246],  // blue
    green:      [34, 197, 94],
    yellow:     [234, 179, 8],
    red:        [239, 68, 68],
    purple:     [168, 85, 247],
    text:       [226, 232, 240],
    textDark:   [15, 23, 42],
    textMuted:  [100, 116, 139]
  };

  const MATRA_LABEL = {
    ad: 'TNI ANGKATAN DARAT',
    al: 'TNI ANGKATAN LAUT',
    au: 'TNI ANGKATAN UDARA'
  };

  // ============================================
  // HELPERS
  // ============================================
  function pad(n) { return String(n).padStart(2, '0'); }

  function formatDate(d = new Date()) {
    const months = ['Januari','Februari','Maret','April','Mei','Juni',
                    'Juli','Agustus','September','Oktober','November','Desember'];
    return `${pad(d.getDate())} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function formatTime(d = new Date()) {
    return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} WIB`;
  }

  function addHeader(doc, title, subtitle, matra) {
    const pageW = doc.internal.pageSize.getWidth();

    // Top bar
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, 0, pageW, 32, 'F');

    // Accent line
    doc.setFillColor(...COLORS.accent);
    doc.rect(0, 32, pageW, 1.5, 'F');

    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('SISKODAL', 14, 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.text('SISTEM KOMANDO PENGENDALIAN DAN INFORMASI', 14, 20);
    doc.text(MATRA_LABEL[matra] || 'TNI', 14, 25);

    // Right side
    doc.setFontSize(9);
    doc.setTextColor(226, 232, 240);
    doc.text(title, pageW - 14, 14, { align: 'right' });
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(subtitle, pageW - 14, 20, { align: 'right' });
    doc.text(`${formatDate()} · ${formatTime()}`, pageW - 14, 25, { align: 'right' });

    return 42; // Y position after header
  }

  function addFooter(doc) {
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();
    const totalPages = doc.internal.getNumberOfPages();

    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(...COLORS.textMuted);
      doc.setLineWidth(0.3);
      doc.line(14, pageH - 12, pageW - 14, pageH - 12);

      doc.setFontSize(7);
      doc.setTextColor(...COLORS.textMuted);
      doc.text('R2 JOINT OPERATIONS CENTER — SISKODAL v1.0', 14, pageH - 7);
      doc.text('CONFIDENTIAL · Restricted Distribution', pageW / 2, pageH - 7, { align: 'center' });
      doc.text(`Halaman ${i} / ${totalPages}`, pageW - 14, pageH - 7, { align: 'right' });
    }
  }

  function addSectionTitle(doc, y, title) {
    doc.setFillColor(...COLORS.primary);
    doc.rect(14, y, doc.internal.pageSize.getWidth() - 28, 7, 'F');
    doc.setFillColor(...COLORS.accent);
    doc.rect(14, y, 2, 7, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(title, 18, y + 5);

    return y + 11;
  }

  function addKpiBox(doc, y, items) {
    const pageW = doc.internal.pageSize.getWidth();
    const startX = 14;
    const boxW = (pageW - 28) / items.length;
    const boxH = 16;

    items.forEach((item, idx) => {
      const x = startX + idx * boxW;

      doc.setFillColor(241, 245, 249);
      doc.rect(x + 1, y, boxW - 2, boxH, 'F');

      doc.setFillColor(...(item.color || COLORS.accent));
      doc.rect(x + 1, y, 1.5, boxH, 'F');

      doc.setTextColor(...COLORS.textMuted);
      doc.setFontSize(6.5);
      doc.setFont('helvetica', 'normal');
      doc.text(item.label.toUpperCase(), x + 4, y + 5);

      doc.setTextColor(...COLORS.textDark);
      doc.setFontSize(13);
      doc.setFont('helvetica', 'bold');
      doc.text(String(item.value), x + 4, y + 13);
    });

    return y + boxH + 4;
  }

  // ============================================
  // PERSONNEL REPORT
  // ============================================
  function exportPersonnel(matra) {
    if (!window.jspdf || !window.PersonnelData || !window.KPIEngine) {
      alert('Dependencies belum loaded. Tunggu 2 detik, coba lagi.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const personnel = PersonnelData.get(matra);
    const positions = PersonnelData.OPEN_POSITIONS[matra] || [];

    let y = addHeader(doc, 'LAPORAN PERSONEL & KPI', 'Personnel Intelligence Report', matra);
    y = addSectionTitle(doc, y, `DATABASE PERSONEL — ${MATRA_LABEL[matra]}`);

    // Summary KPIs
    const avgKpi = personnel.reduce((s, p) => s + KPIEngine.computeComposite(p.kpi), 0) / personnel.length;
    const readyCount = personnel.filter(p => {
      const a = KPIEngine.assessPromotion(p, matra);
      return a && a.status === 'READY';
    }).length;

    y = addKpiBox(doc, y, [
      { label: 'Total Personel', value: personnel.length, color: COLORS.accent },
      { label: 'Rata-rata KPI',  value: avgKpi.toFixed(1), color: COLORS.green },
      { label: 'Ready Promosi',  value: readyCount, color: COLORS.yellow },
      { label: 'Open Positions', value: positions.length, color: COLORS.red }
    ]);

    // Personnel Table
    doc.autoTable({
      startY: y,
      head: [['NRP','Nama','Pangkat','Unit','Provinsi','Pendidikan','KPI']],
      body: personnel.map(p => {
        const composite = KPIEngine.computeComposite(p.kpi);
        const edu = p.education.slice(0, 2).map(e => e.code).join(', ') || '-';
        return [
          p.nrp,
          p.name,
          KPIEngine.getRankName(matra, p.rank),
          p.unit,
          p.province,
          edu,
          composite.toFixed(1)
        ];
      }),
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'left'
      },
      bodyStyles: {
        fontSize: 7.5,
        textColor: COLORS.textDark
      },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 20, font: 'courier' },
        1: { cellWidth: 35 },
        2: { cellWidth: 20 },
        3: { cellWidth: 30 },
        4: { cellWidth: 22 },
        5: { cellWidth: 30 },
        6: { cellWidth: 15, halign: 'right', font: 'courier', fontStyle: 'bold' }
      },
      margin: { left: 14, right: 14 }
    });

    y = doc.lastAutoTable.finalY + 6;

    // Succession Planning
    if (y > 220) { doc.addPage(); y = addHeader(doc, 'LAPORAN PERSONEL & KPI', 'Succession Planning', matra); }
    y = addSectionTitle(doc, y, 'AI SUCCESSION PLANNING — POSISI KRITIS');

    const successionRows = [];
    positions.forEach(pos => {
      const candidates = SuccessionAI.recommendForPosition(pos, matra, 3);
      candidates.forEach((c, idx) => {
        successionRows.push([
          idx === 0 ? pos.position : '',
          idx === 0 ? pos.province : '',
          idx === 0 ? pos.currentHolder : '',
          `${idx + 1}.`,
          c.person.name,
          KPIEngine.getRankName(matra, c.person.rank),
          c.score.total.toString()
        ]);
      });
      // separator row
      successionRows.push(['', '', '', '', '', '', '']);
    });
    // Remove last separator
    if (successionRows.length > 0) successionRows.pop();

    doc.autoTable({
      startY: y,
      head: [['Posisi','Provinsi','Holder','#','Kandidat','Pangkat','Skor']],
      body: successionRows,
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.purple,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 7.5, textColor: COLORS.textDark },
      columnStyles: {
        0: { cellWidth: 38, fontStyle: 'bold' },
        1: { cellWidth: 22 },
        2: { cellWidth: 30, textColor: COLORS.textMuted },
        3: { cellWidth: 7, halign: 'center', font: 'courier' },
        4: { cellWidth: 38 },
        5: { cellWidth: 20 },
        6: { cellWidth: 15, halign: 'right', font: 'courier', fontStyle: 'bold', textColor: COLORS.green }
      },
      margin: { left: 14, right: 14 }
    });

    addFooter(doc);
    doc.save(`R2-Laporan-Personel-${matra.toUpperCase()}-${Date.now()}.pdf`);
    console.log(`[EXPORT] Personnel PDF generated for ${matra.toUpperCase()}`);
  }

  // ============================================
  // LOGISTICS REPORT
  // ============================================
  function exportLogistics(matra) {
    if (!window.jspdf || !window.LogisticsData || !window.LogisticsAI) {
      alert('Dependencies belum loaded. Tunggu 2 detik, coba lagi.');
      return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const analysis = LogisticsAI.analyzeAll(matra);
    const s = analysis.summary;
    const gudang = LogisticsData.getGudang(matra);

    let y = addHeader(doc, 'LAPORAN LOGISTIK & AI', 'AI-Powered Supply Chain Report', matra);
    y = addSectionTitle(doc, y, `OVERVIEW — LOGISTIK ${MATRA_LABEL[matra]}`);

    // KPI Boxes
    y = addKpiBox(doc, y, [
      { label: 'Total Alutsista', value: s.totalAlutsista, color: COLORS.accent },
      { label: 'Ready',           value: s.readyCount, color: COLORS.green },
      { label: 'Fuel Critical',   value: s.criticalFuel, color: COLORS.red },
      { label: 'Cyber Threats',   value: s.cyberThreats, color: COLORS.yellow }
    ]);
    y = addKpiBox(doc, y, [
      { label: 'Auto Resupply',   value: s.autonomousOps, color: COLORS.purple },
      { label: 'Maintenance',     value: s.maintenanceCount, color: COLORS.yellow },
      { label: 'Supply Issues',   value: s.supplyImbalances, color: COLORS.red },
      { label: 'Spare Critical',  value: s.criticalParts, color: COLORS.red }
    ]);

    // AI Executive Summary
    y = addSectionTitle(doc, y, 'AI EXECUTIVE SUMMARY');

    const summaryLines = [];
    if (s.criticalFuel > 0) summaryLines.push(`• ${s.criticalFuel} alutsista butuh refuel segera`);
    if (s.criticalParts > 0) summaryLines.push(`• ${s.criticalParts} spare part diprediksi rusak dalam 14 hari`);
    if (s.autonomousOps > 0) summaryLines.push(`• ${s.autonomousOps} misi autonomous resupply direkomendasikan`);
    if (s.supplyImbalances > 0) summaryLines.push(`• ${s.supplyImbalances} gudang perlu redistribusi`);
    if (s.cyberThreats > 0) summaryLines.push(`• ${s.cyberThreats} anomali siber terdeteksi`);
    if (summaryLines.length === 0) summaryLines.push('• Semua sistem logistik nominal');

    doc.setFontSize(8);
    doc.setTextColor(...COLORS.textDark);
    doc.setFont('helvetica', 'normal');
    summaryLines.forEach(line => {
      doc.text(line, 18, y + 4);
      y += 5;
    });
    y += 3;

    // Alutsista Table
    if (y > 200) { doc.addPage(); y = addHeader(doc, 'LAPORAN LOGISTIK', 'Alutsista Status', matra); }
    y = addSectionTitle(doc, y, 'STATUS ALUTSISTA');

    const alutsista = LogisticsData.getAlutsista(matra);
    doc.autoTable({
      startY: y,
      head: [['ID','Nama','Type','Unit','Fuel','Hours','Status']],
      body: alutsista.map(a => [
        a.id,
        a.name,
        a.type,
        a.unit,
        `${a.fuelLevel}%`,
        `${a.hoursOperational}h`,
        a.status.toUpperCase()
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        0: { cellWidth: 25, font: 'courier' },
        4: { halign: 'right', font: 'courier' },
        5: { halign: 'right', font: 'courier' },
        6: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 6) {
          const status = data.cell.raw;
          data.cell.styles.textColor = status === 'READY' ? COLORS.green : COLORS.red;
        }
        if (data.section === 'body' && data.column.index === 4) {
          const pct = parseInt(data.cell.raw);
          data.cell.styles.textColor = pct < 20 ? COLORS.red : pct < 50 ? COLORS.yellow : COLORS.green;
        }
      },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 6;

    // Predictive Fuel
    if (y > 210) { doc.addPage(); y = addHeader(doc, 'LAPORAN LOGISTIK', 'Predictive Fuel', matra); }
    y = addSectionTitle(doc, y, 'PREDICTIVE FUEL DEPLETION — AI ANALYSIS');

    const fuelSorted = [...analysis.fuelPredictions].sort((a, b) => a.daysRemaining - b.daysRemaining);
    doc.autoTable({
      startY: y,
      head: [['Alutsista','Fuel %','Liters','Konsumsi/Hari','Sisa Hari','Severity','Rekomendasi']],
      body: fuelSorted.map(f => [
        f.alutsista,
        `${f.currentFuel}%`,
        `${f.fuelLiters}L`,
        `${f.dailyConsumption}L`,
        `${f.daysRemaining}`,
        f.severity,
        f.recommendation
      ]),
      theme: 'grid',
      headStyles: {
        fillColor: COLORS.accent,
        textColor: [255, 255, 255],
        fontSize: 7.5,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 7 },
      columnStyles: {
        1: { halign: 'right', font: 'courier' },
        2: { halign: 'right', font: 'courier' },
        3: { halign: 'right', font: 'courier' },
        4: { halign: 'right', font: 'courier', fontStyle: 'bold' },
        5: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index === 5) {
          const sev = data.cell.raw;
          data.cell.styles.textColor = sev === 'CRITICAL' ? COLORS.red :
                                        sev === 'HIGH' ? COLORS.red :
                                        sev === 'MEDIUM' ? COLORS.yellow : COLORS.green;
        }
      },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 6;

    // Gudang
    if (y > 220) { doc.addPage(); y = addHeader(doc, 'LAPORAN LOGISTIK', 'Gudang Status', matra); }
    y = addSectionTitle(doc, y, 'DEPO & STOK GUDANG');

    doc.autoTable({
      startY: y,
      head: [['Nama Gudang','Provinsi','Amunisi','Bahan Bakar','Makanan','Spare Parts']],
      body: gudang.map(g => [
        g.name,
        g.province,
        g.stock.amunisi.toString(),
        g.stock.bahan_bakar.toString(),
        g.stock.makanan.toString(),
        g.stock.spare_parts.toString()
      ]),
      theme: 'striped',
      headStyles: {
        fillColor: COLORS.primary,
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: 'bold'
      },
      bodyStyles: { fontSize: 7.5 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
      columnStyles: {
        2: { halign: 'right', font: 'courier' },
        3: { halign: 'right', font: 'courier' },
        4: { halign: 'right', font: 'courier' },
        5: { halign: 'right', font: 'courier' }
      },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 6;

    // Cyber Threats
    if (analysis.cyberThreats.length > 0) {
      if (y > 220) { doc.addPage(); y = addHeader(doc, 'LAPORAN LOGISTIK', 'Cyber Threats', matra); }
      y = addSectionTitle(doc, y, 'CYBER THREAT HUNTING — SUPPLY CHAIN');

      doc.autoTable({
        startY: y,
        head: [['Severity','Type','Message','MITRE','Response']],
        body: analysis.cyberThreats.map(t => [
          t.severity,
          t.type,
          t.message,
          t.mitre,
          t.response
        ]),
        theme: 'grid',
        headStyles: {
          fillColor: COLORS.red,
          textColor: [255, 255, 255],
          fontSize: 8,
          fontStyle: 'bold'
        },
        bodyStyles: { fontSize: 7, valign: 'top' },
        columnStyles: {
          0: { cellWidth: 18, halign: 'center', fontStyle: 'bold' },
          1: { cellWidth: 28, font: 'courier' },
          2: { cellWidth: 55 },
          3: { cellWidth: 30, font: 'courier', fontSize: 6.5 },
          4: { cellWidth: 45 }
        },
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            data.cell.styles.textColor = data.cell.raw === 'HIGH' ? COLORS.red :
                                          data.cell.raw === 'MEDIUM' ? COLORS.yellow : COLORS.green;
          }
        },
        margin: { left: 14, right: 14 }
      });
    }

    addFooter(doc);
    doc.save(`R2-Laporan-Logistik-${matra.toUpperCase()}-${Date.now()}.pdf`);
    console.log(`[EXPORT] Logistics PDF generated for ${matra.toUpperCase()}`);
  }

  // ============================================
  // COMBINED REPORT (Personel + Logistik)
  // ============================================
  function exportCombined(matra) {
    if (!window.jspdf) { alert('jsPDF belum loaded'); return; }
    exportPersonnel(matra);
    setTimeout(() => exportLogistics(matra), 500);
  }

  // ============================================
  // EXPORT
  // ============================================
  return {
    exportPersonnel,
    exportLogistics,
    exportCombined
  };
})();

if (typeof window !== 'undefined') window.ExportPDF = ExportPDF;
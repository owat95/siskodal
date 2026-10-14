# SISKODAL — Sistem Komando Pengendalian dan Informasi

> **Proyek demonstrasi** command center multi-domain untuk TNI Angkatan Darat Laut dan Udara.
> Dibangun oleh **R2 RajaCyber Solutions (owat)**, 2026.

[![Status](https://img.shields.io/badge/status-demo-blue)]()
[![License](https://img.shields.io/badge/license-MIT-green)]()

## 📖 Tentang

SISKODAL adalah sistem komando pengendalian dan informasi yang dirancang untuk
mendemonstrasikan integrasi **C6ISR** (Command, Control, Communications, Computers,
Cyber Defense, Combat Systems, Intelligence, Surveillance, Reconnaissance).

Semua data dalam proyek ini adalah **simulasi/mockup** — bukan data militer asli.
Dibuat dengan sumber terbuka (Wikipedia, NATO doctrine) untuk keperluan **edukasi**.

## 🎯 Fitur Utama

### 12 Modul Operasional
1. Portal SISKODAL — 12 menu + 3 matra dashboard
2. Peta Cesium NKRI — 3D globe, 62 asset, MIL-STD-2525
3. Dashboard Personel — AD/AL/AU, KPI, succession AI
4. Dashboard Logistik — RBAC, predictive fuel
5. Integrasi ICR — 8 INT disciplines, NATO formats
6. Komunikasi Terpadu — MAC whitelist, MANET
7. SIBER SOC — Live attack map, MITRE ATT&CK
8. Teritorial — 27 Kodam, 38 provinsi
9. Operasi C2 — Kanban, mission state machine
10. Analitik & AI — Charts, AI insight
11. Intelijen — Admiralty Code, 8 country profiles
12. Pengaturan — Session, retention, remote infra

### 8 Topologi Aset
- 🚢 Kapal Laut — VSAT Ku-band
- ✈️ Pesawat Udara — MUM-T, Link 16
- 🛸 Drone (UAV) — Store-and-forward
- 📹 CCTV/FLIR — Fixed infra perimeter
- 🏢 Datacenter IKN — Air-gapped VLM
- 📦 Logistik & HO — AI reasoning pipeline
- 🎖️ Kodam Regional — Multi-sensor fusion
- 🛰️ IKN Central — Multi-INT fusion, L40S

## 🛠️ Tech Stack

| Layer | Teknologi |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JS |
| Charts | Chart.js 4.4 |
| 3D Map | CesiumJS 1.122 |
| Symbols | milsymbol 3.0 (MIL-STD-2525) |
| PDF | jsPDF + AutoTable |
| Icons | Font Awesome 6.5 |

## 📂 Struktur

\\\
joc/
├── index.html              # Portal
├── map.html                # Peta Cesium
├── dashboard-*.html        # Personel & Logistik
├── icr.html, komunikasi.html, siber.html
├── teritorial.html, operasi.html, analitik.html
├── intel.html, pengaturan.html
├── css/                    # Styles
├── js/                     # 40+ modules
└── data/                   # JSON
\\\

## 🚀 Menjalankan Lokal

\\\ash
git clone https://github.com/owat95/siskodal.git
cd siskodal
python3 -m http.server 8080
# Buka: http://localhost:8080
\\\

## ⚠️ Disclaimer

**Proyek ini MOCKUP/DEMO:**
- ❌ Bukan sistem militer asli
- ❌ Bukan data rahasia TNI
- ✅ Data dari sumber terbuka
- ✅ Untuk edukasi & demonstrasi

## 📜 Lisensi

MIT License — bebas dipakai, dimodifikasi, dipelajari.

## 🙏 Untuk Generasi Muda

> *"Saya bangun ini untuk menunjukkan bahwa **anak Indonesia bisa**.*
> *Kedaulatan data bukan slogan — bisa diimplementasikan.*
> *Belajarlah, lanjutkan, bangun yang lebih baik, saatnya kalian bangkit!.*
> 
> *— owat95, R2 RajaCyber Solutions, 2026"*

---

**Dibuat dengan ❤️ di Indonesia**

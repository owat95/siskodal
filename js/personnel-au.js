/* ============================================================
 * PERSONNEL-AU.JS â€” Mock database 50 personel TNI AU
 * ============================================================ */

const PersonnelAU = (() => {
  'use strict';

  // List pangkat AU
  const RANKS = ['PRADA','PRATU','KOPDA','KOPTU','KOPKA','SERMA','PELDA','PELTU',
                 'LETDA','LETTU','KAPTEN','MAYOR','LETKOL','KOLONEL'];

  // Unit AU
  const UNITS = [
    'Lanud Halim PK', 'Lanud Iswahjudi', 'Lanud Hasanuddin',
    'Lanud Adisutjipto', 'Lanud Sultan Iskandar Muda', 'Lanud Sam Ratulangi',
    'Skadron Udara 3', 'Skadron Udara 11', 'Skadron Udara 15',
    'Kosekhanudnas I', 'Kosekhanudnas II', 'Kosekhanudnas III'
  ];

  // Specialty
  const SPECIALTIES = ['PILOT', 'RADAR', 'TEKNISI', 'PSU', 'KOMANDO', 'INTEL', 'LOGISTIK'];

  // Nama-nama Indonesia (untuk mock)
  const FIRST_NAMES = ['Budi','Agus','Hendra','Wawan','Siti','Dewi','Rina','Sari','Andi','Dian',
                       'Eko','Fajar','Gunawan','Hadi','Irfan','Joko','Krisna','Lukman','Maman','Nanda',
                       'Oki','Putra','Rahmat','Slamet','Taufik','Umar','Vino','Wahyu','Yudi','Zaki'];
  const LAST_NAMES = ['Santoso','Wijaya','Pratama','Kusuma','Hartono','Setiawan','Nugroho','Saputra',
                      'Hidayat','Firmansyah','Maulana','Ramadhan','Siregar','Simatupang','Situmorang',
                      'Hutapea','Nainggolan','Panjaitan','Sihombing','Ginting'];

  // Deterministic pseudo-random
  let seed = 42;
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }
  function randInt(min, max) { return Math.floor(rand() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(rand() * arr.length)]; }

  // Generate personel
  function generatePersonel(count = 50) {
    const persons = [];
    for (let i = 0; i < count; i++) {
      const rankIdx = randInt(0, RANKS.length - 1);
      const rank = RANKS[rankIdx];
      const firstName = pick(FIRST_NAMES);
      const lastName = pick(LAST_NAMES);
      const specialty = pick(SPECIALTIES);
      const unit = pick(UNITS);

      // KPI scores (0-100), berbobot untuk komposit
      const kpi = {
        skill:      randInt(55, 98),
        fitness:    randInt(60, 100),
        leadership: randInt(50, 97),
        discipline: randInt(65, 100),
        ops:        randInt(40, 95)
      };

      // Tanggal promosi terakhir
      const yearsInRank = randInt(1, 6);
      const lastPromotionDate = new Date(Date.now() - yearsInRank * 365.25 * 24 * 3600 * 1000);

      // Area penugasan
      const areas = ['JAKARTA','SURABAYA','MAKASSAR','MEDAN','PAPUA','NATUNA','PERBATASAN','MALANG'];
      const area = pick(areas);

      // Awards
      const awards = randInt(0, 6);

      // Violations
      const violations = rand() < 0.85 ? 0 : randInt(1, 2);

      persons.push({
        id: `au-${String(i + 1).padStart(3, '0')}`,
        nrp: `5${randInt(10000000, 99999999)}`,
        name: `${firstName} ${lastName}`,
        rank,
        rankIdx,
        tier: rankIdx < 8 ? 1 : (rankIdx < 12 ? 2 : 3),
        unit,
        specialty,
        area,
        kpi,
        lastPromotionDate: lastPromotionDate.toISOString(),
        awards,
        violations,
        status: rand() < 0.9 ? 'active' : 'on_mission',
        joinedAt: new Date(Date.now() - randInt(5, 25) * 365.25 * 24 * 3600 * 1000).toISOString()
      });
    }
    return persons;
  }

  const ALL_PERSONNEL = generatePersonel(50);

  return {
    getAll: () => ALL_PERSONNEL,
    RANKS, UNITS, SPECIALTIES,
    getById: (id) => ALL_PERSONNEL.find(p => p.id === id)
  };
})();

if (typeof window !== 'undefined') window.PersonnelAU = PersonnelAU;
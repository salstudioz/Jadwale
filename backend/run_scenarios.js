const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Dynamic import or require NestJS services
async function runScenarios() {
  console.log('=== MEMULAI DEMO EKSEKUSI REAL DATABASE ===\n');

  // 1. Dapatkan atau buat sekolah ID 1 (SDN Pancasila 01)
  let sekolah1 = await prisma.sekolah.findFirst({ where: { npsn: '20345678' } });
  if (!sekolah1) {
    sekolah1 = await prisma.sekolah.create({
      data: {
        nama_sekolah: 'SDN Pancasila 01',
        npsn: '20345678',
        alamat: 'Jl. Merdeka No. 10, Jakarta',
      }
    });
  }

  // 2. Dapatkan atau buat sekolah ID 2 (SDN Juara Pelita)
  let sekolah2 = await prisma.sekolah.findFirst({ where: { npsn: '20987654' } });
  if (!sekolah2) {
    sekolah2 = await prisma.sekolah.create({
      data: {
        nama_sekolah: 'SDN Juara Pelita',
        npsn: '20987654',
        alamat: 'Jl. Pendidikan No. 45, Bandung',
      }
    });
  }

  console.log(`[OK] Sekolah 1 ID: ${sekolah1.id} (${sekolah1.nama_sekolah})`);
  console.log(`[OK] Sekolah 2 ID: ${sekolah2.id} (${sekolah2.nama_sekolah})\n`);

  // Define data for Skenario 1
  const payload1 = {
    is_parallel: false,
    class_naming: 'alphabet',
    tingkatan_count: 6,
    kelas_per_tingkatan: 1,
    school_days: 5,
    start_time: '07:30',
    duration_per_jp: 35,
    has_routine: true,
    routine_duration: 15,
    has_monday_ceremony: true,
    istirahat: [
      { after_jp: 3, duration: 15 },
      { after_jp: 5, duration: 15 }
    ],
    mapels: [
      { id: 'm1', nama: 'Matematika', color: '#FDE68A', prioritas: true, jp_per_tingkatan: { 1:4, 2:4, 3:4, 4:4, 5:4, 6:4 } },
      { id: 'm2', nama: 'Bahasa Indonesia', color: '#A7F3D0', prioritas: true, jp_per_tingkatan: { 1:4, 2:4, 3:4, 4:4, 5:4, 6:4 } },
      { id: 'm3', nama: 'Ilmu Pengetahuan Alam (IPA)', color: '#BFDBFE', prioritas: true, jp_per_tingkatan: { 1:3, 2:3, 3:3, 4:3, 5:3, 6:3 } },
      { id: 'm4', nama: 'Ilmu Pengetahuan Sosial (IPS)', color: '#FECACA', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
      { id: 'm5', nama: 'Pendidikan Agama Islam (PAI)', color: '#D8B4FE', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
      { id: 'm6', nama: 'Pendidikan Pancasila (PKn)', color: '#FED7AA', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
      { id: 'm7', nama: 'PENJASKES (Olahraga)', color: '#86EFAC', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
      { id: 'm8', nama: 'SBdP (Seni Budaya)', color: '#FBCFE8', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
      { id: 'm9', nama: 'Bahasa Inggris (Mulok)', color: '#C7D2FE', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
    ],
    gurus: [
      { id: 'g1', nama: 'Ibu Siti Rahayu', nip: '196501011988012001', availability: [] },
      { id: 'g2', nama: 'Bapak Ahmad Fauzi', nip: '196705151990031005', availability: [] },
      { id: 'g3', nama: 'Ibu Dewi Lestari', nip: '196910201992022002', availability: [] },
      { id: 'g4', nama: 'Bapak Budi Santoso', nip: '197112051994031003', availability: [] },
      { id: 'g5', nama: 'Ibu Rina Wati', nip: '197308181996012004', availability: [] },
      { id: 'g6', nama: 'Bapak Eko Prasetyo', nip: '197501211998021005', availability: [{ hari: 1 }, { hari: 2 }] },
      { id: 'g7', nama: 'Ibu Farida Hanum', nip: '197704101999032006', availability: [] },
      { id: 'g8', nama: 'Bapak Agus Salim', nip: '197906011998012007', availability: [] },
      { id: 'g9', nama: 'Ibu Nani Suryani', nip: '198105152001042008', availability: [] },
      { id: 'g10', nama: 'Bapak Heru Nugroho', nip: '198308111999021009', availability: [{ hari: 3 }, { hari: 4 }] },
    ],
    wali_kelas: [
      { id_kelas: '1', id_guru: 'g1', default_mapels: ['m1', 'm2', 'm3', 'm8'] },
      { id_kelas: '2', id_guru: 'g3', default_mapels: ['m1', 'm2', 'm3'] },
      { id_kelas: '3', id_guru: 'g5', default_mapels: ['m1', 'm2', 'm3'] },
      { id_kelas: '4', id_guru: 'g7', default_mapels: [] },
      { id_kelas: '5', id_guru: 'g9', default_mapels: [] },
      { id_kelas: '6', id_guru: 'g4', default_mapels: [] },
    ],
    pengampus: [
      { id_guru: 'g2', id_mapel: 'm1', class_ids: ['4', '5', '6'] },
      { id_guru: 'g2', id_mapel: 'm3', class_ids: ['4', '5', '6'] },
      { id_guru: 'g4', id_mapel: 'm4', class_ids: ['4', '5', '6'] },
      { id_guru: 'g4', id_mapel: 'm6', class_ids: ['4', '5', '6'] },
      { id_guru: 'g6', id_mapel: 'm7', class_ids: ['1', '2', '3', '4', '5', '6'] },
      { id_guru: 'g7', id_mapel: 'm5', class_ids: ['1', '2', '3', '4', '5', '6'] },
      { id_guru: 'g8', id_mapel: 'm9', class_ids: ['1', '2', '3', '4', '5', '6'] },
      { id_guru: 'g9', id_mapel: 'm8', class_ids: ['2', '3', '4', '5', '6'] },
      { id_guru: 'g9', id_mapel: 'm2', class_ids: ['5', '6'] },
      { id_guru: 'g10', id_mapel: 'm4', class_ids: ['1', '2', '3'] },
    ]
  };

  // Run Hydration via SekolahService logic
  const { SekolahService } = require('./dist/src/sekolah/sekolah.service');
  const sekolahService = new SekolahService(prisma);
  
  console.log('--- HYDRATING SKENARIO 1: SDN Pancasila 01 ---');
  await sekolahService.hydrate(sekolah1.id, payload1);
  console.log('[OK] Hydrate Skenario 1 Selesai.');

  // Generate Schedule via JadwalProcessor
  const { JadwalProcessor } = require('./dist/src/jadwal/jadwal.processor');
  const mockGateway = { sendProgress: (id, p, m) => console.log(`   [Progress ${p}%] ${m}`), sendResult: (id, s, m) => console.log(`   [RESULT] ${s.toUpperCase()}: ${m}`) };
  const jadwalProcessor = new JadwalProcessor(prisma, mockGateway);

  console.log('\n--- GENERATING JADWAL SKENARIO 1 ---');
  const t0_1 = Date.now();
  await jadwalProcessor.process({ data: { id_sekolah: sekolah1.id } });
  const duration1 = ((Date.now() - t0_1) / 1000).toFixed(2);
  console.log(`[OK] Skenario 1 Selesai dalam ${duration1} detik.\n`);

  // Query Database Verification for Skenario 1
  const countJadwal1 = await prisma.jadwal.count({ where: { id_sekolah: sekolah1.id } });
  const countGuru1 = await prisma.guru.count({ where: { id_sekolah: sekolah1.id } });
  const countKelas1 = await prisma.kelas.count({ where: { id_sekolah: sekolah1.id } });
  console.log(`📊 DB VERIFIKASI SKENARIO 1:`);
  console.log(`   - Jumlah Kelas tersimpan: ${countKelas1}`);
  console.log(`   - Jumlah Guru tersimpan: ${countGuru1}`);
  console.log(`   - Jumlah Total Slot Jadwal tersimpan: ${countJadwal1} slot`);


  // Define data for Skenario 2 (Paralel: 18 Kelas)
  const mapels2 = [
    { id: 'm1', nama: 'Matematika', color: '#FDE68A', prioritas: true, jp_per_tingkatan: { 1:4, 2:4, 3:4, 4:4, 5:4, 6:4 } },
    { id: 'm2', nama: 'Bahasa Indonesia', color: '#A7F3D0', prioritas: true, jp_per_tingkatan: { 1:4, 2:4, 3:4, 4:4, 5:4, 6:4 } },
    { id: 'm3', nama: 'IPA', color: '#BFDBFE', prioritas: true, jp_per_tingkatan: { 1:3, 2:3, 3:3, 4:3, 5:3, 6:3 } },
    { id: 'm4', nama: 'IPS', color: '#FECACA', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
    { id: 'm5', nama: 'PAI', color: '#D8B4FE', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
    { id: 'm6', nama: 'PKn', color: '#FED7AA', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
    { id: 'm7', nama: 'PENJASKES', color: '#86EFAC', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
    { id: 'm8', nama: 'SBdP', color: '#FBCFE8', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
    { id: 'm9', nama: 'Bahasa Inggris', color: '#C7D2FE', prioritas: false, jp_per_tingkatan: { 1:2, 2:2, 3:2, 4:2, 5:2, 6:2 } },
  ];

  // Generate 28 gurus
  const gurus2 = [];
  const waliNames = [
    'Ibu Ani Wijayanti', 'Bapak Rudi Hartono', 'Ibu Sari Puspita',
    'Bapak Andi Pratama', 'Ibu Dina Marlina', 'Bapak Edi Susanto',
    'Ibu Fitri Handayani', 'Bapak Gatot Subroto', 'Ibu Heni Kristiani',
    'Bapak Imam Santoso', 'Ibu Juwita Sari', 'Bapak Khoirul Anam',
    'Ibu Lina Mardiana', 'Bapak Mulyono', 'Ibu Nia Kurnia',
    'Bapak Oki Setiawan', 'Ibu Putri Ayu', 'Bapak Rizki Fauzi'
  ];
  for (let i = 0; i < 18; i++) {
    gurus2.push({ id: `w${i+1}`, nama: waliNames[i], nip: `1980000000000000${i+1}`, availability: [] });
  }
  const mapelGurus = [
    { id: 'gm1', nama: 'Bapak Agus Salim (Mapel MTK 4-6)' },
    { id: 'gm2', nama: 'Ibu Rina Wati (Mapel MTK 1-3)' },
    { id: 'gm3', nama: 'Bapak Eko Prasetyo (Mapel IPA 4-6)' },
    { id: 'gm4', nama: 'Ibu Farida Hanum (Mapel IPA 1-3)' },
    { id: 'gm5', nama: 'Bapak Budi Santoso (Mapel IPS All)' },
    { id: 'gm6', nama: 'Ibu Dewi Lestari (Mapel B.Indo All)' },
    { id: 'gm7', nama: 'Bapak Heru Nugroho (Mapel PJOK All)' },
    { id: 'gm8', nama: 'Ibu Nani Suryani (Mapel SBdP All)' },
    { id: 'gm9', nama: 'Bapak Fajar Prasetyo (Mapel PAI All)' },
    { id: 'gm10', nama: 'Ibu Mila Kencana (Mapel B.Inggris All)' },
  ];
  mapelGurus.forEach((g, idx) => {
    gurus2.push({ id: g.id, nama: g.nama, nip: `198500000000000${idx+1}`, availability: [] });
  });

  // All 18 class names
  const all18Classes = [];
  for (let t = 1; t <= 6; t++) {
    for (let k = 0; k < 3; k++) {
      const suf = String.fromCharCode(65 + k);
      all18Classes.push(`${t}${suf}`);
    }
  }

  const payload2 = {
    is_parallel: true,
    class_naming: 'alphabet',
    tingkatan_count: 6,
    kelas_per_tingkatan: 3,
    school_days: 6,
    start_time: '07:00',
    duration_per_jp: 35,
    has_routine: true,
    routine_duration: 10,
    has_monday_ceremony: true,
    istirahat: [
      { after_jp: 3, duration: 20 },
      { after_jp: 6, duration: 15 }
    ],
    mapels: mapels2,
    gurus: gurus2,
    wali_kelas: all18Classes.map((cName, idx) => ({ id_kelas: cName, id_guru: `w${idx+1}`, default_mapels: ['m6'] })),
    pengampus: [
      { id_guru: 'gm2', id_mapel: 'm1', class_ids: ['1A','1B','1C','2A','2B','2C','3A','3B','3C'] },
      { id_guru: 'gm1', id_mapel: 'm1', class_ids: ['4A','4B','4C','5A','5B','5C','6A','6B','6C'] },
      { id_guru: 'gm4', id_mapel: 'm3', class_ids: ['1A','1B','1C','2A','2B','2C','3A','3B','3C'] },
      { id_guru: 'gm3', id_mapel: 'm3', class_ids: ['4A','4B','4C','5A','5B','5C','6A','6B','6C'] },
      { id_guru: 'gm6', id_mapel: 'm2', class_ids: all18Classes },
      { id_guru: 'gm5', id_mapel: 'm4', class_ids: all18Classes },
      { id_guru: 'gm7', id_mapel: 'm7', class_ids: all18Classes },
      { id_guru: 'gm8', id_mapel: 'm8', class_ids: all18Classes },
      { id_guru: 'gm9', id_mapel: 'm5', class_ids: all18Classes },
      { id_guru: 'gm10', id_mapel: 'm9', class_ids: all18Classes },
    ]
  };

  console.log('\n--- HYDRATING SKENARIO 2: SDN Juara Pelita (18 Kelas Paralel) ---');
  await sekolahService.hydrate(sekolah2.id, payload2);
  console.log('[OK] Hydrate Skenario 2 Selesai.');

  console.log('\n--- GENERATING JADWAL SKENARIO 2 ---');
  const t0_2 = Date.now();
  await jadwalProcessor.process({ data: { id_sekolah: sekolah2.id } });
  const duration2 = ((Date.now() - t0_2) / 1000).toFixed(2);
  console.log(`[OK] Skenario 2 Selesai dalam ${duration2} detik.\n`);

  // Query Database Verification for Skenario 2
  const countJadwal2 = await prisma.jadwal.count({ where: { id_sekolah: sekolah2.id } });
  const countGuru2 = await prisma.guru.count({ where: { id_sekolah: sekolah2.id } });
  const countKelas2 = await prisma.kelas.count({ where: { id_sekolah: sekolah2.id } });
  console.log(`📊 DB VERIFIKASI SKENARIO 2:`);
  console.log(`   - Jumlah Kelas tersimpan: ${countKelas2}`);
  console.log(`   - Jumlah Guru tersimpan: ${countGuru2}`);
  console.log(`   - Jumlah Total Slot Jadwal tersimpan: ${countJadwal2} slot`);

  console.log('\n=== EKSEKUSI DEMO DUA SKENARIO BERHASIL & TERSIMPAN DI DATABASE ===');
}

runScenarios().catch(console.error).finally(() => prisma.$disconnect());

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding Scenario 2: SDN Nusantara 02 (Paralel)');
  
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.create({
    data: {
      nama: 'Admin Nusantara',
      email: 'admin_paralel@sdnnusantara.sch.id',
      password: hashedPassword,
      no_hp: '081234567890',
      is_admin: true,
      sekolah: {
        create: {
          nama_sekolah: 'SDN Nusantara 02 (Paralel)',
          npsn: '777666555',
          alamat: 'Jl. Merdeka No. 20, Jakarta',
          config: {
            create: {
              is_parallel: true,
              class_naming: 'alphabet',
              start_time: new Date('1970-01-01T07:15:00Z'),
              duration_per_jp: 35,
              school_days: 5,
              has_monday_ceremony: true,
              has_routine: true,
              routine_duration: 15,
            }
          }
        }
      }
    },
    include: { sekolah: { include: { config: true } } }
  });

  const id_sekolah = user.sekolah.id;

  // Routines (Asmaul Husna/Literasi & Istirahat)
  await prisma.routineActivity.createMany({
    data: [
      { id_sekolah, name: 'Pembiasaan Pagi', duration: 15, time_before_jp: 1 },
      { id_sekolah, name: 'Istirahat 1', duration: 15, time_before_jp: 4 }, // after JP 3
      { id_sekolah, name: 'Istirahat 2', duration: 15, time_before_jp: 7 }, // after JP 6
    ]
  });

  // Tingkatan
  for (let t = 1; t <= 6; t++) {
    await prisma.tingkatan.create({
      data: { id_sekolah, nama: `Kelas ${t}` }
    });
  }

  // Kelas (Paralel A, B, C)
  const kelasList = [];
  const alphabets = ['A', 'B', 'C'];
  for (let t = 1; t <= 6; t++) {
    const t_obj = await prisma.tingkatan.findFirst({ where: { id_sekolah, nama: `Kelas ${t}` } });
    for (let i = 0; i < alphabets.length; i++) {
      const k = await prisma.kelas.create({
        data: { id_sekolah, id_tingkatan: t_obj.id, nama_kelas: `${t}${alphabets[i]}`, kode_lengkap: `${t}${alphabets[i]}` }
      });
      kelasList.push(k);
      
      // JP Per Hari (Misal total 34 JP/minggu: S-K = 7 JP, J = 6 JP)
      const dataJp = [];
      for(let h=1; h<=5; h++) {
        dataJp.push({ id_sekolah, id_kelas: k.id, hari: h, jp: h===5 ? 6 : 7 });
      }
      await prisma.jpPerHari.createMany({ data: dataJp });
    }
  }

  // Mapel
  const mapelNames = [
    { nama: 'Matematika', prioritas: true },
    { nama: 'Bahasa Indonesia', prioritas: true },
    { nama: 'Ilmu Pengetahuan Alam', prioritas: true },
    { nama: 'Pendidikan Agama Islam (PAI)', prioritas: false },
    { nama: 'Pendidikan Pancasila (PKn)', prioritas: false },
    { nama: 'Ilmu Pengetahuan Sosial', prioritas: false },
    { nama: 'PENJASKES (Olahraga)', prioritas: false },
    { nama: 'SBdP (Seni Budaya)', prioritas: false },
    { nama: 'Bahasa Inggris', prioritas: false }
  ];

  const mapels = [];
  for (const m of mapelNames) {
    const mapel = await prisma.mapel.create({
      data: { id_sekolah, nama: m.nama, prioritas: m.prioritas, color: '#10b981' }
    });
    mapels.push(mapel);

    // MapelTingkatan
    for (let t = 1; t <= 6; t++) {
      const t_obj = await prisma.tingkatan.findFirst({ where: { id_sekolah, nama: `Kelas ${t}` } });
      await prisma.mapelTingkatan.create({
        data: { id_sekolah, id_mapel: mapel.id, id_tingkatan: t_obj.id, jp_per_minggu: m.prioritas ? 6 : 4 }
      });
    }
  }

  // Guru (Paralel butuh banyak Guru, 18 Wali Kelas + Guru Bidang)
  const gurus = [];
  for (let k = 0; k < kelasList.length; k++) { // 18 wali kelas
    const kelas = kelasList[k];
    const guru = await prisma.guru.create({
      data: { id_sekolah, nama: `Guru Wali Kelas ${kelas.nama_kelas}` }
    });
    gurus.push(guru);
    
    await prisma.waliKelas.create({
      data: { id_sekolah, id_guru: guru.id, id_kelas: kelas.id }
    });
    
    // Ngajar Mapel Utama
    for (let j = 0; j < 6; j++) {
      await prisma.pengampu.create({
        data: { id_sekolah, id_guru: guru.id, id_mapel: mapels[j].id, id_kelas: kelas.id }
      });
    }
  }

  // Guru Bidang Khusus (PJOK, SBdP, BHS ING)
  // Karena 18 kelas, masing-masing butuh 2 guru biar gak bentrok parah (3 mapel * 2 guru = 6 guru)
  const mapelKhusus = [6, 7, 8];
  let guruKhususCount = 1;
  for (let mIdx of mapelKhusus) {
    for (let g = 0; g < 2; g++) { // 2 guru per mapel khusus
      const guruKhusus = await prisma.guru.create({
        data: { id_sekolah, nama: `Guru ${mapels[mIdx].nama} ${g+1}` }
      });
      // Bagi tugas: Guru 1 ngajar Kelas 1-3 (indeks 0-8), Guru 2 ngajar Kelas 4-6 (indeks 9-17)
      const startIdx = g === 0 ? 0 : 9;
      const endIdx = g === 0 ? 9 : 18;
      
      for (let k = startIdx; k < endIdx; k++) {
        await prisma.pengampu.create({
          data: { id_sekolah, id_guru: guruKhusus.id, id_mapel: mapels[mIdx].id, id_kelas: kelasList[k].id }
        });
      }
    }
  }

  console.log('Seeding completed for Skenario 2 (Paralel). User: admin_paralel@sdnnusantara.sch.id / admin123');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

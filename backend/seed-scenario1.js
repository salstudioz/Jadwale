const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding Scenario 1: SDN Pancasila 01');
  
  // Create User and School
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  user = await prisma.user.create({
    data: {
      nama: 'Admin Pancasila Final',
      email: 'admin_final@sdnpancasila.sch.id',
      password: hashedPassword,
      no_hp: '081234567890',
      is_admin: true,
      sekolah: {
        create: {
          nama_sekolah: 'SDN Pancasila 01',
          npsn: '999888777',
          alamat: 'Jl. Merdeka No. 10, Jakarta',
          config: {
            create: {
              start_time: new Date('1970-01-01T07:30:00Z'),
              duration_per_jp: 35,
              school_days: 5,
              has_monday_ceremony: true,
            }
          }
        }
      }
    },
    include: { sekolah: { include: { config: true } } }
  });

  const id_sekolah = user.sekolah.id;

  // Routines (Literasi & Istirahat)
  await prisma.routineActivity.createMany({
    data: [
      { id_sekolah, name: 'Literasi', duration: 15, time_before_jp: 1 },
      { id_sekolah, name: 'Istirahat 1', duration: 15, time_before_jp: 4 },
      { id_sekolah, name: 'Istirahat 2', duration: 15, time_before_jp: 6 },
    ]
  });

  // Tingkatan
  for (let t = 1; t <= 6; t++) {
    await prisma.tingkatan.create({
      data: { id_sekolah, nama: `Kelas ${t}` }
    });
  }

  // Kelas
  const kelasList = [];
  for (let t = 1; t <= 6; t++) {
    const t_obj = await prisma.tingkatan.findFirst({ where: { id_sekolah, nama: `Kelas ${t}` } });
    const k = await prisma.kelas.create({
      data: { id_sekolah, id_tingkatan: t_obj.id, nama_kelas: `${t}A`, kode_lengkap: `${t}A` }
    });
    kelasList.push(k);
    
    // JP Per Hari
    const dataJp = [];
    for(let h=1; h<=5; h++) {
      // Misal Senin 7 JP, Jumat 6 JP
      dataJp.push({ id_sekolah, id_kelas: k.id, hari: h, jp: h===5 ? 6 : 7 });
    }
    await prisma.jpPerHari.createMany({ data: dataJp });
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
      data: { id_sekolah, nama: m.nama, prioritas: m.prioritas, color: '#3b82f6' }
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

  // Guru
  const gurus = [];
  for (let i = 1; i <= 6; i++) {
    const guru = await prisma.guru.create({
      data: { id_sekolah, nama: `Guru Wali Kelas ${i}A` }
    });
    gurus.push(guru);
    
    await prisma.waliKelas.create({
      data: { id_sekolah, id_guru: guru.id, id_kelas: kelasList[i-1].id }
    });
    
    // Pengampu Mapel Utama (MTK, BHS, IPA, PKn, IPS, PAI)
    for (let j = 0; j < 6; j++) {
      await prisma.pengampu.create({
        data: { id_sekolah, id_guru: guru.id, id_mapel: mapels[j].id, id_kelas: kelasList[i-1].id }
      });
    }
  }

  // Guru Mapel Khusus (PJOK, SBdP, BHS ING)
  const mapelKhusus = [6, 7, 8];
  for (let mIdx of mapelKhusus) {
    const guruKhusus = await prisma.guru.create({
      data: { id_sekolah, nama: `Guru ${mapels[mIdx].nama}` }
    });
    // Ngajar semua kelas
    for (let k = 0; k < 6; k++) {
      await prisma.pengampu.create({
        data: { id_sekolah, id_guru: guruKhusus.id, id_mapel: mapels[mIdx].id, id_kelas: kelasList[k].id }
      });
    }
  }

  console.log('Seeding completed for Skenario 1. User: admin@sdnpancasila.sch.id / admin123');
}

seed().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

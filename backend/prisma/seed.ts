import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database Jadwale (Demo SD Pancasila & Harapan)...\n');

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);

  // ═══════════════════════════════════════════════════════════════
  // 1. SUPERADMIN
  // ═══════════════════════════════════════════════════════════════
  await prisma.user.upsert({
    where: { email: 'superadmin@jadwale.id' },
    update: { password: hashedPassword, is_verified: true, is_active: true },
    create: {
      nama: 'Super Admin',
      email: 'superadmin@jadwale.id',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      is_admin: true,
      is_verified: true,
      is_active: true,
    },
  });
  console.log('✅ Superadmin: superadmin@jadwale.id / password123');

  // ═══════════════════════════════════════════════════════════════
  // 2. SEKOLAH DEMO UTAMA — SDN Pancasila
  // ═══════════════════════════════════════════════════════════════
  const sekolahPancasila = await prisma.sekolah.upsert({
    where: { npsn: '20109999' },
    update: { setupCompleted: true, status: 'ACTIVE' },
    create: {
      npsn: '20109999',
      nama_sekolah: 'SDN Pancasila',
      alamat: 'Jl. Pancasila No. 45, Kel. Merdeka, Kota Bandung',
      jenjang: 'SD',
      kepala_sekolah: 'Dr. H. Bambang Hartono, M.Pd.',
      semester_aktif: 'GASAL',
      tahun_pelajaran: '2026/2027',
      setupCompleted: true,
      status: 'ACTIVE',
      config: {
        create: {
          is_parallel: true,
          class_naming: 'alphabet',
          school_days: 5,
          start_time: new Date('1970-01-01T07:00:00Z'),
          duration_per_jp: 35,
          break1_after_jp: 3,
          break1_duration: 15,
          break2_after_jp: 5,
          break2_duration: 15,
          has_routine: true,
          routine_duration: 15,
          has_monday_ceremony: true,
          ceremony_duration: 35,
        },
      },
    },
    include: { config: true },
  });
  console.log('✅ Sekolah 1:', sekolahPancasila.nama_sekolah);

  // ═══════════════════════════════════════════════════════════════
  // 3. ADMIN SEKOLAH — SDN Pancasila (admin_final@sdnpancasila.sch.id)
  // ═══════════════════════════════════════════════════════════════
  await prisma.user.upsert({
    where: { email: 'admin_final@sdnpancasila.sch.id' },
    update: {
      password: hashedPassword,
      is_verified: true,
      is_active: true,
      id_sekolah: sekolahPancasila.id,
    },
    create: {
      nama: 'Admin SDN Pancasila',
      email: 'admin_final@sdnpancasila.sch.id',
      password: hashedPassword,
      role: 'ADMIN_SEKOLAH',
      is_admin: true,
      is_verified: true,
      is_active: true,
      id_sekolah: sekolahPancasila.id,
    },
  });
  console.log('✅ Admin Sekolah Demo: admin_final@sdnpancasila.sch.id / password123');

  // Alias admin lama untuk convenience jika ketik admin@sdnpancasila.sch.id
  await prisma.user.upsert({
    where: { email: 'admin@sdnpancasila.sch.id' },
    update: {
      password: hashedPassword,
      is_verified: true,
      is_active: true,
      id_sekolah: sekolahPancasila.id,
    },
    create: {
      nama: 'Admin SDN Pancasila (Alt)',
      email: 'admin@sdnpancasila.sch.id',
      password: hashedPassword,
      role: 'ADMIN_SEKOLAH',
      is_admin: true,
      is_verified: true,
      is_active: true,
      id_sekolah: sekolahPancasila.id,
    },
  });

  // Helper function to seed full SD data for a school
  async function seedFullSdSchool(sekolah: any, emailDomain: string) {
    // ROUTINES (Upacara, Pembiasaan, Istirahat 1 & 2)
    await prisma.routineActivity.deleteMany({ where: { id_sekolah: sekolah.id } });
    await prisma.routineActivity.createMany({
      data: [
        { id_sekolah: sekolah.id, name: 'Kegiatan Pembiasaan Pagi / Upacara', time_before_jp: 1, duration: 15 },
        { id_sekolah: sekolah.id, name: 'Istirahat 1', time_before_jp: 4, duration: 15 },
        { id_sekolah: sekolah.id, name: 'Istirahat 2', time_before_jp: 6, duration: 15 },
      ]
    });

    // GURU DEMO (12 guru)
    const guruData = [
      { nama: 'Budi Santoso, S.Pd.',       nip: `198201012008011001_${sekolah.id}`, email: `budi@${emailDomain}` },
      { nama: 'Siti Rahayu, S.Pd.',        nip: `198503152010012002_${sekolah.id}`, email: `siti@${emailDomain}` },
      { nama: 'Ahmad Fauzi, S.Pd.',        nip: `197912202006011003_${sekolah.id}`, email: `ahmad@${emailDomain}` },
      { nama: 'Dewi Lestari, S.Pd.',       nip: `199001102015012004_${sekolah.id}`, email: `dewi@${emailDomain}` },
      { nama: 'Hendra Gunawan, S.Pd.',     nip: `198708052012011005_${sekolah.id}`, email: `hendra@${emailDomain}` },
      { nama: 'Rina Oktavia, S.Pd.',       nip: `199205182017012006_${sekolah.id}`, email: `rina@${emailDomain}` },
      { nama: 'Wahyu Setiawan, S.Pd.',     nip: `198411272009011007_${sekolah.id}`, email: `wahyu@${emailDomain}` },
      { nama: 'Nurul Hidayah, S.Pd.',      nip: `199107082016012008_${sekolah.id}`, email: `nurul@${emailDomain}` },
      { nama: 'Agus Prasetyo, S.Pd.',      nip: `198006142004011009_${sekolah.id}`, email: `agus@${emailDomain}` },
      { nama: 'Maya Sari, S.Pd.',          nip: `199310222019012010_${sekolah.id}`, email: `maya@${emailDomain}` },
      { nama: 'Doni Firmansyah, S.Pd.',    nip: `198802132011011011_${sekolah.id}`, email: `doni@${emailDomain}` },
      { nama: 'Sri Wulandari, S.Ag.',      nip: `197805302003012012_${sekolah.id}`, email: `sri@${emailDomain}` },
    ];

    const guruList: any[] = [];
    for (const g of guruData) {
      const guru = await prisma.guru.upsert({
        where: { nip: g.nip },
        update: { nama: g.nama },
        create: { id_sekolah: sekolah.id, nama: g.nama, nip: g.nip },
      });
      guruList.push(guru);

      await prisma.user.upsert({
        where: { email: g.email },
        update: { password: hashedPassword, is_verified: true, is_active: true },
        create: {
          nama: g.nama,
          email: g.email,
          password: hashedPassword,
          role: 'TENAGA_PENDIDIK',
          is_admin: false,
          is_verified: true,
          is_active: true,
          id_sekolah: sekolah.id,
          id_guru: guru.id,
        },
      });
    }

    // TINGKATAN (Kelas 1-6)
    const tingkatanNames = ['Kelas 1', 'Kelas 2', 'Kelas 3', 'Kelas 4', 'Kelas 5', 'Kelas 6'];
    const tingkatanList: any[] = [];
    for (const nama of tingkatanNames) {
      const t = await prisma.tingkatan.upsert({
        where: { id_sekolah_nama: { id_sekolah: sekolah.id, nama } },
        update: {},
        create: { id_sekolah: sekolah.id, nama },
      });
      tingkatanList.push(t);
    }

    // KELAS (1A-6B)
    const kelasList: any[] = [];
    const rombelLabels = ['A', 'B'];
    for (let i = 0; i < tingkatanList.length; i++) {
      const tingkatan = tingkatanList[i];
      const nomor = i + 1;
      for (const rombel of rombelLabels) {
        const namaKelas = rombel;
        const kodeLengkap = `${nomor}${rombel}`;
        let fase = '';
        if (nomor <= 2) fase = 'A';
        else if (nomor <= 4) fase = 'B';
        else fase = 'C';

        const kelas = await prisma.kelas.upsert({
          where: {
            id_sekolah_id_tingkatan_nama_kelas: {
              id_sekolah: sekolah.id,
              id_tingkatan: tingkatan.id,
              nama_kelas: namaKelas,
            },
          },
          update: { kode_lengkap: kodeLengkap, fase },
          create: {
            id_sekolah: sekolah.id,
            id_tingkatan: tingkatan.id,
            nama_kelas: namaKelas,
            kode_lengkap: kodeLengkap,
            fase,
          },
        });
        kelasList.push(kelas);
      }
    }

    // MAPEL
    const mapelData = [
      { nama: 'Pendidikan Agama & Budi Pekerti', prioritas: false, color: '#93C5FD' },
      { nama: 'PPKn',                            prioritas: false, color: '#6EE7B7' },
      { nama: 'Bahasa Indonesia',                prioritas: true,  color: '#FCA5A5' },
      { nama: 'Matematika',                      prioritas: true,  color: '#FCD34D' },
      { nama: 'IPAS',                            prioritas: true,  color: '#A78BFA' },
      { nama: 'Seni Budaya',                     prioritas: false, color: '#F9A8D4' },
      { nama: 'PJOK',                            prioritas: false, color: '#6EE7B7' },
      { nama: 'Bahasa Inggris',                  prioritas: false, color: '#93C5FD' },
      { nama: 'Muatan Lokal',                    prioritas: false, color: '#D1D5DB' },
    ];

    const mapelList: any[] = [];
    for (const m of mapelData) {
      const mapel = await prisma.mapel.upsert({
        where: { id_sekolah_nama: { id_sekolah: sekolah.id, nama: m.nama } },
        update: { color: m.color, prioritas: m.prioritas },
        create: { id_sekolah: sekolah.id, ...m },
      });
      mapelList.push(mapel);
    }

    // JP PER MINGGU
    const jpTable: Record<string, number[]> = {
      'Kelas 1': [4, 4, 8, 6, 0, 2, 3, 0, 2],
      'Kelas 2': [4, 4, 8, 6, 0, 2, 3, 0, 2],
      'Kelas 3': [4, 4, 6, 6, 4, 2, 3, 2, 2],
      'Kelas 4': [4, 4, 6, 6, 4, 2, 3, 2, 2],
      'Kelas 5': [3, 4, 6, 6, 5, 2, 3, 2, 2],
      'Kelas 6': [3, 4, 6, 6, 5, 2, 3, 2, 2],
    };

    for (const tingkatan of tingkatanList) {
      const jpValues = jpTable[tingkatan.nama] || [4, 4, 6, 6, 4, 2, 3, 2, 2];
      for (let mi = 0; mi < mapelList.length; mi++) {
        const jp = jpValues[mi] || 0;
        if (jp === 0) continue;
        await prisma.mapelTingkatan.upsert({
          where: {
            id_sekolah_id_mapel_id_tingkatan: {
              id_sekolah: sekolah.id,
              id_mapel: mapelList[mi].id,
              id_tingkatan: tingkatan.id,
            },
          },
          update: { jp_per_minggu: jp },
          create: {
            id_sekolah: sekolah.id,
            id_mapel: mapelList[mi].id,
            id_tingkatan: tingkatan.id,
            jp_per_minggu: jp,
          },
        });
      }
    }

    // WALI KELAS
    for (let i = 0; i < kelasList.length; i++) {
      const guru = guruList[i % guruList.length];
      await prisma.waliKelas.upsert({
        where: {
          id_sekolah_id_kelas: { id_sekolah: sekolah.id, id_kelas: kelasList[i].id },
        },
        update: { id_guru: guru.id },
        create: {
          id_sekolah: sekolah.id,
          id_guru: guru.id,
          id_kelas: kelasList[i].id,
        },
      }).catch(() => {});
    }

    // PENGAMPU
    const [guruPAI, guruPJOK, guruBIng, guruMulok] = [guruList[9], guruList[10], guruList[11], guruList[11]];

    for (let ki = 0; ki < kelasList.length; ki++) {
      const kelas = kelasList[ki];
      const waliGuru = guruList[ki % guruList.length];
      const tingkatan = tingkatanList[Math.floor(ki / 2)];
      const jpValues = jpTable[tingkatan.nama] || [];

      for (let mi = 0; mi < mapelList.length; mi++) {
        const jp = jpValues[mi] || 0;
        if (jp === 0) continue;

        let assignedGuru = waliGuru;
        if (mi === 0) assignedGuru = guruPAI;
        else if (mi === 6) assignedGuru = guruPJOK;
        else if (mi === 7) assignedGuru = guruBIng;
        else if (mi === 8) assignedGuru = guruMulok;

        await prisma.pengampu.upsert({
          where: {
            id_sekolah_id_guru_id_mapel_id_kelas: {
              id_sekolah: sekolah.id,
              id_guru: assignedGuru.id,
              id_mapel: mapelList[mi].id,
              id_kelas: kelas.id,
            },
          },
          update: {},
          create: {
            id_sekolah: sekolah.id,
            id_guru: assignedGuru.id,
            id_mapel: mapelList[mi].id,
            id_kelas: kelas.id,
          },
        }).catch(() => {});
      }
    }

    console.log(`✅ Data SD lengkap untuk ${sekolah.nama_sekolah} berhasil dibuat.`);
  }

  // Seed data lengkap untuk SDN Pancasila
  await seedFullSdSchool(sekolahPancasila, 'sdnpancasila.sch.id');

  // ═══════════════════════════════════════════════════════════════
  // 4. SEKOLAH DEMO 2 — SDN Harapan Bangsa (Sekolah Tambahan)
  // ═══════════════════════════════════════════════════════════════
  const sekolahHarapan = await prisma.sekolah.upsert({
    where: { npsn: '20101234' },
    update: { setupCompleted: true, status: 'ACTIVE' },
    create: {
      npsn: '20101234',
      nama_sekolah: 'SDN Harapan Bangsa',
      alamat: 'Jl. Pendidikan No. 17, Kota Bandung',
      jenjang: 'SD',
      kepala_sekolah: 'Drs. H. Suherman, M.Pd.',
      semester_aktif: 'GASAL',
      tahun_pelajaran: '2026/2027',
      setupCompleted: true,
      status: 'ACTIVE',
      config: {
        create: {
          is_parallel: true,
          class_naming: 'alphabet',
          school_days: 5,
          start_time: new Date('1970-01-01T07:00:00Z'),
          duration_per_jp: 35,
          break1_after_jp: 3,
          break1_duration: 15,
          break2_after_jp: 5,
          break2_duration: 15,
          has_routine: true,
          routine_duration: 15,
          has_monday_ceremony: true,
          ceremony_duration: 35,
        },
      },
    },
    include: { config: true },
  });

  await prisma.user.upsert({
    where: { email: 'admin@sdnharapan.sch.id' },
    update: {
      password: hashedPassword,
      is_verified: true,
      is_active: true,
      id_sekolah: sekolahHarapan.id,
    },
    create: {
      nama: 'Admin SDN Harapan Bangsa',
      email: 'admin@sdnharapan.sch.id',
      password: hashedPassword,
      role: 'ADMIN_SEKOLAH',
      is_admin: true,
      is_verified: true,
      is_active: true,
      id_sekolah: sekolahHarapan.id,
    },
  });

  await seedFullSdSchool(sekolahHarapan, 'sdnharapan.sch.id');

  // ═══════════════════════════════════════════════════════════════
  // SUMMARY
  // ═══════════════════════════════════════════════════════════════
  console.log('\n' + '═'.repeat(60));
  console.log('🎉 SEEDING SELESAI!');
  console.log('═'.repeat(60));
  console.log('📋 DATA AKUN LOGIN DEMO:');
  console.log('   ★ Admin SDN Pancasila : admin_final@sdnpancasila.sch.id / password123');
  console.log('   ★ Admin SDN Harapan   : admin@sdnharapan.sch.id        / password123');
  console.log('   ★ Superadmin          : superadmin@jadwale.id           / password123');
  console.log('   ★ Guru Demo (Pancasila): budi@sdnpancasila.sch.id        / password123');
  console.log('═'.repeat(60));
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

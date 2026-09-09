const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectFullDb() {
  console.log('=== STATISTIK ISI DATABASE SAAT INI ===\n');

  const usersCount = await prisma.user.count();
  const sekolahCount = await prisma.sekolah.count();
  const configCount = await prisma.schoolConfig.count();
  const tingkatanCount = await prisma.tingkatan.count();
  const kelasCount = await prisma.kelas.count();
  const mapelCount = await prisma.mapel.count();
  const guruCount = await prisma.guru.count();
  const pengampuCount = await prisma.pengampu.count();
  const waliKelasCount = await prisma.waliKelas.count();
  const routineCount = await prisma.routineActivity.count();
  const jadwalCount = await prisma.jadwal.count();
  const shareLinkCount = await prisma.sharedLink.count();

  console.log(`1. User/Akun        : ${usersCount} akun`);
  console.log(`2. Sekolah          : ${sekolahCount} sekolah`);
  console.log(`3. Konfigurasi      : ${configCount} record`);
  console.log(`4. Tingkatan        : ${tingkatanCount} record`);
  console.log(`5. Kelas            : ${kelasCount} kelas`);
  console.log(`6. Mata Pelajaran   : ${mapelCount} mapel`);
  console.log(`7. Guru             : ${guruCount} guru`);
  console.log(`8. Relasi Pengampu  : ${pengampuCount} relasi`);
  console.log(`9. Wali Kelas       : ${waliKelasCount} relasi`);
  console.log(`10. Kegiatan Rutin  : ${routineCount} kegiatan`);
  console.log(`11. Slot Jadwal     : ${jadwalCount} slot`);
  console.log(`12. Share Link      : ${shareLinkCount} link`);

  console.log('\n--- RINCIAN DAFTAR SEKOLAH ---');
  const sekolahList = await prisma.sekolah.findMany({
    include: {
      _count: {
        select: {
          kelas: true,
          gurus: true,
          mapels: true,
          jadwals: true,
          users: true,
        }
      }
    }
  });

  sekolahList.forEach((s, i) => {
    console.log(`\n[Sekolah #${s.id}] ${s.nama_sekolah} (NPSN: ${s.npsn})`);
    console.log(`   - Akun User: ${s._count.users} user`);
    console.log(`   - Kelas    : ${s._count.kelas} kelas`);
    console.log(`   - Guru     : ${s._count.gurus} guru`);
    console.log(`   - Mapel    : ${s._count.mapels} mapel`);
    console.log(`   - Jadwal   : ${s._count.jadwals} slot tersimpan`);
  });
}

inspectFullDb().catch(console.error).finally(() => prisma.$disconnect());

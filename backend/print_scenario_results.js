const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== HASIL AUDIT MATRIX JADWAL DI DATABASE ===\n');

  const sekolahList = await prisma.sekolah.findMany({
    include: { config: true, kelas: true }
  });

  console.log('DAFTAR SEKOLAH DI DB:', sekolahList.map(s => ({ id: s.id, nama: s.nama_sekolah, kelas: s.kelas.length })));

  for (const sek of sekolahList) {
    if (sek.kelas.length === 0) continue;
    console.log(`\n==========================================`);
    console.log(`SEKOLAH ID ${sek.id}: ${sek.nama_sekolah} (${sek.kelas.length} Kelas)`);
    console.log(`Config: Start ${sek.config?.start_time ? sek.config.start_time.toISOString().substring(11, 16) : '07:00'} UTC, Routine: ${sek.config?.has_routine ? 'Aktif' : 'Tidak'}`);

    const sampleKelas = sek.kelas[0];
    const jadwals = await prisma.jadwal.findMany({
      where: { id_sekolah: sek.id, id_kelas: sampleKelas.id },
      include: { mapel: true, guru: true },
      orderBy: [{ hari: 'asc' }, { jam_ke: 'asc' }]
    });

    console.log(`\n🗓️ Matriks Jadwal Kelas ${sampleKelas.nama_kelas} (${jadwals.length} JP tersimpan):`);
    const daysMap = ['', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    jadwals.forEach(j => {
      console.log(`  ${daysMap[j.hari].padEnd(7)} | Jam ${j.jam_ke} | ${j.mapel.nama.padEnd(28)} | ${j.guru.nama}`);
    });

    // Check HC6 (Prioritas Pagi)
    const prioritasPostBreak = jadwals.filter(j => j.mapel.prioritas && j.jam_ke > 3);
    console.log(`\n  ✅ Status Hard Constraint HC6 (Mapel Prioritas): ${prioritasPostBreak.length === 0 ? '100% Terpenuhi (Semua di JP 1-3)' : `${prioritasPostBreak.length} terelaksasi`}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());

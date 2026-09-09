import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Database Default Kemendikbud...');

  const sekolah = await prisma.sekolah.upsert({
    where: { npsn: '1234567890' },
    update: {},
    create: {
      npsn: '1234567890',
      nama_sekolah: 'SDN Percobaan',
      alamat: 'Jl. Pendidikan No. 1',
      config: {
        create: {
          is_parallel: false,
          class_naming: 'alphabet',
          school_days: 5,
          start_time: new Date('1970-01-01T07:00:00Z'),
          duration_per_jp: 35,
          break1_after_jp: 3,
          break2_after_jp: 5,
          has_monday_ceremony: true,
          ceremony_duration: 35,
        }
      }
    }
  });

  console.log('Sekolah and Config created:', sekolah.nama_sekolah);

  const mapels = [
    { nama: 'Pendidikan Agama', prioritas: false },
    { nama: 'PPKn', prioritas: false },
    { nama: 'Bahasa Indonesia', prioritas: true },
    { nama: 'Matematika', prioritas: true },
    { nama: 'IPA', prioritas: true },
    { nama: 'IPS', prioritas: false },
    { nama: 'SBdP', prioritas: false },
    { nama: 'PJOK (Olahraga)', prioritas: false },
    { nama: 'Bahasa Inggris', prioritas: false },
  ];

  for (const m of mapels) {
    await prisma.mapel.upsert({
      where: {
        id_sekolah_nama: {
          id_sekolah: sekolah.id,
          nama: m.nama
        }
      },
      update: {},
      create: {
        id_sekolah: sekolah.id,
        nama: m.nama,
        prioritas: m.prioritas
      }
    });
  }

  const bcrypt = require('bcrypt');
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@sdnpercobaan.sch.id' },
    update: {},
    create: {
      nama: 'Administrator',
      email: 'admin@sdnpercobaan.sch.id',
      password: hashedPassword,
      is_admin: true,
      id_sekolah: sekolah.id
    }
  });

  await prisma.user.upsert({
    where: { email: 'guru@sdnpercobaan.sch.id' },
    update: {},
    create: {
      nama: 'Guru Biasa',
      email: 'guru@sdnpercobaan.sch.id',
      password: hashedPassword,
      is_admin: false,
      id_sekolah: sekolah.id
    }
  });
  console.log('Admin user created: admin@sdnpercobaan.sch.id');
  console.log('Normal user created: guru@sdnpercobaan.sch.id');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

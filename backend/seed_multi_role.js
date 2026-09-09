const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function seedMultiRole() {
  console.log('=== SEEDING PRODUKSI AKUN HAK AKSES JADWALE ===\n');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const allowedEmails = [
    'superadmin@jadwale.id',
    'admin_final@sdnpancasila.sch.id',
    'admin_paralel@sdnnusantara.sch.id',
    'designer_pro@jadwale.id',
  ];

  // Delete all users except allowed 4
  await prisma.user.deleteMany({
    where: { email: { notIn: allowedEmails } }
  });

  // 1. Super Admin Account
  const superadmin = await prisma.user.upsert({
    where: { email: 'superadmin@jadwale.id' },
    update: { role: 'SUPER_ADMIN', is_verified: true, is_active: true, is_admin: true, password: hashedPassword },
    create: {
      nama: 'Super Admin System',
      email: 'superadmin@jadwale.id',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
      is_admin: true,
      is_verified: true,
      is_active: true,
    }
  });

  // 2. Designer Account
  const designer = await prisma.user.upsert({
    where: { email: 'designer_pro@jadwale.id' },
    update: { role: 'DESIGNER', is_verified: true, is_active: true, is_admin: false, password: hashedPassword },
    create: {
      nama: 'Studio Desain Jadwal',
      email: 'designer_pro@jadwale.id',
      password: hashedPassword,
      role: 'DESIGNER',
      is_admin: false,
      is_verified: true,
      is_active: true,
    }
  });

  // 3. Admin Sekolah 1 - SDN Pancasila 01
  const sekolahPancasila = await prisma.sekolah.findFirst({
    where: { nama_sekolah: { contains: 'Pancasila' } }
  });

  if (sekolahPancasila) {
    await prisma.user.upsert({
      where: { email: 'admin_final@sdnpancasila.sch.id' },
      update: { role: 'ADMIN_SEKOLAH', is_verified: true, is_active: true, is_admin: true, id_sekolah: sekolahPancasila.id, password: hashedPassword },
      create: {
        nama: 'Admin Pancasila Final',
        email: 'admin_final@sdnpancasila.sch.id',
        password: hashedPassword,
        role: 'ADMIN_SEKOLAH',
        is_admin: true,
        is_verified: true,
        is_active: true,
        id_sekolah: sekolahPancasila.id,
      }
    });
  }

  // 4. Admin Sekolah 2 - SDN Nusantara 02 (Paralel)
  const sekolahNusantara = await prisma.sekolah.findFirst({
    where: { nama_sekolah: { contains: 'Nusantara' } }
  });

  if (sekolahNusantara) {
    await prisma.user.upsert({
      where: { email: 'admin_paralel@sdnnusantara.sch.id' },
      update: { role: 'ADMIN_SEKOLAH', is_verified: true, is_active: true, is_admin: true, id_sekolah: sekolahNusantara.id, password: hashedPassword },
      create: {
        nama: 'Admin Nusantara',
        email: 'admin_paralel@sdnnusantara.sch.id',
        password: hashedPassword,
        role: 'ADMIN_SEKOLAH',
        is_admin: true,
        is_verified: true,
        is_active: true,
        id_sekolah: sekolahNusantara.id,
      }
    });
  }

  console.log('--- AKUN PRODUKSI AKTIF ---');
  const allUsers = await prisma.user.findMany({ include: { sekolah: true } });
  allUsers.forEach((u, i) => {
    console.log(`${i + 1}. [${u.role}] ${u.nama} (${u.email})`);
    console.log(`   - Verified: ${u.is_verified} | Active: ${u.is_active}`);
    console.log(`   - Sekolah : ${u.sekolah?.nama_sekolah || '-'}\n`);
  });
}

seedMultiRole().catch(console.error).finally(() => prisma.$disconnect());

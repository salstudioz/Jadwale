const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function cleanupProductionAccounts() {
  console.log('=== PEMBERSIHAN AKUN PRODUKSI JADWALE ===\n');
  const hashedPassword = await bcrypt.hash('password123', 10);

  const allowedEmails = [
    'superadmin@jadwale.id',
    'admin_final@sdnpancasila.sch.id',
    'admin_paralel@sdnnusantara.sch.id',
    'designer_pro@jadwale.id',
  ];

  // 1. Delete all users whose email is NOT in the allowed list
  const deleteUsersResult = await prisma.user.deleteMany({
    where: {
      email: {
        notIn: allowedEmails,
      }
    }
  });
  console.log(`- Telah menghapus ${deleteUsersResult.count} akun contoh/tambahan.`);

  // 2. Ensure Superadmin account exists and is valid
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

  // 3. Ensure Designer account exists and is valid
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

  // 4. Clean up any orphan schools that have no active users remaining
  const schools = await prisma.sekolah.findMany({
    include: { users: true }
  });

  for (const s of schools) {
    if (s.users.length === 0) {
      // Check if it's not Pancasila 01 or Nusantara 02
      if (!s.nama_sekolah.includes('Pancasila') && !s.nama_sekolah.includes('Nusantara')) {
        try {
          await prisma.sekolah.delete({ where: { id: s.id } });
          console.log(`- Telah menghapus sekolah contoh tanpa akun: ${s.nama_sekolah}`);
        } catch {
          // Ignore if constrained
        }
      }
    }
  }

  console.log('\n=== AKUN YANG TERSISA DI DATABASE PRODUKSI (TEPAT 4 AKUN) ===');
  const remainingUsers = await prisma.user.findMany({ include: { sekolah: true } });
  remainingUsers.forEach((u, i) => {
    console.log(`${i + 1}. [${u.role}] ${u.nama} (${u.email})`);
    console.log(`   - Verified: ${u.is_verified} | Active: ${u.is_active}`);
    console.log(`   - Sekolah : ${u.sekolah?.nama_sekolah || '-'}\n`);
  });
}

cleanupProductionAccounts().catch(console.error).finally(() => prisma.$disconnect());

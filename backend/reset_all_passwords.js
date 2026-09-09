const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function resetAllPasswords() {
  console.log('=== RESET PASSWORD SEMUA AKUN KE "password123" ===\n');

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const result = await prisma.user.updateMany({
    data: { password: hashedPassword },
  });

  console.log(`✅ Berhasil reset password ${result.count} akun ke "password123"\n`);

  const users = await prisma.user.findMany({ include: { sekolah: true } });
  for (const u of users) {
    console.log(`   - ${u.email} (${u.nama}) — ${u.sekolah?.nama_sekolah || '-'}`);
  }
}

resetAllPasswords().catch(console.error).finally(() => prisma.$disconnect());

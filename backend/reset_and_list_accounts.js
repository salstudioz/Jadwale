const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  // Update all users to have 'password123'
  await prisma.user.updateMany({
    data: { password: hashedPassword }
  });

  const users = await prisma.user.findMany({
    include: { sekolah: true }
  });

  console.log('=== DAFTAR AKUN DAN PASSWORD SYSTEM JADWALE ===\n');
  users.forEach((u, i) => {
    console.log(`${i + 1}. [${u.is_admin ? 'ADMIN' : 'GURU'}] ${u.nama}`);
    console.log(`   - Email   : ${u.email}`);
    console.log(`   - Password: password123`);
    console.log(`   - Sekolah : ${u.sekolah?.nama_sekolah || '-'}\n`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());

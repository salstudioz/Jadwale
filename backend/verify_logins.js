const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function testLoginAll() {
  console.log('=== UJI VERIFIKASI AUTENTIKASI SEMUA AKUN ===\n');

  const users = await prisma.user.findMany({ include: { sekolah: true } });
  
  for (const u of users) {
    const isValid = await bcrypt.compare('password123', u.password);
    console.log(`👤 Nama     : ${u.nama}`);
    console.log(`📧 Email    : ${u.email}`);
    console.log(`🏫 Sekolah  : ${u.sekolah?.nama_sekolah || '-'}`);
    console.log(`🔑 Password : password123`);
    console.log(`✅ status   : ${isValid ? 'VERIFIED (Bisa Login 100%)' : 'FAILED'}\n`);
  }
}

testLoginAll().catch(console.error).finally(() => prisma.$disconnect());

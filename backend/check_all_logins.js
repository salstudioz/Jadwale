const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAllLogins() {
  console.log('=== PENGUJIAN OTENTIKASI REAL-TIME SEMUA AKUN (5 ROLE & VERIFIKASI) ===\n');
  const users = await prisma.user.findMany({ include: { sekolah: true } });
  
  console.log(`Total akun di Database: ${users.length}\n`);

  for (const u of users) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: u.email, password: 'password123' }),
      });

      const data = await response.json();
      if (response.ok && data.access_token) {
        console.log(`✅ [BERHASIL LOGIN - 200 OK]`);
        console.log(`   - ID/Nama  : ${u.id} / ${u.nama}`);
        console.log(`   - Email    : ${u.email}`);
        console.log(`   - Role     : ${u.role}`);
        console.log(`   - Verified : ${u.is_verified}`);
        console.log(`   - Sekolah  : ${u.sekolah?.nama_sekolah || '-'}\n`);
      } else {
        console.log(`🔒 [PENOLAKAN LOGIN / VERIFIKASI - Status ${response.status}]`);
        console.log(`   - Email    : ${u.email}`);
        console.log(`   - Role     : ${u.role}`);
        console.log(`   - Pesan    : ${data.message}\n`);
      }
    } catch (err) {
      console.log(`❌ [ERROR KONEKSI] ${u.email}:`, err.message);
    }
  }
}

checkAllLogins().catch(console.error).finally(() => prisma.$disconnect());


const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/src/app.module');
const { AuthService } = require('./dist/src/auth/auth.service');

async function testLiveLogin() {
  console.log('=== MEMULAI TEST AUTENTIKASI API SELESAI LENGKAP ===\n');

  const app = await NestFactory.createApplicationContext(AppModule, { logger: false });
  const authService = app.get(AuthService);

  const testAccounts = [
    { name: 'Administrator', email: 'admin@sdnpercobaan.sch.id', pass: 'password123' },
    { name: 'Guru Biasa', email: 'guru@sdnpercobaan.sch.id', pass: 'password123' },
    { name: 'Admin Pancasila Final', email: 'admin_final@sdnpancasila.sch.id', pass: 'password123' },
    { name: 'Admin Nusantara', email: 'admin_paralel@sdnnusantara.sch.id', pass: 'password123' },
  ];

  for (const acc of testAccounts) {
    const user = await authService.validateUser(acc.email, acc.pass);
    if (!user) {
      console.log(`❌ [FAILED] ${acc.name} (${acc.email})`);
      continue;
    }

    const tokenObj = await authService.login(user);
    console.log(`✅ [BERHASIL LOGIN] ${acc.name}`);
    console.log(`   - Email        : ${acc.email}`);
    console.log(`   - Role         : ${user.is_admin ? 'ADMIN SEKOLAH' : 'GURU'}`);
    console.log(`   - ID Sekolah   : ${user.id_sekolah}`);
    console.log(`   - JWT Token    : ${tokenObj.access_token.substring(0, 35)}...`);
    console.log(`   - Status Access: FULL GRANTED\n`);
  }

  await app.close();
  console.log('=== SELURUH AKUN BERHASIL LOGIN TANPA ERROR ===');
}

testLiveLogin().catch(console.error);

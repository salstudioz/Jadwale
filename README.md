# 📅 Jadwale

> Generator & Pembuat Jadwal Pelajaran Sekolah Otomatis Berbasis AI Constraint Satisfaction Problem (CSP).

Aplikasi **Jadwale** dirancang untuk menyusun jadwal pelajaran sekolah (SD / SMP) secara otomatis tanpa bentrok antar guru, bentrok kelas, maupun pelanggaran slot waktu pembiasaan (seperti Sholat Berjamaah, Upacara, dan Istirahat).

---

## ✨ Fitur Utama

- 🤖 **Otomatisasi Jadwal (CSP Engine)**: Menyusun jadwal pelajaran bebas bentrok secara otomatis dalam hitungan detik.
- 🏫 **Manajemen Data Sekolah**: Kelola data sekolah, guru, kelas, mata pelajaran, dan alokasi jam mengajar.
- 🔄 **Deteksi Registrasi Otomatis**: Deteksi role akun otomatis berdasarkan domain email (`.sch.id` untuk Admin Sekolah dan `guru.sd.belajar.id` untuk Tenaga Pendidik).
- 🔗 **Share Link & Ekspor Data**: Bagikan jadwal publik via link read-only atau ekspor ke format PDF dan Excel.
- 🌙 **Dark & Light Mode**: Dukungan penuh antarmuka mode gelap dan mode terang.
- 📱 **Mobile & Desktop Friendly**: Tampilan responsif untuk Smartphone, Tablet, dan Desktop.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router), TypeScript, TailwindCSS, Lucide Icons, Next Themes.
- **Backend**: NestJS, TypeScript, Prisma ORM, SQLite / PostgreSQL.
- **Security**: JWT Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC).

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
- **Node.js**: v18.x atau lebih baru
- **npm** / **yarn** / **pnpm**

### 2. Backend (NestJS)
```bash
cd backend
npm install
npm run start:dev
```
> Server Backend berjalan pada `http://localhost:5000`

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
> Aplikasi Frontend berjalan pada `http://localhost:3000`

---

## 🔑 Akun Default

- **Superadmin**: `superadmin@jadwale.id`

---

## 📝 Lisensi

Hak Cipta © 2026 **Jadwale Team**. All Rights Reserved.

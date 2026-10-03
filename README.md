# 📅 Jadwale

> Generator & Pembuat Jadwal Pelajaran Sekolah Otomatis Berbasis AI Constraint Satisfaction Problem (CSP).

Aplikasi **Jadwale** dirancang untuk menyusun jadwal pelajaran sekolah (fokus utama SD) secara otomatis tanpa bentrok antar guru, bentrok kelas, maupun pelanggaran slot waktu kegiatan rutin (seperti Upacara Bendera Senin, Pembiasaan Pagi, dan Jam Istirahat).

---

## ✨ Fitur Utama

- 🤖 **Otomatisasi Jadwal (CSP Engine)**: Menyusun jadwal pelajaran bebas bentrok secara otomatis dengan batasan ketat & rutinitas sekolah.
- 🏫 **Setup Wizard & Manajemen Sekolah**: Panduan langkah demi langkah untuk profil sekolah, guru, kelas (1A-6B), mapel, dan pembagian jam mengajar (JP).
- ☕ **Kegiatan Rutin & Istirahat**: Dukungan otomatisasi slot Upacara Bendera (Senin Pagi), Pembiasaan Pagi, dan Jam Istirahat.
- 📄 **Ekspor & Cetak Jadwal**:
  - **PDF & Excel (.xlsx)**: Unduh jadwal per kelas maupun gabungan seluruh 12 kelas SD.
  - **Cetak Langsung (`@media print`)**: Tampilan bersih khusus printer / cetak browser.
- 🔗 **Share Link Public**: Bagikan link jadwal publik (`/share/[uuid]`) yang dapat diakses guru/orang tua murid tanpa perlu login.
- 📥 **Import Bulk Data**: Fitur upload data Guru, Kelas, Mapel & Pengampu via file Excel/CSV beserta template yang dapat diunduh.
- 🔑 **Multi-Role & Restorasi Akun Demo**: Dukungan role Super Admin, Admin Sekolah, dan Guru.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15+, TypeScript, TailwindCSS, Lucide Icons, Axios, PDFMake.
- **Backend**: NestJS, TypeScript, Prisma ORM, MySQL Database, Redis (BullQueue).
- **Security**: JWT Authentication, Bcrypt Password Hashing, Role-Based Access Control (RBAC).

---

## 🚀 Cara Menjalankan Project

### 1. Prasyarat
- **Node.js**: v18.x atau lebih baru
- **MySQL Database Server**: Port 3306 (atau via Laragon/XAMPP)
- **Redis Server**: Port 6379 (opsional untuk antrean job generator)

### 2. Backend (NestJS)
```bash
cd backend
npm install
npx prisma db push
npx prisma db seed
npm run start:dev
```
> Server Backend berjalan pada `http://localhost:3001` (atau port yang dikonfigurasi).

### 3. Frontend (Next.js)
```bash
cd frontend
npm install
npm run dev
```
> Aplikasi Frontend berjalan pada `http://localhost:3000`

---

## 🔑 Akun Demo & Default

- **Admin Sekolah (Demo Data SD)**:
  - Email: `admin_final@sdnpancasila.sch.id`
  - Password: `Password123!`
- **Superadmin System**:
  - Email: `superadmin@jadwale.id`
  - Password: `Password123!`

---

## 📝 Lisensi

Hak Cipta © 2026 **Jadwale Team**. All Rights Reserved.


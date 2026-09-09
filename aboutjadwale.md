# 📘 DOKUMEN SPESIFIKASI LENGKAP APLIKASI JADWALE (aboutjadwale.md)

**Versi Sistem:** v3.1 – Standalone & Production Ready  
**Nama Aplikasi:** Jadwale  
**Tagline:** *Jadwal Sekolah, Semudah Itu*  
**Pengembang:** Tim Pengembang Jadwale  
**Target Pengguna:** Operator Sekolah Dasar (SD), Guru, Kepala Sekolah, dan Admin Sistem  

---

## 📋 DAFTAR ISI

1. [Pendahuluan & Visi Produk](#1-pendahuluan--visi-produk)
2. [Prinsip Utama & UX Gaptek-Friendly](#2-prinsip-utama--ux-gaptek-friendly)
3. [Arsitektur Teknis Sistem](#3-arsitektur-teknis-sistem)
4. [Algoritma Inti Penjadwalan (CSP - Constraint Satisfaction Problem)](#4-algoritma-inti-penjadwalan-csp---constraint-satisfaction-problem)
5. [Skema Basis Data & ERD (Prisma / MySQL)](#5-skema-basis-data--erd-prisma--mysql)
6. [Alur Kerja Pengguna (User Workflows)](#6-alur-kerja-pengguna-user-workflows)
   - 6.1 [Wizard 5 Langkah (Pengisian Data)](#61-wizard-5-langkah-pengisian-data)
   - 6.2 [Mekanisme State Hydration (Guest ke Auth User)](#62-mekanisme-state-hydration-guest-ke-auth-user)
   - 6.3 [Bento Grid Dashboard](#63-bento-grid-dashboard)
   - 6.4 [Admin Console (RBAC)](#64-admin-console-rbac)
   - 6.5 [Fitur Berbagi Link (Shared Links)](#65-fitur-berbagi-link-shared-links)
7. [Modul Ekspor (PDF Serverless & Excel)](#7-modul-ekspor-pdf-serverless--excel)
8. [Spesifikasi Endpoints API & WebSocket](#8-spesifikasi-endpoints-api--websocket)
9. [Struktur Kode & Folder Repositori](#9-struktur-kode--folder-repositori)
10. [Matriks Quality Assurance & Testing (105 Test Cases)](#10-matriks-quality-assurance--testing-105-test-cases)
11. [Panduan Deployment (Shared Hosting CPanel & VPS Ubuntu)](#11-panduan-deployment-shared-hosting-cpanel--vps-ubuntu)
12. [Environment Variables (.env) & Konfigurasi](#12-environment-variables-env--konfigurasi)

---

## 1. PENDAHULUAN & VISI PRODUK

### 1.1 Latar Belakang
Penyusunan jadwal pelajaran di Sekolah Dasar (SD) di Indonesia sering kali memakan waktu berhari-hari bahkan berminggu-minggu jika dilakukan secara manual. Beberapa tantangan utama di lapangan meliputi:
- Bentrokan jam mengajar guru (khususnya guru yang mengajar di beberapa kelas atau sekolah lain).
- Pengaturan guru honorer yang hanya tersedia di hari/jam tertentu (*Teacher Availability*).
- Penerapan aturan khusus Kemendikbud (Upacara hari Senin di JP 1, Istirahat tepat waktu, Pembiasaan/Routine activities).
- Mata pelajaran prioritas (Bahasa Indonesia, Matematika, IPA) yang harus ditempatkan pada jam-jam awal (pagi hari).
- Kurangnya pemahaman teknis dari operator sekolah/guru (*gaptek*), sehingga membutuhkan aplikasi dengan antarmuka yang sangat intuitif dan sederhana.

### 1.2 Tujuan Utama
1. **Otomatisasi CSP**: Menghasilkan jadwal pelajaran otomatis tanpa bentrok dalam waktu singkat (<30 detik) menggunakan algoritma *Constraint Satisfaction Problem*.
2. **Multi-Tenancy**: Mendukung isolasi data antarsekolah secara aman dalam satu basis data.
3. **UX Ramah Awam**: Bebas istilah teknis rumit (seperti *backtracking*, *MRV*, *constraint*), diganti dengan istilah umum (*Jam Pelajaran*, *Mapel Pagi*, *Jadwal Kehadiran*).
4. **Fleksibilitas Penggunaan**: Dapat diakses tanpa login (mode Guest dengan auto-save `localStorage`) maupun dengan login (mode tersimpan permanen di database).

---

## 2. PRINSIP UTAMA & UX GAPTEK-FRIENDLY

1. **Bahasa Sederhana**: Seluruh teks antarmuka menggunakan bahasa sehari-hari.
2. **Desain Visual Modern & Jelas**:
   - Palet Warna: Neutral Slate (`#F8FAFC`, `#1E293B`) dengan aksen Blue (`#2563EB`) dan Pastel Colors untuk Mapel.
   - Tipografi: Clean sans-serif sans browser default.
   - Ukuran Elemen Sentuh: Minimal tinggi 48px pada tombol mobile.
   - Notifikasi: Toast notification modern (tidak menggunakan `alert()` browser).
3. **Penyimpanan Otomatis (Auto-Save)**: Pengisian data di Wizard langsung tersimpan di `localStorage` browser sehingga aman jika halaman tidak sengaja ter-refresh.
4. **Soft Delete**: Data master (Guru, Mapel, Kelas) yang dihapus tidak benar-benar hilang dari database (`deleted_at TIMESTAMP`), sehingga riwayat jadwal historis tetap utuh.

---

## 3. ARSITEKTUR TEKNIS SISTEM

Sistem **Jadwale** dibangun menggunakan arsitektur Decoupled Modern (Frontend SPA/SSR + Backend REST/WS Service + Async Queue Worker).

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Next.js 16 - App Router)         │
│  - React 19, TailwindCSS v4, Zustand Store                  │
│  - Wizard 5 Langkah + LocalStorage Hydration                │
│  - Dashboard Bento Grid, Socket.io-client Progress          │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS (REST API) / WebSocket (WS)
┌─────────────────────────────▼───────────────────────────────┐
│                    Backend API (NestJS 11)                   │
│  - JWT Authentication + RBAC Guard                          │
│  - Prisma ORM (MySQL / SQLite), Throttler Rate Limiter      │
│  - Socket.io Gateway (Room per id_sekolah)                  │
└───────┬──────────────────────────────────────────┬──────────┘
        │                                          │
┌───────▼──────────────┐          ┌────────────────▼──────────┐
│  Redis (Cache)       │          │  Redis (Queue Broker)     │
│  - Session & Cache   │          │  - BullMQ Job Storage     │
└──────────────────────┘          └────────────────┬──────────┘
                                                   │
┌──────────────────────────────────────────────────▼───────────┐
│               Worker (BullMQ – Proses Terpisah)              │
│  - Algoritma Backtracking CSP + Heuristics                   │
│  - Relaxations Phase (0s - 10s - 20s - 30s)                  │
│  - Penyimpanan Hasil Jadwal ke Database                      │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Serverless PDF Renderer (Puppeteer / Pdfmake)    │
│  - Payload HTML/JSON -> Return PDF Buffer                   │
└─────────────────────────────────────────────────────────────┘
```

### Stack Teknologi Utuh:
- **Frontend Framework**: Next.js 16 (React 19, TypeScript)
- **State Management**: Zustand (dengan middleware `persist` ke LocalStorage)
- **Styling & UI Components**: TailwindCSS v4, Lucide React Icons, Framer Motion
- **Backend Framework**: NestJS 11 (TypeScript, Express)
- **Database & ORM**: MySQL / SQLite via Prisma ORM 6
- **Antrian & Asinkron**: BullMQ & Redis (IoRedis)
- **Komunikasi Realtime**: Socket.io (WebSockets)
- **Keamanan**: Passport JWT, Bcrypt, NestJS Throttler (Rate Limiting)
- **Ekspor Dokumen**: ExcelJS / SheetJS (Excel) & Pdfmake / Puppeteer (PDF)

---

## 4. ALGORITMA INTI PENJADWALAN (CSP - CONSTRAINT SATISFACTION PROBLEM)

Proses pembuatan jadwal diwakili sebagai masalah pencarian solusi yang memenuhi sekumpulan aturan (*constraints*).

### 4.1 Daftar Batasan (Constraints)

#### Hard Constraints (Wajib Mutlak)
1. **HC1**: Satu guru tidak boleh mengajar dua kelas berbeda pada jam/hari yang sama.
2. **HC2**: Jumlah total Jam Pelajaran (JP) per mata pelajaran per tingkatan harus sesuai target mingguan (`jp_per_minggu`).
3. **HC3**: Jumlah JP per hari untuk suatu kelas harus persis sama dengan alokasi (`jp_per_hari`).
4. **HC4**: Suatu mata pelajaran hanya boleh muncul maksimal 1 kali per hari pada kelas yang sama.
5. **HC5**: Slot JP 1 hari Senin wajib diblokir untuk Upacara Bendera (jika opsi upacara aktif).
6. **HC6**: Mata pelajaran prioritas (*Mapel Pagi*) WAJIB diletakkan sebelum jam istirahat pertama (`jam_ke <= break1_after_jp`).

#### Soft Constraints (Diupayakan - Memiliki Bobot Penalti)
1. **SC1**: Maksimal 2 JP berturut-turut untuk mapel yang sama tanpa diselingi istirahat (Bobot: Tinggi).
2. **SC2**: Boleh 3 JP per hari hanya jika dipisahkan oleh jam istirahat (Bobot: Sedang).
3. **SC3**: Seorang guru disarankan tidak mengajar lebih dari 4 JP berturut-turut dalam satu hari (Bobot: Rendah).

### 4.2 Matrix Kehadiran Guru (Teacher Availability)
Tabel `guru_availability` menyimpan preferensi/keterbatasan hari dan jam hadir guru (misalnya guru honorer atau guru agama). Algoritma akan menapis kandidat slot sehingga guru hanya dijadwalkan pada slot jam ketersediaannya.

### 4.3 Strategi Backtracking & Relaksasi Bertahap (Stepwise Relaxation)
- **Waktu Eksekusi Maksimal**: 30 Detik.
- **Heuristik Pencarian**:
  - *MRV (Minimum Remaining Values)*: Memilih slot/variabel yang paling sulit diisi terlebih dahulu.
  - *Degree Heuristic*: Memprioritaskan kelas/guru dengan constraint paling banyak.
- **Relaksasi Waktu (Waktu Mundur)**:
  - **Tahap 0 (0–10 Detik)**: Semua Hard & Soft Constraints wajib dipenuhi 100%.
  - **Tahap 1 (10–20 Detik)**: Mengubah HC6 (Mapel Prioritas) menjadi Soft Constraint (diizinkan lewat sedikit dari istirahat 1 jika terdesak).
  - **Tahap 2 (20–30 Detik)**: Mengizinkan 3 JP berturut-turut tanpa jeda istirahat jika tidak ada pilihan lain.
- Jika setelah 30 detik tidak ditemukan solusi, algoritma menghentikan pencarian, mengembalikan status `FAILED`, dan mencatat rekomendasi perbaikan (misal: "Tambah jumlah guru" atau "Kurangi JP").

---

## 5. SKEMA BASIS DATA & ERD (PRISMA / MYSQL)

Seluruh tabel master menggunakan kolom `deleted_at TIMESTAMP NULL` untuk mendukung fitur **Soft Delete**. Relasi transaksional menggunakan `ON DELETE RESTRICT` untuk menjamin integritas riwayat jadwal.

```prisma
// File: backend/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

model Sekolah {
  id                 Int                 @id @default(autoincrement())
  npsn               String              @unique
  nama_sekolah       String
  alamat             String?
  deleted_at         DateTime?
  created_at         DateTime            @default(now())
  updated_at         DateTime            @updatedAt

  users              User[]
  gurus              Guru[]
  guruAvailabilities GuruAvailability[]
  tingkatans         Tingkatan[]
  kelas              Kelas[]
  mapels             Mapel[]
  mapelTingkatans    MapelTingkatan[]
  waliKelas          WaliKelas[]
  pengampus          Pengampu[]
  jpPerHaris         JpPerHari[]
  config             SchoolConfig?
  routines           RoutineActivity[]
  scheduleSlots      ScheduleSlot[]
  jadwals            Jadwal[]
  sharedLinks        SharedLink[]
  histories          History[]
}

model User {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  nama         String
  email        String    @unique
  no_hp        String?
  password     String
  is_active    Boolean   @default(true)
  is_admin     Boolean   @default(false)
  deleted_at   DateTime?
  last_login   DateTime?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  sekolah            Sekolah      @relation(fields: [id_sekolah], references: [id], onDelete: Restrict)
  templates          Template[]
  sharedLinksCreated SharedLink[] @relation("CreatedBy")
  sharedLinksAllowed SharedLink[] @relation("AllowedUser")
  histories          History[]
  adminLogs          AdminLog[]

  @@index([id_sekolah])
  @@index([email])
}

model Guru {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  nama         String
  nip          String?   @unique
  deleted_at   DateTime?
  created_at   DateTime  @default(now())
  updated_at   DateTime  @updatedAt

  sekolah            Sekolah            @relation(fields: [id_sekolah], references: [id], onDelete: Restrict)
  guruAvailabilities GuruAvailability[]
  waliKelas          WaliKelas[]
  pengampus          Pengampu[]
  jadwals            Jadwal[]

  @@index([id_sekolah])
}

model GuruAvailability {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  id_guru      Int
  hari         Int       // 1 (Senin) - 7 (Minggu)
  jam_mulai    DateTime?
  jam_selesai  DateTime?

  sekolah      Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  guru         Guru      @relation(fields: [id_guru], references: [id], onDelete: Cascade)

  @@unique([id_sekolah, id_guru, hari])
}

model Tingkatan {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  nama         String
  deleted_at   DateTime?

  sekolah      Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Restrict)
  kelas        Kelas[]
  mapelTingkatans MapelTingkatan[]

  @@unique([id_sekolah, nama])
}

model Kelas {
  id             Int       @id @default(autoincrement())
  id_sekolah     Int
  id_tingkatan   Int
  nama_kelas     String
  kode_lengkap   String
  id_wali_kelas  Int?
  deleted_at     DateTime?
  created_at     DateTime  @default(now())

  sekolah        Sekolah        @relation(fields: [id_sekolah], references: [id], onDelete: Restrict)
  tingkatan      Tingkatan      @relation(fields: [id_tingkatan], references: [id], onDelete: Restrict)
  
  waliKelasList  WaliKelas[]
  pengampus      Pengampu[]
  jpPerHaris     JpPerHari[]
  scheduleSlots  ScheduleSlot[]
  jadwals        Jadwal[]
  sharedLinks    SharedLink[]

  @@unique([id_sekolah, id_tingkatan, nama_kelas])
}

model Mapel {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  nama         String
  prioritas    Boolean   @default(false)
  color        String    @default("#E2E8F0")
  deleted_at   DateTime?

  sekolah         Sekolah          @relation(fields: [id_sekolah], references: [id], onDelete: Restrict)
  mapelTingkatans MapelTingkatan[]
  pengampus       Pengampu[]
  jadwals         Jadwal[]

  @@unique([id_sekolah, nama])
}

model MapelTingkatan {
  id             Int       @id @default(autoincrement())
  id_sekolah     Int
  id_mapel       Int
  id_tingkatan   Int
  jp_per_minggu  Int

  sekolah        Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  mapel          Mapel     @relation(fields: [id_mapel], references: [id], onDelete: Cascade)
  tingkatan      Tingkatan @relation(fields: [id_tingkatan], references: [id], onDelete: Cascade)

  @@unique([id_sekolah, id_mapel, id_tingkatan])
}

model WaliKelas {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  id_guru      Int
  id_kelas     Int

  sekolah      Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  guru         Guru      @relation(fields: [id_guru], references: [id], onDelete: Cascade)
  kelas        Kelas     @relation(fields: [id_kelas], references: [id], onDelete: Cascade)

  @@unique([id_sekolah, id_guru])
  @@unique([id_sekolah, id_kelas])
}

model Pengampu {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  id_guru      Int
  id_mapel     Int
  id_kelas     Int

  sekolah      Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  guru         Guru      @relation(fields: [id_guru], references: [id], onDelete: Cascade)
  mapel        Mapel     @relation(fields: [id_mapel], references: [id], onDelete: Cascade)
  kelas        Kelas     @relation(fields: [id_kelas], references: [id], onDelete: Cascade)

  @@unique([id_sekolah, id_guru, id_mapel, id_kelas])
}

model JpPerHari {
  id           Int       @id @default(autoincrement())
  id_sekolah   Int
  id_kelas     Int
  hari         Int
  jp           Int

  sekolah      Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  kelas        Kelas     @relation(fields: [id_kelas], references: [id], onDelete: Cascade)

  @@unique([id_sekolah, id_kelas, hari])
}

model SchoolConfig {
  id                  Int       @id @default(autoincrement())
  id_sekolah          Int       @unique
  is_parallel         Boolean   @default(false)
  class_naming        String    @default("alphabet")
  school_days         Int       @default(5)
  start_time          DateTime  @default(now())
  duration_per_jp     Int       @default(35)
  has_routine         Boolean   @default(false)
  routine_duration    Int       @default(15)
  break1_duration     Int       @default(15)
  break2_duration     Int       @default(15)
  break1_after_jp     Int       @default(3)
  break2_after_jp     Int       @default(5)
  has_monday_ceremony Boolean   @default(true)
  ceremony_duration   Int       @default(35)
  updated_at          DateTime  @updatedAt

  sekolah             Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
}

model RoutineActivity {
  id               Int       @id @default(autoincrement())
  id_sekolah       Int
  name             String
  day_of_week      Int?
  time_before_jp   Int?      @default(1)
  duration         Int
  is_active        Boolean   @default(true)

  sekolah          Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
}

model ScheduleSlot {
  id               Int       @id @default(autoincrement())
  id_sekolah       Int
  id_kelas         Int
  hari             Int
  jam_ke           Int
  waktu_mulai      DateTime
  waktu_selesai    DateTime
  is_break         Boolean   @default(false)
  is_ceremony      Boolean   @default(false)

  sekolah          Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  kelas            Kelas     @relation(fields: [id_kelas], references: [id], onDelete: Cascade)

  @@unique([id_sekolah, id_kelas, hari, jam_ke])
}

model Jadwal {
  id               Int       @id @default(autoincrement())
  id_sekolah       Int
  id_kelas         Int
  hari             Int
  jam_ke           Int
  id_mapel         Int
  id_guru          Int

  sekolah          Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  kelas            Kelas     @relation(fields: [id_kelas], references: [id], onDelete: Cascade)
  mapel            Mapel     @relation(fields: [id_mapel], references: [id], onDelete: Restrict)
  guru             Guru      @relation(fields: [id_guru], references: [id], onDelete: Restrict)

  @@unique([id_sekolah, id_kelas, hari, jam_ke])
  @@index([id_sekolah, id_kelas])
  @@index([id_guru, hari, jam_ke])
}

model Template {
  id               Int       @id @default(autoincrement())
  name             String
  thumbnail        String?
  css_styles       String
  is_premium       Boolean   @default(false)
  created_by       Int
  created_at       DateTime  @default(now())
  updated_at       DateTime  @updatedAt

  user             User      @relation(fields: [created_by], references: [id], onDelete: Cascade)
}

model SharedLink {
  id               Int       @id @default(autoincrement())
  id_sekolah       Int
  uuid             String    @unique
  id_kelas         Int?
  permission       String    @default("read") // read | edit
  created_by       Int
  allowed_user_id  Int?
  expires_at       DateTime?
  view_count       Int       @default(0)
  created_at       DateTime  @default(now())

  sekolah          Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  kelas            Kelas?    @relation(fields: [id_kelas], references: [id], onDelete: Cascade)
  creator          User      @relation("CreatedBy", fields: [created_by], references: [id], onDelete: Cascade)
  allowedUser      User?     @relation("AllowedUser", fields: [allowed_user_id], references: [id], onDelete: Cascade)

  @@index([uuid])
  @@index([expires_at])
}

model History {
  id               Int       @id @default(autoincrement())
  id_sekolah       Int
  user_id          Int
  aksi             String
  deskripsi        String?
  ip_address       String?
  created_at       DateTime  @default(now())

  sekolah          Sekolah   @relation(fields: [id_sekolah], references: [id], onDelete: Cascade)
  user             User      @relation(fields: [user_id], references: [id], onDelete: Cascade)

  @@index([id_sekolah, user_id])
}

model AdminLog {
  id               Int       @id @default(autoincrement())
  admin_user_id    Int
  action           String
  target_type      String?
  target_id        Int?
  details          String?   // JSON String
  created_at       DateTime  @default(now())

  adminUser        User      @relation(fields: [admin_user_id], references: [id], onDelete: Cascade)

  @@index([admin_user_id])
}
```

---

## 6. ALUR KERJA PENGGUNA (USER WORKFLOWS)

### 6.1 Wizard 5 Langkah (Pengisian Data)
Setiap pengguna diawali dengan alur panduan visual 5 langkah yang mudah diikuti:

1. **Step 1: Konfigurasi Sekolah** (`Step1Config.tsx`)
   - Memilih Tipe Kelas: Non-Paralel (1 kelas per tingkatan) atau Paralel (banyak kelas per tingkatan).
   - Penamaan Kelas: Alfabet (`1A, 1B, 2A`) atau Angka (`1-1, 1-2, 2-1`).
   - Jumlah Tingkatan & Jumlah Kelas per Tingkatan.
2. **Step 2: Jam Pelajaran & Istirahat** (`Step2Waktu.tsx`)
   - Durasi 1 JP (Default: 35 menit).
   - Hari Sekolah (5 atau 6 hari).
   - Checkbox Upacara Senin (JP 1) & Kegiatan Rutin/Pembiasaan.
   - Pengaturan Jam Istirahat 1 dan Istirahat 2 (setelah JP ke berapa & durasi).
3. **Step 3: Master Data Guru & Mapel** (`Step3Master.tsx`)
   - Input Guru (Nama, NIP) & Modal Ketersediaan (*Availability Matrix* untuk Guru Honorer).
   - Input Mapel (Nama, Warna Kartu, Prioritas Pagi).
4. **Step 4: Relasi Penugasan (Pengampu & Wali)** (`Step4Relasi.tsx`)
   - Penunjukan Wali Kelas per Kelas.
   - Penugasan Mengajar (Guru + Mapel + Checklist Kelas yang diampu).
   - Tombol "Pilih Semua per Tingkatan" untuk mempercepat centang kelas.
5. **Step 5: Generate Jadwal** (`Step5Generate.tsx`)
   - Menampilkan ringkasan total Guru & Mapel.
   - Jika pengguna **belum login**: Menampilkan peringatan untuk Login agar data dapat di-hydrate ke database server dan pemicu pembuatan jadwal aktif.
   - Jika pengguna **sudah login**: Mengirimkan data wizard ke `/api/sekolah/hydrate`, kemudian mengarahkan ke dashboard jadwal (`/dashboard/jadwal`).

---

### 6.2 Mekanisme State Hydration (Guest ke Auth User)
1. Pengguna tanpa login dapat mengisi Wizard dari Step 1 sampai Step 4. Semua data otomatis disimpan di `localStorage` melalui Zustand middleware.
2. Ketika pengguna melakukan Login, sistem mendeteksi keberadaan data di `localStorage`.
3. Notifikasi Toast / Modal menawarkan opsi:
   - **[Gunakan Data Ini]**: Mengirimkan seluruh objek state wizard ke backend via `/api/sekolah/hydrate`, menyimpan ke MySQL, lalu mengosongkan `localStorage`.
   - **[Lewati / Buat Baru]**: Menghapus `localStorage` dan memuat data eksis dari server.

---

### 6.3 Bento Grid Dashboard
Hasil penataan jadwal disajikan dalam tata letak modern **Bento Grid**:
- **Kotak Utama A**: Tabel Matriks Jadwal Pelajaran (interaktif, filter per Kelas/Guru, toggle Tampilan Kode vs Tampilan Nama).
- **Kotak B (Kanan)**: Widget Rekap Beban Mengajar Guru (Daftar guru + Total JP per minggu + detail kelas).
- **Kotak C (Kiri Bawah)**: Widget Bagikan Link (Salin URL unik + Opsi Hak Akses Read/Edit).
- **Kotak D (Kanan Bawah)**: Widget Pemilih Template Hias (Free/Premium) & Tombol Ekspor PDF/Excel.

---

### 6.4 Admin Console (RBAC)
User dengan `is_admin: true` dapat mengakses antarmuka `/admin` yang terintegrasi:
- **Dashboard Metric**: Grafik jumlah sekolah, user aktif, total generate jadwal, dan error log.
- **Manajemen User Global**: Mengaktifkan/nonaktifkan user, soft delete user, dan reset credential.
- **Manajemen Template Hias**: Menambah/edit stylesheet CSS template premium & mengunggah thumbnail.
- **System Maintenance & Control**: Membersihkan cache Redis, mengaktifkan Maintenance Mode, dan mengatur batas konkurensi worker BullMQ.
- **Log Aktivitas Admin**: Menampilkan audit trail terstruktur dalam format JSON.

---

### 6.5 Fitur Berbagi Link (Shared Links)
Setiap jadwal dapat dibagikan menggunakan link publik berbasis UUID:
- **Permission `read`**: Bebas diakses siapa saja tanpa login. Tombol edit/generate disembunyikan.
- **Permission `edit`**: Hanya dapat dibuka oleh user yang terdaftar dalam `allowed_user_id` yang sedang login.
- **Masa Kadaluarsa**: Link memiliki `expires_at` (30 hari untuk read, 7 hari untuk edit).
- **Tracking**: Setiap akses mencatat increment `view_count`.

---

## 7. MODUL EKSPOR (PDF SERVERLESS & EXCEL)

### 7.1 Ekspor PDF (Serverless Renderer)
Untuk mencegah kehabisan memori (*Out Of Memory / OOM*) pada server API utama akibat eksekusi Headless Chromium/Puppeteer yang berat, proses render PDF dipisahkan ke **Serverless Function** (Vercel Functions / AWS Lambda):
1. Client/API mengirimkan payload HTML + CSS Template ke `PDF_RENDERER_URL`.
2. Serverless Function merender dokumen menjadi PDF Buffer dalam format A4 Landscape.
3. PDF Buffer dikembalikan ke client untuk diunduh.

### 7.2 Ekspor Excel (API Main Engine)
Menggunakan library **ExcelJS / SheetJS (xlsx)**:
- Menghasilkan workbook dengan **1 Sheet per Kelas**.
- Dilengkapi dengan 1 Sheet khusus berisi **Rekap Total Beban Mengajar Guru**.
- Otomatis menyesuaikan lebar kolom dan memberi gaya tabel yang rapi.

---

## 8. SPESIFIKASI ENDPOINTS API & WEBSOCKET

Seluruh endpoint REST API diawali dengan prefix `/api`.

### 8.1 REST API Endpoints Table

| Method | Endpoint | Deskripsi | Hak Akses |
|--------|----------|-----------|-----------|
| **AUTH** ||||
| POST | `/api/auth/login` | Login user, mengembalikan JWT Token | Publik |
| POST | `/api/auth/register` | Mendaftarkan akun user baru | Admin |
| GET | `/api/auth/me` | Mengambil profil user yang sedang login | JWT |
| **SEKOLAH & CONFIG** ||||
| GET | `/api/sekolah` | Mengambil data sekolah user | JWT |
| PUT | `/api/sekolah` | Perbarui profil sekolah | JWT |
| POST | `/api/sekolah/hydrate` | Simpan data wizard dari LocalStorage ke DB | JWT |
| GET | `/api/config` | Ambil konfigurasi sekolah (JP, istirahat, upacara) | JWT |
| POST | `/api/config` | Simpan/perbarui konfigurasi sekolah | JWT |
| **MASTER DATA** ||||
| GET/POST/PUT/DELETE | `/api/guru` | CRUD Master Data Guru (soft delete) | JWT |
| POST | `/api/guru/availability` | Simpan matriks ketersediaan jam guru | JWT |
| GET/POST/PUT/DELETE | `/api/mapel` | CRUD Master Data Mata Pelajaran | JWT |
| GET/POST/PUT/DELETE | `/api/kelas` | CRUD Master Data Kelas | JWT |
| POST | `/api/teacher-loads` | Simpan relasi pengampu guru-mapel-kelas | JWT |
| POST | `/api/wali-kelas` | Assign wali kelas ke kelas tertentu | JWT |
| **GENERATE & JADWAL** ||||
| POST | `/api/generate` | Memicu job generate jadwal (return jobId) | JWT (Rate Limit: 5/mnt) |
| GET | `/api/generate/status/:jobId` | Cek status & progress job antrian | JWT |
| GET | `/api/schedule` | Mengambil jadwal lengkap seluruh sekolah | JWT |
| GET | `/api/schedule/class/:kelasId` | Mengambil jadwal spesifik per kelas | JWT |
| GET | `/api/schedule/teacher/:guruId` | Mengambil jadwal spesifik per guru | JWT |
| **EKSPOR & SHARE** ||||
| POST | `/api/export/pdf` | Kirim payload & render PDF | JWT (Rate Limit: 5/mnt) |
| GET | `/api/export/excel` | Download file .xlsx jadwal | JWT |
| POST | `/api/share` | Buat link share baru (UUID) | JWT |
| GET | `/api/shared/:uuid` | Akses jadwal publik via UUID link | Publik (Rate Limit: 30/mnt) |
| **ADMIN CONSOLE** ||||
| GET | `/api/admin/users` | Ambil semua user dari seluruh sekolah | Admin |
| PUT | `/api/admin/users/:id/status` | Aktifkan/nonaktifkan status user | Admin |
| GET | `/api/admin/stats` | Ambil statistik global sistem | Admin |
| POST | `/api/admin/cache/clear` | Clear cache Redis | Admin |

### 8.2 WebSocket Architecture (Progress Updates)
- **Protocol**: Socket.io / WebSocket Native
- **Namespace Room**: `school:${schoolId}:progress:${jobId}`
- **Security**: Isolasi ketat berbasis `id_sekolah` sehingga progress generate sekolah A tidak dapat diintip oleh pengguna dari sekolah B.
- **Events**:
  - `join_room`: Payload `{ schoolId, jobId }`
  - `progress_update`: Payload `{ percent: 45, message: "Memproses Kelas 3A...", status: "PROCESSING" }`
  - `completed`: Payload `{ status: "SUCCESS", scheduleId: 102 }`
  - `failed`: Payload `{ status: "FAILED", error: "Konflik guru tidak terpecahkan" }`

---

## 9. STRUKTUR KODE & FOLDER REPOSITORI

```
d:\project\Jadwale\
├── plan.md                          # Dokumen Spesifikasi Teknis v3.1
├── testing.md                       # Dokumen 105 QA Test Cases
├── aboutjadwale.md                  # Dokumen Master Dokumentasi Sistem ini
├── docker-compose.yml               # Docker Setup (MySQL, Redis, Backend, Frontend)
├── backend/                         # Project NestJS Core API
│   ├── prisma/
│   │   ├── schema.prisma            # Model Prisma Schema (MySQL)
│   │   └── seed.ts                  # Seeder Data Default Kemendikbud
│   ├── src/
│   │   ├── main.ts                  # Entry point NestJS
│   │   ├── app.module.ts            # Root Module NestJS
│   │   ├── auth/                    # Module Autentikasi JWT & Guard
│   │   ├── sekolah/                 # Module Sekolah & Hydration Endpoint
│   │   ├── guru/                    # Module Guru & Availability
│   │   ├── mapel/                   # Module Mata Pelajaran
│   │   ├── kelas/                   # Module Kelas & Tingkatan
│   │   ├── jadwal/                  # CSP Engine, BullMQ Processor & WebSocket
│   │   ├── export/                  # Service Ekspor PDF & Excel
│   │   ├── share/                   # Service Link Share UUID
│   │   ├── template/                # Service Template Hias
│   │   ├── admin/                   # Service Console Admin & Audit Log
│   │   └── common/                  # Middlewares, Interceptors, Filters
│   ├── package.json
│   └── tsconfig.json
└── frontend/                        # Project Next.js 16 Web App
    ├── public/                      # Asset Statis (Gambar, Icon)
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx           # Root Layout
    │   │   ├── page.tsx             # Landing Page
    │   │   ├── login/               # Halaman Login
    │   │   ├── wizard/              # Halaman Wizard 5 Langkah
    │   │   │   └── components/      # Step1Config, Step2Waktu, Step3Master, Step4Relasi, Step5Generate
    │   │   ├── dashboard/           # Halaman Bento Grid Dashboard
    │   │   │   ├── page.tsx         # Ringkasan Dashboard
    │   │   │   ├── jadwal/          # Tampilan Matriks Jadwal
    │   │   │   ├── sekolah/         # Setting Sekolah
    │   │   │   ├── guru/            # Kelola Guru
    │   │   │   ├── mapel/           # Kelola Mapel
    │   │   │   └── kelas/           # Kelola Kelas
    │   │   ├── shared/              # Halaman Tampilan Public Link Share
    │   │   └── admin/               # Halaman Console Admin
    │   ├── components/              # Reusable UI Components (Navbar, ProtectedRoute, Toast, Modal)
    │   ├── lib/                     # Utilities (axios instance, helper functions)
    │   └── store/                   # State Management Zustand
    │       ├── useWizardStore.ts    # Store Data Wizard & LocalStorage Persist
    │       └── useAuthStore.ts      # Store JWT Token & User Session
    ├── package.json
    └── tailwind.config.ts / postcss.config.mjs
```

---

## 10. MATRIKS QUALITY ASSURANCE & TESTING (105 TEST CASES)

Sistem wajib melewati 105 skenario pengujian di lingkungan Staging sebelum dirilis ke produksi (sesuai dokumen `testing.md`).

### Ringkasan Matriks Kelulusan (Pass Criteria)

| Kategori Pengujian | Jumlah Skenario | Minimal Lolos | Cakupan Utama |
|--------------------|-----------------|---------------|---------------|
| **Guest Mode (Tanpa Login)** | 12 Test Cases | 12/12 (100%) | Wizard 1–4 local save, peringatan Step 5, link publik read-only. |
| **User Authenticated** | 52 Test Cases | 50/52 (96%) | State Hydration, CRUD Master Data, Soft Delete, CSP Solver, PDF/Excel. |
| **Admin Console** | 23 Test Cases | 23/23 (100%) | RBAC 403 Guard, User Toggle, Template Mgmt, Maintenance Mode, Cache Flush. |
| **Sistem & Non-Fungsional** | 18 Test Cases | 17/18 (94%) | Mobile responsiveness, Rate Limiting 429, Stress Test 30 Kelas, PDF Concurrency. |
| **TOTAL** | **105 Test Cases** | **102/105 (97%)** | |

---

## 11. PANDUAN DEPLOYMENT (SHARED HOSTING CPANEL & VPS UBUNTU)

Aplikasi **Jadwale** dapat di-deploy baik di lingkungan Shared Hosting CPanel maupun VPS Ubuntu 22.04 LTS.

### 11.1 Shared Hosting (CPanel + Node.js Selector)
1. **Database**: Buat database MySQL & user via *CPanel MySQL Database Wizard*. Import skema dari Prisma migration.
2. **Frontend Static Export**: Buat build statis Next.js (`output: 'export'` di `next.config.js`) dan upload isi folder `out` ke `public_html`.
3. **Backend API**:
   - Upload folder `backend` di luar `public_html` (misal `/home/user/jadwale-backend`).
   - Buka **Node.js Selector** di CPanel, pilih Node v18+, set App Root ke folder backend, startup file `dist/main.js`.
   - Jalankan `npm install` dan `npm run build`.
4. **Redis Setup**: Gunakan layanan cloud Redis gratis seperti **Upstash Redis** (`redis://...`) dan masukkan URL ke Environment Variables Node.js Selector.
5. **Worker Daemon**: Buat **Cron Job** di CPanel untuk menjalankan script worker setiap menit:
   ```bash
   /usr/local/bin/node /home/user/jadwale-backend/dist/worker.js >> /dev/null 2>&1
   ```

### 11.2 VPS Ubuntu 22.04 LTS (PM2 + Nginx Reverse Proxy)
1. **Instal Dependencies**:
   ```bash
   sudo apt update && sudo apt install -y nodejs npm mysql-server redis-server nginx certbot python3-certbot-nginx
   sudo npm install -g pm2
   ```
2. **Clone & Build**:
   ```bash
   git clone https://github.com/user/jadwale.git /var/www/jadwale
   cd /var/www/jadwale/backend && npm install && npm run build
   cd /var/www/jadwale/frontend && npm install && npm run build
   ```
3. **Jalankan Proses dengan PM2**:
   ```bash
   pm2 start dist/main.js --name jadwale-api
   pm2 start dist/worker.js --name jadwale-worker
   cd ../frontend && pm2 start npm --name jadwale-fe -- start
   pm2 save && pm2 startup
   ```
4. **Konfigurasi Nginx & SSL Certbot**:
   ```nginx
   server {
       listen 80;
       server_name api.jadwale.id;
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
       }
   }
   ```
   Jalankan `sudo certbot --nginx -d api.jadwale.id` untuk mengaktifkan HTTPS secara otomatis.

---

## 12. ENVIRONMENT VARIABLES (.ENV) & KONFIGURASI

### Backend `.env`
```env
# General Configuration
NODE_ENV=production
PORT=3000
APP_URL=https://jadwale.id

# Database Connection (MySQL / MariaDB)
DATABASE_URL="mysql://jadwale_user:SecurePassword123!@localhost:3306/jadwale_db"

# Redis Cache & Queue Broker (Upstash / Local)
REDIS_CACHE_URL="redis://localhost:6379"
REDIS_QUEUE_URL="redis://localhost:6379"

# Security & JWT Token
JWT_SECRET="JadwaleSuperSecretKey2026_ChangeThisInProduction!"
JWT_EXPIRES_IN="7d"

# Microservices External Renderers
PDF_RENDERER_URL="https://pdf-renderer.vercel.app/render"

# Frontend Integration
NEXT_PUBLIC_API_URL="https://api.jadwale.id"
NEXT_PUBLIC_WS_URL="wss://api.jadwale.id"

# System Flag
MAINTENANCE_MODE=false
```

### Frontend `.env.local`
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_WS_URL="http://localhost:3000"
```

---

**Dokumen Spesifikasi `aboutjadwale.md` ini merupakan ringkasan menyeluruh dan berdiri sendiri (standalone).** Seluruh arsitektur, skema database, algoritma CSP, alur kerja UI, endpoints API, dan panduan rilis telah terinci sepenuhnya tanpa ada yang terlewat.

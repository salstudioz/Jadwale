# 📘 DOKUMEN SPESIFIKASI TEKNIS APLIKASI JADWALE
**Versi Produksi – Final (Standalone)**

**Nama Aplikasi:** Jadwale  
**Tagline:** Jadwal Sekolah, Semudah Itu  
**Tanggal Efektif:** 23 Juni 2026  
**Status:** Final – Siap Implementasi & Deployment

---

## DAFTAR ISI

1. [Pendahuluan & Visi Produk](#1-pendahuluan--visi-produk)
2. [Arsitektur Sistem & Multi-Tenancy](#2-arsitektur-sistem--multi-tenancy)
3. [Algoritma Inti Penjadwalan (CSP)](#3-algoritma-inti-penjadwalan-csp)
4. [Perancangan Basis Data (ERD & Skema SQL)](#4-perancangan-basis-data-erd--skema-sql)
5. [UI/UX High-Fidelity & Desain Sistem](#5-uiux-high-fidelity--desain-sistem)
6. [Backend Core: API, Queue, Worker & WebSocket](#6-backend-core-api-queue-worker--websocket)
7. [Modul Ekspor PDF & Excel](#7-modul-ekspor-pdf--excel)
8. [Fitur Template Hias & Berbagi (Share)](#8-fitur-template-hias--berbagi-share)
9. [Admin Console Terintegrasi (RBAC)](#9-admin-console-terintegrasi-rbac)
10. [Keamanan Sistem (Rate Limiting & Isolasi Data)](#10-keamanan-sistem-rate-limiting--isolasi-data)
11. [Quality Assurance & UAT](#11-quality-assurance--uat)
12. [Strategi Deployment (Shared Hosting CPanel & VPS)](#12-strategi-deployment-shared-hosting-cpanel--vps)
13. [Lampiran: Data Default, Environment, & Seeder](#13-lampiran-data-default-environment--seeder)

---

## 1. PENDAHULUAN & VISI PRODUK

### 1.1 Latar Belakang
Aplikasi **Jadwale** dirancang untuk menyelesaikan permasalahan klasik di lingkungan Sekolah Dasar (SD) di Indonesia: penyusunan jadwal pelajaran yang memakan waktu berhari-hari, rawan bentrok, dan sulit disesuaikan dengan kebutuhan guru honorer maupun regulasi yang berlaku.

### 1.2 Tujuan Utama
1. Mengotomatiskan proses penjadwalan dengan algoritma cerdas berbasis *Constraint Satisfaction Problem* (CSP).
2. Menyediakan antarmuka yang sangat ramah bagi pengguna awam teknologi (gaptek) dengan tombol besar, bahasa sederhana, dan panduan visual.
3. Menerapkan standar Kemendikbud secara default (durasi JP, jumlah istirahat, upacara Senin) namun tetap memberikan fleksibilitas kustomisasi.
4. Mendukung arsitektur **multi-tenant** sehingga satu aplikasi dapat melayani banyak sekolah tanpa mencampur data.
5. Menjamin keamanan data melalui mekanisme **soft delete**, **rate limiting**, dan isolasi akses berbasis token.

### 1.3 Target Pengguna
- **Operator Sekolah / Guru**: Mengelola data dan menghasilkan jadwal.
- **Kepala Sekolah / Wali Kelas**: Mengakses jadwal dalam mode baca.
- **Admin Sistem**: Mengelola pengguna, template, dan memantau aktivitas global.

### 1.4 Prinsip Desain & Pengembangan
- **Bahasa Sederhana**: Seluruh istilah teknis (JP, prioritas) diterjemahkan ke dalam bahasa sehari-hari.
- **Ikon Profesional**: Menggunakan *Heroicons* (bukan emoji).
- **Notifikasi Ramah**: Setiap pemberitahuan menggunakan *toast* (bukan `alert()` JavaScript).
- **Palet Warna Netral**: Menggunakan varian *Slate* dan *Blue 600* untuk aksen utama.
- **Soft Delete pada Seluruh Data Master**: Menjaga integritas riwayat jadwal jika terjadi penghapusan tidak sengaja.

---

## 2. ARSITEKTUR SISTEM & MULTI‑TENANCY

### 2.1 Konsep Multi‑Tenant
Setiap sekolah yang terdaftar memiliki ruang data sendiri yang terisolasi. Seluruh tabel utama (`users`, `guru`, `mapel`, `kelas`, `jadwal`, `school_configs`) memiliki kolom `id_sekolah` sebagai *foreign key*. Proses autentikasi menggunakan JWT yang di dalamnya tersimpan `id_sekolah` dan `id_user`, sehingga setiap request API secara otomatis memfilter data berdasarkan identitas sekolah tersebut.

### 2.2 Diagram Arsitektur Umum

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (Next.js 14)                      │
│  - Wizard 5 Langkah dengan Progress Bar                     │
│  - Auto-save ke LocalStorage & Hydration saat Login         │
│  - Bento Grid Dashboard untuk Hasil Jadwal                 │
│  - Bottom Navigation (Mobile) & Hamburger Menu             │
└─────────────────────────────┬───────────────────────────────┘
                              │ HTTPS (REST) / WebSocket (WS)
┌─────────────────────────────▼───────────────────────────────┐
│                    Backend API (NestJS)                      │
│  - Autentikasi JWT + RBAC (is_admin)                        │
│  - Rate Limiter (5 request/menit untuk endpoint berat)      │
│  - REST Endpoint untuk Master Data, Generate, Share         │
└───────┬──────────────────────────────────────────┬──────────┘
        │                                          │
┌───────▼──────────────┐          ┌────────────────▼──────────┐
│  Redis (Cache)       │          │  Redis (Queue Broker)     │
│  - Session & Caching  │          │  - BullMQ Job Storage     │
└──────────────────────┘          └────────────────┬──────────┘
                                                   │
┌──────────────────────────────────────────────────▼───────────┐
│               Worker (BullMQ – Proses Terpisah)              │
│  - Menjalankan Algoritma Backtracking + Heuristic           │
│  - Menerapkan Teacher Availability & Soft Relaxation        │
│  - Menyimpan Hasil Jadwal ke Database                       │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│            Serverless PDF Renderer (Vercel / AWS Lambda)    │
│  - Menerima Payload HTML + CSS, Mengembalikan PDF Buffer   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│           Database MySQL (Managed – RDS/DigitalOcean)       │
│  - Seluruh Tabel Menggunakan Soft Delete (deleted_at)      │
│  - Foreign Key Mengacu ke id_sekolah untuk Isolasi Data    │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Alur Data End‑to‑End
1. **Registrasi & Login**: Pengguna mendaftar (hanya bisa dilakukan oleh admin) atau login. Server memverifikasi kredensial dan mengembalikan JWT yang berisi `id_sekolah`, `userId`, dan `role`.
2. **Pengisian Data**: Setiap request dari frontend menyertakan JWT. Middleware membaca token, mengambil `id_sekolah`, dan menyisipkannya ke semua operasi basis data (INSERT, UPDATE, SELECT, DELETE dengan filter).
3. **Generate Jadwal**: API menambahkan job ke antrian BullMQ. Worker mengambil job, menjalankan algoritma (dengan batas waktu 30 detik), dan menyimpan hasil ke tabel `jadwal`.
4. **Ekspor PDF**: API mengirimkan payload HTML dan CSS ke *serverless function*. Fungsi tersebut merender PDF menggunakan Puppeteer dan mengembalikan buffer, yang kemudian diteruskan ke klien.
5. **Berbagi Link**: Sistem membuat UUID unik. Middleware memverifikasi izin (`read` atau `edit`) setiap kali link diakses.

---

## 3. ALGORITMA INTI PENJADWALAN (CSP)

### 3.1 Daftar Constraint (Batasan)

#### Hard Constraints (Wajib – Mutlak)
| ID | Constraint | Implementasi Teknis |
|----|------------|----------------------|
| **HC1** | 1 guru tidak boleh mengajar 2 kelas di jam yang sama | Pengecekan `(guru_id, hari, jam_ke)` di seluruh jadwal yang sudah di-assign. |
| **HC2** | Total JP per mapel per tingkatan terpenuhi | Akumulasi JP per `(mapel_id, tingkatan)` harus sama dengan `jp_per_minggu`. |
| **HC3** | JP per hari per kelas sesuai input user | Hitung per `(kelas_id, hari)`; total harus sama dengan `jp_per_hari.jp`. |
| **HC4** | 1 mapel tidak boleh muncul 2x di hari yang sama untuk 1 kelas | Per `(kelas_id, hari)`, mapel hanya boleh muncul satu kali. |
| **HC5** | Upacara / pembiasaan wajib di JP 1 hari Senin | Blokir slot tersebut secara otomatis. |
| **HC6** | Mapel prioritas WAJIB sebelum Istirahat 1 | Jika `mapel.prioritas = true`, maka `jam_ke ≤ break1_after_jp`. |

#### Soft Constraints (Diupayakan – Bobot)
| ID | Constraint | Bobot | Catatan |
|----|------------|-------|---------|
| **SC1** | Maks 2 JP berturut‑turut tanpa jeda (istirahat) | Tinggi | Istirahat berfungsi sebagai pemisah (reset counter). |
| **SC2** | Boleh 3 JP per hari jika dipisah istirahat | Sedang | Memungkinkan mapel dengan JP tinggi (misal Matematika 6 JP/minggu). |
| **SC3** | Guru tidak mengajar >4 JP berturut‑turut | Rendah | Menjaga kesejahteraan guru. |

### 3.2 Teacher Availability Matrix (Jadwal Kehadiran Guru)
Guru honorer atau guru dengan jadwal terbatas (misal: guru Agama hanya hadir Senin & Kamis) dapat mendefinisikan hari dan jam kehadiran melalui tabel `guru_availability`. Saat algoritma memilih kandidat mapel untuk suatu slot, sistem memeriksa ketersediaan guru pengampu di hari dan jam tersebut. Jika tidak tersedia, mapel tidak dimasukkan sebagai kandidat.

### 3.3 Algoritma Backtracking dengan Timeout & Relaxation Bertahap
- **Batas waktu**: 30 detik.
- **Relaksasi bertahap**:
  - *Tahap 0 (0-10 detik)*: Semua hard & soft constraint aktif.
  - *Tahap 1 (10-20 detik)*: Mengizinkan mapel prioritas sedikit melewati batas istirahat 1 (prioritas diturunkan menjadi soft).
  - *Tahap 2 (20-30 detik)*: Mengizinkan 3 JP berturut‑turut tanpa jeda (hanya jika terpaksa).
- Jika gagal di semua tahap, algoritma mengembalikan `null` dan mencatat log di tabel `history`.

---

## 4. PERANCANGAN BASIS DATA (ERD & SKEMA SQL)

### 4.1 Kebijakan Soft Delete
Seluruh tabel master (`sekolah`, `users`, `guru`, `mapel`, `kelas`, `tingkatan`) dilengkapi dengan kolom `deleted_at TIMESTAMP NULL`. Aplikasi **tidak pernah melakukan hard delete** (perintah DELETE SQL). Penghapusan data dilakukan dengan mengisi `deleted_at` dengan timestamp sekarang. Tabel transaksional (`jadwal`, `pengampu`, `wali_kelas`) menggunakan foreign key dengan opsi `RESTRICT` untuk mencegah penghapusan data master yang masih memiliki riwayat. Dengan demikian, jadwal historis tetap utuh meskipun guru atau mapel dihapus secara tidak sengaja.

### 4.2 Skema SQL Lengkap

```sql
-- 1. Master Sekolah
CREATE TABLE sekolah (
    id INT AUTO_INCREMENT PRIMARY KEY,
    npsn VARCHAR(10) UNIQUE NOT NULL,
    nama_sekolah VARCHAR(100) NOT NULL,
    alamat TEXT,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_npsn (npsn)
);

-- 2. Users
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    no_hp VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE RESTRICT,
    INDEX idx_sekolah (id_sekolah),
    INDEX idx_email (email)
);

-- 3. Guru
CREATE TABLE guru (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    nip VARCHAR(30) UNIQUE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE RESTRICT,
    INDEX idx_sekolah (id_sekolah)
);

-- 4. Guru Availability
CREATE TABLE guru_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_guru INT NOT NULL,
    hari TINYINT NOT NULL CHECK (hari BETWEEN 1 AND 7),
    jam_mulai TIME,
    jam_selesai TIME,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_guru) REFERENCES guru(id) ON DELETE CASCADE,
    UNIQUE (id_sekolah, id_guru, hari)
);

-- 5. Tingkatan
CREATE TABLE tingkatan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    nama VARCHAR(10) NOT NULL,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE RESTRICT,
    UNIQUE (id_sekolah, nama)
);

-- 6. Kelas
CREATE TABLE kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_tingkatan INT NOT NULL,
    nama_kelas VARCHAR(10) NOT NULL,
    kode_lengkap VARCHAR(10) NOT NULL,
    id_wali_kelas INT NULL,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_tingkatan) REFERENCES tingkatan(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_wali_kelas) REFERENCES guru(id) ON DELETE SET NULL,
    UNIQUE (id_sekolah, id_tingkatan, nama_kelas)
);

-- 7. Mapel
CREATE TABLE mapel (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    nama VARCHAR(100) NOT NULL,
    prioritas BOOLEAN DEFAULT FALSE,
    color VARCHAR(7) DEFAULT '#E2E8F0',
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE RESTRICT,
    UNIQUE (id_sekolah, nama)
);

-- 8. Mapel Tingkatan
CREATE TABLE mapel_tingkatan (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_mapel INT NOT NULL,
    id_tingkatan INT NOT NULL,
    jp_per_minggu INT NOT NULL CHECK (jp_per_minggu > 0),
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_mapel) REFERENCES mapel(id) ON DELETE CASCADE,
    FOREIGN KEY (id_tingkatan) REFERENCES tingkatan(id) ON DELETE CASCADE,
    UNIQUE (id_sekolah, id_mapel, id_tingkatan)
);

-- 9. Wali Kelas
CREATE TABLE wali_kelas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_guru INT NOT NULL,
    id_kelas INT NOT NULL,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_guru) REFERENCES guru(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id) ON DELETE CASCADE,
    UNIQUE (id_sekolah, id_guru),
    UNIQUE (id_sekolah, id_kelas)
);

-- 10. Pengampu
CREATE TABLE pengampu (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_guru INT NOT NULL,
    id_mapel INT NOT NULL,
    id_kelas INT NOT NULL,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_guru) REFERENCES guru(id) ON DELETE CASCADE,
    FOREIGN KEY (id_mapel) REFERENCES mapel(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id) ON DELETE CASCADE,
    UNIQUE (id_sekolah, id_guru, id_mapel, id_kelas)
);

-- 11. JP per Hari
CREATE TABLE jp_per_hari (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_kelas INT NOT NULL,
    hari TINYINT NOT NULL CHECK (hari BETWEEN 1 AND 7),
    jp INT NOT NULL CHECK (jp >= 0),
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id) ON DELETE CASCADE,
    UNIQUE (id_sekolah, id_kelas, hari)
);

-- 12. Konfigurasi Sekolah
CREATE TABLE school_configs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    is_parallel BOOLEAN DEFAULT FALSE,
    class_naming ENUM('alphabet','numeric') DEFAULT 'alphabet',
    school_days TINYINT DEFAULT 5 CHECK (school_days BETWEEN 1 AND 7),
    start_time TIME DEFAULT '07:00:00',
    duration_per_jp INT DEFAULT 35,
    has_routine BOOLEAN DEFAULT FALSE,
    routine_duration INT DEFAULT 15,
    break1_duration INT DEFAULT 15,
    break2_duration INT DEFAULT 15,
    break1_after_jp TINYINT DEFAULT 3,
    break2_after_jp TINYINT DEFAULT 5,
    has_monday_ceremony BOOLEAN DEFAULT TRUE,
    ceremony_duration INT DEFAULT 35,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    UNIQUE (id_sekolah)
);

-- 13. Routine Activities
CREATE TABLE routine_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    day_of_week TINYINT NULL,
    time_before_jp TINYINT DEFAULT 1,
    duration INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE
);

-- 14. Schedule Slots
CREATE TABLE schedule_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_kelas INT NOT NULL,
    hari TINYINT NOT NULL,
    jam_ke TINYINT NOT NULL,
    waktu_mulai TIME NOT NULL,
    waktu_selesai TIME NOT NULL,
    is_break BOOLEAN DEFAULT FALSE,
    is_ceremony BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id) ON DELETE CASCADE,
    UNIQUE (id_sekolah, id_kelas, hari, jam_ke)
);

-- 15. Jadwal Final (Menggunakan RESTRICT untuk melindungi history)
CREATE TABLE jadwal (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    id_kelas INT NOT NULL,
    hari TINYINT NOT NULL,
    jam_ke TINYINT NOT NULL,
    id_mapel INT NOT NULL,
    id_guru INT NOT NULL,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id) ON DELETE CASCADE,
    FOREIGN KEY (id_mapel) REFERENCES mapel(id) ON DELETE RESTRICT,
    FOREIGN KEY (id_guru) REFERENCES guru(id) ON DELETE RESTRICT,
    UNIQUE (id_sekolah, id_kelas, hari, jam_ke),
    INDEX idx_sekolah_kelas (id_sekolah, id_kelas),
    INDEX idx_guru_hari (id_guru, hari, jam_ke)
);

-- 16. Templates (Global)
CREATE TABLE templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    thumbnail VARCHAR(255),
    css_styles TEXT NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- 17. Shared Links
CREATE TABLE shared_links (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    uuid VARCHAR(36) UNIQUE NOT NULL,
    id_kelas INT NULL,
    permission ENUM('edit','read') DEFAULT 'read',
    created_by INT NOT NULL,
    allowed_user_id INT NULL,
    expires_at TIMESTAMP NULL,
    view_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (id_kelas) REFERENCES kelas(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (allowed_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_uuid (uuid),
    INDEX idx_expires (expires_at)
);

-- 18. History
CREATE TABLE history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_sekolah INT NOT NULL,
    user_id INT NOT NULL,
    aksi VARCHAR(50) NOT NULL,
    deskripsi TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_sekolah) REFERENCES sekolah(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_sekolah_user (id_sekolah, user_id)
);

-- 19. Admin Logs
CREATE TABLE admin_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_user_id INT NOT NULL,
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50),
    target_id INT,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_admin (admin_user_id)
);
```

---

## 5. UI/UX HIGH‑FIDELITY & DESAIN SISTEM

### 5.1 Palet Warna
| Elemen | Warna | Kode HEX |
|--------|-------|----------|
| Latar belakang | Slate 50 | `#F8FAFC` |
| Kartu/Komponen | Putih | `#FFFFFF` |
| Teks Utama | Slate 800 | `#1E293B` |
| Tombol Utama | Blue 600 | `#2563EB` |
| Tombol Hover | Blue 700 | `#1D4ED8` |
| Mapel Prioritas | Pastel Blue | `#DBEAFE` |
| Mapel Non-Prioritas | Pastel Green | `#D1FAE5` |
| Istirahat/Upacara | Yellow 100 | `#FEF3C7` |

### 5.2 Layout Bento Grid pada Dashboard (Step 5)
- **Kotak A (Besar)**: Tabel Jadwal Utama (interaktif, scroll).
- **Kotak B (Medium Kanan)**: Ringkasan Beban Mengajar Guru (list nama + total JP).
- **Kotak C (Kecil Kiri Bawah)**: Widget Bagikan Link (copy link & atur izin).
- **Kotak D (Kecil Kanan Bawah)**: Pilihan Template Hias & Tombol Download (PDF/Excel).

### 5.3 State Hydration (Sinkronisasi Data Lokal saat Login)
Data yang diisi oleh pengguna tanpa login akan tersimpan secara otomatis di `localStorage`. Ketika pengguna memutuskan untuk login, sistem mendeteksi keberadaan data tersebut dan menampilkan *toast* konfirmasi: *"Data sementara ditemukan. Gunakan data ini?"* dengan tombol [Gunakan] dan [Lewati]. Jika pengguna memilih [Gunakan], sistem mengirimkan seluruh data ke server untuk disimpan ke database dan kemudian menghapus `localStorage`.

### 5.4 Komponen Mobile & Navigasi
- **Bottom Navigation**: 5 menu utama (Beranda, Jadwal, Guru, Mapel, Pengaturan) yang muncul di perangkat mobile.
- **Hamburger Menu**: Terletak di pojok kanan atas, berisi akses ke Profil, Template, Bagikan, dan Logout.
- **Wizard Buttons**: Tombol "Kembali" dan "Lanjut" bersifat *sticky* (menempel) di bagian bawah layar dengan z-index tinggi agar mudah dijangkau.
- **Ukuran Tombol**: Minimal tinggi 48px dan padding horizontal 12px untuk kenyamanan sentuhan di layar sentuh.

---

## 6. BACKEND CORE: API, QUEUE, WORKER & WEBSOCKET

### 6.1 Endpoint API
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| **Auth** ||||
| POST | `/api/auth/login` | Login, return JWT + `id_sekolah` | Public |
| POST | `/api/auth/register` | Registrasi user (hanya admin) | Admin |
| GET | `/api/auth/me` | Profil user | JWT |
| **Sekolah** ||||
| GET | `/api/sekolah` | Data sekolah user | JWT |
| PUT | `/api/sekolah` | Update profil sekolah | JWT |
| **Config** ||||
| GET | `/api/config` | Konfigurasi sekolah | JWT |
| POST | `/api/config` | Simpan konfigurasi | JWT |
| **Master Data** ||||
| CRUD | `/api/guru`, `/api/mapel`, `/api/kelas` | Semua dengan filter `id_sekolah`; soft delete | JWT |
| POST | `/api/teacher-loads` | Simpan relasi guru-mapel-kelas | JWT |
| POST | `/api/wali-kelas` | Assign wali kelas | JWT |
| **Generate** ||||
| POST | `/api/generate` | Trigger generate (return jobId) | JWT |
| GET | `/api/generate/status/:jobId` | Progress & hasil | JWT |
| **Schedule** ||||
| GET | `/api/schedule` | Jadwal seluruh sekolah | JWT |
| GET | `/api/schedule/class/:kelasId` | Per kelas | JWT |
| GET | `/api/schedule/teacher/:guruId` | Per guru | JWT |
| **Export** ||||
| POST | `/api/export/pdf` | Kirim payload ke serverless PDF | JWT |
| GET | `/api/export/excel/:scheduleId` | Download Excel | JWT |
| **Share** ||||
| POST | `/api/share` | Buat link share | JWT |
| GET | `/api/shared/:uuid` | Akses publik | Public |
| **Admin** ||||
| GET | `/api/admin/users` | Semua user (lintas sekolah) | Admin |
| PUT | `/api/admin/users/:id/status` | Aktif/nonaktif | Admin |
| GET | `/api/admin/stats` | Statistik global | Admin |
| POST | `/api/admin/cache/clear` | Clear cache | Admin |

### 6.2 Queue & Worker (BullMQ) dengan Timeout
**Producer**: Menambahkan job ke antrian dengan parameter `timeout: 30000` (30 detik) dan `relaxation: true`.
**Worker**: Menjalankan algoritma, memantau waktu eksekusi. Jika melewati batas waktu, worker mengembalikan error dan mencatatnya di tabel `history`. Worker berjalan di server terpisah (atau proses berbeda) dengan jumlah konkurensi maksimal 2 job secara paralel.

### 6.3 WebSocket untuk Progress (Dengan Isolasi Namespace)
WebSocket menggunakan **room berbasis `id_sekolah`** untuk memastikan klien dari sekolah lain tidak dapat mengakses progress jadwal sekolah lain. Ketika klien bergabung, mereka mengirimkan `schoolId` dan `jobId`, kemudian server menempatkan mereka ke dalam room `school:${schoolId}:progress:${jobId}`. Update progress hanya dikirim ke room tersebut.

---

## 7. MODUL EKSPOR PDF & EXCEL

### 7.1 Ekspor PDF (Serverless)
Menggunakan **Puppeteer** yang dijalankan di dalam *Serverless Function* (Vercel Functions / AWS Lambda). API utama hanya bertugas mengirimkan payload HTML dan CSS ke fungsi tersebut. Fungsi merender PDF dan mengembalikan buffer. Pendekatan ini mencegah API utama kehabisan memori (OOM) karena proses Chromium yang berat dipisahkan ke lingkungan yang terisolasi.

### 7.2 Ekspor Excel (Tetap di API)
Menggunakan pustaka **SheetJS (xlsx)** yang ringan dan efisien. Server membuat file Excel dengan satu sheet per kelas, ditambah sheet khusus untuk rekap beban mengajar guru, kemudian mengirimkannya langsung ke klien.

---

## 8. FITUR TEMPLATE HIAS & BERBAGI (SHARE)

### 8.1 Template Hias
- **Tabel `templates`** bersifat global (tidak terikat sekolah) dan dikelola oleh admin.
- **Free**: 1 template default dengan tampilan bersih dan profesional.
- **Premium**: 5+ template dengan tema berbeda (Biru Langit, Hijau Segar, Oranye Ceria, Pastel, Formal).
- Pengguna yang login dapat memilih template premium. Pengguna tanpa login hanya dapat menggunakan template default.

### 8.2 Fitur Share dengan UUID & Permission
- **Read (Public)**: Dapat diakses tanpa login. Tombol edit dan generate disembunyikan.
- **Edit (Restricted)**: Hanya user dengan `allowed_user_id` yang sesuai dan sudah login yang dapat mengakses. Menampilkan tombol edit dan regenerasi.
- **Expired**: Link memiliki masa berlaku (30 hari untuk read, 7 hari untuk edit). Setelah kedaluwarsa, akses ditolak.

---

## 9. ADMIN CONSOLE TERINTEGRASI (RBAC)

### 9.1 Konsep Keamanan
Menggunakan **flag `is_admin`** di tabel `users`. Admin login melalui halaman login biasa; setelah berhasil, menu Admin muncul secara otomatis di antarmuka. Seluruh aksi admin dicatat di tabel `admin_logs` untuk keperluan audit.

### 9.2 Fitur Admin Console
| Menu | Fungsi |
|------|--------|
| **Dashboard** | Menampilkan statistik total sekolah, total generate, total user, dan aktivitas terkini. |
| **Manajemen User** | Melihat semua user (lintas sekolah), mengaktifkan/nonaktifkan, dan menghapus (soft delete). |
| **Manajemen Template** | Menambah, mengedit, dan menghapus template premium. |
| **Konfigurasi Sistem** | Membersihkan cache Redis, mengaktifkan mode pemeliharaan, dan mengatur batas generate paralel. |
| **Log Aktivitas** | Melihat riwayat aksi admin dengan detail JSON. |

---

## 10. KEAMANAN SISTEM (RATE LIMITING & ISOLASI DATA)

### 10.1 Rate Limiting
- **Endpoint `/api/generate` dan `/api/export/pdf`** dibatasi maksimal 5 request per 60 detik per pengguna untuk mencegah eksploitasi yang dapat memicu biaya tinggi di serverless function.
- **Endpoint publik `/api/shared/:uuid`** dibatasi 30 request per menit untuk mencegah scraping.
- Implementasi menggunakan `@nestjs/throttler` yang terintegrasi di level controller.

### 10.2 Isolasi Data
- Seluruh query basis data secara otomatis menyertakan filter `id_sekolah` yang diambil dari JWT.
- WebSocket menggunakan room berbasis `id_sekolah` untuk memastikan tidak ada kebocoran data progress antar sekolah.

### 10.3 Soft Delete
Semua data master tidak dihapus secara permanen. Kolom `deleted_at` diisi dengan timestamp. Data yang sudah dihapus tidak muncul di antarmuka, namun tetap tersimpan untuk menjaga integritas riwayat jadwal.

---

## 11. QUALITY ASSURANCE & UAT

### 11.1 Unit Test (Jest)
- **Constraint Testing**: Memastikan hard constraint (guru bentrok, total JP, prioritas) tidak pernah dilanggar.
- **Teacher Availability**: Memastikan guru honorer tidak dijadwalkan di luar jam ketersediaan.
- **Timeout & Relaxation**: Menguji bahwa algoritma mengembalikan solusi atau `null` dalam batas waktu 30 detik.

### 11.2 Stress Test
- **Skenario**: 6 tingkatan × 5 kelas = 30 kelas, 40 guru, 15 mapel, 5 hari sekolah.
- **Target**: Proses generate selesai dalam waktu kurang dari 60 detik (dengan mekanisme relaxation).
- **PDF Serverless**: Mengirim 50 permintaan PDF secara simultan; tidak boleh terjadi timeout atau kegagalan.

### 11.3 UAT (User Acceptance Test)
- Melibatkan 5 sekolah dengan kondisi berbeda (paralel/non-paralel, perkotaan/pedesaan).
- **Kriteria Sukses**: 100% guru dapat menyelesaikan wizard tanpa bantuan; hasil jadwal sesuai ekspektasi lapangan; tidak ada keluhan tentang istilah teknis.

---

## 12. STRATEGI DEPLOYMENT (SHARED HOSTING CPANEL & VPS)

Aplikasi Jadwale dapat di-deploy baik di lingkungan **Shared Hosting dengan CPanel** (untuk anggaran terbatas) maupun di **VPS/Dedicated Server** (untuk performa tinggi dan kontrol penuh). Berikut adalah panduan lengkap untuk kedua skenario.

### 12.1 Deployment di Shared Hosting (CPanel + Node.js Selector)

Banyak penyedia hosting di Indonesia mendukung Node.js melalui fitur **Node.js Selector** atau **Setup Node.js App** di CPanel.

**Pra-kondisi Hosting:**
- CPanel dengan fitur "Node.js Selector" (biasanya disediakan oleh CloudLinux).
- Akses ke **File Manager** atau **FTP**.
- Akses ke **MySQL Database Wizard**.
- Support untuk **Cron Jobs**.

**Langkah-langkah:**

1. **Persiapan Database MySQL:**
   - Buka CPanel → **MySQL Database Wizard**.
   - Buat database baru (misal: `jadwale_db`).
   - Buat user baru (misal: `jadwale_user`) dan berikan semua hak akses (ALL PRIVILEGES).
   - Catat nama database, username, dan password.

2. **Upload Aplikasi:**
   - Buka **File Manager** atau gunakan FTP.
   - Upload seluruh folder `backend` dan `frontend` ke direktori publik (biasanya `public_html` atau `jadwale`). Untuk keamanan, letakkan backend di luar `public_html` (misal di `home/username/jadwale-backend`) dan frontend di dalam `public_html`.

3. **Setup Frontend (Next.js):**
   - Buka terminal melalui **Terminal** CPanel (jika tersedia) atau gunakan SSH.
   - Masuk ke folder frontend: `cd public_html`.
   - Jalankan: `npm install` dan `npm run build` (membangun file statis).
   - Hasil build (`out` atau `.next/static`) akan digunakan. Namun, karena CPanel biasanya tidak menjalankan Next.js secara native di sisi server, disarankan untuk melakukan **export static** dengan mengatur `output: 'export'` di `next.config.js`. Dengan demikian, aplikasi berjalan sebagai file HTML/CSS/JS statis.
   - Alternatif: Gunakan **Vercel** untuk frontend dan arahkan subdomain (misal `app.jadwale.id`) ke Vercel.

4. **Setup Backend (NestJS):**
   - Buka CPanel → **Node.js Selector** (atau "Setup Node.js App").
   - Pilih versi Node.js (minimal 18.x).
   - Tentukan **Application Root**: arahkan ke folder backend (`home/username/jadwale-backend`).
   - Tentukan **Application URL**: pilih domain/subdomain (misal `api.jadwale.id`).
   - Tentukan **Application Startup File**: `dist/main.js` (setelah proses build).
   - Klik **Setup**.
   - Setelah setup, buka terminal atau gunakan **NPM Script Runner** di CPanel untuk menjalankan `npm install` dan `npm run build` di folder backend.

5. **Setup Environment Variables:**
   - Di **Node.js Selector**, temukan opsi "Environment Variables".
   - Tambahkan variabel berikut:
     ```
     NODE_ENV=production
     DATABASE_URL=mysql://jadwale_user:password@localhost/jadwale_db
     REDIS_CACHE_URL=redis://... (gunakan Upstash, lihat catatan)
     REDIS_QUEUE_URL=redis://... (gunakan Upstash)
     JWT_SECRET=your_secret_key
     PDF_RENDERER_URL=https://pdf-renderer.vercel.app/render
     APP_URL=https://jadwale.id
     MAINTENANCE_MODE=false
     ```
   - **Catatan Redis**: Sebagian besar shared hosting tidak menyediakan Redis. Gunakan **Upstash** (layanan Redis cloud gratis hingga 10.000 operasi/hari). Buat database Redis di Upstash, salin URL-nya, dan masukkan ke environment variables.

6. **Menjalankan Worker (BullMQ):**
   - Worker adalah proses terpisah yang harus berjalan terus-menerus. Pada shared hosting, buat **Cron Job** untuk menjalankan worker secara berkala.
   - Buka CPanel → **Cron Jobs**.
   - Tambahkan perintah berikut untuk dijalankan setiap menit:
     ```bash
     /usr/local/bin/node /home/username/jadwale-backend/dist/worker.js >> /dev/null 2>&1
     ```
   - Atau, jika Node.js Selector mendukung "Run Script as Daemon", atur worker sebagai daemon. Jika tidak, gunakan pendekatan **cron-job** (meskipun kurang ideal untuk antrian, namun masih berfungsi untuk skala kecil).

7. **Setup SSL (HTTPS):**
   - Buka CPanel → **SSL/TLS** → **AutoSSL**.
   - Aktifkan AutoSSL untuk domain yang digunakan.

8. **Konfigurasi .htaccess (untuk redirect ke frontend):**
   - Di folder `public_html`, buat file `.htaccess` untuk mengarahkan semua request ke file `index.html` (jika menggunakan static export):
     ```apache
     RewriteEngine On
     RewriteBase /
     RewriteRule ^index\.html$ - [L]
     RewriteCond %{REQUEST_FILENAME} !-f
     RewriteCond %{REQUEST_FILENAME} !-d
     RewriteRule . /index.html [L]
     ```

### 12.2 Deployment di VPS (DigitalOcean, AWS, atau Linode) dengan PM2

Untuk performa optimal dan kontrol penuh, gunakan VPS dengan sistem operasi Ubuntu 22.04 LTS.

1. **Instal Dependencies:**
   ```bash
   apt update && apt install -y nodejs npm mysql-server redis-server nginx
   npm install -g pm2
   ```

2. **Clone Repository dan Setup Database:**
   ```bash
   git clone https://github.com/your-username/jadwale.git /var/www/jadwale
   cd /var/www/jadwale/backend
   npm install && npm run build
   # Import skema SQL ke MySQL
   mysql -u root -p < /path/to/schema.sql
   ```

3. **Konfigurasi Environment (.env):**
   - Buat file `.env` di folder backend dan isi dengan konfigurasi production (gunakan Redis lokal: `redis://localhost:6379`).

4. **Menjalankan API & Worker dengan PM2:**
   ```bash
   pm2 start dist/main.js --name jadwale-api
   pm2 start dist/worker.js --name jadwale-worker
   pm2 save && pm2 startup
   ```

5. **Setup Nginx sebagai Reverse Proxy:**
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
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   Lalu aktifkan SSL menggunakan Certbot.

6. **Deploy Frontend ke Vercel:**
   Karena Vercel menawarkan performa global yang lebih baik, tetap gunakan Vercel untuk frontend dan arahkan domain utama ke Vercel.

### 12.3 Monitoring & Logging
- **PM2**: Gunakan `pm2 logs jadwale-api` dan `pm2 monit` untuk memantau penggunaan CPU dan memori.
- **Sentry**: Pasang *Sentry SDK* di backend dan frontend untuk menangkap error secara real-time.
- **UptimeRobot**: Buat monitor untuk endpoint `/api/health` setiap 5 menit.

---

## 13. LAMPIRAN: DATA DEFAULT, ENVIRONMENT, & SEEDER

### 13.1 Data Default Kemendikbud (Seeder SQL)
```sql
INSERT INTO sekolah (npsn, nama_sekolah, alamat) 
VALUES ('1234567890', 'SDN Percobaan', 'Jl. Pendidikan No. 1');

INSERT INTO school_configs (id_sekolah, is_parallel, class_naming, school_days, start_time, duration_per_jp,
  break1_after_jp, break2_after_jp, has_monday_ceremony, ceremony_duration)
VALUES (1, false, 'alphabet', 5, '07:00:00', 35, 3, 5, true, 35);

INSERT INTO mapel (id_sekolah, nama, prioritas) VALUES
(1, 'Pendidikan Agama', false),
(1, 'PPKn', false),
(1, 'Bahasa Indonesia', true),
(1, 'Matematika', true),
(1, 'IPA', true),
(1, 'IPS', false),
(1, 'SBdP', false),
(1, 'PJOK (Olahraga)', false),
(1, 'Bahasa Inggris', false);
```

### 13.2 Environment Variables (.env)
```
NODE_ENV=production
DATABASE_URL=mysql://user:pass@localhost:3306/jadwale_db
REDIS_CACHE_URL=redis://localhost:6379
REDIS_QUEUE_URL=redis://localhost:6379
JWT_SECRET=your_very_long_secret_key
PDF_RENDERER_URL=https://pdf-renderer.vercel.app/render
APP_URL=https://jadwale.id
NEXT_PUBLIC_API_URL=https://api.jadwale.id
NEXT_PUBLIC_WS_URL=wss://api.jadwale.id
MAINTENANCE_MODE=false
```

### 13.3 Petunjuk Menjalankan Seeder
1. Setelah skema database diimpor, jalankan perintah seeder melalui script khusus (misal `npm run seed`) yang akan mengisi data master sekolah contoh, konfigurasi, dan 9 mapel wajib.
2. Buat user admin pertama dengan perintah: `node scripts/create-admin.js --email=admin@sekolah.id --password=rahasia`.

---

**Dokumen Spesifikasi ini merupakan versi final dan lengkap (standalone).** Semua aspek arsitektur, basis data, keamanan, antarmuka pengguna, algoritma, dan strategi deployment telah dijabarkan secara rinci tanpa mengacu pada dokumen revisi sebelumnya. Tim pengembang dan arsitek dapat langsung menggunakan dokumen ini sebagai acuan tunggal untuk membangun, menguji, dan mendeploy aplikasi Jadwale ke lingkungan produksi.
===== FILE 1: 01_Cover_dan_Pendahuluan.docx =====

---

# LAPORAN PROGRESS PENGOLAHAN DATA PENGUJIAN KUALITAS PERANGKAT LUNAK

---

## COVER

| | |
|---|---|
| **Judul Tugas** | Pengujian Kualitas dan Kelayakan Sistem Generator Jadwal Pelajaran Sekolah Otomatis "Jadwale" Berdasarkan Standar ISO/IEC 25010 |
| **Mata Kuliah** | Uji Kualitas Perangkat Lunak |
| **Program Studi** | ......... |
| **Fakultas** | ......... |
| **Universitas** | ......... |
| **Tanggal** | 26 September 2026 |
| **Status Dokumen** | **PROGRESS** (Bukan Laporan Final) |

---

### Anggota Kelompok

| No. | Nama | NIM |
|-----|------|-----|
| 1 | Salma Faizatul Jannah | H1D024066 |
| 2 | Nafisah Sekar Ayu | H1D024087 |
| 3 | Talitha Maharani Nashier | H1D024098 |

---

## BAB 1 — PENDAHULUAN

### 1.1 Latar Belakang

Perkembangan teknologi informasi telah mendorong transformasi berbagai proses administratif di lembaga pendidikan, termasuk penyusunan jadwal pelajaran sekolah. Proses penjadwalan secara manual seringkali memerlukan waktu yang lama, rentan terhadap kesalahan manusia, serta sulit untuk mengakomodasi berbagai batasan (*constraint*) yang kompleks seperti ketersediaan guru, kapasitas ruang kelas, dan preferensi waktu mata pelajaran.

Sistem "Jadwale" hadir sebagai solusi berbasis perangkat lunak yang mampu menghasilkan jadwal pelajaran sekolah secara otomatis. Sistem ini dikembangkan dengan pendekatan modern menggunakan teknologi web (*full-stack*) dan dapat diakses melalui antarmuka berbasis browser. Untuk memastikan bahwa sistem ini layak digunakan secara luas, diperlukan pengujian kualitas yang sistematis dan terstandarisasi.

Standar internasional ISO/IEC 25010 (*Systems and Software Engineering — Systems and Software Quality Requirements and Evaluation / SQuaRE*) menyediakan model kualitas produk perangkat lunak yang komprehensif dan diakui secara global. Standar ini mencakup delapan karakteristik kualitas utama, antara lain *Functional Suitability*, *Performance Efficiency*, *Compatibility*, *Usability*, *Reliability*, *Security*, *Maintainability*, dan *Portability*. Dengan menggunakan standar ini sebagai acuan, pengujian terhadap sistem Jadwale dapat dilakukan secara objektif, terukur, dan dapat dipertanggungjawabkan secara akademis.

Dokumen ini merupakan laporan **progress** pengolahan data pengujian yang sedang berjalan. Beberapa karakteristik pengujian telah selesai dilaksanakan, sementara sebagian lainnya masih dalam tahap persiapan instrumen.

---

### 1.2 Tujuan Pengujian

Tujuan dari pengujian kualitas perangkat lunak sistem Jadwale adalah sebagai berikut:

1. Mengukur tingkat **Functional Suitability** sistem Jadwale, yaitu sejauh mana fungsi-fungsi utama sistem bekerja sesuai dengan kebutuhan pengguna.
2. Mengukur **Performance Efficiency** sistem, khususnya waktu respons (*response time*) terhadap berbagai skenario permintaan.
3. Mengevaluasi **Reliability** (keandalan) sistem melalui pengujian *error handling* pada kondisi input tidak valid atau skenario batas.
4. Mengukur tingkat **Usability** (kegunaan) sistem menggunakan metode *System Usability Scale* (SUS) — ***(dalam tahap persiapan)***.
5. Memberikan rekomendasi perbaikan berdasarkan hasil pengujian sebagai masukan bagi pengembang sistem.

---

### 1.3 Ruang Lingkup Pengujian

Pengujian ini mencakup komponen-komponen berikut pada sistem Jadwale:

| No. | Ruang Lingkup | Keterangan |
|-----|---------------|------------|
| 1 | **Frontend** | Antarmuka pengguna berbasis web (React/Next.js) yang dapat diakses melalui browser |
| 2 | **Backend API** | REST API berbasis NestJS yang melayani permintaan dari frontend |
| 3 | **Fitur Utama** | Manajemen data (guru, mata pelajaran, kelas, ruang), proses generate jadwal otomatis, tampilan & ekspor jadwal |
| 4 | **Lingkungan Pengujian** | Localhost (pengembangan) dan hosting publik (produksi) |
| 5 | **Pengguna Sasaran** | Administrator sekolah sebagai pengguna utama sistem |

**Yang TIDAK termasuk dalam ruang lingkup:**
- Pengujian keamanan (*Security Testing*) secara mendalam
- Pengujian *Maintainability* dan *Portability* secara teknis
- Pengujian pada perangkat mobile (hanya desktop browser)

---

### 1.4 Metode Pengujian

Pengujian mengacu pada standar **ISO/IEC 25010:2011 — Product Quality Model** dengan fokus pada karakteristik yang dapat diuji dalam lingkup proyek ini:

| No. | Karakteristik ISO/IEC 25010 | Metode Pengujian | Status |
|-----|-----------------------------|------------------|--------|
| 1 | **Functional Suitability** | *Checklist* evaluasi fungsi (matriks FS-01 s/d FS-10) | ✅ Selesai |
| 2 | **Performance Efficiency** | Pengukuran *response time* menggunakan Chrome DevTools | ✅ Selesai |
| 3 | **Reliability** | Pengujian *error handling* dengan skenario input tidak valid | ✅ Selesai |
| 4 | **Usability** | *System Usability Scale* (SUS) — kuesioner 10 item Skala Likert 1–5 | 🔄 Pending |
| 5 | **Compatibility** | Pengujian lintas browser dasar | 🔄 Opsional |

**Pendekatan Pengujian:**
- **Black-box Testing**: Pengujian dilakukan dari perspektif pengguna tanpa melihat kode sumber secara langsung.
- **Empirical Testing**: Data dikumpulkan secara langsung melalui observasi dan pengukuran pada sistem yang berjalan.
- **Survey/Kuesioner**: Untuk pengujian Usability menggunakan metode SUS yang telah terstandarisasi.

---

### 1.5 Tools dan Lingkungan Pengujian

#### 1.5.1 Lingkungan Pengujian

| Parameter | Spesifikasi |
|-----------|-------------|
| **URL Lokal** | `http://localhost:3000` |
| **URL Hosting** | `https://jadwale.vercel.app` *(sesuaikan)* |
| **Browser** | Google Chrome (versi terbaru) |
| **Sistem Operasi** | Windows 10/11 |
| **Koneksi Internet** | Stabil (untuk pengujian hosting) |

#### 1.5.2 Tools yang Digunakan

| No. | Tool | Kegunaan |
|-----|------|----------|
| 1 | **Google Chrome DevTools** | Mengukur *response time*, memonitor *network requests* |
| 2 | **Chrome Network Tab** | Mengamati waktu muat halaman dan API calls |
| 3 | **Spreadsheet (Google Sheets/Excel)** | Tabulasi data hasil pengujian |
| 4 | **Google Forms** | Penyebaran kuesioner SUS *(direncanakan)* |
| 5 | **Microsoft Word / Google Docs** | Penyusunan laporan |
| 6 | **GitHub** | Repositori kode sumber: `https://github.com/salstudioz/Jadwale` |

---

### 1.6 Sistematika Dokumen

Laporan progress pengolahan data ini terdiri dari beberapa file terpisah:

| File | Nama Dokumen | Keterangan |
|------|--------------|------------|
| 01 | Cover dan Pendahuluan | Dokumen ini |
| 02 | Matriks Functional Suitability | Hasil evaluasi 10 indikator fungsi |
| 03 | Performance Efficiency | Hasil pengukuran waktu respons |
| 04 | Reliability | Hasil pengujian penanganan error |
| 05 | Catatan Usability (Pending) | Status dan rencana pengujian SUS |
| 06 | Ringkasan Progress dan Rencana | Ikhtisar keseluruhan progress |
| 07 | README.txt | Panduan isi ZIP |

---

*Dokumen ini berstatus PROGRESS dan akan diperbarui setelah seluruh pengujian selesai dilaksanakan.*

---
**Dibuat oleh:** Kelompok ......... | **Tanggal:** 26 September 2026

===== FILE 2: 02_Matriks_Functional_Suitability.docx =====

---

# MATRIKS EVALUASI FUNCTIONAL SUITABILITY
## Sistem Jadwale — Pengujian Berdasarkan ISO/IEC 25010

| | |
|---|---|
| **Karakteristik** | Functional Suitability |
| **Sub-karakteristik** | Functional Completeness, Functional Correctness, Functional Appropriateness |
| **Tanggal Pengujian** | ......... |
| **Penguji** | Salma Faizatul Jannah / Nafisah Sekar Ayu / Talitha Maharani Nashier |
| **Lingkungan** | `http://localhost:3000` / `https://jadwale.vercel.app` |

---

## 1. DEFINISI SUB-KARAKTERISTIK

| Sub-karakteristik | Definisi |
|-------------------|----------|
| **Functional Completeness** | Sejauh mana fungsi-fungsi yang disediakan mencakup semua tugas dan tujuan pengguna yang ditentukan |
| **Functional Correctness** | Sejauh mana sistem menghasilkan hasil yang benar dengan tingkat presisi yang dibutuhkan |
| **Functional Appropriateness** | Sejauh mana fungsi-fungsi yang disediakan memfasilitasi pencapaian tugas dan tujuan tertentu |

---

## 2. MATRIKS EVALUASI FUNCTIONAL SUITABILITY

| Kode | Indikator / Fungsi yang Diuji | Sub-karakteristik | Langkah Uji | Hasil (Ya/Tidak) | Bukti / Keterangan | Skor |
|------|-------------------------------|-------------------|-------------|------------------|--------------------|------|
| **FS-01** | Sistem dapat menampilkan halaman login dan memproses autentikasi pengguna (admin) dengan benar | Functional Completeness | Buka URL sistem → masukkan kredensial valid → klik Login | ....... | [SCREENSHOT: FS-01_login_berhasil.png] | ....... |
| **FS-02** | Sistem dapat menampilkan dashboard utama setelah login berhasil | Functional Completeness | Login sebagai admin → amati tampilan dashboard | ....... | [SCREENSHOT: FS-02_dashboard.png] | ....... |
| **FS-03** | Sistem dapat menambahkan data guru (nama, mata pelajaran ampu, jam mengajar) | Functional Correctness | Menu Guru → Tambah Guru → isi form → simpan | ....... | [SCREENSHOT: FS-03_tambah_guru.png] | ....... |
| **FS-04** | Sistem dapat menambahkan dan mengelola data mata pelajaran | Functional Completeness | Menu Mata Pelajaran → Tambah → isi data → simpan | ....... | [SCREENSHOT: FS-04_mata_pelajaran.png] | ....... |
| **FS-05** | Sistem dapat menambahkan dan mengelola data kelas | Functional Completeness | Menu Kelas → Tambah Kelas → isi data → simpan | ....... | [SCREENSHOT: FS-05_kelola_kelas.png] | ....... |
| **FS-06** | Sistem dapat menambahkan dan mengelola data ruang / lab | Functional Completeness | Menu Ruang → Tambah Ruang → isi data → simpan | ....... | [SCREENSHOT: FS-06_kelola_ruang.png] | ....... |
| **FS-07** | Sistem dapat menjalankan proses *generate* jadwal otomatis berdasarkan data yang telah dimasukkan | Functional Correctness | Klik tombol "Generate Jadwal" → tunggu proses → amati hasil | ....... | [SCREENSHOT: FS-07_generate_jadwal.png] | ....... |
| **FS-08** | Hasil jadwal yang di-*generate* bebas dari konflik (tidak ada guru mengajar dua kelas di waktu sama) | Functional Correctness | Periksa hasil jadwal → cek keberulangan guru di slot waktu yang sama | ....... | [SCREENSHOT: FS-08_cek_konflik.png] | ....... |
| **FS-09** | Sistem dapat menampilkan jadwal dalam format yang mudah dibaca (tabel per kelas / per guru) | Functional Appropriateness | Buka halaman jadwal → amati tampilan dan navigasi | ....... | [SCREENSHOT: FS-09_tampilan_jadwal.png] | ....... |
| **FS-10** | Sistem dapat mengekspor / mencetak jadwal yang telah dibuat | Functional Appropriateness | Klik tombol ekspor/cetak → amati output (PDF/Excel/Print) | ....... | [SCREENSHOT: FS-10_ekspor_jadwal.png] | ....... |

---

## 3. PANDUAN PENGISIAN SKOR

| Nilai Skor | Keterangan |
|------------|------------|
| **1** | Fungsi tersedia dan berjalan dengan benar (Ya) |
| **0** | Fungsi tidak tersedia atau tidak berjalan (Tidak) |

> **Catatan:** Kolom "Hasil (Ya/Tidak)" diisi berdasarkan observasi langsung. Skor 1 = Ya, Skor 0 = Tidak.

---

## 4. RUMUS PERHITUNGAN PERSENTASE FUNCTIONAL SUITABILITY

```
Persentase Functional Suitability = (Jumlah Skor yang Diperoleh / Total Skor Maksimum) × 100%

Keterangan:
- Jumlah Skor yang Diperoleh = Total skor "1" dari semua indikator yang terpenuhi
- Total Skor Maksimum        = Jumlah total indikator × 1 (dalam kasus ini: 10 × 1 = 10)

Contoh Perhitungan:
Jika 8 dari 10 indikator terpenuhi:
Persentase = (8 / 10) × 100% = 80%
```

---

## 5. HASIL PERHITUNGAN (DIISI SETELAH PENGUJIAN)

| Parameter | Nilai |
|-----------|-------|
| Total Indikator | 10 |
| Indikator Terpenuhi (Ya) | ....... |
| Indikator Tidak Terpenuhi (Tidak) | ....... |
| **Persentase Functional Suitability** | .......% |

---

## 6. TABEL INTERPRETASI HASIL

| Rentang Persentase | Kategori | Keterangan |
|-------------------|----------|------------|
| 86% – 100% | **Sangat Baik** | Semua atau hampir semua fungsi berjalan dengan benar |
| 71% – 85% | **Baik** | Sebagian besar fungsi berjalan, ada sedikit kekurangan |
| 56% – 70% | **Cukup** | Beberapa fungsi utama berjalan, perlu perbaikan |
| 41% – 55% | **Kurang** | Banyak fungsi yang tidak berjalan, perlu perbaikan signifikan |
| ≤ 40% | **Sangat Kurang** | Fungsi sistem banyak yang tidak berjalan |

**Hasil Sistem Jadwale:** Persentase = .......% → Kategori: **.......**

---

## 7. DAFTAR SCREENSHOT YANG DIBUTUHKAN

| No. | Nama File Screenshot | Keterangan |
|-----|---------------------|------------|
| 1 | `FS-01_login_berhasil.png` | Tampilan setelah login berhasil |
| 2 | `FS-02_dashboard.png` | Halaman dashboard utama |
| 3 | `FS-03_tambah_guru.png` | Form tambah data guru + notifikasi sukses |
| 4 | `FS-04_mata_pelajaran.png` | Daftar/form mata pelajaran |
| 5 | `FS-05_kelola_kelas.png` | Daftar/form kelas |
| 6 | `FS-06_kelola_ruang.png` | Daftar/form ruang |
| 7 | `FS-07_generate_jadwal.png` | Proses/hasil generate jadwal |
| 8 | `FS-08_cek_konflik.png` | Verifikasi tidak ada konflik jadwal |
| 9 | `FS-09_tampilan_jadwal.png` | Tampilan tabel jadwal per kelas/guru |
| 10 | `FS-10_ekspor_jadwal.png` | Proses ekspor/cetak jadwal |

---

## 8. ANALISIS DAN KESIMPULAN (DIISI SETELAH PENGUJIAN)

**Temuan Utama:**
- .......

**Fungsi yang Berjalan dengan Baik:**
- .......

**Fungsi yang Perlu Diperbaiki:**
- .......

**Kesimpulan:**
Berdasarkan pengujian Functional Suitability yang dilakukan, sistem Jadwale memperoleh persentase sebesar .......% yang termasuk dalam kategori "......." berdasarkan skala interpretasi ISO/IEC 25010. Hal ini menunjukkan bahwa sistem ......... dalam memenuhi kebutuhan fungsional pengguna.

---

*Dokumen ini berstatus PROGRESS — Data pengujian sedang dalam proses pengisian.*

**Dibuat oleh:** Kelompok ......... | **Tanggal:** 26 September 2026

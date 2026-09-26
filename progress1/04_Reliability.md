===== FILE 4: 04_Reliability.docx =====

---

# PENGUJIAN RELIABILITY (KEANDALAN)
## Sistem Jadwale — Pengujian Berdasarkan ISO/IEC 25010

| | |
|---|---|
| **Karakteristik** | Reliability |
| **Sub-karakteristik** | Maturity, Availability, Fault Tolerance, Recoverability |
| **Tanggal Pengujian** | ......... |
| **Penguji** | Salma Faizatul Jannah / Nafisah Sekar Ayu / Talitha Maharani Nashier |
| **Lingkungan** | `http://localhost:3000` / `https://jadwale.vercel.app` |
| **Browser** | Google Chrome (Versi: .......) |

---

## 1. DEFINISI SUB-KARAKTERISTIK

| Sub-karakteristik | Definisi |
|-------------------|----------|
| **Maturity** | Kemampuan sistem menghindari kegagalan akibat kesalahan pada perangkat lunak |
| **Availability** | Kemampuan sistem beroperasi dan dapat diakses saat dibutuhkan |
| **Fault Tolerance** | Kemampuan sistem beroperasi sesuai yang dimaksud meskipun terjadi kesalahan hardware/software |
| **Recoverability** | Kemampuan sistem memulihkan data dan menetapkan kembali kondisi yang diinginkan setelah terjadi gangguan |

> **Fokus Pengujian:** *Fault Tolerance* dan *Maturity* — pengujian kemampuan sistem menangani input tidak valid, kondisi batas (*edge case*), dan error tanpa mengalami crash atau menghasilkan data yang salah.

---

## 2. METODE PENGUJIAN

**Pendekatan:** *Negative Testing* / *Error Handling Testing*
- Sistem diuji dengan memberikan input yang salah, tidak lengkap, atau di luar batas yang diharapkan.
- Diamati apakah sistem memberikan pesan error yang informatif dan tidak mengalami crash (sistem tetap berjalan normal setelah error).

**Kriteria Keberhasilan:**
- ✅ **Berhasil (Pass):** Sistem menampilkan pesan error/validasi yang sesuai dan tetap berjalan normal
- ❌ **Gagal (Fail):** Sistem crash, hang, menampilkan error 500, atau tidak memberikan feedback sama sekali

---

## 3. TABEL PENGUJIAN ERROR HANDLING (RELIABILITY)

### 3.1 Skenario RL-01: Login dengan Kredensial Salah

| Parameter | Nilai |
|-----------|-------|
| **Deskripsi** | Pengguna mencoba login dengan username dan/atau password yang salah |
| **Input** | Username: `admin@test.com`, Password: `passwordsalah123` |
| **Output yang Diharapkan** | Sistem menampilkan pesan error "Username atau password salah" dan tidak mengizinkan masuk |
| **Sub-karakteristik** | Fault Tolerance, Maturity |

| Aspek Evaluasi | Hasil | Keterangan |
|----------------|-------|------------|
| Sistem tidak crash | ....... | ....... |
| Muncul pesan error yang informatif | ....... | ....... |
| Pengguna tidak bisa masuk ke sistem | ....... | ....... |
| Form dapat digunakan kembali setelah error | ....... | ....... |
| **Hasil Keseluruhan (Pass/Fail)** | **.......**  | |

[SCREENSHOT: RL-01_login_gagal.png]

---

### 3.2 Skenario RL-02: Menyimpan Data dengan Field Wajib Kosong

| Parameter | Nilai |
|-----------|-------|
| **Deskripsi** | Pengguna mencoba menyimpan data (misalnya: tambah guru) tanpa mengisi semua field yang wajib diisi |
| **Input** | Form tambah guru dengan field nama dikosongkan |
| **Output yang Diharapkan** | Sistem menampilkan validasi "Field ini wajib diisi" dan tidak menyimpan data yang tidak lengkap |
| **Sub-karakteristik** | Fault Tolerance, Maturity |

| Aspek Evaluasi | Hasil | Keterangan |
|----------------|-------|------------|
| Sistem tidak crash | ....... | ....... |
| Muncul pesan validasi yang jelas | ....... | ....... |
| Data tidak tersimpan ke database | ....... | ....... |
| Form tetap dapat digunakan setelah validasi | ....... | ....... |
| **Hasil Keseluruhan (Pass/Fail)** | **.......**  | |

[SCREENSHOT: RL-02_validasi_form_kosong.png]

---

### 3.3 Skenario RL-03: Akses Halaman yang Memerlukan Login (Tanpa Login)

| Parameter | Nilai |
|-----------|-------|
| **Deskripsi** | Pengguna mencoba mengakses halaman yang terproteksi (dashboard/data) tanpa melakukan login terlebih dahulu |
| **Input** | Ketik langsung URL dashboard di browser tanpa sesi login aktif |
| **Output yang Diharapkan** | Sistem mengalihkan (*redirect*) pengguna ke halaman login secara otomatis |
| **Sub-karakteristik** | Fault Tolerance, Availability |

| Aspek Evaluasi | Hasil | Keterangan |
|----------------|-------|------------|
| Sistem tidak crash | ....... | ....... |
| Pengguna diarahkan ke halaman login | ....... | ....... |
| Konten halaman terproteksi tidak terekspos | ....... | ....... |
| Setelah login, pengguna dapat mengakses halaman | ....... | ....... |
| **Hasil Keseluruhan (Pass/Fail)** | **.......**  | |

[SCREENSHOT: RL-03_redirect_ke_login.png]

---

### 3.4 Skenario RL-04: Generate Jadwal dengan Data yang Tidak Lengkap/Konflik

| Parameter | Nilai |
|-----------|-------|
| **Deskripsi** | Pengguna mencoba menjalankan proses generate jadwal padahal data yang dibutuhkan belum lengkap (misalnya: belum ada data guru, atau jumlah jam tidak mencukupi) |
| **Input** | Klik tombol "Generate Jadwal" saat data guru/kelas/mapel belum lengkap |
| **Output yang Diharapkan** | Sistem menampilkan pesan peringatan yang informatif tentang data yang kurang/konflik, dan tidak melanjutkan proses generate yang salah |
| **Sub-karakteristik** | Fault Tolerance, Maturity |

| Aspek Evaluasi | Hasil | Keterangan |
|----------------|-------|------------|
| Sistem tidak crash | ....... | ....... |
| Muncul pesan error/peringatan yang informatif | ....... | ....... |
| Proses generate dihentikan dengan aman | ....... | ....... |
| Sistem dapat digunakan kembali setelah peringatan | ....... | ....... |
| **Hasil Keseluruhan (Pass/Fail)** | **.......**  | |

[SCREENSHOT: RL-04_generate_data_tidak_lengkap.png]

---

### 3.5 Skenario RL-05: Input dengan Karakter Tidak Valid / Potensi Injeksi

| Parameter | Nilai |
|-----------|-------|
| **Deskripsi** | Pengguna memasukkan karakter khusus atau string yang berpotensi menyebabkan error pada form input (misalnya: `<script>`, `'; DROP TABLE`, karakter non-latin, dll.) |
| **Input** | Pada field nama guru, masukkan: `<script>alert('test')</script>` |
| **Output yang Diharapkan** | Sistem menolak atau men-sanitasi input, tidak mengeksekusi script, tidak mengalami error pada database, dan menampilkan pesan validasi yang sesuai |
| **Sub-karakteristik** | Fault Tolerance, Maturity |

| Aspek Evaluasi | Hasil | Keterangan |
|----------------|-------|------------|
| Sistem tidak crash / error 500 | ....... | ....... |
| Script tidak dieksekusi (tidak ada alert) | ....... | ....... |
| Input di-sanitasi atau ditolak dengan pesan | ....... | ....... |
| Database tidak rusak/tidak ada data aneh tersimpan | ....... | ....... |
| **Hasil Keseluruhan (Pass/Fail)** | **.......**  | |

[SCREENSHOT: RL-05_input_karakter_tidak_valid.png]

---

## 4. REKAP HASIL PENGUJIAN RELIABILITY

| Kode | Skenario | Hasil (Pass/Fail) | Keterangan |
|------|----------|:-----------------:|------------|
| RL-01 | Login dengan kredensial salah | ....... | ....... |
| RL-02 | Simpan data dengan field wajib kosong | ....... | ....... |
| RL-03 | Akses halaman terproteksi tanpa login | ....... | ....... |
| RL-04 | Generate jadwal dengan data tidak lengkap | ....... | ....... |
| RL-05 | Input dengan karakter tidak valid | ....... | ....... |
| | **Total Pass** | **....... / 5** | |

---

## 5. RUMUS PERHITUNGAN PERSENTASE RELIABILITY

```
Persentase Reliability = (Jumlah Skenario yang Lulus (Pass) / Total Skenario) × 100%

Keterangan:
- Jumlah Skenario yang Lulus = Total skenario dengan hasil "Pass"
- Total Skenario              = Jumlah keseluruhan skenario pengujian (5)

Contoh Perhitungan:
Jika 4 dari 5 skenario lulus:
Persentase = (4 / 5) × 100% = 80%

Selain itu, dapat digunakan rumus Reliability Rate:
Reliability Rate = 1 - (Jumlah Failure / Total Test Cases)
                 = 1 - (1 / 5)
                 = 1 - 0.2
                 = 0.8 = 80%
```

---

## 6. HASIL PERHITUNGAN (DIISI SETELAH PENGUJIAN)

| Parameter | Nilai |
|-----------|-------|
| Total Skenario | 5 |
| Skenario Lulus (Pass) | ....... |
| Skenario Gagal (Fail) | ....... |
| **Persentase Reliability** | .......% |
| **Reliability Rate** | ....... |

---

## 7. TABEL INTERPRETASI HASIL

| Rentang Persentase | Kategori | Keterangan |
|-------------------|----------|------------|
| 86% – 100% | **Sangat Baik** | Sistem sangat andal, hampir semua kondisi error ditangani dengan baik |
| 71% – 85% | **Baik** | Sistem cukup andal, sebagian besar error ditangani |
| 56% – 70% | **Cukup** | Sistem perlu perbaikan pada beberapa mekanisme penanganan error |
| 41% – 55% | **Kurang** | Banyak kondisi error yang tidak ditangani dengan baik |
| ≤ 40% | **Sangat Kurang** | Sistem tidak andal, perlu perbaikan signifikan |

**Hasil Sistem Jadwale:** Persentase = .......% → Kategori: **.......**

---

## 8. ANALISIS DAN KESIMPULAN (DIISI SETELAH PENGUJIAN)

**Temuan Utama:**
- .......

**Skenario yang Ditangani dengan Baik:**
- .......

**Skenario yang Perlu Perbaikan:**
- .......

**Rekomendasi:**
- .......

**Kesimpulan:**
Berdasarkan pengujian Reliability yang dilakukan melalui 5 skenario *error handling*, sistem Jadwale memperoleh persentase sebesar .......% yang termasuk dalam kategori "......." Hasil ini menunjukkan bahwa sistem ......... dalam menangani kondisi error dan input yang tidak valid.

---

## 9. DAFTAR SCREENSHOT YANG DIBUTUHKAN

| No. | Nama File | Keterangan |
|-----|-----------|------------|
| 1 | `RL-01_login_gagal.png` | Tampilan pesan error saat login gagal |
| 2 | `RL-02_validasi_form_kosong.png` | Tampilan pesan validasi saat field wajib kosong |
| 3 | `RL-03_redirect_ke_login.png` | Proses redirect ke halaman login saat akses tanpa autentikasi |
| 4 | `RL-04_generate_data_tidak_lengkap.png` | Pesan peringatan saat generate dengan data tidak lengkap |
| 5 | `RL-05_input_karakter_tidak_valid.png` | Hasil input karakter tidak valid |

---

*Dokumen ini berstatus PROGRESS — Data pengujian sedang dalam proses pengisian.*

**Dibuat oleh:** Kelompok ......... | **Tanggal:** 26 September 2026

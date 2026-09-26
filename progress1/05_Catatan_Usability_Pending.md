===== FILE 5: 05_Catatan_Usability_Pending.docx =====

---

# CATATAN PENGUJIAN USABILITY — STATUS PENDING
## Sistem Jadwale — Pengujian Berdasarkan ISO/IEC 25010

| | |
|---|---|
| **Karakteristik** | Usability |
| **Metode Rencana** | System Usability Scale (SUS) |
| **Status Saat Ini** | 🔄 **BELUM DILAKSANAKAN** |
| **Alasan** | Instrumen kuesioner belum disusun dan belum disebarkan ke responden |
| **Tanggal Dokumen** | 26 September 2026 |

---

## 1. PENJELASAN STATUS PENGUJIAN

Pengujian karakteristik **Usability** pada sistem Jadwale hingga saat ini **belum dapat dilaksanakan**. Hal ini dikarenakan dua faktor utama yang saling berkaitan:

1. **Instrumen Kuesioner Belum Disusun:** Kuesioner System Usability Scale (SUS) yang akan digunakan sebagai alat ukur kepuasan dan kemudahan penggunaan sistem belum selesai disusun dan divalidasi oleh tim peneliti.

2. **Kuesioner Belum Disebarkan kepada Responden:** Mengingat instrumen belum tersedia, maka proses penyebaran kepada target responden (administrator sekolah / pengguna potensial sistem) juga belum dapat dilaksanakan.

Dengan demikian, pada tahap progress ini, belum ada data kuantitatif maupun kualitatif mengenai aspek Usability sistem Jadwale yang dapat dilaporkan.

---

## 2. DEFINISI USABILITY (ISO/IEC 25010)

Menurut standar ISO/IEC 25010, **Usability** didefinisikan sebagai:

> *"Kemampuan produk perangkat lunak untuk digunakan oleh pengguna yang ditentukan untuk mencapai tujuan tertentu dengan efektivitas, efisiensi, dan kepuasan dalam konteks penggunaan yang ditentukan."*

Sub-karakteristik Usability yang diukur meliputi:

| Sub-karakteristik | Definisi |
|-------------------|----------|
| **Appropriateness Recognizability** | Kemampuan pengguna untuk mengenali apakah sistem sesuai kebutuhannya |
| **Learnability** | Kemudahan sistem untuk dipelajari oleh pengguna baru |
| **Operability** | Kemampuan sistem untuk dioperasikan dan dikontrol oleh pengguna |
| **User Error Protection** | Perlindungan terhadap kesalahan operasi pengguna |
| **User Interface Aesthetics** | Keindahan dan kenyamanan tampilan antarmuka pengguna |
| **Accessibility** | Kemampuan sistem untuk digunakan oleh pengguna dengan berbagai kemampuan |

---

## 3. METODE PENGUJIAN YANG DIRENCANAKAN: SYSTEM USABILITY SCALE (SUS)

### 3.1 Latar Belakang Metode SUS

**System Usability Scale (SUS)** adalah metode pengukuran usability yang dikembangkan oleh John Brooke pada tahun 1986. SUS merupakan metode yang:
- Telah terstandarisasi dan diakui secara internasional
- Sederhana dan mudah diisi oleh responden
- Memberikan skor akhir yang mudah diinterpretasikan
- Dapat digunakan untuk berbagai jenis sistem perangkat lunak

### 3.2 Instrumen Kuesioner SUS (10 Item)

Kuesioner SUS terdiri dari **10 pernyataan** yang dijawab menggunakan **Skala Likert 1 hingga 5**, dengan keterangan:
- `1` = Sangat Tidak Setuju
- `2` = Tidak Setuju
- `3` = Netral / Ragu-ragu
- `4` = Setuju
- `5` = Sangat Setuju

| No. | Pernyataan (Bahasa Indonesia) | Jenis |
|-----|-------------------------------|-------|
| 1 | Saya pikir saya akan sering menggunakan sistem ini | Positif |
| 2 | Saya merasa sistem ini tidak perlu dibuat terlalu kompleks | Negatif |
| 3 | Saya pikir sistem ini mudah digunakan | Positif |
| 4 | Saya membutuhkan bantuan dari orang yang ahli untuk menggunakan sistem ini | Negatif |
| 5 | Saya merasa berbagai fungsi dalam sistem ini terintegrasi dengan baik | Positif |
| 6 | Saya merasa terlalu banyak hal yang tidak konsisten dalam sistem ini | Negatif |
| 7 | Saya pikir kebanyakan orang akan belajar menggunakan sistem ini dengan sangat cepat | Positif |
| 8 | Saya merasa sistem ini sangat sulit digunakan | Negatif |
| 9 | Saya merasa sangat percaya diri menggunakan sistem ini | Positif |
| 10 | Saya perlu belajar banyak hal sebelum saya bisa memulai menggunakan sistem ini | Negatif |

### 3.3 Rumus Perhitungan Skor SUS

```
RUMUS PERHITUNGAN SKOR SUS:

Langkah 1 — Hitung Skor Kontribusi Per Item:
  - Untuk item POSITIF (nomor ganjil: 1, 3, 5, 7, 9):
    Skor Kontribusi = (Nilai yang Dipilih Responden) - 1
    
  - Untuk item NEGATIF (nomor genap: 2, 4, 6, 8, 10):
    Skor Kontribusi = 5 - (Nilai yang Dipilih Responden)

Langkah 2 — Jumlahkan Semua Skor Kontribusi:
  Total Kontribusi = Jumlah skor kontribusi dari 10 item

Langkah 3 — Kalikan dengan 2,5:
  Skor SUS = Total Kontribusi × 2,5

Keterangan:
  - Skor SUS berkisar antara 0 hingga 100
  - Skor SUS dihitung per responden, kemudian dirata-rata

Contoh Perhitungan (1 Responden):
  Item 1 (positif): nilai 4 → kontribusi = 4 - 1 = 3
  Item 2 (negatif): nilai 2 → kontribusi = 5 - 2 = 3
  Item 3 (positif): nilai 5 → kontribusi = 5 - 1 = 4
  Item 4 (negatif): nilai 1 → kontribusi = 5 - 1 = 4
  Item 5 (positif): nilai 4 → kontribusi = 4 - 1 = 3
  Item 6 (negatif): nilai 2 → kontribusi = 5 - 2 = 3
  Item 7 (positif): nilai 4 → kontribusi = 4 - 1 = 3
  Item 8 (negatif): nilai 1 → kontribusi = 5 - 1 = 4
  Item 9 (positif): nilai 4 → kontribusi = 4 - 1 = 3
  Item 10 (negatif): nilai 2 → kontribusi = 5 - 2 = 3

  Total Kontribusi = 3+3+4+4+3+3+3+4+3+3 = 33
  Skor SUS = 33 × 2,5 = 82,5

Rata-rata Skor SUS (jika ada N responden):
  Skor SUS Rata-rata = (Jumlah Skor SUS semua responden) / N
```

### 3.4 Tabel Interpretasi Skor SUS

| Rentang Skor SUS | Grade | Kategori | Adjective |
|:----------------:|:-----:|----------|-----------|
| 90 – 100 | A+ | **Terbaik** | Best Imaginable |
| 80 – 89 | A | **Sangat Baik** | Excellent |
| 70 – 79 | B | **Baik** | Good |
| 60 – 69 | C | **Cukup / Oke** | OK |
| 50 – 59 | D | **Kurang** | Poor |
| < 50 | F | **Tidak Dapat Diterima** | Awful |

> **Referensi:** Bangor, A., Kortum, P., & Miller, J. (2009). Determining what individual SUS scores mean: Adding an adjective rating scale. *Journal of Usability Studies*.

---

## 4. TARGET RESPONDEN

| Parameter | Rencana |
|-----------|---------|
| **Kategori Responden** | Administrator sekolah / Pengguna potensial sistem Jadwale |
| **Jumlah Target Responden** | Minimal **20 responden** (direkomendasikan 20–30 untuk reliabilitas SUS) |
| **Metode Rekrutmen** | Purposive sampling — dipilih berdasarkan relevansi peran sebagai pengguna sistem |
| **Media Penyebaran** | Google Forms (online) |
| **Prosedur** | Responden diberi akses ke sistem Jadwale terlebih dahulu (minimal 5-10 menit eksplorasi), kemudian mengisi kuesioner |

---

## 5. RENCANA PENGUJIAN SUS — TIMELINE

| No. | Kegiatan | Target Tanggal | Penanggung Jawab | Status |
|-----|----------|:--------------:|------------------|--------|
| 1 | Penyusunan draft kuesioner SUS dalam Bahasa Indonesia | ......... | ......... | 🔄 Pending |
| 2 | Review dan validasi kuesioner oleh dosen / rekan | ......... | ......... | 🔄 Pending |
| 3 | Pembuatan Google Form kuesioner | ......... | ......... | 🔄 Pending |
| 4 | Penyebaran kuesioner kepada responden | ......... | ......... | 🔄 Pending |
| 5 | Batas akhir pengumpulan respons kuesioner | ......... | ......... | 🔄 Pending |
| 6 | Pengolahan data: perhitungan skor SUS per responden | ......... | ......... | 🔄 Pending |
| 7 | Analisis dan interpretasi hasil | ......... | ......... | 🔄 Pending |
| 8 | Penulisan laporan Usability | ......... | ......... | 🔄 Pending |

---

## 6. TEMPLATE TABEL DATA HASIL SUS (DISIAPKAN UNTUK DIISI NANTI)

Tabel berikut merupakan template yang akan digunakan untuk memasukkan data respons kuesioner SUS setelah pengujian selesai dilaksanakan.

| Resp. | Item 1 | Item 2 | Item 3 | Item 4 | Item 5 | Item 6 | Item 7 | Item 8 | Item 9 | Item 10 | Skor SUS |
|:-----:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:------:|:-------:|:--------:|
| R-01 | . | . | . | . | . | . | . | . | . | . | . |
| R-02 | . | . | . | . | . | . | . | . | . | . | . |
| R-03 | . | . | . | . | . | . | . | . | . | . | . |
| *(dst...)* | | | | | | | | | | | |
| **Rata-rata** | | | | | | | | | | | **.......**|

---

## 7. CATATAN UNTUK DOSEN PEMBIMBING

Dengan hormat, kami ingin menyampaikan bahwa pengujian aspek **Usability** menggunakan metode **System Usability Scale (SUS)** pada sistem Jadwale saat ini **masih dalam tahap persiapan**. Pengujian ini belum dapat dilaksanakan karena instrumen kuesioner masih dalam proses penyusunan dan belum disebarkan kepada responden.

Kami berkomitmen untuk segera menyelesaikan penyusunan instrumen dan melaksanakan pengujian sesuai timeline yang telah direncanakan. Hasil pengujian Usability akan disertakan dalam laporan final kelompok kami.

Kami mohon pengertian dan bimbingan Bapak/Ibu dosen terkait progress ini.

Hormat kami,
**Kelompok .......**

---

*Dokumen ini berstatus PENDING — Pengujian akan dilaksanakan sesuai timeline yang direncanakan.*

**Dibuat oleh:** Kelompok ......... | **Tanggal:** 26 September 2026

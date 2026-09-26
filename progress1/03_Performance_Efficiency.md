===== FILE 3: 03_Performance_Efficiency.docx =====

---

# PENGUJIAN PERFORMANCE EFFICIENCY
## Sistem Jadwale — Pengujian Berdasarkan ISO/IEC 25010

| | |
|---|---|
| **Karakteristik** | Performance Efficiency |
| **Sub-karakteristik** | Time Behaviour, Resource Utilisation, Capacity |
| **Tanggal Pengujian** | ......... |
| **Penguji** | Salma Faizatul Jannah / Nafisah Sekar Ayu / Talitha Maharani Nashier |
| **Tool Pengujian** | Google Chrome DevTools — Network Tab |
| **Lingkungan** | `http://localhost:3000` / `https://jadwale.vercel.app` |
| **Browser** | Google Chrome (Versi: .......) |

---

## 1. DEFINISI SUB-KARAKTERISTIK

| Sub-karakteristik | Definisi |
|-------------------|----------|
| **Time Behaviour** | Kemampuan sistem memberikan respons dan hasil pemrosesan dalam batas waktu yang dapat diterima |
| **Resource Utilisation** | Jumlah dan jenis sumber daya yang digunakan sistem saat menjalankan fungsinya |
| **Capacity** | Batas parameter sistem yang memenuhi kebutuhan |

> **Fokus Pengujian:** *Time Behaviour* — pengukuran waktu respons (*response time*) menggunakan Chrome DevTools Network Tab.

---

## 2. METODE PENGUKURAN

**Langkah-langkah pengukuran response time:**
1. Buka Google Chrome dan akses URL sistem (localhost/hosting)
2. Tekan `F12` untuk membuka Chrome DevTools
3. Pilih tab **"Network"**
4. Centang opsi **"Disable cache"** untuk memastikan pengukuran yang akurat
5. Lakukan aksi sesuai skenario
6. Catat nilai **"Finish"** atau **"DOMContentLoaded"** / **"Load"** yang muncul di bagian bawah tab Network
7. Ulangi pengukuran sebanyak **3 kali** untuk setiap skenario, ambil rata-rata

---

## 3. TABEL PENGUKURAN RESPONSE TIME

### 3.1 Skenario PE-01: Memuat Halaman Login

| Parameter | Nilai |
|-----------|-------|
| **URL** | `/login` |
| **Deskripsi** | Waktu yang dibutuhkan untuk memuat halaman login secara penuh |
| **Kondisi** | Cache dikosongkan, koneksi normal |

| Pengukuran Ke- | Response Time (ms) | Keterangan |
|:--------------:|:-----------------:|------------|
| 1 | ....... | ....... |
| 2 | ....... | ....... |
| 3 | ....... | ....... |
| **Rata-rata** | **....... ms** | |

[SCREENSHOT: PE-01_response_time_login.png]

---

### 3.2 Skenario PE-02: Memuat Halaman Dashboard (Setelah Login)

| Parameter | Nilai |
|-----------|-------|
| **URL** | `/dashboard` |
| **Deskripsi** | Waktu memuat dashboard utama beserta data awal yang ditampilkan |
| **Kondisi** | Pengguna sudah login, cache dikosongkan |

| Pengukuran Ke- | Response Time (ms) | Keterangan |
|:--------------:|:-----------------:|------------|
| 1 | ....... | ....... |
| 2 | ....... | ....... |
| 3 | ....... | ....... |
| **Rata-rata** | **....... ms** | |

[SCREENSHOT: PE-02_response_time_dashboard.png]

---

### 3.3 Skenario PE-03: Memuat Daftar Data (Guru / Mata Pelajaran / Kelas)

| Parameter | Nilai |
|-----------|-------|
| **URL** | `/guru` atau `/mata-pelajaran` |
| **Deskripsi** | Waktu memuat halaman yang berisi daftar/tabel data dari database |
| **Kondisi** | Data sudah ada di database, cache dikosongkan |

| Pengukuran Ke- | Response Time (ms) | Keterangan |
|:--------------:|:-----------------:|------------|
| 1 | ....... | ....... |
| 2 | ....... | ....... |
| 3 | ....... | ....... |
| **Rata-rata** | **....... ms** | |

[SCREENSHOT: PE-03_response_time_daftar_data.png]

---

### 3.4 Skenario PE-04: Proses Generate Jadwal Otomatis

| Parameter | Nilai |
|-----------|-------|
| **URL** | `/generate` atau tombol generate di halaman jadwal |
| **Deskripsi** | Waktu yang dibutuhkan sistem untuk memproses dan menghasilkan jadwal otomatis |
| **Kondisi** | Data guru, kelas, mapel, dan ruang sudah lengkap diinput |

| Pengukuran Ke- | Response Time (ms) | Keterangan |
|:--------------:|:-----------------:|------------|
| 1 | ....... | ....... |
| 2 | ....... | ....... |
| 3 | ....... | ....... |
| **Rata-rata** | **....... ms** | |

[SCREENSHOT: PE-04_response_time_generate.png]

---

### 3.5 Skenario PE-05: Memuat Halaman Tampilan Jadwal Hasil

| Parameter | Nilai |
|-----------|-------|
| **URL** | `/jadwal` atau halaman hasil generate |
| **Deskripsi** | Waktu memuat tampilan jadwal yang sudah di-generate dalam format tabel |
| **Kondisi** | Jadwal sudah berhasil di-generate sebelumnya |

| Pengukuran Ke- | Response Time (ms) | Keterangan |
|:--------------:|:-----------------:|------------|
| 1 | ....... | ....... |
| 2 | ....... | ....... |
| 3 | ....... | ....... |
| **Rata-rata** | **....... ms** | |

[SCREENSHOT: PE-05_response_time_tampilan_jadwal.png]

---

## 4. REKAP HASIL PENGUKURAN

| Kode | Skenario | Rata-rata Response Time (ms) | Kategori |
|------|----------|:----------------------------:|----------|
| PE-01 | Memuat Halaman Login | ....... ms | ....... |
| PE-02 | Memuat Dashboard | ....... ms | ....... |
| PE-03 | Memuat Daftar Data | ....... ms | ....... |
| PE-04 | Generate Jadwal Otomatis | ....... ms | ....... |
| PE-05 | Memuat Tampilan Jadwal | ....... ms | ....... |
| | **Rata-rata Keseluruhan** | **....... ms** | **.......**  |

---

## 5. RUMUS PERHITUNGAN RATA-RATA

```
Rata-rata Response Time per Skenario:
  RT_avg = (RT1 + RT2 + RT3) / 3

Keterangan:
  RT_avg = Rata-rata response time (ms)
  RT1, RT2, RT3 = Nilai response time pada pengukuran ke-1, ke-2, ke-3

Rata-rata Keseluruhan (seluruh skenario):
  RT_total = (RT_avg_PE01 + RT_avg_PE02 + RT_avg_PE03 + RT_avg_PE04 + RT_avg_PE05) / 5

Contoh:
  Jika RT1=1200ms, RT2=1150ms, RT3=1300ms
  RT_avg = (1200 + 1150 + 1300) / 3 = 3650 / 3 = 1216,67 ms
```

---

## 6. TABEL INTERPRETASI HASIL (STANDAR GOOGLE / NIELSEN)

| Rentang Response Time | Kategori | Deskripsi |
|-----------------------|----------|-----------|
| **< 1000 ms (< 1 detik)** | **Sangat Baik** | Pengguna merasa sistem merespons secara instan |
| **1000 – 2000 ms (1–2 detik)** | **Baik** | Pengguna masih merasa nyaman, tidak ada gangguan signifikan |
| **2000 – 4000 ms (2–4 detik)** | **Cukup** | Pengguna mulai merasakan keterlambatan, perlu optimasi |
| **4000 – 8000 ms (4–8 detik)** | **Kurang** | Pengguna merasa frustrasi, kemungkinan meninggalkan halaman |
| **> 8000 ms (> 8 detik)** | **Sangat Kurang** | Pengalaman pengguna sangat buruk, perlu perbaikan mendesak |

> **Referensi:** Google PageSpeed Insights & Nielsen Norman Group Response Time Guidelines

**Hasil Sistem Jadwale:**
- Rata-rata Response Time: ....... ms
- Kategori: **.......**

---

## 7. CATATAN PENGUJIAN

| Aspek | Catatan |
|-------|---------|
| **Kondisi Jaringan** | ....... (WiFi/LAN/Hotspot, kecepatan: ........ Mbps) |
| **Beban Server** | Pengujian dilakukan saat server dalam kondisi ....... (idle/aktif) |
| **Jumlah Data** | Database berisi ±....... record saat pengujian |
| **Temuan Khusus** | ....... |

---

## 8. ANALISIS DAN KESIMPULAN (DIISI SETELAH PENGUJIAN)

**Temuan Utama:**
- .......

**Skenario dengan Performa Terbaik:**
- .......

**Skenario dengan Performa Paling Lambat:**
- .......

**Rekomendasi:**
- .......

**Kesimpulan:**
Berdasarkan pengujian Performance Efficiency, sistem Jadwale memperoleh rata-rata *response time* sebesar ....... ms yang termasuk dalam kategori "......." Hal ini menunjukkan bahwa sistem ......... dalam hal kecepatan respons terhadap permintaan pengguna.

---

## 9. DAFTAR SCREENSHOT YANG DIBUTUHKAN

| No. | Nama File | Keterangan |
|-----|-----------|------------|
| 1 | `PE-01_response_time_login.png` | DevTools Network tab saat memuat halaman login |
| 2 | `PE-02_response_time_dashboard.png` | DevTools Network tab saat memuat dashboard |
| 3 | `PE-03_response_time_daftar_data.png` | DevTools Network tab saat memuat daftar data |
| 4 | `PE-04_response_time_generate.png` | DevTools Network tab saat proses generate jadwal |
| 5 | `PE-05_response_time_tampilan_jadwal.png` | DevTools Network tab saat memuat tampilan jadwal |

---

*Dokumen ini berstatus PROGRESS — Data pengujian sedang dalam proses pengisian.*

**Dibuat oleh:** Kelompok ......... | **Tanggal:** 26 September 2026

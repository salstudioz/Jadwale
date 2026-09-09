# 🧪 DOKUMEN TESTING TERINTEGRASI - JADWALE v3.1

**Versi Dokumen:** 1.0  
**Tanggal:** 23 Juni 2026  
**Tujuan:** Menjamin seluruh fungsionalitas aplikasi berjalan sesuai spesifikasi untuk seluruh skenario pengguna (Tanpa Login, Login, dan Admin) sebelum diluncurkan ke produksi.

---

## A. LINGKUP & STRATEGI TESTING

### A.1 Lingkungan Testing
| Lingkungan | URL | Tujuan |
|------------|-----|--------|
| **Development** | `http://localhost:3000` | Testing internal developer, unit test, integrasi awal. |
| **Staging** | `https://staging.jadwale.id` | UAT (User Acceptance Test) dengan data dummy, mencakup seluruh skenario. |
| **Production** | `https://jadwale.id` | Sanity check setelah deployment; hanya menjalankan smoke test. |

### A.2 Perangkat yang Digunakan untuk Testing (Responsif)
- **Desktop**: Chrome (1920x1080), Firefox, Safari.
- **Tablet**: iPad Pro (1024x1366).
- **Mobile**: iPhone 12 (390x844), Android Samsung (360x800).

### A.3 Data Dummy untuk Testing
- **Sekolah A (SDN 01)**: Non-Paralel, 6 tingkatan, masing-masing 1 kelas.
- **Sekolah B (SDN 02)**: Paralel, 6 tingkatan, masing-masing 3 kelas (1A,1B,1C).
- **Guru Dummy**: 20 guru (termasuk 5 guru honorer dengan jadwal terbatas).
- **Mapel Dummy**: 9 mapel wajib + 2 mapel muatan lokal.

---

## B. TESTING UNTUK PENGGUNA TANPA LOGIN (GUEST / NON-AUTH)

### B.1 Skenario 1: Akses Halaman Awal & Wizard
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TG-01** | Membuka aplikasi tanpa login | 1. Buka `https://jadwale.id/localhost` | Halaman landing/wizard Step 1 muncul tanpa meminta login. |
| **TG-02** | Mengisi Step 1 (Konfigurasi Sekolah) | 1. Pilih "Paralel" atau "Non". <br>2. Pilih jumlah kelas & penamaan (Alfabet/Angka). | Data tersimpan di localStorage. Jika refresh halaman, data tetap ada. |
| **TG-03** | Mengisi Step 2 (Jam & Istirahat) | 1. Ubah durasi JP, istirahat, dan upacara. | Perubahan langsung tersimpan di localStorage. |
| **TG-04** | Mengisi Step 3 (Master Data) | 1. Tambahkan mapel "Bahasa Jawa". <br>2. Tambahkan guru "Budi". | Data baru muncul di daftar. LocalStorage terupdate. |
| **TG-05** | Mengisi Step 4 (Relasi) | 1. Assign Wali Kelas. <br>2. Pilih Mapel yang diampu guru (checklist kelas). | Relasi tersimpan di localStorage. |
| **TG-06** | Mengakses Step 5 (Generate) | 1. Klik tombol "Buat Jadwal". | Muncul toast peringatan: *"Silakan login terlebih dahulu untuk menyimpan dan menggenerate jadwal."* Tombol generate tidak aktif (disabled). |

### B.2 Skenario 2: Akses Link Share Publik (Read-Only)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TG-07** | Membuka link share publik | 1. Admin/User membuat link share dengan permission `read`. <br>2. Salin link. <br>3. Buka link di tab incognito (tanpa login). | Halaman jadwal tampil lengkap dengan tabel dan rekap guru. |
| **TG-08** | Interaksi pada halaman publik | 1. Coba klik tombol "Edit" atau "Buat Ulang". | Tombol tersebut tidak ada atau disembunyikan. |
| **TG-09** | Download PDF/Excel dari link publik | 1. Klik tombol "Download PDF". <br>2. Klik "Download Excel". | File PDF/Excel berhasil terunduh dengan template default. |
| **TG-10** | Pemilihan template di link publik | 1. Pilih template yang tersedia. | Hanya 1 template default (gratis) yang tersedia. Template premium tidak muncul. |

### B.3 Skenario 3: Auto-Save & State Management
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TG-11** | Refresh browser setelah mengisi data | 1. Isi Step 1-4. <br>2. Refresh halaman (F5). | Data yang diisi sebelumnya tetap ada (tidak hilang). |
| **TG-12** | Clear browser cache | 1. Buka DevTools → Application → Clear Storage. <br>2. Refresh halaman. | Data hilang, semua field kembali ke default (kosong). |

---

## C. TESTING UNTUK PENGGUNA LOGIN (USER AUTHENTICATED)

### C.1 Skenario 4: Autentikasi & State Hydration
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-01** | Login dengan kredensial benar | 1. Klik tombol "Login". <br>2. Masukkan email & password. | Berhasil login, diarahkan ke dashboard. JWT tersimpan di cookie/httpOnly. |
| **TC-02** | Login dengan kredensial salah | 1. Masukkan password salah. | Muncul toast error: *"Email atau password salah."* |
| **TC-03** | State Hydration (Data lokal vs server) | 1. Isi data wizard tanpa login (di localStorage). <br>2. Login. | Muncul toast: *"Data sementara ditemukan. Gunakan data ini?"* dengan tombol [Gunakan] dan [Lewati]. |
| **TC-04** | Pilih [Gunakan] pada Hydration | 1. Klik tombol [Gunakan]. | Data dikirim ke server, tersimpan di database. LocalStorage dihapus. |
| **TC-05** | Pilih [Lewati] pada Hydration | 1. Klik tombol [Lewati]. | LocalStorage dihapus, user memulai wizard dari awal (kosong). |

### C.2 Skenario 5: Wizard Lengkap (Step 1-4) - Master Data & Relasi
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-06** | Step 1 - Konfigurasi Paralel & Penamaan | 1. Pilih "Paralel" → jumlah kelas per tingkatan = 3. <br>2. Pilih penamaan "Alfabet". | Sistem otomatis membuat kelas 1A, 1B, 1C, 2A, 2B, 2C, dst. |
| **TC-07** | Step 1 - Penamaan Angka | 1. Pilih "Angka". | Sistem membuat kelas 1-1, 1-2, 1-3, 2-1, dst. |
| **TC-08** | Step 2 - Setting JP & Istirahat (Default Kemendikbud) | 1. Biarkan default (JP 35 menit, istirahat 1=JP3, istirahat 2=JP5). | Tabel JP per hari otomatis terisi (Kelas 1-2: 4 JP, Kelas 3-6: 6 JP). |
| **TC-09** | Step 2 - Kustom Istirahat | 1. Ubah istirahat 1 menjadi JP4, durasi 20 menit. | Konfigurasi tersimpan. Algoritma akan menerapkan aturan baru. |
| **TC-10** | Step 2 - Upacara Senin | 1. Nonaktifkan checkbox "Ada Upacara". | JP 1 di hari Senin tidak terblokir untuk upacara. |
| **TC-11** | Step 3 - Tambah Mapel | 1. Klik "Tambah Mapel" → isi "Bahasa Daerah". <br>2. Centang "Pagi" (prioritas). | Mapel baru muncul di daftar. Toggle prioritas berfungsi. |
| **TC-12** | Step 3 - Hapus Mapel (Soft Delete) | 1. Klik tombol hapus (🗑️) pada mapel "Bahasa Daerah". | Mapel hilang dari daftar. Di database, `deleted_at` terisi timestamp. |
| **TC-13** | Step 3 - Tambah Guru | 1. Klik "Tambah Guru" → isi nama "Siti" dan NIP "197001011990012001". | Guru muncul di daftar. |
| **TC-14** | Step 3 - Hapus Guru (Soft Delete) | 1. Hapus guru "Siti". | Guru hilang dari daftar, tetapi `deleted_at` terisi di database. |
| **TC-15** | Step 4 - Assign Wali Kelas | 1. Dropdown "Wali Kelas" → pilih "Budi" untuk kelas 1A. | Relasi tersimpan di tabel `wali_kelas`. |
| **TC-16** | Step 4 - Assign Guru Mengajar (Pengampu) | 1. Pilih Guru "Budi" → Role "GM" → Mapel "Matematika". <br>2. Checklist kelas "1A", "1B". | Relasi tersimpan. Guru Budi mengajar Matematika di 1A dan 1B. |
| **TC-17** | Step 4 - Fitur "Pilih Semua" per Tingkatan | 1. Klik tombol "Pilih Semua 1" di baris guru. | Semua kelas di tingkatan 1 (1A,1B,1C) tercentang otomatis. |
| **TC-18** | Step 4 - Input Teacher Availability (Guru Honorer) | 1. Buka modal "Jadwal Kehadiran" untuk guru "Agus". <br>2. Pilih hari Senin, jam 07:00-12:00. | Data tersimpan di tabel `guru_availability`. |

### C.3 Skenario 6: Generate Jadwal (Proses & Progress)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-19** | Trigger Generate (Berhasil) | 1. Di Step 5, klik "Buat Jadwal". | Muncul toast loading: *"Memproses jadwal..."* Job ID dikembalikan. |
| **TC-20** | Progress Bar & WebSocket | 1. Amati progress bar di UI. | Progress berjalan dari 0-100% dengan pesan dinamis (ex: "Memproses kelas 3A..."). |
| **TC-21** | Generate Selesai (Sukses) | 1. Tunggu hingga progress 100%. | Muncul toast success: *"Jadwal berhasil dibuat!"* Hasil jadwal tampil di Bento Grid. |
| **TC-22** | Generate Gagal (Timeout) | 1. Gunakan data ekstrim (30 kelas, 40 guru). <br>2. Klik "Buat Jadwal". | Setelah 30 detik, muncul toast error: *"Tidak ditemukan solusi. Coba kurangi JP atau tambah hari."* |
| **TC-23** | Generate Gagal (No Solution) | 1. Buat skenario impossible (misal: 1 guru mengajar 10 mapel di 30 kelas). | Algoritma mengembalikan null. Toast error muncul. Log tersimpan di `history`. |
| **TC-24** | Generate Duplicate (Concurrent) | 1. Klik generate 2 kali berturut-turut. | Request kedua ditolak dengan error: *"Generate sedang berjalan."* |

### C.4 Skenario 7: Hasil Jadwal & Dashboard (Bento Grid)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-25** | Tampilan Jadwal Utama (Tabel) | 1. Lihat tabel jadwal. | Tabel menampilkan JP 1..N, hari Senin-Jumat, waktu mulai-selesai, mapel, dan guru. |
| **TC-26** | Warna Mapel | 1. Cek warna latar belakang sel mapel. | Mapel prioritas (Matematika) berwarna Pastel Blue. Mapel non-prioritas berwarna Pastel Green. |
| **TC-27** | Tampilan Istirahat & Upacara | 1. Lihat baris JP yang merupakan istirahat. | Baris tersebut bertuliskan "☕ Istirahat" dengan background Yellow 100. JP 1 Senin bertuliskan "🎌 Upacara". |
| **TC-28** | Ringkasan Beban Mengajar Guru | 1. Scroll ke bagian bawah. | Tabel rekap menampilkan nama guru, total JP/minggu, dan detail (mapel di kelas apa). |
| **TC-29** | Switch Kelas | 1. Klik dropdown pilih kelas "1B". | Tabel jadwal berubah menampilkan kelas 1B. |
| **TC-30** | Tampilan Jadwal Kode | 1. Klik tab "🔢 Kode". | Tabel menampilkan MP001/GR001 (bukan nama). Legend muncul di bawah. |

### C.5 Skenario 8: Template Hias
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-31** | Pilih Template Free (Default) | 1. Di bagian "Pilih Template", pilih template default. | Tabel berubah gaya (CSS) sesuai template. |
| **TC-32** | Pilih Template Premium | 1. Pilih template premium "Biru Langit". | Tabel berubah gaya. Warna header menjadi gradasi biru-ungu. |
| **TC-33** | Preview Template | 1. Hover ke thumbnail template. | Muncul preview kecil (tooltip) atau modal popup. |

### C.6 Skenario 9: Ekspor PDF & Excel
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-34** | Ekspor PDF | 1. Klik tombol "Download PDF". | Browser mengunduh file PDF. PDF terbuka dengan format A4 Landscape, CSS template teraplikasi. |
| **TC-35** | Ekspor PDF (Serverless) | 1. Pantau log serverless function. | Fungsi berhasil dipanggil. Tidak ada error OOM (Out of Memory). |
| **TC-36** | Ekspor Excel | 1. Klik tombol "Download Excel". | Browser mengunduh file .xlsx. Excel memiliki 1 sheet per kelas + sheet rekap. |
| **TC-37** | Ekspor PDF dengan Template Premium | 1. Pilih template premium, lalu download PDF. | PDF menggunakan CSS template premium. |

### C.7 Skenario 10: Fitur Share (Buat & Akses Link)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-38** | Buat Link Share (Read) | 1. Klik "Bagikan" → pilih permission "Read". <br>2. Klik "Buat Link". | Muncul URL unik (contoh: `/shared/abcd-1234`). |
| **TC-39** | Buat Link Share (Edit) | 1. Pilih permission "Edit". <br>2. Pilih user yang diizinkan (dropdown). | Link dibuat. Hanya user tersebut yang bisa edit. |
| **TC-40** | Akses Link Read (Public) | 1. Buka link di incognito. | Tampilan read-only (tombol edit hilang). |
| **TC-41** | Akses Link Edit (User yang diizinkan) | 1. Login sebagai user yang diizinkan. <br>2. Buka link. | Tombol "Edit" dan "Buat Ulang" muncul. |
| **TC-42** | Akses Link Edit (User tidak diizinkan) | 1. Login sebagai user lain. <br>2. Buka link. | Muncul error 403: *"Akses edit tidak diizinkan."* |
| **TC-43** | Link Expired | 1. Tunggu hingga `expires_at` terlewati. <br>2. Buka link. | Muncul error: *"Link sudah kadaluarsa."* |
| **TC-44** | View Count pada Link | 1. Buka link 3 kali. | Di database, `view_count` bertambah menjadi 3. |

### C.8 Skenario 11: Manajemen Data Master (CRUD & Soft Delete)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-45** | Update Data Guru | 1. Edit nama guru "Budi" menjadi "Budi Santoso". | Nama berubah di daftar dan di database. |
| **TC-46** | Soft Delete Guru & Verifikasi History | 1. Hapus guru "Budi". <br>2. Lihat jadwal historis yang menggunakan guru "Budi". | Guru "Budi" hilang dari daftar. Tabel `jadwal` tetap memiliki data dengan `id_guru` Budi (tidak hilang karena RESTRICT). |
| **TC-47** | Restore Data (Soft Delete) | 1. Admin membuka menu "Data Terhapus". <br>2. Klik "Restore" pada guru "Budi". | `deleted_at` menjadi NULL. Guru muncul kembali di daftar. |
| **TC-48** | Hapus Kelas yang Masih Memiliki Jadwal | 1. Coba hapus kelas "1A" yang sudah memiliki jadwal. | Muncul error: *"Tidak dapat menghapus kelas karena masih memiliki jadwal."* (karena RESTRICT). |

### C.9 Skenario 12: Teacher Availability (Guru Honorer)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-49** | Generate dengan Guru Honorer | 1. Set guru "Agus" hanya tersedia Senin & Kamis. <br>2. Generate jadwal. | Guru "Agus" tidak dijadwalkan di Selasa, Rabu, atau Jumat. |
| **TC-50** | Guru Honorer Tanpa Availability | 1. Hapus availability guru "Agus". <br>2. Generate ulang. | Guru "Agus" bisa dijadwalkan di hari apa saja (default). |

### C.10 Skenario 13: Rate Limiting
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TC-51** | Rate Limit Generate | 1. Klik "Buat Jadwal" 6 kali dalam 1 menit. | Pada request ke-6, muncul error 429: *"Too Many Requests. Silakan tunggu."* |
| **TC-52** | Rate Limit Export PDF | 1. Klik "Download PDF" 6 kali dalam 1 menit. | Request ke-6 ditolak dengan error 429. |

---

## D. TESTING UNTUK ADMIN (ROLE is_admin = true)

### D.1 Skenario 14: Akses Admin Console & Dashboard
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TA-01** | Login sebagai Admin | 1. Login dengan user yang memiliki `is_admin = true`. | Menu "Admin Console" muncul di sidebar/hamburger. |
| **TA-02** | Login sebagai User Biasa | 1. Login dengan user biasa (`is_admin = false`). | Menu "Admin Console" tidak muncul. |
| **TA-03** | Akses langsung URL Admin | 1. User biasa mencoba akses `/api/admin/users`. | Ditolak dengan error 403 Forbidden. |
| **TA-04** | Dashboard Admin | 1. Buka Admin Console → Dashboard. | Menampilkan statistik: Total User, Total Generate, Total Sekolah, Aktivitas Terbaru. |
| **TA-05** | Dashboard - Grafik Aktivitas | 1. Lihat grafik generate per hari. | Grafik muncul dengan data real. |

### D.2 Skenario 15: Manajemen User
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TA-06** | Lihat Semua User (Lintas Sekolah) | 1. Buka menu "Manajemen User". | Tabel menampilkan semua user dari semua sekolah. |
| **TA-07** | Nonaktifkan User | 1. Klik tombol "Toggle" pada user "Siti". | Status berubah menjadi "Nonaktif". User tidak bisa login. |
| **TA-08** | Aktifkan Kembali User | 1. Klik "Toggle" lagi. | Status kembali "Aktif". |
| **TA-09** | Hapus User (Soft Delete) | 1. Klik tombol "Hapus" pada user "Budi". | User hilang dari daftar. `deleted_at` terisi di database. |
| **TA-10** | Cari User | 1. Ketik "Siti" di kolom pencarian. | Tabel hanya menampilkan user "Siti". |

### D.3 Skenario 16: Manajemen Template (Premium)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TA-11** | Tambah Template Baru | 1. Buka "Manajemen Template". <br>2. Klik "Tambah". <br>3. Isi nama, upload thumbnail, tulis CSS. | Template baru muncul di daftar. |
| **TA-12** | Edit Template | 1. Klik tombol "Edit" pada template. <br>2. Ubah CSS. | CSS terupdate. |
| **TA-13** | Jadikan Template Premium | 1. Klik tombol "Jadikan Premium". | Status berubah menjadi "⭐ Premium". |
| **TA-14** | Jadikan Template Free | 1. Klik "Jadikan Free". | Status berubah menjadi "Free". |
| **TA-15** | Hapus Template | 1. Klik tombol "Hapus". | Template terhapus dari daftar. |
| **TA-16** | Preview Template di Admin | 1. Klik tombol "Preview". | Muncul popup menampilkan contoh tabel dengan template tersebut. |

### D.4 Skenario 17: Log Aktivitas Admin
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TA-17** | Lihat Admin Logs | 1. Buka menu "Log Aktivitas". | Tabel menampilkan waktu, admin user, aksi, target, dan detail JSON. |
| **TA-18** | Filter Log Berdasarkan Aksi | 1. Pilih filter "DELETE" pada dropdown. | Hanya log dengan aksi DELETE yang muncul. |
| **TA-19** | Ekspor Log Admin | 1. Klik tombol "Ekspor CSV". | File CSV terunduh berisi semua log. |

### D.5 Skenario 18: Manajemen Sistem & Cache
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TA-20** | Clear Cache Redis | 1. Buka menu "Pengaturan Sistem". <br>2. Klik tombol "Clear Cache". | Muncul toast: *"Cache berhasil dibersihkan."* |
| **TA-21** | Aktifkan Maintenance Mode | 1. Centang checkbox "Maintenance Mode". <br>2. Klik "Simpan". | User biasa yang mengakses halaman mendapat pesan maintenance. Admin tetap bisa akses. |
| **TA-22** | Nonaktifkan Maintenance Mode | 1. Uncheck checkbox. <br>2. Klik "Simpan". | Akses normal kembali. |
| **TA-23** | Ubah Batas Generate Paralel | 1. Ubah nilai "Maksimal Generate Paralel" dari 2 menjadi 5. <br>2. Simpan. | Worker hanya menjalankan maksimal 5 job paralel. |

---

## E. TESTING SISTEM & NON-FUNGSIONAL (LINTAS SKENARIO)

### E.1 Skenario 19: Responsif & Mobile
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TS-01** | Mobile - Bottom Navigation | 1. Buka di HP (360x800). | Bottom nav muncul dengan 5 menu (Beranda, Jadwal, Guru, Mapel, Pengaturan). |
| **TS-02** | Mobile - Wizard Sticky Buttons | 1. Scroll ke bawah pada wizard. | Tombol "Kembali" dan "Lanjut" tetap menempel di bawah layar. |
| **TS-03** | Mobile - Tabel Jadwal (Card View) | 1. Buka hasil jadwal di HP. | Tabel berubah menjadi Card per Hari (tidak ada scroll horizontal). |
| **TS-04** | Mobile - Hamburger Menu | 1. Klik ikon hamburger (☰) di kanan atas. | Menu dropdown muncul (Profil, Template, Bagikan, Logout). |
| **TS-05** | Tablet - Layout | 1. Buka di iPad (1024x1366). | Layout menyesuaikan (tabel penuh, tidak ada bottom nav). |
| **TS-06** | Desktop - Layout | 1. Buka di 1920x1080. | Semua komponen terlihat rapi, Bento Grid proporsional. |

### E.2 Skenario 20: Keamanan & Isolasi Data
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TS-07** | Isolasi Data Multi-Tenant | 1. Login sebagai User Sekolah A. <br>2. Coba akses endpoint `/api/guru` dengan memodifikasi ID. | Hanya data Sekolah A yang muncul. |
| **TS-08** | Isolasi WebSocket | 1. User Sekolah A generate jadwal (jobId: X). <br>2. User Sekolah B mencoba join room yang sama. | User B tidak bisa menerima update progress. |
| **TS-09** | JWT Expired | 1. Tunggu hingga JWT expired (misal 24 jam). <br>2. Refresh halaman. | Redirect ke halaman login. |
| **TS-10** | Brute Force Login | 1. Coba login 10 kali dengan password salah. | Akun terkunci sementara (captcha atau delay). |

### E.3 Skenario 21: Performa & Stress Test
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TS-11** | Generate 30 Kelas (Ekstrim) | 1. Siapkan sekolah dengan 30 kelas. <br>2. Generate jadwal. | Proses selesai dalam < 60 detik. |
| **TS-12** | PDF Serverless - 50 Request Serentak | 1. Kirim 50 request PDF secara paralel (menggunakan Postman). | Tidak ada request yang gagal (timeout). Serverless function skalabel. |
| **TS-13** | BullMQ - Antrian panjang | 1. Kirim 10 job generate sekaligus. | Job masuk antrian. Worker memproses 2 job paralel (sesuai concurrency). |
| **TS-14** | Database Query Performance | 1. Generate jadwal dengan 30 kelas. <br>2. Pantau query log MySQL. | Query menggunakan indeks (tidak ada full table scan). |

### E.4 Skenario 22: Notifikasi & UX (Gaptek)
| ID | Skenario | Langkah | Hasil yang Diharapkan |
|----|----------|---------|----------------------|
| **TS-15** | Toast Notification (Bukan Alert) | 1. Lakukan aksi error (misal login gagal). | Muncul toast di pojok kanan atas. Tidak ada popup `alert()`. |
| **TS-16** | Tooltip Bantuan | 1. Arahkan mouse ke ikon (?) di samping label "Prioritas". | Muncul tooltip: *"Mapel Pagi = diletakkan sebelum istirahat 1."* |
| **TS-17** | Validasi Input Langsung | 1. Isi JP dengan angka 0. | Field berubah border merah. Muncul pesan: *"JP minimal 1."* |
| **TS-18** | Bahasa Sederhana | 1. Cek seluruh label di UI. | Tidak ada istilah "Constraint", "MRV", "LCV". Diganti "Jam Pelajaran", "Mapel Pagi". |

---

## F. MATRIKS KELULUSAN (PASS/FAIL CRITERIA)

| Kategori | Jumlah Test Case | Minimal Pass |
|----------|------------------|--------------|
| **Guest (Tanpa Login)** | 12 | 12/12 (100%) |
| **User Login** | 52 | 50/52 (96%) |
| **Admin** | 23 | 23/23 (100%) |
| **Sistem & Non-Fungsional** | 18 | 17/18 (94%) |
| **TOTAL** | **105** | **102/105 (97%)** |

Jika terdapat lebih dari 3 test case yang gagal di tahap Staging, maka **tidak boleh melanjutkan ke Production** sebelum semua bug diperbaiki dan regression test dilakukan.

---

## G. LAPORAN BUG & TEMPLATE PELAPORAN

Setiap bug yang ditemukan harus dilaporkan dengan format:

```
**ID Bug**: BUG-XXX
**Skenario**: TC-XX
**Judul**: [Singkat dan jelas]
**Langkah Reproduksi**:
1. ...
2. ...
**Hasil Aktual**: ...
**Hasil yang Diharapkan**: ...
**Screenshot**: [Lampirkan]
**Lingkungan**: (Staging/Production, Browser, OS)
**Severity**: (Critical/High/Medium/Low)
**Assignee**: [Nama Developer]
```

---

**Dokumen Testing ini mencakup 105 test case yang menjangkau seluruh fitur aplikasi Jadwale v3.1.** Tim QA harus menjalankan seluruh skenario di lingkungan Staging sebelum memberikan rekomendasi Go-Live ke Production.
================================================================================
           DOKUMEN PROGRESS PENGOLAHAN DATA PENGUJIAN
           SISTEM "JADWALE" — GENERATOR JADWAL PELAJARAN SEKOLAH OTOMATIS
           Berdasarkan Standar ISO/IEC 25010
================================================================================

PENTING: Dokumen ini adalah LAPORAN PROGRESS, bukan laporan final.
         Pengujian masih berlangsung. Usability belum selesai dilaksanakan.

--------------------------------------------------------------------------------
INFORMASI KELOMPOK
--------------------------------------------------------------------------------

Mata Kuliah    : Uji Kualitas Perangkat Lunak
Tema           : Pengujian Kualitas dan Kelayakan Sistem Generator Jadwal
                 Pelajaran Sekolah Otomatis "Jadwale" Berdasarkan Standar
                 ISO/IEC 25010
Sistem yang Diuji : Jadwale (https://github.com/salstudioz/Jadwale)
Tanggal Penyusunan : ..............................

Anggota Kelompok:
  1. Salma Faizatul Jannah    — H1D024066
  2. Nafisah Sekar Ayu        — H1D024087
  3. Talitha Maharani Nashier — H1D024098

--------------------------------------------------------------------------------
DAFTAR ISI / STRUKTUR FILE ZIP
--------------------------------------------------------------------------------

  Jadwale_Progress/
  │
  ├── README.txt                                 ← File ini
  │
  ├── 01_Cover_dan_Pendahuluan.docx              ← Cover, latar belakang,
  │                                                 tujuan, ruang lingkup,
  │                                                 metode, tools
  │
  ├── 02_Matriks_Functional_Suitability.docx     ← Matriks 10 indikator FS,
  │                                                 rumus, interpretasi
  │
  ├── 03_Performance_Efficiency.docx             ← Tabel 5 skenario response
  │                                                 time, rumus rata-rata
  │
  ├── 04_Reliability.docx                        ← Tabel 5 skenario error
  │                                                 handling, rumus reliability
  │
  ├── 05_Catatan_Usability_Pending.docx          ← Penjelasan status pending,
  │                                                 draf kuesioner SUS,
  │                                                 rumus SUS, timeline
  │
  ├── 06_Ringkasan_Progress_dan_Rencana.docx     ← Status 8 karakteristik
  │                                                 ISO 25010, kesimpulan,
  │                                                 rencana tindak lanjut,
  │                                                 kalimat untuk dosen
  │
  └── README.txt                                 ← Dokumen ini

  (Opsional — tambahkan folder ini setelah screenshot diambil):
  screenshots/
  ├── functional/     → Simpan screenshot FS_01_FS-01.png s/d FS_10_FS-10.png
  ├── performance/    → Simpan screenshot PE_01_PE-01_DevTools.png s/d PE_05_...
  └── reliability/    → Simpan screenshot RE_01_RE-01_result.png s/d RE_05_...

--------------------------------------------------------------------------------
STATUS PENGUJIAN
--------------------------------------------------------------------------------

  [✔] SELESAI   : Functional Suitability  (Dokumen 02)
  [✔] SELESAI   : Performance Efficiency  (Dokumen 03)
  [✔] SELESAI   : Reliability             (Dokumen 04)
  [⏳] PENDING  : Usability (SUS)         (Dokumen 05 — rencana terlampir)
  [—]  Tidak Diuji: Security, Compatibility, Maintainability, Portability

  Progress keseluruhan (dari karakteristik yang direncanakan): 75%

--------------------------------------------------------------------------------
PANDUAN PENGISIAN PLACEHOLDER
--------------------------------------------------------------------------------

  Seluruh kolom yang berisi "......" adalah PLACEHOLDER yang harus diisi
  dengan data pengujian nyata. Cara pengisian:

  1. Buka setiap file .docx dengan Microsoft Word atau LibreOffice Writer
  2. Cari teks "......" dan ganti dengan data pengujian yang sebenarnya
  3. Untuk placeholder screenshot [SCREENSHOT: nama_file.png], ganti dengan
     gambar aktual menggunakan Insert > Picture di Word
  4. Setelah semua data terisi, simpan ulang file dengan nama yang sama
  5. Kumpulkan semua file beserta folder screenshots/ ke dalam satu ZIP baru

--------------------------------------------------------------------------------
STANDAR PENAMAAN SCREENSHOT
--------------------------------------------------------------------------------

  Functional Suitability : FS_01_FS-01.png, FS_02_FS-02.png, ..., FS_10_FS-10.png
  Performance Efficiency  : PE_01_PE-01_DevTools.png, ..., PE_05_PE-05_DevTools.png
  Reliability             : RE_01_RE-01_result.png, ..., RE_05_RE-05_result.png

--------------------------------------------------------------------------------
CATATAN PENTING
--------------------------------------------------------------------------------

  * Dokumen ini BUKAN laporan final. Laporan final akan disusun setelah
    pengujian Usability (SUS) selesai dilaksanakan.

  * Nomor kelompok pada Dokumen 06 (bagian "Kalimat untuk Dosen") perlu
    diisi sesuai nomor kelompok yang ditetapkan dosen.

  * URL hosting sistem Jadwale (selain localhost:3000) perlu dilengkapi
    di seluruh dokumen yang mencantumkan placeholder "........."

  * Target responden kuesioner SUS: minimal 20 orang dari kalangan yang
    relevan (guru, staf TU, atau pengguna potensial sistem penjadwalan).

================================================================================
                     DIBUAT OLEH: KELOMPOK [NOMOR KELOMPOK]
                     MATA KULIAH UJI KUALITAS PERANGKAT LUNAK
================================================================================

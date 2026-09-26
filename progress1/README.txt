===== FILE 7: README.txt =====

================================================================================
                    README — PROGRESS PENGOLAHAN DATA
           Pengujian Kualitas Sistem "Jadwale" (ISO/IEC 25010)
================================================================================

MATA KULIAH  : Uji Kualitas Perangkat Lunak
TANGGAL      : 26 September 2026
STATUS       : PROGRESS (BUKAN LAPORAN FINAL)

================================================================================
                          ANGGOTA KELOMPOK
================================================================================

No. | Nama                          | NIM
----|-------------------------------|------------
 1  | Salma Faizatul Jannah         | H1D024066
 2  | Nafisah Sekar Ayu             | H1D024087
 3  | Talitha Maharani Nashier      | H1D024098

================================================================================
                      TEMA PENGUJIAN
================================================================================

"Pengujian Kualitas dan Kelayakan Sistem Generator Jadwal Pelajaran
Sekolah Otomatis 'Jadwale' Berdasarkan Standar ISO/IEC 25010"

Repositori GitHub: https://github.com/salstudioz/Jadwale
Standar Acuan    : ISO/IEC 25010 (Product Quality Model)

================================================================================
                       DAFTAR ISI ZIP / FOLDER
================================================================================

Folder: progress1/
│
├── 01_Cover_dan_Pendahuluan.md
│     Isi: Cover, latar belakang, tujuan, ruang lingkup, metode, dan tools
│           pengujian. Dokumen utama/pembuka laporan progress ini.
│
├── 02_Matriks_Functional_Suitability.md
│     Isi: Matriks evaluasi Functional Suitability dengan 10 indikator
│          (FS-01 s/d FS-10), rumus perhitungan persentase, dan tabel
│          interpretasi hasil. [Status: Data pengujian sudah dikumpulkan]
│
├── 03_Performance_Efficiency.md
│     Isi: Tabel pengukuran response time untuk 5 skenario pengujian
│          (PE-01 s/d PE-05) menggunakan Chrome DevTools, rumus rata-rata,
│          dan tabel interpretasi hasil. [Status: Data pengujian sudah dikumpulkan]
│
├── 04_Reliability.md
│     Isi: Tabel pengujian error handling untuk 5 skenario (RL-01 s/d RL-05),
│          rumus perhitungan persentase Reliability, dan interpretasi hasil.
│          [Status: Data pengujian sudah dikumpulkan]
│
├── 05_Catatan_Usability_Pending.md
│     Isi: Penjelasan status PENDING pengujian Usability, metode SUS yang
│          direncanakan, 10 item kuesioner, rumus skor SUS, target responden,
│          dan timeline rencana. [Status: PENDING - instrumen belum disusun]
│
├── 06_Ringkasan_Progress_dan_Rencana.md
│     Isi: Tabel status semua karakteristik ISO 25010, ringkasan hasil
│          pengujian, kesimpulan progress, rencana tindak lanjut, dan
│          kalimat penjelasan untuk dosen. [Status: Progress keseluruhan]
│
└── README.txt
      Isi: Dokumen panduan ini.

================================================================================
                   FOLDER SCREENSHOT (DISIAPKAN TERPISAH)
================================================================================

Buat folder "screenshots/" di dalam ZIP untuk menyimpan screenshot bukti
pengujian dengan penamaan sebagai berikut:

screenshots/
│
├── Functional Suitability/
│     FS-01_login_berhasil.png
│     FS-02_dashboard.png
│     FS-03_tambah_guru.png
│     FS-04_mata_pelajaran.png
│     FS-05_kelola_kelas.png
│     FS-06_kelola_ruang.png
│     FS-07_generate_jadwal.png
│     FS-08_cek_konflik.png
│     FS-09_tampilan_jadwal.png
│     FS-10_ekspor_jadwal.png
│
├── Performance Efficiency/
│     PE-01_response_time_login.png
│     PE-02_response_time_dashboard.png
│     PE-03_response_time_daftar_data.png
│     PE-04_response_time_generate.png
│     PE-05_response_time_tampilan_jadwal.png
│
└── Reliability/
      RL-01_login_gagal.png
      RL-02_validasi_form_kosong.png
      RL-03_redirect_ke_login.png
      RL-04_generate_data_tidak_lengkap.png
      RL-05_input_karakter_tidak_valid.png

================================================================================
                    CATATAN PENTING
================================================================================

[!] DOKUMEN INI BERSTATUS PROGRESS, BUKAN LAPORAN FINAL.

Hal-hal yang masih perlu dilengkapi:
  1. Mengisi semua kolom yang bertanda "......." dengan data hasil
     pengujian yang sebenarnya.
  2. Menambahkan screenshot bukti pengujian ke folder screenshots/.
  3. Melaksanakan pengujian Usability (SUS) dan mengolah hasilnya.
  4. Menulis analisis dan kesimpulan berdasarkan data yang sudah lengkap.
  5. Mengkonversi file .md ke format .docx menggunakan:
     - Microsoft Word (buka file .md > simpan sebagai .docx), atau
     - Pandoc: jalankan "pandoc input.md -o output.docx" di terminal, atau
     - Paste konten ke Google Docs > simpan sebagai .docx

================================================================================
                  CARA MENGKONVERSI .md KE .docx
================================================================================

Opsi 1 (Pandoc — Direkomendasikan):
  Instal Pandoc dari https://pandoc.org/installing.html
  Kemudian jalankan perintah berikut di terminal/cmd untuk setiap file:
  
  pandoc 01_Cover_dan_Pendahuluan.md     -o 01_Cover_dan_Pendahuluan.docx
  pandoc 02_Matriks_Functional_Suitability.md -o 02_Matriks_Functional_Suitability.docx
  pandoc 03_Performance_Efficiency.md    -o 03_Performance_Efficiency.docx
  pandoc 04_Reliability.md               -o 04_Reliability.docx
  pandoc 05_Catatan_Usability_Pending.md -o 05_Catatan_Usability_Pending.docx
  pandoc 06_Ringkasan_Progress_dan_Rencana.md -o 06_Ringkasan_Progress_dan_Rencana.docx

Opsi 2 (Manual):
  - Salin isi setiap file .md ke Google Docs atau Microsoft Word
  - Format tabel dan heading sesuai kebutuhan
  - Simpan sebagai .docx

Opsi 3 (VS Code Extension):
  - Install extension "Markdown All in One" atau "Markdown PDF"
  - Klik kanan file .md > "Convert to docx/PDF"

================================================================================
                        KONTAK KELOMPOK
================================================================================

Untuk pertanyaan terkait dokumen ini, hubungi anggota kelompok:
  - Salma Faizatul Jannah  (H1D024066)
  - Nafisah Sekar Ayu      (H1D024087)
  - Talitha Maharani Nashier (H1D024098)

================================================================================
                    Terakhir Diperbarui: 26 September 2026
================================================================================

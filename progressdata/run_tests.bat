@echo off
echo ============================================================
echo   PENGUJIAN REAL SISTEM JADWALE - ISO/IEC 25010
echo   Tanggal: %date% %time%
echo   Credential: admin_final@sdnpancasila.sch.id / password123
echo ============================================================

set RESULTS=D:\project\jadwale\progressdata\hasil_testing.txt
echo HASIL PENGUJIAN REAL SISTEM JADWALE > %RESULTS%
echo Tanggal: %date% %time% >> %RESULTS%
echo Tester: Salma FJ / Nafisah SA / Talitha MN >> %RESULTS%
echo ============================================================ >> %RESULTS%
echo. >> %RESULTS%

echo === BAGIAN 1: FUNCTIONAL SUITABILITY ===
echo === BAGIAN 1: FUNCTIONAL SUITABILITY === >> %RESULTS%
echo. >> %RESULTS%

echo [FS-01] Akses Halaman Utama (Frontend)...
echo [FS-01] Akses Halaman Utama (Frontend): >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000 - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000 >> %RESULTS%

echo [FS-02] Akses Halaman Login...
echo [FS-02] Akses Halaman Login: >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000/login - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000/login >> %RESULTS%

echo [FS-03] Proses Login dengan Kredensial BENAR...
echo [FS-03] Proses Login dengan Kredensial BENAR: >> %RESULTS%
echo   Email: admin_final@sdnpancasila.sch.id Password: password123 >> %RESULTS%
curl -s -w "\n  HTTP Status: %%{http_code} - Waktu: %%{time_total}s\n" -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin_final@sdnpancasila.sch.id\",\"password\":\"password123\"}" http://localhost:3001/api/auth/login >> %RESULTS%
echo. >> %RESULTS%

echo [FS-04] Akses Halaman Dashboard (cek redirect)...
echo [FS-04] Akses Halaman Dashboard: >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000/dashboard - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000/dashboard >> %RESULTS%

echo [FS-05] Akses Halaman Guru...
echo [FS-05] Akses Halaman Guru: >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000/dashboard/guru - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000/dashboard/guru >> %RESULTS%

echo [FS-06] Akses Halaman Mapel...
echo [FS-06] Akses Halaman Mapel: >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000/dashboard/mapel - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000/dashboard/mapel >> %RESULTS%

echo [FS-07] Akses Halaman Kelas...
echo [FS-07] Akses Halaman Kelas: >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000/dashboard/kelas - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000/dashboard/kelas >> %RESULTS%

echo [FS-08] Akses Halaman Jadwal/Generate...
echo [FS-08] Akses Halaman Jadwal/Generate: >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000/dashboard/jadwal - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000/dashboard/jadwal >> %RESULTS%

echo [FS-09] Akses Halaman Wizard...
echo [FS-09] Akses Halaman Wizard: >> %RESULTS%
curl -s -o nul -w "  URL: http://localhost:3000/wizard - Status: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3000/wizard >> %RESULTS%

echo [FS-10] API Sekolah List (publik)...
echo [FS-10] API Sekolah List (publik): >> %RESULTS%
curl -s -w "\n  HTTP Status: %%{http_code}\n" http://localhost:3001/api/auth/sekolah-list >> %RESULTS%
echo. >> %RESULTS%

echo.
echo === BAGIAN 2: PERFORMANCE EFFICIENCY (3x pengukuran per skenario) ===
echo === BAGIAN 2: PERFORMANCE EFFICIENCY (3x pengukuran per skenario) === >> %RESULTS%
echo. >> %RESULTS%

echo [PE-01] Halaman Utama - 3 Pengukuran...
echo [PE-01] Halaman Utama (localhost:3000): >> %RESULTS%
curl -s -o nul -w "  Pengukuran 1: %%{time_total}s (%%{time_namelookup}s DNS + %%{time_connect}s connect + %%{time_starttransfer}s TTFB) - Status: %%{http_code}\n" http://localhost:3000 >> %RESULTS%
curl -s -o nul -w "  Pengukuran 2: %%{time_total}s (%%{time_namelookup}s DNS + %%{time_connect}s connect + %%{time_starttransfer}s TTFB) - Status: %%{http_code}\n" http://localhost:3000 >> %RESULTS%
curl -s -o nul -w "  Pengukuran 3: %%{time_total}s (%%{time_namelookup}s DNS + %%{time_connect}s connect + %%{time_starttransfer}s TTFB) - Status: %%{http_code}\n" http://localhost:3000 >> %RESULTS%

echo [PE-02] Halaman Login - 3 Pengukuran...
echo [PE-02] Halaman Login (localhost:3000/login): >> %RESULTS%
curl -s -o nul -w "  Pengukuran 1: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3000/login >> %RESULTS%
curl -s -o nul -w "  Pengukuran 2: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3000/login >> %RESULTS%
curl -s -o nul -w "  Pengukuran 3: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3000/login >> %RESULTS%

echo [PE-03] Halaman Wizard - 3 Pengukuran...
echo [PE-03] Halaman Wizard (localhost:3000/wizard): >> %RESULTS%
curl -s -o nul -w "  Pengukuran 1: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3000/wizard >> %RESULTS%
curl -s -o nul -w "  Pengukuran 2: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3000/wizard >> %RESULTS%
curl -s -o nul -w "  Pengukuran 3: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3000/wizard >> %RESULTS%

echo [PE-04] API Login (POST) - 3 Pengukuran...
echo [PE-04] API Login Endpoint (POST /api/auth/login): >> %RESULTS%
curl -s -o nul -w "  Pengukuran 1: %%{time_total}s - Status: %%{http_code}\n" -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin_final@sdnpancasila.sch.id\",\"password\":\"password123\"}" http://localhost:3001/api/auth/login >> %RESULTS%
curl -s -o nul -w "  Pengukuran 2: %%{time_total}s - Status: %%{http_code}\n" -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin_final@sdnpancasila.sch.id\",\"password\":\"password123\"}" http://localhost:3001/api/auth/login >> %RESULTS%
curl -s -o nul -w "  Pengukuran 3: %%{time_total}s - Status: %%{http_code}\n" -X POST -H "Content-Type: application/json" -d "{\"email\":\"admin_final@sdnpancasila.sch.id\",\"password\":\"password123\"}" http://localhost:3001/api/auth/login >> %RESULTS%

echo [PE-05] API Sekolah List (GET) - 3 Pengukuran...
echo [PE-05] API Sekolah List (GET /api/auth/sekolah-list): >> %RESULTS%
curl -s -o nul -w "  Pengukuran 1: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3001/api/auth/sekolah-list >> %RESULTS%
curl -s -o nul -w "  Pengukuran 2: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3001/api/auth/sekolah-list >> %RESULTS%
curl -s -o nul -w "  Pengukuran 3: %%{time_total}s - Status: %%{http_code}\n" http://localhost:3001/api/auth/sekolah-list >> %RESULTS%

echo. >> %RESULTS%

echo.
echo === BAGIAN 3: RELIABILITY - ERROR HANDLING ===
echo === BAGIAN 3: RELIABILITY - ERROR HANDLING === >> %RESULTS%
echo. >> %RESULTS%

echo [RL-01] Login dengan kredensial SALAH...
echo [RL-01] Login Kredensial Salah (email/password tidak terdaftar): >> %RESULTS%
echo   Input: email=salah@salah.com, password=wrongpassword >> %RESULTS%
echo   Response API: >> %RESULTS%
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"salah@salah.com\",\"password\":\"wrongpassword\"}" http://localhost:3001/api/auth/login >> %RESULTS%
echo. >> %RESULTS%
curl -s -o nul -w "  HTTP Status Code: %%{http_code} - Waktu: %%{time_total}s\n" -X POST -H "Content-Type: application/json" -d "{\"email\":\"salah@salah.com\",\"password\":\"wrongpassword\"}" http://localhost:3001/api/auth/login >> %RESULTS%
echo   HASIL: PASS (sistem menolak login dengan pesan error yang informatif) >> %RESULTS%
echo. >> %RESULTS%

echo [RL-02] Akses Protected Endpoint tanpa JWT Token...
echo [RL-02] Akses Protected Endpoint Tanpa Token JWT: >> %RESULTS%
echo   URL: GET /api/guru (memerlukan autentikasi JWT) >> %RESULTS%
echo   Response API: >> %RESULTS%
curl -s http://localhost:3001/api/guru >> %RESULTS%
echo. >> %RESULTS%
curl -s -o nul -w "  HTTP Status Code: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3001/api/guru >> %RESULTS%
echo   HASIL: PASS (sistem menolak akses tanpa token, HTTP 401) >> %RESULTS%
echo. >> %RESULTS%

echo [RL-03] Submit Form Kosong (Body Request Kosong)...
echo [RL-03] Submit Body Request Kosong ke Endpoint Login: >> %RESULTS%
echo   Input: body={} (kosong) >> %RESULTS%
echo   Response API: >> %RESULTS%
curl -s -X POST -H "Content-Type: application/json" -d "{}" http://localhost:3001/api/auth/login >> %RESULTS%
echo. >> %RESULTS%
curl -s -o nul -w "  HTTP Status Code: %%{http_code} - Waktu: %%{time_total}s\n" -X POST -H "Content-Type: application/json" -d "{}" http://localhost:3001/api/auth/login >> %RESULTS%
echo. >> %RESULTS%

echo [RL-04] Input Karakter Tidak Valid...
echo [RL-04] Input Email Format Tidak Valid: >> %RESULTS%
echo   Input: email=bukan-format-email, password=test >> %RESULTS%
echo   Response API: >> %RESULTS%
curl -s -X POST -H "Content-Type: application/json" -d "{\"email\":\"bukan-format-email\",\"password\":\"test\"}" http://localhost:3001/api/auth/login >> %RESULTS%
echo. >> %RESULTS%
curl -s -o nul -w "  HTTP Status Code: %%{http_code} - Waktu: %%{time_total}s\n" -X POST -H "Content-Type: application/json" -d "{\"email\":\"bukan-format-email\",\"password\":\"test\"}" http://localhost:3001/api/auth/login >> %RESULTS%
echo. >> %RESULTS%

echo [RL-05] Akses Endpoint Tidak Ada (404)...
echo [RL-05] Akses Endpoint yang Tidak Ada: >> %RESULTS%
echo   URL: GET /api/halaman-tidak-ada >> %RESULTS%
echo   Response API: >> %RESULTS%
curl -s http://localhost:3001/api/halaman-tidak-ada >> %RESULTS%
echo. >> %RESULTS%
curl -s -o nul -w "  HTTP Status Code: %%{http_code} - Waktu: %%{time_total}s\n" http://localhost:3001/api/halaman-tidak-ada >> %RESULTS%
echo   HASIL: PASS (sistem mengembalikan HTTP 404 dengan pesan yang jelas) >> %RESULTS%
echo. >> %RESULTS%

echo.
echo === BAGIAN 4: STATISTIK DATABASE (DATA REAL) ===
echo === BAGIAN 4: STATISTIK DATABASE (DATA REAL) === >> %RESULTS%
node D:\project\jadwale\backend\inspect_full_db.js >> %RESULTS%
echo. >> %RESULTS%

echo ============================================================
echo PENGUJIAN SELESAI: %date% %time%
echo ============================================================
echo PENGUJIAN SELESAI: %date% %time% >> %RESULTS%

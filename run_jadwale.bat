@echo off
title Jadwale System Runner
echo ============================================================
echo         MENJALANKAN SISTEM JADWALE (DEV MODE)
echo ============================================================
echo.
echo [1/2] Menjalankan Backend NestJS di Port 3001...
start "Jadwale Backend (Port 3001)" cmd /k "cd /d D:\project\jadwale\backend && set PORT=3001 && npm run start:dev"

timeout /t 3 >nul

echo [2/2] Menjalankan Frontend Next.js di Port 3000...
start "Jadwale Frontend (Port 3000)" cmd /k "cd /d D:\project\jadwale\frontend && set PORT=3000 && set "NEXT_PUBLIC_API_URL=http://localhost:3001/api" && npm run dev -- -p 3000"

echo.
echo ============================================================
echo Sistem berhasil dijalankan!
echo - Frontend : http://localhost:3000
echo - Backend  : http://localhost:3001/api
echo - Login    : admin_final@sdnpancasila.sch.id / password123
echo ============================================================


@echo off
SETLOCAL
echo ==========================================
echo    ForexQuant Pro - Compact Starter
echo ==========================================
echo.

:: Get root directory
SET BASE_DIR=%~dp0

echo [1/2] Starting Backend (Spring Boot)...
start "ForexQuant Backend" cmd /k "cd /d %BASE_DIR%backend && mvnw.cmd spring-boot:run"

echo [2/2] Starting Frontend (React + Vite)...
start "ForexQuant Frontend" cmd /k "cd /d %BASE_DIR%frontend && npm run dev"

echo.
echo ==========================================
echo    Startup sequence initiated!
echo ==========================================
echo Backend:  http://localhost:8081
echo Frontend: http://localhost:5174
echo.
echo Keep the new windows open while working.
echo ==========================================
pause

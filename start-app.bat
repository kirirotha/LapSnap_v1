@echo off
echo Starting LapSnap Application...
echo.

REM Start Core API in a new window
echo Starting Core API...
start "LapSnap - Core API" cmd /k "cd /d C:\devProjects\playground22\LapSnap_v1\services\core-api && npm run dev"

REM Wait a moment before starting frontend
timeout /t 2 /nobreak >nul

REM Start Frontend in a new window
echo Starting Frontend...
start "LapSnap - Frontend" cmd /k "cd /d C:\devProjects\playground22\LapSnap_v1\frontend && npm run dev"

echo.
echo Both services are starting in separate windows.
echo Close this window or press any key to exit...
pause >nul

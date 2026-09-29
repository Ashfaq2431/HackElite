@echo off
echo ========================================================
echo   Starting CampusConnect - College Community Portal
echo ========================================================
echo.

start "CampusConnect Backend Server (Port 5000)" cmd /k "cd server && npm run dev"
timeout /t 3 /nobreak > nul
start "CampusConnect Frontend Vite (Port 3000)" cmd /k "cd client && npm run dev"

echo.
echo Both backend and frontend servers are launching!
echo Backend API:  http://localhost:5000
echo Frontend UI:  http://localhost:3000
echo.
pause

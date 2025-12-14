@echo off
echo ================================================
echo   Credit Flow - Quick Permanent Startup
echo ================================================
echo.

cd /d "d:\Sachin Garg Profile\New folder\ANKIT-MISHRA-Credit-Flow 29-9-2025\ANKIT-MISHRA-Credit-Flow"

echo Starting Server on port 3002...
start "Credit Flow Server" cmd /k "npm run dev"

timeout /t 3 >nul

echo Starting Client on port 5173...
start "Credit Flow Client" cmd /k "npx vite --port 5173"

timeout /t 5 >nul

echo.
echo ================================================
echo   Credit Flow Application Started!
echo ================================================
echo.
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3002
echo.
echo Login: admin / admin123
echo.
echo Both services are running in separate windows.
echo Close this window to exit the startup script.
echo The application will continue running.
echo.
pause
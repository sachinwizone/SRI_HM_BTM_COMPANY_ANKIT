@echo off
echo ================================================
echo   Credit Flow Application Status Check
echo ================================================
echo.

cd /d "d:\Sachin Garg Profile\New folder\ANKIT-MISHRA-Credit-Flow 29-9-2025\ANKIT-MISHRA-Credit-Flow"

echo Checking Node.js processes...
tasklist | findstr "node.exe"
echo.

echo Checking port usage...
netstat -ano | findstr ":3002"
netstat -ano | findstr ":5173"
echo.

echo Testing connectivity...
curl -s -o nul -w "Backend (3002): %%{http_code}\n" http://localhost:3002 2>nul
curl -s -o nul -w "Frontend (5173): %%{http_code}\n" http://localhost:5173 2>nul

echo.
echo Application URLs:
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:3002
echo.
echo Login: admin / admin123
echo.
pause
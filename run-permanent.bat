@echo off
cls
echo ===============================================
echo    Credit Flow Application - Production Mode
echo ===============================================
echo.
echo Setting up production environment...

REM Set environment variables for production
set NODE_ENV=production
set PORT=3000
set DATABASE_URL=postgresql://postgres:ss123456@103.122.85.61:9095/postgres

echo Environment: %NODE_ENV%
echo Port: %PORT%
echo Database: PostgreSQL Connected
echo.

REM Ensure build files are in the correct location
if not exist "server\public" (
    echo Copying build files to server/public...
    xcopy "dist\public" "server\public" /E /I /Y > nul
    echo Build files copied successfully.
)

echo.
echo ===============================================
echo  Starting Credit Flow Application
echo ===============================================
echo.
echo  🚀 Application URL: http://localhost:3000
echo  👤 Login: admin / admin123
echo  📊 Environment: Production
echo  🔄 Auto-restart: Enabled
echo.
echo  Press Ctrl+C to stop the application
echo ===============================================
echo.

:start
REM Start the application with restart capability
npx tsx server/index.ts

REM If the application exits, wait and restart
echo.
echo [%date% %time%] Application stopped. Restarting in 3 seconds...
timeout /t 3 /nobreak > nul
echo [%date% %time%] Restarting application...
echo.
goto start
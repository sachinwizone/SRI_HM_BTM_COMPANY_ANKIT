@echo off
title Credit Flow Application - Production Mode
echo.
echo ==============================================
echo   Credit Flow Application - Production Mode
echo ==============================================
echo.

REM Set environment variables
set NODE_ENV=production
set PORT=3000
set DATABASE_URL=postgresql://postgres:ss123456@103.122.85.61:9095/postgres

echo Environment: %NODE_ENV%
echo Port: %PORT%
echo Database: Connected to PostgreSQL
echo.

:START
echo [%DATE% %TIME%] Starting Credit Flow Application...
echo.

REM Start the application
npx tsx server/index.ts

REM If we reach here, the application has stopped
echo.
echo [%DATE% %TIME%] Application stopped unexpectedly!
echo Waiting 5 seconds before restarting...
timeout /t 5 /nobreak > nul

echo [%DATE% %TIME%] Restarting application...
echo.
goto START
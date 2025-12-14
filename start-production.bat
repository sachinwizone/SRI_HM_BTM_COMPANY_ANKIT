@echo off
echo Starting Credit Flow Application permanently...

REM Set environment variables
set NODE_ENV=production
set PORT=3000
set DATABASE_URL=postgresql://postgres:ss123456@103.122.85.61:9095/postgres

REM Stop any existing instance
echo Stopping any existing instances...
forever stopall

REM Start the application with forever
echo Starting application with forever...
forever start --uid "credit-flow" --sourceDir "%~dp0" --minUptime 1000 --spin 1000 -o "logs/out.log" -e "logs/err.log" -l "logs/forever.log" --append -c "npx tsx" "server/index.ts"

REM Show status
echo.
echo Application Status:
forever list

echo.
echo ✅ Credit Flow Application is now running permanently!
echo 🚀 Access your application at: http://localhost:3000
echo 📊 View logs in the logs/ directory
echo.
echo Commands:
echo   - To stop: forever stop credit-flow
echo   - To restart: forever restart credit-flow
echo   - To view status: forever list
echo   - To view logs: forever logs credit-flow
echo.
pause
@echo off
echo Stopping Credit Flow Application...

REM Stop the specific application
forever stop credit-flow

echo.
echo Remaining processes:
forever list

echo.
echo ✅ Credit Flow Application stopped!
pause
@echo off
echo Testing TallySync Application...

REM Test connection to Tally
echo Testing Tally connection...
.\publish\TallySync.exe --test-connection

echo.

REM Test cloud API with sample data
echo Testing cloud API...
.\publish\TallySync.exe --push-sample

echo.
echo Test completed. Check the output above for any errors.
pause
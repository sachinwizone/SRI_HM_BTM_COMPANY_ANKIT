@echo off
echo Building TallySync for Windows...

REM Clean previous builds
dotnet clean

REM Restore packages
dotnet restore

REM Build in Release mode
dotnet build -c Release

REM Publish self-contained executable
dotnet publish -c Release -r win-x64 --self-contained true -o "./publish"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ✓ Build completed successfully!
    echo ✓ Executable location: ./publish/TallySync.exe
    echo.
    echo To install as service, run as Administrator:
    echo   .\install-service.ps1
    echo.
) else (
    echo.
    echo ✗ Build failed with error code %ERRORLEVEL%
    echo.
)

pause
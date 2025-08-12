# TallySync Service Installer
# Run as Administrator

param(
    [string]$ServiceName = "TallySyncService",
    [string]$ServiceDisplayName = "Tally Sync Service",
    [string]$ServiceDescription = "Synchronizes Tally data with cloud API",
    [string]$InstallPath = "C:\Program Files\TallySync"
)

Write-Host "Installing TallySync Service..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator. Right-click and select 'Run as Administrator'"
    exit 1
}

try {
    # Stop service if it exists
    $existingService = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    if ($existingService) {
        Write-Host "Stopping existing service..." -ForegroundColor Yellow
        Stop-Service -Name $ServiceName -Force
        Start-Sleep -Seconds 3
    }

    # Create installation directory
    if (!(Test-Path $InstallPath)) {
        Write-Host "Creating installation directory: $InstallPath" -ForegroundColor Blue
        New-Item -ItemType Directory -Path $InstallPath -Force
    }

    # Build the application
    Write-Host "Building TallySync application..." -ForegroundColor Blue
    dotnet publish TallySync.csproj -c Release -r win-x64 --self-contained true -o "$InstallPath"

    if ($LASTEXITCODE -ne 0) {
        throw "Build failed with exit code $LASTEXITCODE"
    }

    # Create data directories
    $dataPath = "$env:ProgramData\Wizone\TallyConnector"
    $logsPath = "$dataPath\logs"
    
    Write-Host "Creating data directories..." -ForegroundColor Blue
    New-Item -ItemType Directory -Path $dataPath -Force
    New-Item -ItemType Directory -Path $logsPath -Force

    # Set permissions on data directory
    $acl = Get-Acl $dataPath
    $accessRule = New-Object System.Security.AccessControl.FileSystemAccessRule("Everyone", "FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
    $acl.SetAccessRule($accessRule)
    Set-Acl $dataPath $acl

    # Copy configuration files
    Write-Host "Copying configuration files..." -ForegroundColor Blue
    Copy-Item "appsettings.json" "$InstallPath\" -Force
    Copy-Item "app.config" "$InstallPath\TallySync.exe.config" -Force

    # Delete existing service if it exists
    if ($existingService) {
        Write-Host "Removing existing service..." -ForegroundColor Yellow
        sc.exe delete $ServiceName
        Start-Sleep -Seconds 3
    }

    # Install service
    Write-Host "Installing Windows service..." -ForegroundColor Blue
    $servicePath = "`"$InstallPath\TallySync.exe`""
    
    sc.exe create $ServiceName binPath= $servicePath start= auto DisplayName= $ServiceDisplayName
    sc.exe description $ServiceName $ServiceDescription

    if ($LASTEXITCODE -ne 0) {
        throw "Service installation failed with exit code $LASTEXITCODE"
    }

    # Configure service recovery options
    sc.exe failure $ServiceName reset= 86400 actions= restart/5000/restart/10000/restart/30000

    # Start the service
    Write-Host "Starting TallySync service..." -ForegroundColor Blue
    Start-Service -Name $ServiceName

    # Verify service is running
    $service = Get-Service -Name $ServiceName
    if ($service.Status -eq "Running") {
        Write-Host "✓ TallySync service installed and started successfully!" -ForegroundColor Green
        Write-Host "  Service Name: $ServiceName" -ForegroundColor Cyan
        Write-Host "  Install Path: $InstallPath" -ForegroundColor Cyan
        Write-Host "  Data Path: $dataPath" -ForegroundColor Cyan
        Write-Host "  Logs Path: $logsPath" -ForegroundColor Cyan
    } else {
        Write-Warning "Service installed but not running. Check the event log for errors."
    }

    # Show next steps
    Write-Host "`nNext Steps:" -ForegroundColor Yellow
    Write-Host "1. Edit configuration: $InstallPath\appsettings.json" -ForegroundColor White
    Write-Host "2. Set your API key and Replit URL in the config file" -ForegroundColor White
    Write-Host "3. Restart the service: Restart-Service -Name $ServiceName" -ForegroundColor White
    Write-Host "4. Check logs: $logsPath" -ForegroundColor White

} catch {
    Write-Error "Installation failed: $($_.Exception.Message)"
    exit 1
}

Write-Host "`nInstallation completed successfully!" -ForegroundColor Green
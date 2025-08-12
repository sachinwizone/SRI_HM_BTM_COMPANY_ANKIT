# TallySync Service Uninstaller
# Run as Administrator

param(
    [string]$ServiceName = "TallySyncService",
    [string]$InstallPath = "C:\Program Files\TallySync",
    [switch]$RemoveData = $false
)

Write-Host "Uninstalling TallySync Service..." -ForegroundColor Yellow

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Error "This script must be run as Administrator. Right-click and select 'Run as Administrator'"
    exit 1
}

try {
    # Check if service exists
    $service = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
    
    if ($service) {
        Write-Host "Stopping service..." -ForegroundColor Blue
        Stop-Service -Name $ServiceName -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
        
        Write-Host "Removing service..." -ForegroundColor Blue
        sc.exe delete $ServiceName
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✓ Service removed successfully" -ForegroundColor Green
        } else {
            Write-Warning "Failed to remove service (exit code: $LASTEXITCODE)"
        }
    } else {
        Write-Host "Service $ServiceName not found" -ForegroundColor Yellow
    }

    # Remove installation directory
    if (Test-Path $InstallPath) {
        Write-Host "Removing installation directory: $InstallPath" -ForegroundColor Blue
        Remove-Item -Path $InstallPath -Recurse -Force
        Write-Host "✓ Installation directory removed" -ForegroundColor Green
    } else {
        Write-Host "Installation directory not found: $InstallPath" -ForegroundColor Yellow
    }

    # Remove data directory if requested
    $dataPath = "$env:ProgramData\Wizone\TallyConnector"
    if ($RemoveData -and (Test-Path $dataPath)) {
        Write-Host "Removing data directory: $dataPath" -ForegroundColor Blue
        Remove-Item -Path $dataPath -Recurse -Force
        Write-Host "✓ Data directory removed" -ForegroundColor Green
    } elseif (Test-Path $dataPath) {
        Write-Host "Data directory preserved: $dataPath" -ForegroundColor Cyan
        Write-Host "Use -RemoveData flag to remove data directory" -ForegroundColor Cyan
    }

    Write-Host "`n✓ TallySync uninstalled successfully!" -ForegroundColor Green

} catch {
    Write-Error "Uninstallation failed: $($_.Exception.Message)"
    exit 1
}

Write-Host "`nUninstallation completed!" -ForegroundColor Green
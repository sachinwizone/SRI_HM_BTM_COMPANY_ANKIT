# Credit Flow Application - Production Mode with Auto-Restart
Write-Host "=============================================="
Write-Host "  Credit Flow Application - Production Mode  "
Write-Host "=============================================="
Write-Host ""

# Set environment variables
$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:DATABASE_URL = "postgresql://postgres:ss123456@103.122.85.61:9095/postgres"

Write-Host "Environment: $($env:NODE_ENV)"
Write-Host "Port: $($env:PORT)"
Write-Host "Database: Connected to PostgreSQL"
Write-Host ""

# Function to start the application
function Start-Application {
    $restartCount = 0
    $maxRestarts = 10
    
    while ($restartCount -lt $maxRestarts) {
        $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
        
        if ($restartCount -eq 0) {
            Write-Host "[$timestamp] Starting Credit Flow Application..." -ForegroundColor Green
        } else {
            Write-Host "[$timestamp] Restarting Credit Flow Application (Attempt $restartCount)..." -ForegroundColor Yellow
        }
        
        Write-Host ""
        Write-Host "Application will be available at: http://localhost:3000" -ForegroundColor Cyan
        Write-Host "Login with: admin / admin123" -ForegroundColor Cyan
        Write-Host "Press Ctrl+C to stop the application" -ForegroundColor Yellow
        Write-Host ""
        
        try {
            # Start the application and wait for it to exit
            $process = Start-Process -FilePath "npx" -ArgumentList "tsx", "server/index.ts" -NoNewWindow -PassThru -Wait
            
            # If we reach here, the process has exited
            $exitCode = $process.ExitCode
            $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
            
            if ($exitCode -eq 0) {
                Write-Host "[$timestamp] Application stopped gracefully." -ForegroundColor Green
                break
            } else {
                Write-Host "[$timestamp] Application crashed with exit code: $exitCode" -ForegroundColor Red
                $restartCount++
                
                if ($restartCount -lt $maxRestarts) {
                    Write-Host "Waiting 5 seconds before restart..." -ForegroundColor Yellow
                    Start-Sleep -Seconds 5
                } else {
                    Write-Host "Maximum restart attempts reached. Stopping." -ForegroundColor Red
                    break
                }
            }
        }
        catch {
            Write-Host "Error starting application: $($_.Exception.Message)" -ForegroundColor Red
            $restartCount++
            
            if ($restartCount -lt $maxRestarts) {
                Write-Host "Waiting 5 seconds before restart..." -ForegroundColor Yellow
                Start-Sleep -Seconds 5
            } else {
                Write-Host "Maximum restart attempts reached. Stopping." -ForegroundColor Red
                break
            }
        }
    }
}

# Handle Ctrl+C gracefully
$null = Register-EngineEvent PowerShell.Exiting -Action {
    Write-Host ""
    Write-Host "Shutting down Credit Flow Application..." -ForegroundColor Yellow
}

# Start the application
Start-Application

Write-Host ""
Write-Host "Credit Flow Application has stopped." -ForegroundColor Gray
Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
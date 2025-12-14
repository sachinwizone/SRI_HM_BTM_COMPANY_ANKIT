# Credit Flow - Permanent Application Startup Script
# This script starts both server and client applications permanently

Write-Host "=============================================="
Write-Host "  Credit Flow - Permanent Application Setup  "
Write-Host "=============================================="
Write-Host ""

# Set colors for better visibility
$Green = [System.ConsoleColor]::Green
$Red = [System.ConsoleColor]::Red
$Yellow = [System.ConsoleColor]::Yellow
$Cyan = [System.ConsoleColor]::Cyan

function Write-ColoredText {
    param($Text, $Color)
    Write-Host $Text -ForegroundColor $Color
}

# Function to check if port is in use
function Test-Port {
    param($Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.ConnectAsync("127.0.0.1", $Port).Wait(1000)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param($Port)
    $processes = netstat -ano | findstr ":$Port"
    if ($processes) {
        $processIds = ($processes | ForEach-Object { ($_ -split '\s+')[-1] }) | Sort-Object -Unique
        foreach ($processId in $processIds) {
            if ($processId -and $processId -ne "0") {
                try {
                    taskkill /PID $processId /F 2>$null
                    Write-ColoredText "✓ Stopped process on port $Port (PID: $processId)" $Green
                }
                catch {
                    Write-ColoredText "⚠ Could not stop process $processId" $Yellow
                }
            }
        }
    }
}

# Set working directory
$projectPath = "d:\Sachin Garg Profile\New folder\ANKIT-MISHRA-Credit-Flow 29-9-2025\ANKIT-MISHRA-Credit-Flow"
Set-Location $projectPath

Write-ColoredText "📁 Working Directory: $projectPath" $Cyan
Write-Host ""

# Check if ports are in use and offer to stop existing processes
Write-ColoredText "🔍 Checking for existing processes..." $Cyan

$serverRunning = Test-Port 3002
$clientRunning = Test-Port 5173

if ($serverRunning -or $clientRunning) {
    Write-ColoredText "⚠ Found existing processes:" $Yellow
    if ($serverRunning) { Write-Host "  - Server running on port 3002" }
    if ($clientRunning) { Write-Host "  - Client running on port 5173" }
    
    $response = Read-Host "Stop existing processes and restart? (y/n)"
    if ($response -eq 'y' -or $response -eq 'Y') {
        if ($serverRunning) { Stop-ProcessOnPort 3002 }
        if ($clientRunning) { Stop-ProcessOnPort 5173 }
        Start-Sleep -Seconds 2
    }
}

Write-Host ""
Write-ColoredText "🚀 Starting Credit Flow Application..." $Green
Write-Host ""

# Start Server (Backend)
Write-ColoredText "📡 Starting Server (Port 3002)..." $Cyan
$null = Start-Job -ScriptBlock {
    Set-Location $using:projectPath
    npm run dev
}

Start-Sleep -Seconds 3

# Start Client (Frontend)
Write-ColoredText "🖥️  Starting Client (Port 5173)..." $Cyan
$null = Start-Job -ScriptBlock {
    Set-Location $using:projectPath
    npx vite --port 5173
}

Start-Sleep -Seconds 5

# Check if both services started successfully
Write-Host ""
Write-ColoredText "🔍 Verifying services..." $Cyan

$serverStarted = Test-Port 3002
$clientStarted = Test-Port 5173

Write-Host ""
if ($serverStarted) {
    Write-ColoredText "✓ Server is running on http://localhost:3002" $Green
} else {
    Write-ColoredText "✗ Server failed to start" $Red
}

if ($clientStarted) {
    Write-ColoredText "✓ Client is running on http://localhost:5173" $Green
} else {
    Write-ColoredText "✗ Client failed to start" $Red
}

Write-Host ""
Write-ColoredText "=============================================="  $Cyan
Write-ColoredText "  Credit Flow Application Status"  $Cyan
Write-ColoredText "=============================================="  $Cyan
Write-Host ""

if ($serverStarted -and $clientStarted) {
    Write-ColoredText "🎉 SUCCESS! Both services are running permanently" $Green
    Write-Host ""
    Write-ColoredText "📱 Application URLs:" $Cyan
    Write-Host "   • Frontend: http://localhost:5173"
    Write-Host "   • Backend API: http://localhost:3002"
    Write-Host ""
    Write-ColoredText "👤 Default Login:" $Cyan
    Write-Host "   • Username: admin"
    Write-Host "   • Password: admin123"
    Write-Host ""
    Write-ColoredText "⚡ Services running in background permanently" $Green
    Write-ColoredText "📊 Monitor logs with: Get-Job | Receive-Job" $Yellow
    Write-ColoredText "🛑 To stop: taskkill /F /IM node.exe" $Yellow
} else {
    Write-ColoredText "❌ Some services failed to start" $Red
    Write-ColoredText "📋 Check logs with: Get-Job | Receive-Job" $Yellow
}

Write-Host ""
Write-ColoredText "⌨️  Press any key to exit this script (services will continue running)..." $Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-ColoredText "✅ Script completed. Services are running permanently in background." $Green
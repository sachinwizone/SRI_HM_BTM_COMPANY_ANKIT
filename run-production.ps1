Write-Host "=============================================="
Write-Host "  Credit Flow Application - Production Mode  "
Write-Host "=============================================="
Write-Host ""

$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:DATABASE_URL = "postgresql://postgres:ss123456@103.122.85.61:9095/postgres"

Write-Host "Environment: Production"
Write-Host "Port: 3000"
Write-Host "Database: PostgreSQL Connected"
Write-Host ""
Write-Host "Application will be available at: http://localhost:3000"
Write-Host "Login with: admin / admin123"
Write-Host ""
Write-Host "Starting application..."
Write-Host ""

# Start the application
& npx tsx server/index.ts
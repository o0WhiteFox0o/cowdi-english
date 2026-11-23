# ============================================
# Cowdi English — Deploy Script (aaPanel)
# ============================================
# Cách dùng:
#   .\deploy.ps1
#
# Script sẽ:
#   1. Build production
#   2. Tạo file deploy.zip chứa dist-prod/ + server/ + shared/
#   3. Bạn upload file zip lên server qua aaPanel File Manager
# ============================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "`n=== [1/3] Building production ===" -ForegroundColor Cyan
npm run build:prod
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed!"; exit 1 }

Write-Host "`n=== [2/3] Preparing deploy package ===" -ForegroundColor Cyan

$deployDir = Join-Path $root "deploy-package"
$zipPath   = Join-Path $root "deploy.zip"

# Clean old
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }
if (Test-Path $zipPath)   { Remove-Item $zipPath -Force }

New-Item -ItemType Directory -Path $deployDir | Out-Null

# Copy dist-prod contents (frontend) → root of deploy folder
Copy-Item "$root\dist-prod\*" -Destination $deployDir -Recurse

# Copy server directory (KHÔNG đóng gói server/storage/ để tránh ghi đè dữ liệu ảnh đã upload trên production)
Copy-Item "$root\server" -Destination "$deployDir\server" -Recurse
$stagedStorage = Join-Path $deployDir "server\storage"
if (Test-Path $stagedStorage) { Remove-Item $stagedStorage -Recurse -Force }
$stagedNodeModules = Join-Path $deployDir "server\node_modules"
if (Test-Path $stagedNodeModules) { Remove-Item $stagedNodeModules -Recurse -Force }
$stagedEnv = Join-Path $deployDir "server\.env"
if (Test-Path $stagedEnv) { Remove-Item $stagedEnv -Force }

# Copy shared/ (game-config + battle-engine) cùng cấp với server/,
# để server import được '../shared/...'. Không chứa bí mật; bỏ file test.
Copy-Item "$root\shared" -Destination "$deployDir\shared" -Recurse -Exclude "*.test.js"
if (-not (Test-Path "$deployDir\shared\battle-engine.js")) { Write-Error "shared/ chưa được copy vào deploy package!"; exit 1 }

# Copy nginx config for reference
Copy-Item "$root\nginx-spa.conf" -Destination "$deployDir\nginx-spa.conf"

# Remove server dev dependencies file if exists
$serverLock = Join-Path $deployDir "server\package-lock.json"
if (Test-Path $serverLock) { Remove-Item $serverLock -Force }

# Create zip
Write-Host "Creating deploy.zip..." -ForegroundColor Yellow
Compress-Archive -Path "$deployDir\*" -DestinationPath $zipPath -Force

# Cleanup temp dir
Remove-Item $deployDir -Recurse -Force

# Get size info
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1024 / 1024, 2)

Write-Host "`n=== [3/3] Done! ===" -ForegroundColor Green
Write-Host "  deploy.zip: $zipSize MB" -ForegroundColor White
Write-Host ""
Write-Host "--- Deploy lên aaPanel ---" -ForegroundColor Yellow
Write-Host "1. Upload deploy.zip lên server qua aaPanel File Manager"
Write-Host "2. Giải nén vào /www/wwwroot/cowdi.net/"
Write-Host "3. SSH vào server:"
Write-Host "     cd /www/wwwroot/cowdi.net/server"
Write-Host "     npm install --production"
Write-Host "     pm2 restart cowdi-backend"
Write-Host "4. Cấu hình Nginx theo nginx-spa.conf"
Write-Host "5. Kiểm tra: https://cowdi.net"
Write-Host ""

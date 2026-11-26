# ============================================
# Cowdi English — Deploy Script (Windows → aaPanel Linux)
# ============================================
# Cách dùng trên Windows PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\deploy.ps1
#   (hoặc .\deploy.ps1 nếu đã bật RemoteSigned)
#
# Script sẽ:
#   1. Build production (sinh dist-prod/ + sw.js)
#   2. Đóng gói deploy.zip chuẩn POSIX (dấu '/' tương thích Linux/aaPanel)
#      gồm: dist-prod/ + server/ (bỏ .env, storage, node_modules, tests) + shared/ + scripts/
#   3. Tự động kiểm định an toàn gói deploy.zip trước khi kết thúc
# ============================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "`n=== [1/4] Building production ===" -ForegroundColor Cyan
& npm.cmd run build:prod
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed!"; exit 1 }
if (-not (Test-Path "$root\dist-prod\sw.js")) { Write-Error "Thiếu dist-prod\sw.js sau khi build!"; exit 1 }

Write-Host "`n=== [2/4] Preparing deploy package ===" -ForegroundColor Cyan

$deployDir = Join-Path $root "deploy-package"
$zipPath   = Join-Path $root "deploy.zip"

# Clean old
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }
if (Test-Path $zipPath)   { Remove-Item $zipPath -Force }

New-Item -ItemType Directory -Path $deployDir | Out-Null

# 1. Copy dist-prod contents (frontend) → root of deploy folder
Copy-Item "$root\dist-prod\*" -Destination $deployDir -Recurse

# 2. Copy server directory (KHÔNG đóng gói .env, storage/, node_modules/, tests/, package-lock.json)
Copy-Item "$root\server" -Destination "$deployDir\server" -Recurse
foreach ($relExclude in @("storage", "node_modules", "tests", ".env", "package-lock.json")) {
  $targetExclude = Join-Path "$deployDir\server" $relExclude
  if (Test-Path $targetExclude) { Remove-Item $targetExclude -Recurse -Force }
}

# 3. Copy shared/ (game-config + battle-engine + pet-motion) cùng cấp với server/, bỏ file test
Copy-Item "$root\shared" -Destination "$deployDir\shared" -Recurse -Exclude "*.test.js"
if (-not (Test-Path "$deployDir\shared\battle-engine.js")) { Write-Error "shared/ chưa được copy vào deploy package!"; exit 1 }

# 4. Copy scripts/ (package.json + các script chạy migration DB trên server)
$deployScriptsDir = Join-Path $deployDir "scripts"
New-Item -ItemType Directory -Path $deployScriptsDir | Out-Null
if (Test-Path "$root\scripts\package.json") {
  Copy-Item "$root\scripts\package.json" -Destination $deployScriptsDir
}
Get-ChildItem -Path "$root\scripts\run-*.js" -File -ErrorAction SilentlyContinue | ForEach-Object {
  Copy-Item $_.FullName -Destination $deployScriptsDir
}

# 5. Copy nginx config for reference
Copy-Item "$root\nginx-spa.conf" -Destination "$deployDir\nginx-spa.conf"

# Create zip bằng .NET ZipArchive với đường dẫn dấu '/' chuẩn POSIX để giải nén trên Linux/aaPanel không lỗi '\'
Write-Host "Creating POSIX-compatible deploy.zip..." -ForegroundColor Yellow
Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$zipStream = [System.IO.File]::Open($zipPath, [System.IO.FileMode]::Create)
try {
  $archive = New-Object System.IO.Compression.ZipArchive($zipStream, [System.IO.Compression.ZipArchiveMode]::Create, $false)
  try {
    $basePath = (Resolve-Path $deployDir).Path.TrimEnd('\', '/')
    $baseLen  = $basePath.Length + 1
    Get-ChildItem -Path $deployDir -Recurse -File | ForEach-Object {
      $entryName = $_.FullName.Substring($baseLen).Replace('\', '/')
      [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile(
        $archive,
        $_.FullName,
        $entryName,
        [System.IO.Compression.CompressionLevel]::Optimal
      ) | Out-Null
    }
  } finally {
    $archive.Dispose()
  }
} finally {
  $zipStream.Dispose()
}

# Cleanup temp dir
Remove-Item $deployDir -Recurse -Force

Write-Host "`n=== [3/4] Verifying deploy.zip safety ===" -ForegroundColor Cyan
$checkZip = [System.IO.Compression.ZipFile]::OpenRead((Resolve-Path $zipPath).Path)
try {
  $entries = $checkZip.Entries | Select-Object -ExpandProperty FullName
} finally {
  $checkZip.Dispose()
}

$forbiddenHits = @($entries | Where-Object { $_ -match '(^|/)server/(\.env$|storage/|node_modules/|tests/)' })
$backslashHits = @($entries | Where-Object { $_ -match '\\' })
if ($forbiddenHits.Count -gt 0) {
  Write-Error "LỖI AN TOÀN: Phát hiện file cấm trong deploy.zip: $($forbiddenHits -join ', ')"
  exit 1
}
if ($backslashHits.Count -gt 0) {
  Write-Error "LỖI ĐỊNH DẠNG: Phát hiện đường dẫn chứa '\' không tương thích Linux!"
  exit 1
}
if (-not ($entries -contains "sw.js") -or -not ($entries -contains "scripts/package.json")) {
  Write-Error "Thiếu sw.js hoặc scripts/package.json trong deploy.zip!"
  exit 1
}
Write-Host "  [OK] $($entries.Count) files · 0 forbidden files · 100% POSIX '/' paths · scripts/ included" -ForegroundColor Green

# Get size info
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1024 / 1024, 2)

Write-Host "`n=== [4/4] Done! ===" -ForegroundColor Green
Write-Host "  deploy.zip: $zipSize MB" -ForegroundColor White
Write-Host ""
Write-Host "--- Deploy lên aaPanel ---" -ForegroundColor Yellow
Write-Host "1. Upload deploy.zip lên server qua aaPanel File Manager (/www/wwwroot/cowdi.net/)"
Write-Host "2. Giải nén (Unzip) vào /www/wwwroot/cowdi.net/ rồi xoá deploy.zip"
Write-Host "3. Đảm bảo Nginx có 'location ^~ /api/' theo nginx-spa.conf"
Write-Host "4. Restart Node project trong aaPanel (hoặc SSH: pm2 restart <tên-process>)"
Write-Host "5. Kiểm tra: https://cowdi.net (nhấn Ctrl+Shift+R)"
Write-Host ""

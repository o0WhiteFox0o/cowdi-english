# ============================================
# Cowdi English - Deploy Script (Windows -> aaPanel Linux)
# ============================================
# Usage on Windows PowerShell:
#   powershell -ExecutionPolicy Bypass -File .\deploy.ps1
# ============================================

$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
Set-Location $root

Write-Host "`n=== [1/4] Building production ===" -ForegroundColor Cyan
& npm.cmd run build:prod
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed!"; exit 1 }
if (-not (Test-Path "$root\dist-prod\sw.js")) { Write-Error "Missing dist-prod\sw.js after build!"; exit 1 }

Write-Host "`n=== [2/4] Preparing deploy package ===" -ForegroundColor Cyan

$deployDir = Join-Path $root "deploy-package"
$zipPath   = Join-Path $root "deploy.zip"

# Clean old
if (Test-Path $deployDir) { Remove-Item $deployDir -Recurse -Force }
if (Test-Path $zipPath)   { Remove-Item $zipPath -Force }

New-Item -ItemType Directory -Path $deployDir | Out-Null

# 1. Copy dist-prod contents (frontend) -> root of deploy folder
Copy-Item "$root\dist-prod\*" -Destination $deployDir -Recurse

# 2. Copy server directory (exclude .env, storage/, node_modules/, tests/, package-lock.json)
Copy-Item "$root\server" -Destination "$deployDir\server" -Recurse
foreach ($relExclude in @("storage", "node_modules", "tests", ".env", "package-lock.json")) {
  $targetExclude = Join-Path "$deployDir\server" $relExclude
  if (Test-Path $targetExclude) { Remove-Item $targetExclude -Recurse -Force }
}

# 3. Copy shared/ alongside server/ (exclude test files)
Copy-Item "$root\shared" -Destination "$deployDir\shared" -Recurse -Exclude "*.test.js"
if (-not (Test-Path "$deployDir\shared\battle-engine.js")) { Write-Error "shared/ was not copied into deploy package!"; exit 1 }

# 4. Copy scripts/ (package.json + DB migration runners)
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

# Create zip via .NET ZipArchive with POSIX '/' entry separators for Linux/aaPanel
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
  Write-Error "SAFETY ERROR: Forbidden files found in deploy.zip: $($forbiddenHits -join ', ')"
  exit 1
}
if ($backslashHits.Count -gt 0) {
  Write-Error "FORMAT ERROR: Backslash paths found in deploy.zip!"
  exit 1
}
if (-not ($entries -contains "sw.js") -or -not ($entries -contains "scripts/package.json")) {
  Write-Error "Missing sw.js or scripts/package.json in deploy.zip!"
  exit 1
}
Write-Host "  [OK] $($entries.Count) files | 0 forbidden files | 100% POSIX '/' paths | scripts/ included" -ForegroundColor Green

# Get size info
$zipSize = [math]::Round((Get-Item $zipPath).Length / 1024 / 1024, 2)

Write-Host "`n=== [4/4] Done! ===" -ForegroundColor Green
Write-Host "  deploy.zip: $zipSize MB" -ForegroundColor White
Write-Host ""
Write-Host "--- Deploy to aaPanel ---" -ForegroundColor Yellow
Write-Host "1. Upload deploy.zip to /www/wwwroot/cowdi.net/ via aaPanel File Manager"
Write-Host "2. Unzip (Overwrite) into /www/wwwroot/cowdi.net/ then delete deploy.zip"
Write-Host "3. Ensure Nginx has 'location ^~ /api/' per nginx-spa.conf"
Write-Host "4. Restart Node project in aaPanel (or SSH: pm2 restart all)"
Write-Host "5. Check https://cowdi.net (press Ctrl+Shift+R)"
Write-Host ""

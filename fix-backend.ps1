# Complete Node.js v20 install and backend setup
Write-Host "🔧 Fixing Backend Setup..." -ForegroundColor Cyan

# Step 1: Uninstall Node v24
Write-Host "📦 Uninstalling Node.js v24..." -ForegroundColor Yellow
$app = Get-WmiObject -Class Win32_Product -Filter "Name LIKE '%Node.js%'"
if ($app) {
    $app.Uninstall() | Out-Null
    Start-Sleep -Seconds 5
    Write-Host "✅ Node.js v24 uninstalled" -ForegroundColor Green
}

# Step 2: Download and install Node v20
Write-Host "📥 Downloading Node.js v20 LTS..." -ForegroundColor Yellow
$ProgressPreference = 'SilentlyContinue'
$url = 'https://nodejs.org/dist/v20.11.0/node-v20.11.0-x64.msi'
$msi = "$env:TEMP\node-v20.msi"
Invoke-WebRequest -Uri $url -OutFile $msi
Write-Host "⚙️  Installing Node.js v20..." -ForegroundColor Yellow
Start-Process msiexec.exe -ArgumentList "/i $msi /quiet" -Wait
Remove-Item $msi -Force

# Step 3: Refresh PATH
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path", "User")
Write-Host "✅ Node.js v20 installed" -ForegroundColor Green
node --version
npm --version

# Step 4: Clean and install backend
Write-Host "🧹 Cleaning backend..." -ForegroundColor Yellow
cd C:\Users\rice\Documents\abdul\kartikeya-orchestator\backend
Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
npm cache clean --force

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Yellow
npm install

Write-Host "🚀 Starting backend server..." -ForegroundColor Green
npm start

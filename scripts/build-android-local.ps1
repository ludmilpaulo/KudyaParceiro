param(
  [ValidateSet("preview", "production", "local-apk", "local-aab")]
  [string]$Profile = "local-apk"
)

$ErrorActionPreference = "Stop"
Set-Location (Split-Path $PSScriptRoot -Parent)

function Require-EnvVar($name) {
  if (-not (Get-Item "Env:$name" -ErrorAction SilentlyContinue)) {
    Write-Error "Missing `$env:$name. Install Android Studio, then set ANDROID_HOME and JAVA_HOME (JDK 17)."
  }
}

Require-EnvVar "ANDROID_HOME"
Require-EnvVar "JAVA_HOME"

$sdkManager = Join-Path $env:ANDROID_HOME "cmdline-tools\latest\bin\sdkmanager.bat"
if (-not (Test-Path $sdkManager)) {
  Write-Warning "Android cmdline-tools not found at $sdkManager — EAS local build may fail until SDK is installed."
}

Write-Host "Building Android locally with profile '$Profile' (no EAS cloud quota)..." -ForegroundColor Cyan
npx eas-cli build --profile $Profile --platform android --local

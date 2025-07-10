# Save current location
$originalDir = Get-Location

# Move to project root
Set-Location (Join-Path $PSScriptRoot "..")

# ... your build commands ...
docker build -f backend/Dockerfile -t insighthub-backend .

# Restore original location
Set-Location $originalDir

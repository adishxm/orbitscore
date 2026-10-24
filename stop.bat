@echo off
title Stopping OrbitScore Services

echo ========================================================================
echo   Stopping OrbitScore Backend and Frontend Servers...
echo ========================================================================
echo.

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { if ($_ -gt 0) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped process ID: ' + $_) } }"

echo.
echo [OK] OrbitScore services on ports 8000 and 5173 have been stopped.
powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul 2>&1

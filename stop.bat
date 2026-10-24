@echo off
title Stopping OrbitScore Services

echo ========================================================================
echo   Stopping OrbitScore Backend and Frontend Servers...
echo ========================================================================
echo.

powershell -NoProfile -Command "Get-NetTCPConnection -LocalPort 8000, 5173 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { if ($_ -gt 0) { $proc = Get-Process -Id $_ -ErrorAction SilentlyContinue; if ($proc -and ($proc.ProcessName -match 'python|node|uvicorn|cmd')) { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue; Write-Host ('Stopped OrbitScore process: ' + $proc.ProcessName + ' (PID ' + $_ + ')') } else { Write-Host ('Skipping unverified process on port: PID ' + $_) } } }"

echo.
echo [OK] OrbitScore services on ports 8000 and 5173 have been stopped.
powershell -NoProfile -Command "Start-Sleep -Seconds 2" >nul 2>&1

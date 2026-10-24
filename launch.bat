@echo off
title OrbitScore - Space Sustainability and Compliance Platform

echo ========================================================================
echo   ORBITSCORE - Space Sustainability and Compliance Decision Support
echo ========================================================================
echo.

set ROOT_DIR=%~dp0
cd /d "%ROOT_DIR%"

echo [*] Checking system prerequisites...
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python is not found in PATH!
    echo Please install Python 3.10+ and make sure it is added to your PATH.
    pause
    exit /b 1
)

call npm --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js / npm is not found in PATH!
    echo Please install Node.js 18+ and make sure it is added to your PATH.
    pause
    exit /b 1
)

echo [OK] Prerequisites verified: Python and Node/npm are ready.
echo.
echo [1/3] Starting FastAPI Backend on http://127.0.0.1:8000 ...
start "OrbitScore Backend (FastAPI)" /D "%ROOT_DIR%backend" cmd /k python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

echo [2/3] Starting Vite React Frontend on http://localhost:5173 ...
start "OrbitScore Frontend (Vite)" /D "%ROOT_DIR%frontend" cmd /k npm.cmd run dev

echo.
echo [*] Waiting for services to initialize...
powershell -NoProfile -Command "Start-Sleep -Seconds 4" >nul 2>&1

echo [3/3] Opening OrbitScore in your default web browser...
start http://localhost:5173

echo.
echo ========================================================================
echo   ORBITSCORE IS NOW RUNNING!
echo ========================================================================
echo   - Frontend UI:          http://localhost:5173
echo   - Backend Health:       http://127.0.0.1:8000/health
echo   - Interactive API Docs: http://127.0.0.1:8000/docs
echo   - Readiness Probe:      http://127.0.0.1:8000/ready
echo ========================================================================
echo   To stop all services, close the Backend and Frontend command windows,
echo   or run 'stop.bat'.
echo ========================================================================
echo.

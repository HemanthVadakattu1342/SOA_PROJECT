@echo off
title SpendWise - Starting All Services
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-all.ps1"
if errorlevel 1 (
    echo.
    echo [ERROR] Startup failed. Read the message above, resolve it, and retry.
)
echo.
pause

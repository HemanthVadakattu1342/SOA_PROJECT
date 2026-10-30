@echo off
title SpendWise - Stopping All Services
color 0C
echo.
echo  ======================================================
echo   SpendWise - Stopping All Microservices
echo  ======================================================
echo.

REM Kill Java processes running the SpendWise JARs
echo Stopping all Java (Spring Boot) services...
for %%p in (
    "discovery-server-1.0.0.jar"
    "auth-service-1.0.0.jar"
    "category-service-1.0.0.jar"
    "expense-service-1.0.0.jar"
    "budget-service-1.0.0.jar"
    "notification-service-1.0.0.jar"
    "report-service-1.0.0.jar"
    "api-gateway-1.0.0.jar"
) do (
    for /f "tokens=2" %%i in ('wmic process where "CommandLine like '%%%~p%%'" get ProcessId /value 2^>nul ^| findstr ProcessId') do (
        echo   Killing process %%i (%%~p)
        taskkill /PID %%i /F >nul 2>&1
    )
)

REM Kill Node (React dev server) by port 5173
echo Stopping React frontend on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":5173 " 2^>nul') do (
    taskkill /PID %%a /F >nul 2>&1
)

echo.
echo  All services stopped.
echo.
pause

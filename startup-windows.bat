@echo off
setlocal

echo ============================================
echo  HeLpER - Windows Startup Script
echo ============================================
echo.

:: Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

:: Check if Rust is installed
where rustc >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Rust is not installed or not in PATH
    echo Please install Rust from https://rustup.rs/
    pause
    exit /b 1
)

:: Navigate to project directory
cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules" (
    echo [WARNING] Dependencies not installed. Running assembly first...
    echo.
    call assemble-windows.bat
    if %ERRORLEVEL% neq 0 (
        echo [ERROR] Assembly failed
        pause
        exit /b 1
    )
)

echo Starting HeLpER in development mode...
echo.
echo Press Ctrl+C to stop the development server.
echo.

call npm run tauri dev
if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Development server exited with an error
    pause
    exit /b 1
)

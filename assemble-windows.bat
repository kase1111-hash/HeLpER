@echo off
setlocal

echo ============================================
echo  HeLpER - Windows Assembly Script
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

echo [1/3] Installing npm dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install npm dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Installing Tauri CLI...
call npm install @tauri-apps/cli
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install Tauri CLI
    pause
    exit /b 1
)

echo.
echo [3/3] Building Rust dependencies...
cd src-tauri
call cargo fetch
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to fetch Rust dependencies
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo  Assembly Complete!
echo ============================================
echo.
echo Project is ready for development.
echo Run startup-windows.bat to start the dev server.
echo Run build-windows.bat to create a release build.
echo.

pause

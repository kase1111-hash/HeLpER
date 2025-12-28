@echo off
setlocal

echo ============================================
echo  HeLpER - Windows Build Script
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

echo [1/3] Installing dependencies...
call npm install
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Failed to install npm dependencies
    pause
    exit /b 1
)

echo.
echo [2/3] Building Tauri application for Windows...
call npm run tauri build
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Build failed
    pause
    exit /b 1
)

echo.
echo ============================================
echo  Build Complete!
echo ============================================
echo.
echo Installer location:
echo   src-tauri\target\release\bundle\msi\
echo.
echo Executable location:
echo   src-tauri\target\release\helper.exe
echo.

:: Open the bundle folder
explorer "src-tauri\target\release\bundle\msi"

pause

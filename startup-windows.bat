@echo off
setlocal EnableDelayedExpansion

:: ============================================
:: HeLpER - Windows Startup Script
:: ============================================

:: Error codes
set "ERR_NONE=0"
set "ERR_NO_NODE=10"
set "ERR_NO_RUST=11"
set "ERR_NO_DEPENDENCIES=25"
set "ERR_ASSEMBLY_FAILED=26"
set "ERR_DEV_SERVER=30"
set "ERR_UNKNOWN=99"

:: Initialize variables
set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "LOG_FILE=%LOG_DIR%\startup-%TIMESTAMP%.log"
set "EXIT_CODE=%ERR_NONE%"
set "DEV_SERVER_PID="

:: Navigate to project directory
cd /d "%SCRIPT_DIR%"

:: Create logs directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Start logging
call :log "============================================"
call :log " HeLpER - Windows Startup Script"
call :log " Started: %DATE% %TIME%"
call :log "============================================"

echo ============================================
echo  HeLpER - Windows Startup Script
echo ============================================
echo.

:: ============================================
:: Phase 1: Prerequisite Checks
:: ============================================
call :log "[PHASE 1] Checking prerequisites..."
echo [PHASE 1] Checking prerequisites...

:: Check Node.js
call :log "Checking Node.js..."
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    call :error %ERR_NO_NODE% "Node.js is not installed or not in PATH"
    echo [ERROR] Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    goto :cleanup
)
for /f "tokens=*" %%i in ('node --version') do set "NODE_VERSION=%%i"
call :log "Node.js: %NODE_VERSION%"
echo   Node.js: %NODE_VERSION%

:: Check Rust
call :log "Checking Rust..."
where rustc >nul 2>nul
if %ERRORLEVEL% neq 0 (
    call :error %ERR_NO_RUST% "Rust is not installed or not in PATH"
    echo [ERROR] Rust is not installed or not in PATH
    echo Please install Rust from https://rustup.rs/
    goto :cleanup
)
for /f "tokens=*" %%i in ('rustc --version') do set "RUST_VERSION=%%i"
call :log "Rust: %RUST_VERSION%"
echo   Rust: %RUST_VERSION%

echo.

:: ============================================
:: Phase 2: Dependency Check
:: ============================================
call :log "[PHASE 2] Checking dependencies..."
echo [PHASE 2] Checking dependencies...

if not exist "node_modules" (
    call :log "node_modules not found, running assembly..."
    echo [WARNING] Dependencies not installed. Running assembly first...
    echo.

    call assemble-windows.bat
    if %ERRORLEVEL% neq 0 (
        call :error %ERR_ASSEMBLY_FAILED% "Assembly failed"
        echo [ERROR] Assembly failed
        goto :cleanup
    )
)
call :log "Dependencies verified"
echo   Dependencies: OK
echo.

:: ============================================
:: Phase 3: Start Development Server
:: ============================================
call :log "[PHASE 3] Starting development server..."
echo [PHASE 3] Starting development server...
echo.
echo   Starting HeLpER in development mode...
echo   Press Ctrl+C to stop the server.
echo.
echo ============================================
echo.

:: Run the dev server
call :log "Starting Tauri dev server..."
call npm run tauri dev 2>>"%LOG_FILE%"
set "DEV_EXIT_CODE=%ERRORLEVEL%"

:: Server has stopped
call :log "Development server exited with code: %DEV_EXIT_CODE%"

if %DEV_EXIT_CODE% neq 0 (
    :: Check if it was a user interrupt (Ctrl+C)
    if %DEV_EXIT_CODE% equ 3221225786 (
        :: This is the Windows code for Ctrl+C
        call :log "Server stopped by user (Ctrl+C)"
        set "EXIT_CODE=%ERR_NONE%"
    ) else (
        call :error %ERR_DEV_SERVER% "Development server crashed"
        echo.
        echo [ERROR] Development server exited with an error
        echo   Exit code: %DEV_EXIT_CODE%
        echo   Check the log file for details: %LOG_FILE%
    )
) else (
    call :log "Development server stopped normally"
    set "EXIT_CODE=%ERR_NONE%"
)

goto :normal_exit

:: ============================================
:: Cleanup and Exit (on error)
:: ============================================
:cleanup
call :log "Startup failed with exit code: %EXIT_CODE%"

echo.
echo [FAILED] Startup failed. Check log: %LOG_FILE%
echo.
goto :end

:: ============================================
:: Normal Exit
:: ============================================
:normal_exit
call :log "============================================"
call :log " Startup script completed"
call :log " Exit code: %EXIT_CODE%"
call :log "============================================"

echo.
echo Development session ended.
echo Log: %LOG_FILE%
echo.

:end
call :log "Script ended with exit code: %EXIT_CODE%"
pause
exit /b %EXIT_CODE%

:: ============================================
:: Helper Functions
:: ============================================

:log
echo [%DATE% %TIME%] %~1 >> "%LOG_FILE%"
exit /b 0

:error
set "EXIT_CODE=%~1"
call :log "[ERROR] Code %~1: %~2"
exit /b 0

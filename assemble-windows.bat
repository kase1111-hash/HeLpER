@echo off
setlocal EnableDelayedExpansion

:: ============================================
:: HeLpER - Windows Assembly Script
:: With Boundary-SIEM and boundary-daemon integration
:: ============================================

:: Error codes
set "ERR_NONE=0"
set "ERR_NO_NODE=10"
set "ERR_NO_RUST=11"
set "ERR_NO_POWERSHELL=12"
set "ERR_POLICY_DENIED=20"
set "ERR_NPM_INSTALL=30"
set "ERR_TAURI_INSTALL=31"
set "ERR_CARGO_FETCH=32"
set "ERR_SECURITY_INIT=40"
set "ERR_CONNECTION_PROTECT=41"
set "ERR_UNKNOWN=99"

:: Initialize variables
set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "LOG_FILE=%LOG_DIR%\assembly-%TIMESTAMP%.log"
set "EXIT_CODE=%ERR_NONE%"
set "FAILED_OPERATIONS=0"
set "MAX_RETRIES=3"

:: Navigate to project directory
cd /d "%SCRIPT_DIR%"

:: Create logs directory
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

:: Start logging
call :log "============================================"
call :log " HeLpER - Windows Assembly Script"
call :log " Started: %DATE% %TIME%"
call :log "============================================"

echo ============================================
echo  HeLpER - Windows Assembly Script
echo  With Security Integration
echo ============================================
echo.

:: ============================================
:: Phase 1: Prerequisite Checks
:: ============================================
call :log "[PHASE 1] Checking prerequisites..."
echo [PHASE 1] Checking prerequisites...

:: Check PowerShell (required for security integration)
call :log "Checking PowerShell..."
where powershell >nul 2>nul
if %ERRORLEVEL% neq 0 (
    call :error %ERR_NO_POWERSHELL% "PowerShell is not installed or not in PATH"
    echo [ERROR] PowerShell is required for security integration
    goto :cleanup
)
call :log "PowerShell: OK"

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
:: Phase 2: Security Initialization
:: ============================================
call :log "[PHASE 2] Initializing security integration..."
echo [PHASE 2] Initializing security integration...

:: Initialize security module and report startup
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-StartupEvent -Mode 'assembly'; ^
    $policy = Request-BoundaryPolicy -Resource 'package-install' -AccessType 'install'; ^
    if (-not $policy.Allowed -and -not $policy.Unavailable) { exit 20 }; ^
    exit 0"

if %ERRORLEVEL% equ 20 (
    call :error %ERR_POLICY_DENIED% "Assembly blocked by boundary policy"
    echo [ERROR] Assembly operation blocked by security policy
    echo Please check boundary-daemon configuration
    goto :cleanup
)

if %ERRORLEVEL% neq 0 (
    call :log "[WARNING] Security module initialization had issues (non-critical)"
    echo [WARNING] Security integration unavailable (continuing anyway)
) else (
    call :log "Security module initialized successfully"
    echo   Security integration: Active
)

:: Protect network connections
call :log "Registering protected connections..."
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Protect-NetworkConnection -Destination 'registry.npmjs.org' -Port 443 -Purpose 'npm-install'; ^
    Protect-NetworkConnection -Destination 'crates.io' -Port 443 -Purpose 'cargo-fetch'; ^
    Protect-NetworkConnection -Destination 'github.com' -Port 443 -Purpose 'dependency-fetch'"

echo   Protected connections: npm, crates.io, github
echo.

:: ============================================
:: Phase 3: NPM Dependencies
:: ============================================
call :log "[PHASE 3] Installing npm dependencies..."
echo [PHASE 3] Installing npm dependencies...

set "RETRY_COUNT=0"
:npm_install_retry
call npm install 2>>"%LOG_FILE%"
if %ERRORLEVEL% neq 0 (
    set /a "RETRY_COUNT+=1"
    set /a "FAILED_OPERATIONS+=1"

    if !RETRY_COUNT! lss %MAX_RETRIES% (
        call :log "[RETRY] npm install failed, attempt !RETRY_COUNT! of %MAX_RETRIES%"
        echo   [RETRY] Attempt !RETRY_COUNT! failed, retrying...
        timeout /t 2 /nobreak >nul
        goto :npm_install_retry
    )

    call :error %ERR_NPM_INSTALL% "Failed to install npm dependencies after %MAX_RETRIES% attempts"
    call :report_error "ERR_NPM_INSTALL" "Failed to install npm dependencies" "npm" "high"
    echo [ERROR] Failed to install npm dependencies
    goto :cleanup
)
call :log "npm dependencies installed successfully"
call :report_success "npm-install" "NPM dependencies installed"
echo   npm dependencies: Installed
echo.

:: ============================================
:: Phase 4: Tauri CLI
:: ============================================
call :log "[PHASE 4] Installing Tauri CLI..."
echo [PHASE 4] Installing Tauri CLI...

set "RETRY_COUNT=0"
:tauri_install_retry
call npm install @tauri-apps/cli 2>>"%LOG_FILE%"
if %ERRORLEVEL% neq 0 (
    set /a "RETRY_COUNT+=1"
    set /a "FAILED_OPERATIONS+=1"

    if !RETRY_COUNT! lss %MAX_RETRIES% (
        call :log "[RETRY] Tauri CLI install failed, attempt !RETRY_COUNT! of %MAX_RETRIES%"
        echo   [RETRY] Attempt !RETRY_COUNT! failed, retrying...
        timeout /t 2 /nobreak >nul
        goto :tauri_install_retry
    )

    call :error %ERR_TAURI_INSTALL% "Failed to install Tauri CLI after %MAX_RETRIES% attempts"
    call :report_error "ERR_TAURI_INSTALL" "Failed to install Tauri CLI" "tauri" "high"
    echo [ERROR] Failed to install Tauri CLI
    goto :cleanup
)
call :log "Tauri CLI installed successfully"
call :report_success "tauri-install" "Tauri CLI installed"
echo   Tauri CLI: Installed
echo.

:: ============================================
:: Phase 5: Rust Dependencies
:: ============================================
call :log "[PHASE 5] Fetching Rust dependencies..."
echo [PHASE 5] Fetching Rust dependencies...

cd src-tauri
set "RETRY_COUNT=0"
:cargo_fetch_retry
call cargo fetch 2>>"%LOG_FILE%"
if %ERRORLEVEL% neq 0 (
    set /a "RETRY_COUNT+=1"
    set /a "FAILED_OPERATIONS+=1"

    if !RETRY_COUNT! lss %MAX_RETRIES% (
        call :log "[RETRY] cargo fetch failed, attempt !RETRY_COUNT! of %MAX_RETRIES%"
        echo   [RETRY] Attempt !RETRY_COUNT! failed, retrying...
        timeout /t 2 /nobreak >nul
        goto :cargo_fetch_retry
    )

    cd ..
    call :error %ERR_CARGO_FETCH% "Failed to fetch Rust dependencies after %MAX_RETRIES% attempts"
    call :report_error "ERR_CARGO_FETCH" "Failed to fetch Rust dependencies" "cargo" "high"
    echo [ERROR] Failed to fetch Rust dependencies
    goto :cleanup
)
cd ..
call :log "Rust dependencies fetched successfully"
call :report_success "cargo-fetch" "Rust dependencies fetched"
echo   Rust dependencies: Fetched
echo.

:: ============================================
:: Assembly Complete
:: ============================================
set "EXIT_CODE=%ERR_NONE%"
call :log "============================================"
call :log " Assembly Complete!"
call :log " Failed operations: %FAILED_OPERATIONS%"
call :log "============================================"

echo ============================================
echo  Assembly Complete!
echo ============================================
echo.
echo Project is ready for development.
echo   - Run startup-windows.bat to start the dev server
echo   - Run build-windows.bat to create a release build
echo.
echo Security log: %LOG_FILE%
echo.

:: Report successful completion
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-ShutdownEvent -ExitCode 0 -Reason 'assembly-complete'"

goto :end

:: ============================================
:: Cleanup and Exit
:: ============================================
:cleanup
call :log "Assembly failed with exit code: %EXIT_CODE%"

:: Report failure to security systems
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-ShutdownEvent -ExitCode %EXIT_CODE% -Reason 'assembly-failed'"

echo.
echo [FAILED] Assembly failed. Check log: %LOG_FILE%
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

:report_success
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-SiemEvent -Action '%~1' -Outcome 'success' -Severity 'info' -Message '%~2'"
exit /b 0

:report_error
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-ErrorEvent -ErrorCode '%~1' -ErrorMessage '%~2' -Component '%~3' -Severity '%~4'"
exit /b 0

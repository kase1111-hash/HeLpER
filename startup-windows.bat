@echo off
setlocal EnableDelayedExpansion

:: ============================================
:: HeLpER - Windows Startup Script
:: With Boundary-SIEM and boundary-daemon integration
:: ============================================

:: Error codes
set "ERR_NONE=0"
set "ERR_NO_NODE=10"
set "ERR_NO_RUST=11"
set "ERR_NO_POWERSHELL=12"
set "ERR_POLICY_DENIED=20"
set "ERR_NO_DEPENDENCIES=25"
set "ERR_ASSEMBLY_FAILED=26"
set "ERR_DEV_SERVER=30"
set "ERR_SECURITY_INIT=40"
set "ERR_CONNECTION_PROTECT=41"
set "ERR_TRIPWIRE=50"
set "ERR_UNKNOWN=99"

:: Initialize variables
set "SCRIPT_DIR=%~dp0"
set "LOG_DIR=%SCRIPT_DIR%logs"
set "TIMESTAMP=%DATE:~10,4%%DATE:~4,2%%DATE:~7,2%_%TIME:~0,2%%TIME:~3,2%%TIME:~6,2%"
set "TIMESTAMP=%TIMESTAMP: =0%"
set "LOG_FILE=%LOG_DIR%\startup-%TIMESTAMP%.log"
set "EXIT_CODE=%ERR_NONE%"
set "DEV_SERVER_PID="
set "BOUNDARY_MODE=unknown"

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

:: Initialize security module and check boundary mode
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-StartupEvent -Mode 'development'; ^
    $policy = Request-BoundaryPolicy -Resource 'dev-server' -AccessType 'execute'; ^
    if (-not $policy.Allowed -and -not $policy.Unavailable) { ^
        Write-Host \"BOUNDARY_MODE=$($policy.Mode)\"; ^
        exit 20 ^
    }; ^
    Write-Host \"BOUNDARY_MODE=$($policy.Mode)\"; ^
    exit 0" > "%TEMP%\boundary_check.txt" 2>&1

set /p BOUNDARY_OUTPUT=<"%TEMP%\boundary_check.txt"
for /f "tokens=2 delims==" %%a in ('echo %BOUNDARY_OUTPUT%') do set "BOUNDARY_MODE=%%a"
del "%TEMP%\boundary_check.txt" 2>nul

if %ERRORLEVEL% equ 20 (
    call :error %ERR_POLICY_DENIED% "Startup blocked by boundary policy (mode: %BOUNDARY_MODE%)"
    echo [ERROR] Development server blocked by security policy
    echo   Boundary mode: %BOUNDARY_MODE%
    echo Please check boundary-daemon configuration
    goto :cleanup
)

if %ERRORLEVEL% neq 0 (
    call :log "[WARNING] Security module initialization had issues (non-critical)"
    echo [WARNING] Security integration unavailable (continuing anyway)
    set "BOUNDARY_MODE=unavailable"
) else (
    call :log "Security module initialized successfully"
    echo   Security integration: Active
)

:: Check for tripwire conditions
call :log "Checking tripwire conditions..."
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    $policy = Request-BoundaryPolicy -Resource 'network-localhost' -AccessType 'network'; ^
    if ($policy.Mode -eq 'LOCKDOWN') { exit 50 }; ^
    exit 0"

if %ERRORLEVEL% equ 50 (
    call :error %ERR_TRIPWIRE% "System is in LOCKDOWN mode - tripwire triggered"
    echo [ERROR] Boundary daemon is in LOCKDOWN mode
    echo   A security tripwire has been triggered.
    echo   Please investigate and clear the lockdown before continuing.
    goto :cleanup
)

echo   Boundary mode: %BOUNDARY_MODE%
echo.

:: ============================================
:: Phase 3: Dependency Check
:: ============================================
call :log "[PHASE 3] Checking dependencies..."
echo [PHASE 3] Checking dependencies...

if not exist "node_modules" (
    call :log "node_modules not found, running assembly..."
    echo [WARNING] Dependencies not installed. Running assembly first...
    echo.

    :: Report this event
    call :report_event "auto-assembly" "info" "Auto-running assembly due to missing dependencies"

    call assemble-windows.bat
    if %ERRORLEVEL% neq 0 (
        call :error %ERR_ASSEMBLY_FAILED% "Assembly failed"
        call :report_error "ERR_ASSEMBLY_FAILED" "Auto-assembly failed" "assembly" "high"
        echo [ERROR] Assembly failed
        goto :cleanup
    )
)
call :log "Dependencies verified"
echo   Dependencies: OK
echo.

:: ============================================
:: Phase 4: Register Protected Connections
:: ============================================
call :log "[PHASE 4] Registering protected connections..."
echo [PHASE 4] Registering protected connections...

:: Register the development server connections with boundary-daemon
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Protect-NetworkConnection -Destination 'localhost' -Port 1420 -Purpose 'vite-dev-server'; ^
    Protect-NetworkConnection -Destination '127.0.0.1' -Port 1420 -Purpose 'vite-dev-server'; ^
    Protect-NetworkConnection -Destination 'localhost' -Port 5173 -Purpose 'vite-hmr'; ^
    Send-SiemEvent -Action 'connection-protection' -Outcome 'success' -Severity 'info' -Message 'Development connections registered'"

echo   localhost:1420 (Vite dev server): Protected
echo   localhost:5173 (Vite HMR): Protected
echo.

:: ============================================
:: Phase 5: Start Development Server
:: ============================================
call :log "[PHASE 5] Starting development server..."
echo [PHASE 5] Starting development server...
echo.
echo   Starting HeLpER in development mode...
echo   Press Ctrl+C to stop the server.
echo.
echo ============================================
echo.

:: Report server start
call :report_event "dev-server-start" "info" "Starting Tauri development server"

:: Set up signal handler for clean shutdown
call :log "Starting Tauri dev server..."

:: Run the dev server
call npm run tauri dev 2>>"%LOG_FILE%"
set "DEV_EXIT_CODE=%ERRORLEVEL%"

:: Server has stopped
call :log "Development server exited with code: %DEV_EXIT_CODE%"

if %DEV_EXIT_CODE% neq 0 (
    :: Check if it was a user interrupt (Ctrl+C)
    if %DEV_EXIT_CODE% equ 3221225786 (
        :: This is the Windows code for Ctrl+C
        call :log "Server stopped by user (Ctrl+C)"
        call :report_event "dev-server-stop" "info" "Development server stopped by user"
        set "EXIT_CODE=%ERR_NONE%"
    ) else (
        call :error %ERR_DEV_SERVER% "Development server crashed"
        call :report_error "ERR_DEV_SERVER" "Development server exited unexpectedly" "tauri-dev" "high"
        echo.
        echo [ERROR] Development server exited with an error
        echo   Exit code: %DEV_EXIT_CODE%
        echo   Check the log file for details: %LOG_FILE%
    )
) else (
    call :log "Development server stopped normally"
    call :report_event "dev-server-stop" "info" "Development server stopped normally"
    set "EXIT_CODE=%ERR_NONE%"
)

goto :normal_exit

:: ============================================
:: Cleanup and Exit (on error)
:: ============================================
:cleanup
call :log "Startup failed with exit code: %EXIT_CODE%"

:: Report failure to security systems
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-ShutdownEvent -ExitCode %EXIT_CODE% -Reason 'startup-failed'"

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

:: Report shutdown
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-ShutdownEvent -ExitCode %EXIT_CODE% -Reason 'normal-shutdown'"

echo.
echo Development session ended.
echo Security log: %LOG_FILE%
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

:report_event
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-SiemEvent -Action '%~1' -Outcome 'success' -Severity '%~2' -Message '%~3'"
exit /b 0

:report_error
powershell -ExecutionPolicy Bypass -Command ^
    "$ErrorActionPreference = 'SilentlyContinue'; ^
    . '%SCRIPT_DIR%scripts\security-integration.ps1'; ^
    Initialize-SecurityModule; ^
    Send-ErrorEvent -ErrorCode '%~1' -ErrorMessage '%~2' -Component '%~3' -Severity '%~4'"
exit /b 0

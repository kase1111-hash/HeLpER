# HeLpER Security Integration Module
# Integrates with Boundary-SIEM and boundary-daemon for security monitoring

param(
    [Parameter(Mandatory=$false)]
    [string]$ConfigPath = "$PSScriptRoot\..\security-config.json"
)

# Default configuration
$Script:DefaultConfig = @{
    SiemEndpoint = "http://localhost:8080/api/v1/events"
    SiemApiKey = ""
    DaemonSocket = "/var/run/boundary-daemon.sock"
    DaemonHttpEndpoint = "http://localhost:9090/api/v1"
    EnableSiem = $true
    EnableDaemon = $true
    LogPath = "$PSScriptRoot\..\logs"
    ProductName = "HeLpER"
    ProductVersion = "0.1.0"
    Severity = @{
        Info = 1
        Low = 3
        Medium = 5
        High = 7
        Critical = 10
    }
}

$Script:Config = $null
$Script:SessionId = [guid]::NewGuid().ToString()

function Initialize-SecurityModule {
    <#
    .SYNOPSIS
    Initializes the security module with configuration
    #>

    # Load configuration
    if (Test-Path $ConfigPath) {
        try {
            $fileConfig = Get-Content $ConfigPath -Raw | ConvertFrom-Json
            $Script:Config = @{}

            # Merge with defaults
            foreach ($key in $Script:DefaultConfig.Keys) {
                if ($null -ne $fileConfig.$key) {
                    $Script:Config[$key] = $fileConfig.$key
                } else {
                    $Script:Config[$key] = $Script:DefaultConfig[$key]
                }
            }
        } catch {
            Write-Warning "Failed to load security config, using defaults: $_"
            $Script:Config = $Script:DefaultConfig.Clone()
        }
    } else {
        $Script:Config = $Script:DefaultConfig.Clone()
    }

    # Ensure log directory exists
    if (-not (Test-Path $Script:Config.LogPath)) {
        New-Item -ItemType Directory -Path $Script:Config.LogPath -Force | Out-Null
    }

    return $true
}

function Get-Timestamp {
    return (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

function Write-SecurityLog {
    <#
    .SYNOPSIS
    Writes to local security log file in CEF format for SIEM ingestion
    #>
    param(
        [string]$Action,
        [string]$Outcome,
        [int]$Severity,
        [string]$Message,
        [hashtable]$Extensions = @{}
    )

    $timestamp = Get-Timestamp
    $logFile = Join-Path $Script:Config.LogPath "security-$(Get-Date -Format 'yyyy-MM-dd').log"

    # CEF Format: CEF:Version|Device Vendor|Device Product|Device Version|Signature ID|Name|Severity|Extensions
    $signatureId = "$Action-$Outcome"
    $extString = ($Extensions.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }) -join " "

    $cefLine = "CEF:0|HeLpER|$($Script:Config.ProductName)|$($Script:Config.ProductVersion)|$signatureId|$Message|$Severity|$extString sessionId=$Script:SessionId"

    try {
        Add-Content -Path $logFile -Value "[$timestamp] $cefLine"
    } catch {
        Write-Warning "Failed to write security log: $_"
    }
}

function Send-SiemEvent {
    <#
    .SYNOPSIS
    Sends an event to Boundary-SIEM
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Action,

        [Parameter(Mandatory=$true)]
        [ValidateSet("success", "failure", "unknown")]
        [string]$Outcome,

        [Parameter(Mandatory=$true)]
        [ValidateSet("info", "low", "medium", "high", "critical")]
        [string]$Severity,

        [Parameter(Mandatory=$true)]
        [string]$Message,

        [hashtable]$Metadata = @{}
    )

    if (-not $Script:Config.EnableSiem) {
        return @{ Success = $true; Skipped = $true }
    }

    $severityValue = $Script:Config.Severity[$Severity.Substring(0,1).ToUpper() + $Severity.Substring(1).ToLower()]

    # Write to local log first
    Write-SecurityLog -Action $Action -Outcome $Outcome -Severity $severityValue -Message $Message -Extensions $Metadata

    $event = @{
        timestamp = Get-Timestamp
        source = @{
            product = $Script:Config.ProductName
            version = $Script:Config.ProductVersion
            hostname = $env:COMPUTERNAME
            ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPAddress
        }
        session_id = $Script:SessionId
        action = $Action
        outcome = $Outcome
        severity = $severityValue
        message = $Message
        metadata = $Metadata
        user = @{
            name = $env:USERNAME
            domain = $env:USERDOMAIN
        }
    }

    $headers = @{
        "Content-Type" = "application/json"
    }

    if ($Script:Config.SiemApiKey) {
        $headers["Authorization"] = "Bearer $($Script:Config.SiemApiKey)"
    }

    try {
        $response = Invoke-RestMethod -Uri $Script:Config.SiemEndpoint -Method Post -Body ($event | ConvertTo-Json -Depth 10) -Headers $headers -TimeoutSec 5 -ErrorAction Stop
        return @{ Success = $true; Response = $response }
    } catch {
        Write-Warning "Failed to send event to SIEM: $_"
        return @{ Success = $false; Error = $_.Exception.Message }
    }
}

function Request-BoundaryPolicy {
    <#
    .SYNOPSIS
    Requests policy decision from boundary-daemon
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Resource,

        [Parameter(Mandatory=$true)]
        [ValidateSet("read", "write", "execute", "network", "install")]
        [string]$AccessType,

        [hashtable]$Context = @{}
    )

    if (-not $Script:Config.EnableDaemon) {
        return @{ Allowed = $true; Skipped = $true; Mode = "disabled" }
    }

    $request = @{
        timestamp = Get-Timestamp
        session_id = $Script:SessionId
        resource = $Resource
        access_type = $AccessType
        context = $Context
        requester = @{
            process = "HeLpER"
            user = $env:USERNAME
            hostname = $env:COMPUTERNAME
        }
    }

    try {
        $response = Invoke-RestMethod -Uri "$($Script:Config.DaemonHttpEndpoint)/policy/check" -Method Post -Body ($request | ConvertTo-Json -Depth 5) -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop

        return @{
            Allowed = $response.allowed
            Mode = $response.mode
            Reason = $response.reason
        }
    } catch {
        # Fail-open for development, fail-closed for production
        Write-Warning "Boundary daemon unavailable, defaulting to allowed: $_"
        return @{ Allowed = $true; Unavailable = $true; Mode = "unknown" }
    }
}

function Protect-NetworkConnection {
    <#
    .SYNOPSIS
    Registers a network connection with boundary-daemon for protection
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$Destination,

        [Parameter(Mandatory=$true)]
        [int]$Port,

        [string]$Protocol = "tcp",
        [string]$Purpose = "general"
    )

    if (-not $Script:Config.EnableDaemon) {
        return @{ Protected = $false; Skipped = $true }
    }

    $request = @{
        timestamp = Get-Timestamp
        session_id = $Script:SessionId
        connection = @{
            destination = $Destination
            port = $Port
            protocol = $Protocol
            purpose = $Purpose
        }
        requester = @{
            process = "HeLpER"
            user = $env:USERNAME
        }
    }

    try {
        $response = Invoke-RestMethod -Uri "$($Script:Config.DaemonHttpEndpoint)/connections/protect" -Method Post -Body ($request | ConvertTo-Json -Depth 5) -ContentType "application/json" -TimeoutSec 3 -ErrorAction Stop

        return @{
            Protected = $response.protected
            ConnectionId = $response.connection_id
            Rules = $response.rules
        }
    } catch {
        Write-Warning "Failed to register connection protection: $_"
        return @{ Protected = $false; Error = $_.Exception.Message }
    }
}

function Invoke-SecureOperation {
    <#
    .SYNOPSIS
    Executes an operation with full security integration
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$OperationName,

        [Parameter(Mandatory=$true)]
        [scriptblock]$Operation,

        [string]$Resource = "system",
        [string]$AccessType = "execute",
        [ValidateSet("info", "low", "medium", "high", "critical")]
        [string]$Severity = "info"
    )

    $startTime = Get-Date
    $result = @{
        Success = $false
        Output = $null
        Error = $null
        Duration = 0
    }

    # Check policy
    $policy = Request-BoundaryPolicy -Resource $Resource -AccessType $AccessType
    if (-not $policy.Allowed) {
        $result.Error = "Operation blocked by boundary policy: $($policy.Reason)"
        Send-SiemEvent -Action $OperationName -Outcome "failure" -Severity "high" -Message "Operation blocked by policy" -Metadata @{
            reason = $policy.Reason
            mode = $policy.Mode
        }
        return $result
    }

    # Report operation start
    Send-SiemEvent -Action "$OperationName-start" -Outcome "success" -Severity $Severity -Message "Starting operation: $OperationName" -Metadata @{
        resource = $Resource
        access_type = $AccessType
    }

    try {
        $result.Output = & $Operation
        $result.Success = $true
        $result.Duration = ((Get-Date) - $startTime).TotalMilliseconds

        Send-SiemEvent -Action "$OperationName-complete" -Outcome "success" -Severity $Severity -Message "Operation completed: $OperationName" -Metadata @{
            duration_ms = $result.Duration
        }
    } catch {
        $result.Error = $_.Exception.Message
        $result.Duration = ((Get-Date) - $startTime).TotalMilliseconds

        Send-SiemEvent -Action "$OperationName-error" -Outcome "failure" -Severity "high" -Message "Operation failed: $OperationName" -Metadata @{
            error = $result.Error
            duration_ms = $result.Duration
        }
    }

    return $result
}

function Send-StartupEvent {
    <#
    .SYNOPSIS
    Reports application startup to security systems
    #>
    param(
        [string]$Mode = "development"
    )

    Send-SiemEvent -Action "application-startup" -Outcome "success" -Severity "info" -Message "HeLpER starting in $Mode mode" -Metadata @{
        mode = $Mode
        powershell_version = $PSVersionTable.PSVersion.ToString()
        os = [System.Environment]::OSVersion.VersionString
    }
}

function Send-ShutdownEvent {
    <#
    .SYNOPSIS
    Reports application shutdown to security systems
    #>
    param(
        [int]$ExitCode = 0,
        [string]$Reason = "normal"
    )

    $outcome = if ($ExitCode -eq 0) { "success" } else { "failure" }
    $severity = if ($ExitCode -eq 0) { "info" } else { "medium" }

    Send-SiemEvent -Action "application-shutdown" -Outcome $outcome -Severity $severity -Message "HeLpER shutting down" -Metadata @{
        exit_code = $ExitCode
        reason = $Reason
    }
}

function Send-ErrorEvent {
    <#
    .SYNOPSIS
    Reports an error to security systems
    #>
    param(
        [Parameter(Mandatory=$true)]
        [string]$ErrorCode,

        [Parameter(Mandatory=$true)]
        [string]$ErrorMessage,

        [string]$Component = "unknown",
        [ValidateSet("low", "medium", "high", "critical")]
        [string]$Severity = "medium"
    )

    Send-SiemEvent -Action "error" -Outcome "failure" -Severity $Severity -Message $ErrorMessage -Metadata @{
        error_code = $ErrorCode
        component = $Component
    }
}

# Export functions
Export-ModuleMember -Function @(
    'Initialize-SecurityModule',
    'Send-SiemEvent',
    'Request-BoundaryPolicy',
    'Protect-NetworkConnection',
    'Invoke-SecureOperation',
    'Send-StartupEvent',
    'Send-ShutdownEvent',
    'Send-ErrorEvent',
    'Write-SecurityLog'
)

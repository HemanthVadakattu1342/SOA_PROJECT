$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$jwtSecret = "SpendWise-Super-Secret-Key-That-Is-At-Least-256-Bits-Long-For-Security"
$services = @(
    @{ Name = "Auth"; Port = 8081; Jar = "backend\auth-service\target\auth-service-1.0.0.jar"; Database = $true },
    @{ Name = "Category"; Port = 8083; Jar = "backend\category-service\target\category-service-1.0.0.jar"; Database = $true },
    @{ Name = "Expense"; Port = 8082; Jar = "backend\expense-service\target\expense-service-1.0.0.jar"; Database = $true },
    @{ Name = "Budget"; Port = 8084; Jar = "backend\budget-service\target\budget-service-1.0.0.jar"; Database = $true },
    @{ Name = "Notification"; Port = 8086; Jar = "backend\notification-service\target\notification-service-1.0.0.jar"; Database = $true },
    @{ Name = "Report"; Port = 8085; Jar = "backend\report-service\target\report-service-1.0.0.jar"; Database = $false },
    @{ Name = "Gateway"; Port = 8080; Jar = "backend\api-gateway\target\api-gateway-1.0.0.jar"; Database = $false }
)

function Wait-ForHealth($name, $port, $process, $timeoutSeconds = 120) {
    $deadline = (Get-Date).AddSeconds($timeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        if ($process.HasExited) {
            throw "$name exited before becoming healthy. Check its service window for the error."
        }

        try {
            $health = Invoke-RestMethod -Uri "http://localhost:$port/actuator/health" -TimeoutSec 3
            if ($health.status -eq "UP") {
                Write-Host "  [READY] $name on port $port"
                return
            }
        } catch {
            Start-Sleep -Seconds 2
        }
    }

    throw "$name did not become healthy on port $port within $timeoutSeconds seconds."
}

Write-Host "`nSpendWise - starting local services`n"

$missingJars = @($services | Where-Object { -not (Test-Path (Join-Path $root $_.Jar)) })
if ($missingJars.Count -gt 0 -or -not (Test-Path (Join-Path $root "backend\discovery-server\target\discovery-server-1.0.0.jar"))) {
    Write-Host "Building backend services first..."
    & (Join-Path $root "build-all.ps1")
    if ($LASTEXITCODE -ne 0) {
        throw "Backend build failed."
    }
}

$discoveryJar = Join-Path $root "backend\discovery-server\target\discovery-server-1.0.0.jar"
if (-not (Test-Path $discoveryJar)) {
    throw "Discovery server JAR is missing. Run build-all.bat and check the build output."
}

try {
    $mysql = Get-Service -Name "MySQL80" -ErrorAction SilentlyContinue
    if ($mysql -and $mysql.Status -ne "Running") {
        Start-Service -Name "MySQL80"
    }
    $mysqlConnection = Test-NetConnection -ComputerName "127.0.0.1" -Port 3306 -WarningAction SilentlyContinue
    if (-not $mysqlConnection.TcpTestSucceeded) {
        throw "MySQL is not accepting connections at localhost:3306. Start MySQL and try again."
    }

    if ([string]::IsNullOrEmpty($env:DB_PASSWORD)) {
        $securePassword = Read-Host "Enter your MySQL root password" -AsSecureString
        if ($securePassword.Length -eq 0) {
            throw "The MySQL password cannot be empty."
        }
        $passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
        try {
            $env:DB_PASSWORD = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
        } finally {
            [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
            $securePassword.Dispose()
        }
    } else {
        Write-Host "Using the MySQL password supplied to this process."
    }
    $env:DB_USERNAME = "root"
    $env:JWT_SECRET = $jwtSecret

    $ports = @(8761) + @($services | ForEach-Object { $_.Port }) + @(5173)
    $inUse = Get-NetTCPConnection -State Listen -ErrorAction SilentlyContinue |
        Where-Object { $_.LocalPort -in $ports }
    if ($inUse) {
        $busyPorts = ($inUse.LocalPort | Sort-Object -Unique) -join ", "
        throw "These required ports are already in use: $busyPorts. Close the other app/services and retry."
    }

    $java = (Get-Command java.exe -ErrorAction Stop).Source
    $running = @{}
    Write-Host "[1/9] Starting Eureka Discovery Server..."
    $running["Eureka"] = Start-Process -FilePath $java -ArgumentList @("-jar", "`"$discoveryJar`"") -WorkingDirectory $root -PassThru -WindowStyle Normal
    Wait-ForHealth "Eureka" 8761 $running["Eureka"]

    $index = 2
    foreach ($service in $services | Where-Object { $_.Name -ne "Gateway" }) {
        Write-Host "[$index/9] Starting $($service.Name) Service..."
        $jarPath = Join-Path $root $service.Jar
        $running[$service.Name] = Start-Process -FilePath $java -ArgumentList @("-jar", "`"$jarPath`"") -WorkingDirectory $root -PassThru -WindowStyle Normal
        $index++
    }

    foreach ($service in $services | Where-Object { $_.Name -ne "Gateway" }) {
        Wait-ForHealth "$($service.Name) Service" $service.Port $running[$service.Name]
    }

    $gateway = $services | Where-Object { $_.Name -eq "Gateway" }
    Write-Host "[8/9] Starting API Gateway..."
    $gatewayJar = Join-Path $root $gateway.Jar
    $running["Gateway"] = Start-Process -FilePath $java -ArgumentList @("-jar", "`"$gatewayJar`"") -WorkingDirectory $root -PassThru -WindowStyle Normal
    Wait-ForHealth "API Gateway" 8080 $running["Gateway"]
} finally {
    Remove-Item Env:\DB_PASSWORD -ErrorAction SilentlyContinue
    Remove-Item Env:\DB_USERNAME -ErrorAction SilentlyContinue
    Remove-Item Env:\JWT_SECRET -ErrorAction SilentlyContinue
}

$frontend = Join-Path $root "frontend"
if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    Write-Host "[9/9] Installing frontend packages..."
    Push-Location $frontend
    try {
        & npm.cmd install
        if ($LASTEXITCODE -ne 0) {
            throw "Frontend dependency installation failed."
        }
    } finally {
        Pop-Location
    }
}

Write-Host "[9/9] Starting React frontend..."
$frontendProcess = Start-Process -FilePath "cmd.exe" -ArgumentList @("/k", "npm.cmd run dev -- --host 127.0.0.1") -WorkingDirectory $frontend -PassThru -WindowStyle Normal
$frontendDeadline = (Get-Date).AddSeconds(45)
do {
    Start-Sleep -Seconds 2
    $frontendReady = (Test-NetConnection -ComputerName "127.0.0.1" -Port 5173 -WarningAction SilentlyContinue).TcpTestSucceeded
    if ($frontendProcess.HasExited) {
        throw "Frontend process exited. Check the frontend terminal for the error."
    }
} while (-not $frontendReady -and (Get-Date) -lt $frontendDeadline)
if (-not $frontendReady) {
    throw "Frontend did not start listening on port 5173 within 45 seconds."
}

Write-Host "`nALL SERVICES ARE READY"
Write-Host "Frontend:        http://localhost:5173"
Write-Host "Eureka:          http://localhost:8761"
Write-Host "API Gateway:     http://localhost:8080"
Write-Host "Swagger:         http://localhost:8080/swagger-ui.html`n"
Start-Process "http://localhost:5173"

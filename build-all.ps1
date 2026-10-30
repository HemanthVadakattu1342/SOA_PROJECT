$ErrorActionPreference = "Stop"
$root = $PSScriptRoot
$services = @(
    "discovery-server",
    "auth-service",
    "category-service",
    "expense-service",
    "budget-service",
    "notification-service",
    "report-service",
    "api-gateway"
)

$maven = Get-Command mvn.cmd -ErrorAction SilentlyContinue
if (-not $maven) {
    $maven = Get-Command mvn -ErrorAction SilentlyContinue
}
if (-not $maven) {
    $localMaven = Join-Path $env:LOCALAPPDATA "Programs\Apache\Maven\apache-maven-3.9.11\bin\mvn.cmd"
    if (Test-Path $localMaven) {
        $maven = Get-Command $localMaven
    }
}
if (-not $maven) {
    throw "Maven 3.8+ is required but was not found on PATH. Install Maven, open a new terminal, and retry."
}

$env:MAVEN_OPTS = "-Xmx512m"
foreach ($service in $services) {
    Write-Host "`nBuilding $service..."
    & $maven.Source -B -f (Join-Path $root "backend\$service\pom.xml") clean package -DskipTests
    if ($LASTEXITCODE -ne 0) {
        throw "Build failed for $service (exit code $LASTEXITCODE)."
    }
}

Write-Host "`nAll backend services built successfully."

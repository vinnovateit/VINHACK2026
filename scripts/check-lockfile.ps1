<#
.SYNOPSIS
    Verifies package-lock.json is in sync with package.json, the same check
    Cloudflare's build runs via `npm ci`. Catches the EUSAGE "not in sync"
    failure locally, before it reaches the Cloudflare build.

.PARAMETER Fix
    If the lockfile is out of sync, regenerate it (package-lock.json only,
    node_modules is left untouched) instead of just reporting the problem.

    Regeneration prefers Docker, running the exact node/npm version pinned
    in package.json's "engines" field inside a Linux container - matching
    Cloudflare's build environment (Linux, that node/npm build) far more
    closely than any locally installed npm can, without installing that
    node/npm version on this machine. Falls back to `npx npm@<version>`
    (pins npm only, still runs on the host OS/arch) if Docker isn't
    installed or the daemon isn't running.

.NOTES
    A local npm newer than Cloudflare's build npm can silently accept, or
    even produce, a lockfile shape that the older npm rejects as "out of
    sync" - which is exactly what caused the original Cloudflare failure
    even though a plain local `npm ci --dry-run` reported no problem.
#>

param(
    [switch]$Fix,
    [string]$NpmVersion = '10.9.2'
)

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
Push-Location $repoRoot

function Get-PinnedNodeVersion {
    try {
        $pkg = Get-Content (Join-Path $repoRoot 'package.json') -Raw | ConvertFrom-Json
        if ($pkg.engines -and $pkg.engines.node) {
            return $pkg.engines.node
        }
    }
    catch {}
    return 'lts'
}

function Test-DockerReady {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        return $false
    }
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    docker info *>$null
    $ready = ($LASTEXITCODE -eq 0)
    $ErrorActionPreference = $prevEap
    return $ready
}

function Invoke-DockerFix {
    param([string]$NodeVersion)

    $image = "node:$NodeVersion"
    $tempDir = Join-Path ([System.IO.Path]::GetTempPath()) ("lockfix-" + [guid]::NewGuid())
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    try {
        Copy-Item (Join-Path $repoRoot 'package.json') (Join-Path $tempDir 'package.json')
        $lockSrc = Join-Path $repoRoot 'package-lock.json'
        if (Test-Path $lockSrc) {
            Copy-Item $lockSrc (Join-Path $tempDir 'package-lock.json')
        }

        Write-Host "Using Docker ($image) to regenerate package-lock.json (matches Cloudflare's Linux build env)..." -ForegroundColor Yellow

        $prevEap = $ErrorActionPreference
        $ErrorActionPreference = 'Continue'
        docker run --rm -v "${tempDir}:/repo" -w /repo $image npm install --package-lock-only --no-audit --no-fund
        $dockerExit = $LASTEXITCODE
        $ErrorActionPreference = $prevEap

        if ($dockerExit -ne 0) {
            Write-Host "Docker-based regeneration failed (exit $dockerExit)." -ForegroundColor Red
            return $false
        }

        Copy-Item (Join-Path $tempDir 'package-lock.json') $lockSrc -Force
        return $true
    }
    finally {
        Remove-Item $tempDir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

function Invoke-NpxFix {
    param([string]$Version)

    Write-Host "Docker unavailable - falling back to 'npx npm@$Version install --package-lock-only'." -ForegroundColor Yellow
    Write-Host "(Lower fidelity: pins the npm version only, still runs on this host's OS/arch.)" -ForegroundColor Yellow

    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    npx --yes "npm@$Version" install --package-lock-only --no-audit --no-fund
    $exit = $LASTEXITCODE
    $ErrorActionPreference = $prevEap
    return ($exit -eq 0)
}

try {
    if (-not (Get-Command npx -ErrorAction SilentlyContinue)) {
        Write-Error "npx not found on PATH (comes with npm)."
        exit 1
    }

    Write-Host "Checking package-lock.json is in sync with package.json (npm@$NpmVersion ci --dry-run)..." -ForegroundColor Cyan

    # --dry-run performs npm ci's lockfile-sync validation without writing
    # node_modules, so this mirrors what Cloudflare's build does. Pinned via
    # npx to the exact npm version Cloudflare's build uses - see .NOTES.
    # EBADENGINE/funding warnings go to stderr; don't let PowerShell treat
    # those as terminating errors.
    $prevEap = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    npx --yes "npm@$NpmVersion" ci --dry-run --no-audit --no-fund *>$null
    $ciExit = $LASTEXITCODE
    $ErrorActionPreference = $prevEap

    if ($ciExit -eq 0) {
        Write-Host "package-lock.json is in sync." -ForegroundColor Green
        exit 0
    }

    Write-Host "package-lock.json is OUT OF SYNC with package.json." -ForegroundColor Red
    Write-Host "This is what would fail on Cloudflare's 'npm clean-install'." -ForegroundColor Red

    if (-not $Fix) {
        Write-Host ""
        Write-Host "Fix it with:" -ForegroundColor Yellow
        Write-Host "  powershell -File scripts/check-lockfile.ps1 -Fix" -ForegroundColor Yellow
        exit 1
    }

    $nodeVersion = Get-PinnedNodeVersion
    $fixed = $false

    if (Test-DockerReady) {
        $fixed = Invoke-DockerFix -NodeVersion $nodeVersion
    }
    else {
        Write-Host "Docker not installed or daemon not running." -ForegroundColor Yellow
    }

    if (-not $fixed) {
        $fixed = Invoke-NpxFix -Version $NpmVersion
    }

    if (-not $fixed) {
        Write-Error "Failed to regenerate package-lock.json."
        exit 1
    }

    Write-Host "package-lock.json regenerated." -ForegroundColor Green
    exit 0
}
finally {
    Pop-Location
}

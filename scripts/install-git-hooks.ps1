<#
.SYNOPSIS
    One-time setup: installs a pre-commit hook that runs
    scripts/check-lockfile.ps1 -Fix whenever package.json or
    package-lock.json is staged. If the lockfile is out of sync, it is
    auto-regenerated (via Docker when available, matching Cloudflare's
    build env) and staged automatically so the commit proceeds with a
    lockfile that will actually pass Cloudflare's `npm ci`. The commit is
    only blocked if regeneration itself fails.

.NOTES
    Run this once after cloning: powershell -File scripts/install-git-hooks.ps1
#>

$ErrorActionPreference = 'Stop'
$repoRoot = Split-Path -Parent $PSScriptRoot
$hooksDir = Join-Path $repoRoot '.git\hooks'

if (-not (Test-Path $hooksDir)) {
    Write-Error "No .git/hooks directory found - is this a git repo checkout?"
    exit 1
}

$hookPath = Join-Path $hooksDir 'pre-commit'

$hookContent = @'
#!/bin/sh
# Installed by scripts/install-git-hooks.ps1
# Auto-fixes package-lock.json when it drifts out of sync with
# package.json (the exact failure Cloudflare's `npm ci` hits otherwise),
# and stages the fix so the commit proceeds with a working lockfile.

if git diff --cached --name-only | grep -qE '^package(-lock)?\.json$'; then
    root="$(git rev-parse --show-toplevel)"
    powershell.exe -NoProfile -ExecutionPolicy Bypass -File "$root/scripts/check-lockfile.ps1" -Fix
    if [ $? -ne 0 ]; then
        echo ""
        echo "pre-commit hook: could not regenerate package-lock.json. Commit blocked."
        exit 1
    fi
    git add "$root/package-lock.json"
fi
'@

Set-Content -Path $hookPath -Value $hookContent -NoNewline -Encoding ascii
Write-Host "Installed pre-commit hook at $hookPath" -ForegroundColor Green
Write-Host "It will run 'scripts/check-lockfile.ps1 -Fix' whenever package.json or package-lock.json is staged," -ForegroundColor Green
Write-Host "auto-regenerating and staging package-lock.json if it's out of sync." -ForegroundColor Green

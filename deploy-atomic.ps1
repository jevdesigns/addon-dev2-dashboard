<#
deploy-atomic.ps1

Performs an atomic deploy of the `dist/` folder to the target Samba share.
Steps:
  - Build is expected to have produced `dist/` already (script can be called after build)
  - Copy `dist/` into a timestamped temp folder on the target share
  - Rewrite `index.html` in the temp folder to append a cache-busting `?v=<ts>` to asset URLs
  - Move existing target to a timestamped backup and move temp -> target
  - Optionally remove backups older than N days

Usage:
  powershell -NoProfile -File ./deploy-atomic.ps1 -TargetPath 'Z:\www\d522-react' -DistPath '.\dist' -KeepBackupsForDays 3
#>

param(
    [string]$TargetPath = 'Z:\www\d522-react',
    [string]$DistPath = '.\dist',
    [int]$KeepBackupsForDays = 3,
    [switch]$ForceBuild
)

function Timestamp() { Get-Date -Format 'yyyyMMddHHmmss' }

if ($ForceBuild) {
    Write-Host 'Running production build first...'
    npm run build
}

$ts = Timestamp
$temp = Join-Path (Split-Path -Path $TargetPath -Parent) (Split-Path -Leaf $TargetPath + "_tmp_$ts")
$backup = "$TargetPath.old_$ts"

Write-Host "Preparing temp folder: $temp"
if (Test-Path $temp) { Remove-Item -Path $temp -Recurse -Force -ErrorAction SilentlyContinue }
New-Item -ItemType Directory -Path $temp | Out-Null

Write-Host "Copying files from $DistPath to $temp"
Copy-Item -Path (Join-Path $PWD $DistPath)\* -Destination $temp -Recurse -Force

# Append cache-busting query param to index.html asset URLs
$indexFile = Join-Path $temp 'index.html'
if (Test-Path $indexFile) {
    $content = Get-Content -Raw -Path $indexFile
    $v = $ts
    # Add ?v=<ts> to src/href attributes pointing to local assets (js/css) unless they already have a query
    $pattern = '(?<pre>(?:src|href)="(?:(?!https?:).+?)(?<file>[^\"\?]+\.(?:js|css|png|jpg|svg|webp)))(?<post>\")'
    $new = [System.Text.RegularExpressions.Regex]::Replace($content, $pattern, '${pre}?v=' + $v + '${post}')
    Set-Content -Path $indexFile -Value $new -Encoding utf8
    Write-Host "Updated index.html with cache-busting ?v=$v"
} else {
    Write-Host "Warning: index.html not found at $indexFile"
}

Write-Host "Backing up existing target (if exists) to $backup"
if (Test-Path $TargetPath) {
    # Move existing target to backup
    if (Test-Path $backup) { Remove-Item -Path $backup -Recurse -Force -ErrorAction SilentlyContinue }
    Move-Item -Path $TargetPath -Destination $backup -Force
}

Write-Host "Moving temp -> target"
Move-Item -Path $temp -Destination $TargetPath -Force

Write-Host "Cleaning up old backups older than $KeepBackupsForDays days"
Get-ChildItem -Path (Split-Path -Path $TargetPath -Parent) -Filter '*.old_*' -Directory -ErrorAction SilentlyContinue | Where-Object { ($_.LastWriteTime -lt (Get-Date).AddDays(-$KeepBackupsForDays)) } | ForEach-Object {
    Remove-Item -Path $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "Deploy complete. Target: $TargetPath"

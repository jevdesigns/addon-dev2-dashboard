<#
watch-and-sync.ps1

Helper to run common dev/build/sync tasks for the D522 project.

Usage:
  .\watch-and-sync.ps1 -Mode dev           # run dev server (foreground)
  .\watch-and-sync.ps1 -Mode src-watch     # run src-watch in new window
  .\watch-and-sync.ps1 -Mode dev-sync      # run dev + src-watch in separate windows
  .\watch-and-sync.ps1 -Mode build         # run production build (foreground)
  .\watch-and-sync.ps1 -Mode build:sync    # build then sync to Samba (foreground)
  .\watch-and-sync.ps1 -Mode sync          # copy dist/ to Samba (foreground)
  .\watch-and-sync.ps1 -Mode deploy        # same as sync
  .\watch-and-sync.ps1 -Mode build:watch   # continuous prod watch (foreground)

This script opens new PowerShell windows for long-running watchers so you can keep the
current terminal free for interactive commands. It expects `npm` to be on PATH.
#>

param(
    [Parameter(Mandatory=$false)]
    [ValidateSet('dev','src-watch','dev-sync','build','build:sync','build:watch','sync','deploy','help')]
    [string]$Mode = 'help',
    [switch]$Windowed
)

function Show-Help {
    Get-Content -Path $MyInvocation.MyCommand.Definition | Select-String -Pattern "^#" -SimpleMatch | ForEach-Object { $_.Line.TrimStart('#') }
}

function Start-Windowed($command, $title = '') {
    $escaped = $command -replace "'","''"
    $args = "-NoExit","-Command","cd '$PWD'; $command"
    Start-Process -FilePath powershell -ArgumentList $args -WindowStyle Normal
    Write-Host "Started new window: $command"
}

function Start-BackgroundJob($command) {
    $script = "npm $command"
    $job = Start-Job -ScriptBlock { param($cmd) & cmd /c $cmd } -ArgumentList $script
    Write-Host "Started background job Id=$($job.Id) for: $command"
}

function Run-Foreground($command) {
    Write-Host "Running: $command"
    & npm $command
}

Push-Location (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent)

switch ($Mode) {
    'help' {
        Show-Help
    }
    'dev' {
        Run-Foreground 'run dev'
    }
    'src-watch' {
        if ($Windowed) { Start-Windowed 'run src-watch' } else { Start-BackgroundJob 'run src-watch' }
    }
    'dev-sync' {
        if ($Windowed) { Start-Windowed 'run dev'; Start-Windowed 'run src-watch' ; Write-Host 'Started dev + src-watch in separate windows.' }
        else { Start-BackgroundJob 'run dev'; Start-BackgroundJob 'run src-watch' ; Write-Host 'Started dev + src-watch as background jobs.' }
    }
    'build' {
        Run-Foreground 'run build'
    }
    'build:sync' {
        Run-Foreground 'run build:sync'
    }
    'build:watch' {
        Run-Foreground 'run build:watch'
    }
    'sync' {
        Run-Foreground 'run sync'
    }
    'deploy' {
        Run-Foreground 'run deploy'
    }
    default {
        Write-Host "Unknown mode: $Mode`n"
        Show-Help
    }
}

Pop-Location

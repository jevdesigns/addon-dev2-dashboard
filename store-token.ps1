<#
store-token.ps1

Prompts for a Home Assistant long-lived access token and writes it to `.env` in the project root.
This is a convenience helper for local development. The script will create `.env` if missing
and will update or append the `VITE_HA_TOKEN` line. Use with care and do not commit `.env`.
#>

param()

$envPath = Join-Path -Path (Split-Path -Path $MyInvocation.MyCommand.Definition -Parent) -ChildPath '.env'

Write-Host "This will store a token in: $envPath"
$secure = Read-Host -Prompt 'Enter Home Assistant long-lived access token' -AsSecureString
$ptr = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
$plain = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($ptr)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($ptr)

if (-not (Test-Path $envPath)) {
    "VITE_HA_WS=/api/websocket" | Out-File -FilePath $envPath -Encoding utf8
}

$content = Get-Content -Path $envPath -ErrorAction SilentlyContinue

$updated = $false
for ($i=0; $i -lt $content.Length; $i++) {
    if ($content[$i] -match '^VITE_HA_TOKEN=') {
        $content[$i] = "VITE_HA_TOKEN=$plain"
        $updated = $true
        break
    }
}

if (-not $updated) {
    $content += "VITE_HA_TOKEN=$plain"
}

$content | Set-Content -Path $envPath -Encoding utf8
Write-Host "Token saved to $envPath (do NOT commit this file)."

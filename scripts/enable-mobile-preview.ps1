$ErrorActionPreference = 'Stop'
$taskRuleName = 'CentralSimples-MobilePreview-5190'
$taskLogPath = Join-Path $PSScriptRoot '..\artifacts\mobile-network-status.txt'
try {
    $taskExisting = Get-NetFirewallRule -Name $taskRuleName -ErrorAction SilentlyContinue
    if ($taskExisting) {
        $taskExisting | Remove-NetFirewallRule
    }
    New-NetFirewallRule -Name $taskRuleName -DisplayName 'Central Simples - teste mobile (rede local)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 5190 -RemoteAddress LocalSubnet -InterfaceAlias 'Wi-Fi' -Profile Any -EdgeTraversalPolicy Block | Out-Null
    'OK: porta TCP 5190 liberada somente para a rede local pela interface Wi-Fi.' | Set-Content -LiteralPath $taskLogPath
} catch {
    $_.Exception.Message | Set-Content -LiteralPath $taskLogPath
    exit 1
}

param([string]$Destination = '')
$ErrorActionPreference = 'Stop'
$projectsRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
$privateRoot = Join-Path $env:USERPROFILE '.central-simples'
$custodyBase = Join-Path $privateRoot 'backup-custody'
$timestamp = (Get-Date).ToUniversalTime().ToString('yyyy-MM-ddTHH-mm-ssZ')
$custodyFolder = Join-Path $custodyBase ($timestamp + '-' + [guid]::NewGuid().ToString('N'))
$identity = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
$nodePath = (Get-Command node -ErrorAction Stop).Source

New-Item -ItemType Directory -Path $custodyFolder -Force | Out-Null
& icacls.exe $custodyFolder '/inheritance:r' '/grant:r' ($identity + ':(OI)(CI)F') '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Não foi possível restringir o pacote privado.' }
$copyFolder = Join-Path $custodyFolder 'copies'
New-Item -ItemType Directory -Path $copyFolder | Out-Null
$applications = @(
    @{ Name = 'finorya'; Root = (Join-Path $projectsRoot 'Finorya'); Script = 'database-backup.mjs' },
    @{ Name = 'ajudante-eletrico'; Root = (Join-Path $projectsRoot 'Ajudante Elétrico/app'); Script = 'database-backup.mjs' },
    @{ Name = 'lingua-memory'; Root = (Join-Path $projectsRoot 'Lingua Memory'); Script = 'cloud-backup.mjs' }
)
$keys = @()
foreach ($app in $applications) {
    $sourceFolder = Join-Path $privateRoot ('backups/' + $app.Name)
    if ($app.Name -eq 'lingua-memory') {
        $latest = Get-ChildItem -LiteralPath $sourceFolder -Directory |
            Where-Object { $_.Name -match '^\d{4}-\d{2}-\d{2}T' -and (Test-Path -LiteralPath (Join-Path $_.FullName 'manifest.enc')) } |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
    } else {
        $latest = Get-ChildItem -LiteralPath $sourceFolder -Filter '*.backup.json' -File |
            Sort-Object LastWriteTime -Descending | Select-Object -First 1
    }
    if (-not $latest) { throw ('Nenhuma cópia concluída para ' + $app.Name) }
    & $nodePath (Join-Path $app.Root ('scripts/' + $app.Script)) 'verify' $latest.FullName | Out-Null
    if ($LASTEXITCODE -ne 0) { throw ('Verificação criptográfica falhou para ' + $app.Name) }
    $targetFolder = Join-Path $copyFolder $app.Name
    New-Item -ItemType Directory -Path $targetFolder | Out-Null
    Copy-Item -LiteralPath $latest.FullName -Destination $targetFolder -Recurse
    $keyPath = Join-Path $privateRoot ('backup-keys/' + $app.Name + '.key')
    if ((Get-Item -LiteralPath $keyPath).Length -ne 32) { throw ('Chave ausente/inválida para ' + $app.Name) }
    $keys += $keyPath
}

function FileManifest($folder) {
    @(Get-ChildItem -LiteralPath $folder -File -Recurse | Sort-Object FullName | ForEach-Object {
        @{ Path = [IO.Path]::GetRelativePath($folder, $_.FullName); Size = $_.Length; Sha256 = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash.ToLowerInvariant() }
    })
}
$copyManifest = FileManifest $copyFolder
$keyManifest = @($keys | ForEach-Object {
    @{ Name = [IO.Path]::GetFileName($_); Size = (Get-Item -LiteralPath $_).Length; Sha256 = (Get-FileHash -LiteralPath $_ -Algorithm SHA256).Hash.ToLowerInvariant() }
})
Compress-Archive -LiteralPath $copyFolder -DestinationPath (Join-Path $custodyFolder 'backups-criptografados.zip') -CompressionLevel Optimal
# This separate archive contains decryption keys. It is PRIVATE, not encrypted,
# and must never be stored next to the copies or uploaded without a chosen owner-only destination.
Compress-Archive -LiteralPath $keys -DestinationPath (Join-Path $custodyFolder 'chaves-privadas.zip') -CompressionLevel Optimal
$checkFolder = Join-Path $custodyFolder 'archive-check'
Expand-Archive -LiteralPath (Join-Path $custodyFolder 'backups-criptografados.zip') -DestinationPath $checkFolder
$actual = FileManifest (Join-Path $checkFolder 'copies')
if (($actual | ConvertTo-Json -Depth 5 -Compress) -ne ($copyManifest | ConvertTo-Json -Depth 5 -Compress)) { throw 'O ZIP de cópias diverge dos arquivos verificados.' }
$keyCheckFolder = Join-Path $custodyFolder 'key-archive-check'
Expand-Archive -LiteralPath (Join-Path $custodyFolder 'chaves-privadas.zip') -DestinationPath $keyCheckFolder
foreach ($item in $keyManifest) {
    $extracted = Join-Path $keyCheckFolder $item.Name
    if ((Get-Item -LiteralPath $extracted).Length -ne $item.Size -or (Get-FileHash -LiteralPath $extracted -Algorithm SHA256).Hash.ToLowerInvariant() -ne $item.Sha256) { throw 'O ZIP de chaves diverge das chaves originais.' }
}
$report = @{ Version = 1; CreatedAt = $timestamp; Copies = $copyManifest; Keys = $keyManifest; Verified = $true; OffComputerConfirmed = $false; KeyArchiveEncrypted = $false; Folder = $custodyFolder }
if ($Destination) {
    $volumeRoot = [IO.Path]::GetPathRoot([IO.Path]::GetFullPath($Destination))
    if ($volumeRoot -eq [IO.Path]::GetPathRoot($env:USERPROFILE)) { throw 'Destino no disco do computador; use unidade externa ou confirme a transferência ao provedor separadamente.' }
    if (-not (Test-Path -LiteralPath $volumeRoot)) { throw 'Unidade de destino não está conectada.' }
    if ($volumeRoot -notmatch '^[A-Za-z]:\\$') { throw 'Use uma unidade externa identificada por letra; destinos de nuvem exigem comprovação própria de upload.' }
    $letter = $volumeRoot.Substring(0, 1)
    $volume = Get-Volume -DriveLetter $letter
    $isExternal = $volume.DriveType -eq 'Removable'
    if (-not $isExternal) {
        $disk = Get-Partition -DriveLetter $letter | Get-Disk
        $isExternal = $disk.BusType -eq 'USB'
    }
    if (-not $isExternal) { throw 'A unidade não foi identificada como removível/USB; não anunciar cópia fora do computador.' }
    New-Item -ItemType Directory -Path $Destination -Force | Out-Null
    $externalCopy = Join-Path $Destination ($timestamp + '-backups-criptografados.zip')
    Copy-Item -LiteralPath (Join-Path $custodyFolder 'backups-criptografados.zip') -Destination $externalCopy
    if ((Get-FileHash -LiteralPath $externalCopy -Algorithm SHA256).Hash -ne (Get-FileHash -LiteralPath (Join-Path $custodyFolder 'backups-criptografados.zip') -Algorithm SHA256).Hash) { throw 'Cópia externa corrompida.' }
    $report.ExternalCopy = $externalCopy
    $report.OffComputerCopiesConfirmed = $true
    # Keys are intentionally not copied by this option. Separate custody remains required.
}
$report | ConvertTo-Json -Depth 6 | Set-Content -LiteralPath (Join-Path $custodyFolder 'custody-report.json') -Encoding utf8
$report | Select-Object Folder,Verified,OffComputerConfirmed,OffComputerCopiesConfirmed,ExternalCopy,KeyArchiveEncrypted | ConvertTo-Json -Compress

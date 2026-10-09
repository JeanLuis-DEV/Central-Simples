# Requires PowerShell 7 on Windows. Never pass a password on the command line.
param(
    [string]$InputFile = '',
    [switch]$Restore,
    [switch]$SelfTest
)
$ErrorActionPreference = 'Stop'
$magic = [Text.Encoding]::ASCII.GetBytes("CSKEYS1`0")
$maxBytes = 1048576

function DeriveKey([string]$Password, [byte[]]$Salt) {
    $passwordBytes = [Text.Encoding]::UTF8.GetBytes($Password)
    try {
        return ,([Security.Cryptography.Rfc2898DeriveBytes]::Pbkdf2(
            $passwordBytes, $Salt, 600000, [Security.Cryptography.HashAlgorithmName]::SHA256, 32))
    } finally { [Array]::Clear($passwordBytes, 0, $passwordBytes.Length) }
}

function SealKeys([byte[]]$Plain, [string]$Password) {
    if ($Plain.Length -lt 4 -or $Plain.Length -gt $maxBytes -or
        $Plain[0] -ne 80 -or $Plain[1] -ne 75 -or $Plain[2] -ne 3 -or $Plain[3] -ne 4) {
        throw 'O pacote de entrada deve ser um ZIP válido de até 1 MB.'
    }
    if ($Password.Length -lt 16 -or $Password.Length -gt 1024) { throw 'Use uma senha de 16 a 1024 caracteres.' }
    $salt = [Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
    $nonce = [Security.Cryptography.RandomNumberGenerator]::GetBytes(12)
    [byte[]]$header = $magic + $salt + $nonce
    $key = DeriveKey $Password $salt
    $cipher = [byte[]]::new($Plain.Length)
    $tag = [byte[]]::new(16)
    $aes = [Security.Cryptography.AesGcm]::new($key, 16)
    try { $aes.Encrypt($nonce, $Plain, $cipher, $tag, $header) }
    finally { $aes.Dispose(); [Array]::Clear($key, 0, $key.Length) }
    return ,([byte[]]($header + $tag + $cipher))
}

function OpenKeys([byte[]]$Envelope, [string]$Password) {
    if ($Envelope.Length -lt 72 -or $Envelope.Length -gt ($maxBytes + 68) -or
        $Password.Length -gt 1024) { throw 'Pacote inválido.' }
    for ($i = 0; $i -lt $magic.Length; $i++) {
        if ($Envelope[$i] -ne $magic[$i]) { throw 'Formato de pacote desconhecido.' }
    }
    [byte[]]$salt = $Envelope[8..39]
    [byte[]]$nonce = $Envelope[40..51]
    [byte[]]$header = $Envelope[0..51]
    [byte[]]$tag = $Envelope[52..67]
    [byte[]]$cipher = $Envelope[68..($Envelope.Length - 1)]
    $key = DeriveKey $Password $salt
    $plain = [byte[]]::new($cipher.Length)
    $aes = [Security.Cryptography.AesGcm]::new($key, 16)
    try { $aes.Decrypt($nonce, $cipher, $tag, $plain, $header) }
    catch { [Array]::Clear($plain, 0, $plain.Length); throw 'Senha incorreta ou pacote danificado.' }
    finally { $aes.Dispose(); [Array]::Clear($key, 0, $key.Length) }
    return ,$plain
}

function SameBytes([byte[]]$Left, [byte[]]$Right) {
    if ($Left.Length -ne $Right.Length) { return $false }
    for ($i = 0; $i -lt $Left.Length; $i++) { if ($Left[$i] -ne $Right[$i]) { return $false } }
    return $true
}

function AssertKeyZip([byte[]]$Bytes, $ExpectedKeys = $null) {
    $stream = [IO.MemoryStream]::new($Bytes, $false)
    $archive = $null
    try {
        $archive = [IO.Compression.ZipArchive]::new($stream, [IO.Compression.ZipArchiveMode]::Read)
        $expectedNames = @('ajudante-eletrico.key', 'finorya.key', 'lingua-memory.key')
        $names = @($archive.Entries | ForEach-Object { $_.FullName } | Sort-Object)
        if (($names -join '|') -ne ($expectedNames -join '|')) { throw 'O ZIP deve conter somente as três chaves esperadas.' }
        foreach ($entry in $archive.Entries) {
            if ($entry.Length -ne 32) { throw 'Tamanho inválido de chave.' }
            $entryStream = $entry.Open()
            try {
                $hash = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($entryStream)).ToLowerInvariant()
            } finally { $entryStream.Dispose() }
            if ($ExpectedKeys) {
                $expected = @($ExpectedKeys | Where-Object { $_.Name -eq $entry.FullName })
                if ($expected.Count -ne 1 -or $expected[0].Size -ne 32 -or $expected[0].Sha256 -ne $hash) {
                    throw 'O pacote diverge do inventário privado de chaves.'
                }
            }
        }
    } finally { if ($archive) { $archive.Dispose() }; $stream.Dispose() }
}

if ($SelfTest) {
    [byte[]]$testZip = @(80, 75, 3, 4) + [Security.Cryptography.RandomNumberGenerator]::GetBytes(96)
    $testPassword = 'Senha somente para testes 123!'
    $sealed = SealKeys $testZip $testPassword
    if (-not (SameBytes $testZip (OpenKeys $sealed $testPassword))) { throw 'Falha no round-trip.' }
    if (SameBytes $sealed (SealKeys $testZip $testPassword)) { throw 'Salt/nonce repetidos.' }
    $wrongRejected = $false
    try { $null = OpenKeys $sealed 'Outra senha de testes' } catch { $wrongRejected = $true }
    if (-not $wrongRejected) { throw 'Senha incorreta aceita.' }
    foreach ($position in @(0, 8, 40, 52, 68, ($sealed.Length - 1))) {
        [byte[]]$tampered = $sealed.Clone()
        $tampered[$position] = $tampered[$position] -bxor 1
        $rejected = $false
        try { $null = OpenKeys $tampered $testPassword } catch { $rejected = $true }
        if (-not $rejected) { throw 'Adulteração aceita.' }
    }
    $rejected = $false
    try { $null = OpenKeys $sealed[0..66] $testPassword } catch { $rejected = $true }
    if (-not $rejected) { throw 'Truncamento aceito.' }
    $zipStream = [IO.MemoryStream]::new()
    $zipArchive = [IO.Compression.ZipArchive]::new($zipStream, [IO.Compression.ZipArchiveMode]::Create, $true)
    $keyManifest = @()
    foreach ($name in @('ajudante-eletrico.key', 'finorya.key', 'lingua-memory.key')) {
        $keyBytes = [Security.Cryptography.RandomNumberGenerator]::GetBytes(32)
        $entryStream = $zipArchive.CreateEntry($name).Open()
        try { $entryStream.Write($keyBytes, 0, $keyBytes.Length) } finally { $entryStream.Dispose() }
        $keyManifest += @{ Name = $name; Size = 32; Sha256 = [Convert]::ToHexString([Security.Cryptography.SHA256]::HashData($keyBytes)).ToLowerInvariant() }
    }
    $zipArchive.Dispose()
    $realZip = $zipStream.ToArray()
    $zipStream.Dispose()
    AssertKeyZip $realZip $keyManifest
    AssertKeyZip (OpenKeys (SealKeys $realZip $testPassword) $testPassword)
    $keyManifest[0].Sha256 = '0' * 64
    $rejected = $false
    try { AssertKeyZip $realZip $keyManifest } catch { $rejected = $true }
    if (-not $rejected) { throw 'Inventário divergente aceito.' }
    Write-Output 'PASS: recuperação, salt/nonce, senha incorreta, adulteração, truncamento e inventário de ZIP.'
    exit 0
}

if (-not $IsWindows -or $PSVersionTable.PSVersion.Major -lt 7) { throw 'Use PowerShell 7 no Windows.' }
if (-not $InputFile) { throw 'Informe -InputFile. A senha será solicitada somente na janela local.' }
$inputPath = [IO.Path]::GetFullPath($InputFile)
$source = Get-Item -LiteralPath $inputPath
if ($source.PSIsContainer -or ($source.Attributes -band [IO.FileAttributes]::ReparsePoint) -or
    $source.Length -gt ($maxBytes + 68)) { throw 'Arquivo de entrada inválido.' }
if ($Restore -and $source.Extension -ne '.cskeys') { throw 'Selecione um pacote .cskeys.' }
if (-not $Restore -and $source.Name -ne 'chaves-privadas.zip') { throw 'Selecione o ZIP privado preparado pela rotina de custódia.' }
$expectedKeys = $null
if (-not $Restore) {
    $custodyReport = Get-Content -LiteralPath (Join-Path $source.DirectoryName 'custody-report.json') -Raw | ConvertFrom-Json
    if (-not $custodyReport.Verified -or $custodyReport.Keys.Count -ne 3) { throw 'Inventário de custódia inválido.' }
    $expectedKeys = $custodyReport.Keys
}

# Decrypted keys always go to a new ACL-restricted folder, never over existing keys.
$privateBase = Join-Path $env:USERPROFILE '.central-simples/backup-custody'
$privateOutput = if ($Restore) {
    Join-Path $privateBase ('keys-restored-' + [guid]::NewGuid().ToString('N'))
} else {
    Join-Path $privateBase ('keys-protected-' + [guid]::NewGuid().ToString('N'))
}
New-Item -ItemType Directory -Path $privateOutput | Out-Null
$identity = [Security.Principal.WindowsIdentity]::GetCurrent().Name
& icacls.exe $privateOutput '/inheritance:r' '/grant:r' ($identity + ':(OI)(CI)F') '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Falha ao proteger a pasta de saída.' }

Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing
$form = [Windows.Forms.Form]::new()
$form.Text = if ($Restore) { 'Recuperar chaves de backup' } else { 'Proteger chaves para o Google Drive' }
$form.ClientSize = [Drawing.Size]::new(570, 355)
$form.StartPosition = 'CenterScreen'
$form.FormBorderStyle = 'FixedDialog'
$form.MaximizeBox = $false
$form.MinimizeBox = $false

function AddLabel($Text, $Top, $Height = 24) {
    $label = [Windows.Forms.Label]::new()
    $label.Text = $Text
    $label.SetBounds(20, $Top, 530, $Height)
    $form.Controls.Add($label)
}
AddLabel 'A senha fica somente nesta janela. Não é enviada pelo chat ou ao Google.' 20 40
AddLabel 'Senha de recuperação (mínimo de 16 caracteres):' 70
$passwordBox = [Windows.Forms.TextBox]::new()
$passwordBox.UseSystemPasswordChar = $true
$passwordBox.MaxLength = 1024
$passwordBox.SetBounds(20, 98, 530, 28)
$form.Controls.Add($passwordBox)
AddLabel 'Confirme a senha:' 139
$confirmBox = [Windows.Forms.TextBox]::new()
$confirmBox.UseSystemPasswordChar = $true
$confirmBox.MaxLength = 1024
$confirmBox.SetBounds(20, 167, 530, 28)
$form.Controls.Add($confirmBox)
$outside = [Windows.Forms.CheckBox]::new()
$outside.Text = 'Guardei esta senha fora do Google Drive (gerenciador ou papel seguro).'
$outside.SetBounds(20, 209, 530, 40)
$form.Controls.Add($outside)
$status = [Windows.Forms.Label]::new()
$status.SetBounds(20, 258, 530, 35)
$form.Controls.Add($status)
$submit = [Windows.Forms.Button]::new()
$submit.Text = if ($Restore) { 'Recuperar' } else { 'Criptografar chaves' }
$submit.SetBounds(340, 307, 210, 30)
$form.Controls.Add($submit)
$cancel = [Windows.Forms.Button]::new()
$cancel.Text = 'Cancelar'
$cancel.SetBounds(20, 307, 110, 30)
$cancel.Add_Click({ $form.Close() })
$form.Controls.Add($cancel)
$form.CancelButton = $cancel
if ($Restore) { $confirmBox.Visible = $false; $outside.Visible = $false }
$script:completed = $false
$submit.Add_Click({
    $plain = $null
    $verifiedPlain = $null
    $submit.Enabled = $false
    try {
        if (-not $Restore -and ($passwordBox.Text -ne $confirmBox.Text -or -not $outside.Checked)) {
            throw 'Confirme a senha e sua guarda fora do Drive.'
        }
        $bytes = [IO.File]::ReadAllBytes($inputPath)
        if ($Restore) {
            $plain = OpenKeys $bytes $passwordBox.Text
            AssertKeyZip $plain
            $destination = Join-Path $privateOutput 'chaves-recuperadas.zip'
            [IO.File]::WriteAllBytes($destination, $plain)
        } else {
            $plain = $bytes
            AssertKeyZip $plain $expectedKeys
            $encrypted = SealKeys $plain $passwordBox.Text
            $destination = Join-Path $privateOutput 'chaves-protegidas.cskeys'
            [IO.File]::WriteAllBytes($destination, $encrypted)
            $verifiedPlain = OpenKeys ([IO.File]::ReadAllBytes($destination)) $passwordBox.Text
            if (-not (SameBytes $plain $verifiedPlain)) { throw 'Verificação do pacote falhou.' }
        }
        @{ Version = 1; CreatedAt = [DateTime]::UtcNow.ToString('o'); InputFile = $inputPath;
            OutputFile = $destination; Verified = $true; KeyArchiveEncrypted = (-not $Restore);
            Sha256 = (Get-FileHash -LiteralPath $destination -Algorithm SHA256).Hash.ToLowerInvariant();
            PassphraseOutsideDriveConfirmedByOwner = (-not $Restore) } |
            ConvertTo-Json | Set-Content -LiteralPath (Join-Path $privateOutput 'protection-report.json') -Encoding utf8
        $script:completed = $true
        $passwordBox.Clear(); $confirmBox.Clear()
        [Windows.Forms.MessageBox]::Show('Pacote verificado e salvo em: ' + $destination, 'Concluído') | Out-Null
        $form.Close()
    } catch { $status.Text = $_.Exception.Message }
    finally {
        if ($plain) { [Array]::Clear($plain, 0, $plain.Length) }
        if ($verifiedPlain) { [Array]::Clear($verifiedPlain, 0, $verifiedPlain.Length) }
        $submit.Enabled = $true
    }
})
try { $form.ShowDialog() | Out-Null }
finally { $passwordBox.Clear(); $confirmBox.Clear(); $form.Dispose() }
if (-not $script:completed) { exit 2 }

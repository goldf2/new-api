[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('Menu', 'InstallCli', 'InstallGlobal', 'RotateKey', 'Status', 'Restore')]
    [string]$Action = 'Menu',

    [string]$BaseUrl = 'https://kmepu6yo89vk6b28cnoajopf.13.140.158.124.sslip.io/v1',

    [string]$Model = 'gpt-5.6-sol',

    [ValidateSet('minimal', 'low', 'medium', 'high', 'xhigh')]
    [string]$Reasoning = 'high',

    [switch]$DryRun
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

if ($env:OS -ne 'Windows_NT') {
    throw '此脚本仅支持 Windows。macOS 和 Linux 请使用 setup-codex-newapi.sh。'
}

$Script:TargetHome = Join-Path $env:USERPROFILE '.codex-na'
$Script:ManagerHome = Join-Path $env:USERPROFILE '.codex-newapi-manager'
$Script:GlobalHome = Join-Path $env:USERPROFILE '.codex'
$Script:GlobalConfig = Join-Path $Script:GlobalHome 'config.toml'
$Script:GlobalBackup = Join-Path $Script:ManagerHome 'config.toml.before-newapi'
$Script:GlobalOriginalState = Join-Path $Script:ManagerHome 'global-original-state'
$Script:ModeFile = Join-Path $Script:ManagerHome 'mode'
$Script:CredentialDir = Join-Path $Script:ManagerHome 'credentials'
$Script:CredentialFile = Join-Path $Script:CredentialDir 'newapi-key.dpapi'
$Script:HelperDir = Join-Path $Script:ManagerHome 'bin'
$Script:CredentialHelper = Join-Path $Script:HelperDir 'get-newapi-key.ps1'
$Script:CliWrapper = Join-Path $Script:HelperDir 'codex.cmd'
$Script:PowerShellExe = (Get-Process -Id $PID).Path

function Get-Timestamp {
    Get-Date -Format 'yyyyMMdd-HHmmss'
}

function Ensure-Directory {
    param([Parameter(Mandatory = $true)][string]$Path)

    if (-not (Test-Path -LiteralPath $Path -PathType Container)) {
        [void][System.IO.Directory]::CreateDirectory($Path)
    }
}

function Write-Utf8NoBom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    Ensure-Directory (Split-Path -Parent $Path)
    $encoding = [System.Text.UTF8Encoding]::new($false)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Write-Utf8Bom {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    Ensure-Directory (Split-Path -Parent $Path)
    $encoding = [System.Text.UTF8Encoding]::new($true)
    [System.IO.File]::WriteAllText($Path, $Content, $encoding)
}

function Write-SystemEncodedText {
    param(
        [Parameter(Mandatory = $true)][string]$Path,
        [Parameter(Mandatory = $true)][AllowEmptyString()][string]$Content
    )

    Ensure-Directory (Split-Path -Parent $Path)
    [System.IO.File]::WriteAllText($Path, $Content, [System.Text.Encoding]::Default)
}

function ConvertTo-TomlString {
    param([Parameter(Mandatory = $true)][string]$Value)

    $Value.Replace('\', '\\').Replace('"', '\"')
}

function ConvertTo-PowerShellSingleQuotedString {
    param([Parameter(Mandatory = $true)][string]$Value)

    $Value.Replace("'", "''")
}

function Normalize-Settings {
    $Script:BaseUrl = $BaseUrl.TrimEnd('/')
    if ($Script:BaseUrl -notmatch '^https?://') {
        throw 'New API 地址必须以 http:// 或 https:// 开头。'
    }
    if ($Script:BaseUrl -match '/(responses|chat/completions)$') {
        throw 'New API 地址应以 /v1 结尾，不要包含具体接口路径。'
    }
    if ($Script:BaseUrl -notmatch '/v1$') {
        $Script:BaseUrl += '/v1'
    }
    if ($Model -notmatch '^[A-Za-z0-9._:-]+$') {
        throw '模型名称包含不支持的字符。'
    }
}

function Get-RealCodexPath {
    $commands = @(Get-Command codex -CommandType Application -All -ErrorAction SilentlyContinue)
    foreach ($command in $commands) {
        $source = $command.Source
        if ([string]::IsNullOrWhiteSpace($source)) {
            continue
        }
        if (-not $source.StartsWith($Script:HelperDir, [System.StringComparison]::OrdinalIgnoreCase)) {
            return $source
        }
    }
    throw '未找到 Codex CLI。请先安装 Codex CLI，再重新运行此脚本。'
}

function Write-CredentialHelper {
    Ensure-Directory $Script:HelperDir
    $escapedCredentialPath = ConvertTo-PowerShellSingleQuotedString $Script:CredentialFile
    $helper = @'
$ErrorActionPreference = 'Stop'
$encrypted = [System.IO.File]::ReadAllText('__CREDENTIAL_PATH__').Trim()
$secure = ConvertTo-SecureString $encrypted
$pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
try {
    $plain = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
    [Console]::Out.Write($plain)
}
finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
}
'@
    $helper = $helper.Replace('__CREDENTIAL_PATH__', $escapedCredentialPath)
    Write-Utf8Bom -Path $Script:CredentialHelper -Content $helper
}

function Test-Credential {
    (Test-Path -LiteralPath $Script:CredentialFile -PathType Leaf) -and
    (Test-Path -LiteralPath $Script:CredentialHelper -PathType Leaf)
}

function Save-Credential {
    param([bool]$Force = $false)

    if ((-not $Force) -and (Test-Credential)) {
        Write-Host '已找到保存的 New API 密钥。'
        return
    }

    Write-Host ''
    Write-Host '请粘贴 New API 密钥，然后按回车。'
    Write-Host '输入时屏幕上不会显示任何内容，这是正常的。'
    $secure = Read-Host 'New API key' -AsSecureString
    $plain = ([System.Net.NetworkCredential]::new('', $secure)).Password
    if ([string]::IsNullOrWhiteSpace($plain)) {
        throw '密钥不能为空。'
    }
    $plain = $null

    Ensure-Directory $Script:CredentialDir
    $encrypted = ConvertFrom-SecureString $secure
    Write-Utf8NoBom -Path $Script:CredentialFile -Content $encrypted
    Write-CredentialHelper
    Write-Host 'New API 密钥已保存。'
}

function Get-TopLevelConfig {
    $tomlModel = ConvertTo-TomlString $Model
    $tomlReasoning = ConvertTo-TomlString $Reasoning

    @"
model = "$tomlModel"
model_provider = "newapi"
model_reasoning_effort = "$tomlReasoning"
"@
}

function Get-ProviderTablesConfig {
    $authCommand = ConvertTo-TomlString ($Script:PowerShellExe.Replace('\', '/'))
    $authHelper = ConvertTo-TomlString ($Script:CredentialHelper.Replace('\', '/'))
    $tomlBaseUrl = ConvertTo-TomlString $Script:BaseUrl

    @"
[model_providers.newapi]
name = "New API"
base_url = "$tomlBaseUrl"
wire_api = "responses"
request_max_retries = 4
stream_max_retries = 10
stream_idle_timeout_ms = 300000

[model_providers.newapi.auth]
command = "$authCommand"
args = ["-NoProfile", "-NonInteractive", "-ExecutionPolicy", "Bypass", "-File", "$authHelper"]
timeout_ms = 5000
refresh_interval_ms = 0
"@
}

function Get-ProviderConfig {
    (Get-TopLevelConfig).TrimEnd() + [Environment]::NewLine + [Environment]::NewLine +
        (Get-ProviderTablesConfig).TrimStart()
}

function Write-IsolatedConfig {
    Ensure-Directory $Script:TargetHome
    $config = Join-Path $Script:TargetHome 'config.toml'
    if (Test-Path -LiteralPath $config -PathType Leaf) {
        Copy-Item -LiteralPath $config -Destination "$($config).backup.$(Get-Timestamp)" -Force
    }
    Write-Utf8NoBom -Path $config -Content (Get-ProviderConfig)
    Write-Host 'Codex 配置已保存。'
}

function Get-PathWithoutWrapper {
    param([AllowNull()][string]$PathValue)

    if ([string]::IsNullOrWhiteSpace($PathValue)) {
        return ''
    }
    $parts = @($PathValue -split ';' | Where-Object {
        (-not [string]::IsNullOrWhiteSpace($_)) -and
        (-not $_.TrimEnd('\').Equals($Script:HelperDir.TrimEnd('\'), [System.StringComparison]::OrdinalIgnoreCase))
    })
    $parts -join ';'
}

function Install-CliWrapper {
    $codexPath = Get-RealCodexPath
    Ensure-Directory $Script:HelperDir
    $wrapper = @"
@echo off
set "CODEX_HOME=$Script:TargetHome"
call "$codexPath" %*
"@
    Write-SystemEncodedText -Path $Script:CliWrapper -Content $wrapper

    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    $cleanUserPath = Get-PathWithoutWrapper $userPath
    if ([string]::IsNullOrWhiteSpace($cleanUserPath)) {
        $newUserPath = $Script:HelperDir
    }
    else {
        $newUserPath = $Script:HelperDir + ';' + $cleanUserPath
    }
    [Environment]::SetEnvironmentVariable('Path', $newUserPath, 'User')

    $cleanProcessPath = Get-PathWithoutWrapper $env:Path
    $env:Path = $Script:HelperDir + ';' + $cleanProcessPath
    Write-Host 'Codex 默认入口已设置。'
}

function Remove-CliWrapper {
    $userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
    [Environment]::SetEnvironmentVariable('Path', (Get-PathWithoutWrapper $userPath), 'User')
    $env:Path = Get-PathWithoutWrapper $env:Path
    if (Test-Path -LiteralPath $Script:CliWrapper -PathType Leaf) {
        Remove-Item -LiteralPath $Script:CliWrapper -Force
    }
}

function Ensure-ManagerHome {
    Ensure-Directory $Script:ManagerHome
}

function Set-Mode {
    param([Parameter(Mandatory = $true)][string]$Mode)

    Ensure-ManagerHome
    Write-Utf8NoBom -Path $Script:ModeFile -Content $Mode
}

function Get-Mode {
    if (Test-Path -LiteralPath $Script:ModeFile -PathType Leaf) {
        return [System.IO.File]::ReadAllText($Script:ModeFile).Trim()
    }
    if (Test-Path -LiteralPath $Script:CliWrapper -PathType Leaf) {
        return 'cli'
    }
    if (Test-Path -LiteralPath $Script:GlobalOriginalState -PathType Leaf) {
        return 'global'
    }
    'official'
}

function Prepare-GlobalBackup {
    Ensure-ManagerHome
    if (Test-Path -LiteralPath $Script:GlobalOriginalState -PathType Leaf) {
        return
    }
    if (Test-Path -LiteralPath $Script:GlobalConfig -PathType Leaf) {
        Copy-Item -LiteralPath $Script:GlobalConfig -Destination $Script:GlobalBackup -Force
        Write-Utf8NoBom -Path $Script:GlobalOriginalState -Content 'present'
    }
    else {
        Write-Utf8NoBom -Path $Script:GlobalOriginalState -Content 'missing'
    }
}

function Write-GlobalConfig {
    Prepare-GlobalBackup
    Ensure-Directory $Script:GlobalHome

    $preserved = New-Object 'System.Collections.Generic.List[string]'
    $state = [System.IO.File]::ReadAllText($Script:GlobalOriginalState).Trim()
    if ($state -eq 'present') {
        if (-not (Test-Path -LiteralPath $Script:GlobalBackup -PathType Leaf)) {
            throw '找不到原配置备份，已停止以避免覆盖现有配置。'
        }

        $topLevel = $true
        $skipNewApi = $false
        foreach ($line in [System.IO.File]::ReadAllLines($Script:GlobalBackup)) {
            if ($line -match '^\s*\[') {
                $topLevel = $false
                if ($line -match '^\s*\[model_providers\.newapi(\.[^]]+)?\]\s*$') {
                    $skipNewApi = $true
                    continue
                }
                $skipNewApi = $false
            }
            if ($skipNewApi) {
                continue
            }
            if ($topLevel -and $line -match '^\s*model\s*=') {
                continue
            }
            if ($topLevel -and $line -match '^\s*model_provider\s*=') {
                continue
            }
            if ($topLevel -and $line -match '^\s*model_reasoning_effort\s*=') {
                continue
            }
            [void]$preserved.Add($line)
        }
    }
    elseif ($state -ne 'missing') {
        throw '无法识别原配置状态，已停止以避免误操作。'
    }

    $topLevelConfig = (Get-TopLevelConfig).TrimEnd()
    $providerTables = (Get-ProviderTablesConfig).Trim()
    if ($preserved.Count -gt 0) {
        $lines = $topLevelConfig + [Environment]::NewLine + [Environment]::NewLine +
            ($preserved -join [Environment]::NewLine).Trim() + [Environment]::NewLine +
            [Environment]::NewLine + $providerTables + [Environment]::NewLine
    }
    else {
        $lines = $topLevelConfig + [Environment]::NewLine + [Environment]::NewLine +
            $providerTables + [Environment]::NewLine
    }
    Write-Utf8NoBom -Path $Script:GlobalConfig -Content $lines
    Write-Host '默认 Codex 配置已切换到 New API。'
}

function Restore-GlobalConfig {
    if (-not (Test-Path -LiteralPath $Script:GlobalOriginalState -PathType Leaf)) {
        return
    }

    $state = [System.IO.File]::ReadAllText($Script:GlobalOriginalState).Trim()
    switch ($state) {
        'present' {
            if (-not (Test-Path -LiteralPath $Script:GlobalBackup -PathType Leaf)) {
                throw '找不到原配置备份，无法安全恢复。'
            }
            Ensure-Directory $Script:GlobalHome
            Copy-Item -LiteralPath $Script:GlobalBackup -Destination $Script:GlobalConfig -Force
        }
        'missing' {
            if (Test-Path -LiteralPath $Script:GlobalConfig -PathType Leaf) {
                Move-Item -LiteralPath $Script:GlobalConfig -Destination "$($Script:GlobalConfig).newapi-removed.$(Get-Timestamp)"
            }
        }
        default {
            throw '无法识别原配置状态，已停止以避免误操作。'
        }
    }

    Remove-Item -LiteralPath $Script:GlobalBackup -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $Script:GlobalOriginalState -Force -ErrorAction SilentlyContinue
}

function Install-CliMode {
    if (Test-Path -LiteralPath $Script:GlobalOriginalState -PathType Leaf) {
        Restore-GlobalConfig
    }
    Save-Credential
    Write-IsolatedConfig
    Install-CliWrapper
    Set-Mode 'cli'

    Write-Host ''
    Write-Host '方式 1 已启用：终端 Codex CLI 将使用 New API。'
    Write-Host 'ChatGPT 桌面端登录保持不变。'
    Write-Host ''
    Write-Host '重新打开终端，然后输入：codex'
}

function Install-GlobalMode {
    Remove-CliWrapper
    Save-Credential
    Write-GlobalConfig
    Set-Mode 'global'

    Write-Host ''
    Write-Host '方式 2 已启用：默认 Codex 配置将使用 New API。'
    Write-Host '请完全退出并重新打开受影响的 Codex 客户端。'
    Write-Host 'New API 不会替代 ChatGPT 账号或 ChatGPT 登录。'
}

function Rotate-Credential {
    Save-Credential -Force $true
    Write-Host ''
    Write-Host 'New API 密钥已更换。'
}

function Show-Status {
    switch (Get-Mode) {
        'cli' { Write-Host "`n当前模式：方式 1，仅接管终端 Codex CLI" }
        'global' { Write-Host "`n当前模式：方式 2，接管默认 Codex 配置" }
        default { Write-Host "`n当前模式：官方默认" }
    }
    if (Test-Credential) {
        Write-Host 'New API 密钥：已保存'
    }
    else {
        Write-Host 'New API 密钥：未保存'
    }
}

function Remove-Credential {
    Remove-Item -LiteralPath $Script:CredentialFile -Force -ErrorAction SilentlyContinue
    Remove-Item -LiteralPath $Script:CredentialHelper -Force -ErrorAction SilentlyContinue
}

function Restore-Default {
    param([bool]$DeleteKey = $false)

    Remove-CliWrapper
    Restore-GlobalConfig
    if ($DeleteKey) {
        Remove-Credential
    }
    if (Test-Path -LiteralPath $Script:TargetHome -PathType Container) {
        Move-Item -LiteralPath $Script:TargetHome -Destination "$($Script:TargetHome).removed.$(Get-Timestamp)"
    }
    Remove-Item -LiteralPath $Script:ModeFile -Force -ErrorAction SilentlyContinue

    Write-Host ''
    Write-Host '已恢复官方默认配置。'
    Write-Host '请重新打开终端或 Codex 客户端。'
}

function Confirm-Action {
    param([Parameter(Mandatory = $true)][string]$Message)

    $answer = Read-Host "$Message [y/N]"
    $answer -match '^(y|yes)$'
}

function Pause-Menu {
    [void](Read-Host "`n按回车返回菜单")
}

function Show-InteractiveMenu {
    while ($true) {
        Write-Host ''
        Write-Host 'Codex New API 管理'
        Write-Host ''
        Write-Host '  1. 仅接管终端 Codex CLI（推荐）'
        Write-Host '     ChatGPT 桌面端登录和 Remote Control 保持不变'
        Write-Host ''
        Write-Host '  2. 接管默认 Codex 配置'
        Write-Host '     可影响共用 ~/.codex 的客户端，但不会替代 ChatGPT 账号'
        Write-Host ''
        Write-Host '  3. 更换 New API 密钥'
        Write-Host '  4. 查看当前状态'
        Write-Host '  5. 移除 New API 配置，恢复官方默认'
        Write-Host '  0. 退出'
        Write-Host ''
        $choice = Read-Host '请选择'

        switch ($choice) {
            '1' {
                Install-CliMode
                Pause-Menu
            }
            '2' {
                Write-Host ''
                Write-Host '方式 2 会修改默认 Codex 配置，并可能影响桌面 Codex。'
                Write-Host 'ChatGPT 账号、云端功能和 Remote Control 不能由 New API 替代。'
                if (Confirm-Action '继续使用方式 2？') {
                    Install-GlobalMode
                }
                else {
                    Write-Host "`n已取消。"
                }
                Pause-Menu
            }
            '3' {
                Rotate-Credential
                Pause-Menu
            }
            '4' {
                Show-Status
                Pause-Menu
            }
            '5' {
                if (Confirm-Action '恢复官方默认？') {
                    $deleteKey = Confirm-Action '同时删除已保存的 New API 密钥？'
                    Restore-Default -DeleteKey $deleteKey
                }
                else {
                    Write-Host "`n已取消。"
                }
                Pause-Menu
            }
            '0' {
                Write-Host "`n已退出。"
                return
            }
            default {
                Write-Host "`n请输入 0-5。"
            }
        }
    }
}

try {
    Normalize-Settings

    if ($DryRun) {
        Write-Host '预览模式：不会修改文件或密钥。'
        Write-Host "操作：$Action"
        Write-Host "New API 地址：$Script:BaseUrl"
        Write-Host "模型：$Model"
        Write-Host "推理强度：$Reasoning"
        exit 0
    }

    switch ($Action) {
        'Menu' { Show-InteractiveMenu }
        'InstallCli' { Install-CliMode }
        'InstallGlobal' {
            Write-Host ''
            Write-Host '方式 2 会修改默认 Codex 配置，但不会替代 ChatGPT 账号。'
            if (Confirm-Action '继续使用方式 2？') {
                Install-GlobalMode
            }
            else {
                Write-Host "`n已取消。"
            }
        }
        'RotateKey' { Rotate-Credential }
        'Status' { Show-Status }
        'Restore' { Restore-Default }
    }
}
catch {
    Write-Host ''
    Write-Host ("操作失败：" + $_.Exception.Message) -ForegroundColor Red
    exit 1
}

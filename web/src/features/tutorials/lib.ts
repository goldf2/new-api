/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
export const PUBLIC_SITE_ORIGIN = 'https://ai.ebm001.com'

export function getApiBaseUrl(origin: string): string {
  return `${origin.replace(/\/+$/, '')}/v1`
}

export function getSiteOrigin(origin: string): string {
  return origin.replace(/\/+$/, '')
}

function buildPowerShellUrl(value: string): string {
  const separatorIndex = value.indexOf('://')
  const quote = (segment: string) => `'${segment.replaceAll("'", "''")}'`

  if (separatorIndex === -1) {
    return quote(value)
  }

  return `${quote(value.slice(0, separatorIndex))} + ${quote(value.slice(separatorIndex))}`
}

export function buildUnixInstallerCommand(
  origin: string,
  baseUrl: string
): string {
  const siteOrigin = getSiteOrigin(origin)
  return `curl -fsSL "${siteOrigin}/scripts/setup-codex-newapi.sh" | bash -s -- --base-url "${baseUrl}"`
}

export function buildWindowsInstallerCommand(
  origin: string,
  baseUrl: string
): string {
  const siteOrigin = getSiteOrigin(origin)
  const scriptUrl = buildPowerShellUrl(
    `${siteOrigin}/scripts/setup-codex-newapi.ps1`
  )
  const apiBaseUrl = buildPowerShellUrl(baseUrl)

  return `$scriptUrl = ${scriptUrl}; $baseUrl = ${apiBaseUrl}; $scriptPath = Join-Path $env:TEMP 'setup-codex-newapi.ps1'; Remove-Item -LiteralPath $scriptPath -Force -ErrorAction SilentlyContinue; curl.exe --fail --location --retry 3 --http1.1 --ssl-no-revoke $scriptUrl --output $scriptPath; if ($LASTEXITCODE -ne 0) { Start-BitsTransfer -Source $scriptUrl -Destination $scriptPath }; if (!(Test-Path -LiteralPath $scriptPath) -or (Get-Item -LiteralPath $scriptPath).Length -eq 0) { throw '脚本下载失败，请检查网络后重试。' }; & powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath -BaseUrl $baseUrl`
}

export function buildResponsesCurl(baseUrl: string): string {
  return `curl "${baseUrl}/responses" \\
  -H "Authorization: Bearer sk-YOUR_NEW_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model":"YOUR_MODEL_ID","input":"Hello","stream":true}'`
}

export function buildCodexConfig(baseUrl: string): string {
  return `[model_providers.newapi]
name = "New API"
base_url = "${baseUrl}"
env_key = "NEWAPI_API_KEY"
wire_api = "responses"

[profiles.newapi]
model = "YOUR_MODEL_ID"
model_provider = "newapi"`
}

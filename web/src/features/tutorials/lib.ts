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
export function getApiBaseUrl(origin: string): string {
  return `${origin.replace(/\/+$/, '')}/v1`
}

export function getSiteOrigin(origin: string): string {
  return origin.replace(/\/+$/, '')
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
  return `$script = Invoke-RestMethod "${siteOrigin}/scripts/setup-codex-newapi.ps1"; & ([ScriptBlock]::Create($script)) -BaseUrl "${baseUrl}"`
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

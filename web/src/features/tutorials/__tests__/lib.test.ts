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
import { readFileSync } from 'node:fs'

import { describe, expect, test } from 'vitest'

import {
  buildCodexConfig,
  buildResponsesCurl,
  buildUnixInstallerCommand,
  buildWindowsInstallerCommand,
  getApiBaseUrl,
  PUBLIC_SITE_ORIGIN,
} from '../lib'

describe('tutorial configuration examples', () => {
  test('uses the public New API domain', () => {
    expect(PUBLIC_SITE_ORIGIN).toBe('https://ai.ebm001.com')
    expect(getApiBaseUrl(PUBLIC_SITE_ORIGIN)).toBe('https://ai.ebm001.com/v1')
  })

  test('normalizes the current origin into an API base URL', () => {
    expect(getApiBaseUrl('https://gateway.example/')).toBe(
      'https://gateway.example/v1'
    )
  })

  test('builds examples against the current gateway and requires streaming', () => {
    const baseUrl = getApiBaseUrl('https://gateway.example')

    expect(buildResponsesCurl(baseUrl)).toContain(
      'https://gateway.example/v1/responses'
    )
    expect(buildResponsesCurl(baseUrl)).toContain('"stream":true')
    const codexConfig = buildCodexConfig(baseUrl)

    expect(codexConfig).toContain('base_url = "https://gateway.example/v1"')
    expect(codexConfig).not.toContain('[profiles.newapi]')
    expect(codexConfig.startsWith('model = "YOUR_MODEL_ID"')).toBe(true)
    expect(codexConfig).toContain('model_provider = "newapi"')
  })

  test('builds one-line installers hosted by the current site', () => {
    const origin = 'https://gateway.example/'
    const baseUrl = getApiBaseUrl(origin)

    expect(buildUnixInstallerCommand(origin, baseUrl)).toBe(
      'curl -fsSL "https://gateway.example/scripts/setup-codex-newapi.sh" | bash -s -- --base-url "https://gateway.example/v1"'
    )
    const windowsCommand = buildWindowsInstallerCommand(origin, baseUrl)

    expect(windowsCommand).toBe(
      '$script = Invoke-RestMethod -Uri "https://gateway.example/scripts/setup-codex-newapi.ps1"; & ([ScriptBlock]::Create($script)) -BaseUrl "https://gateway.example/v1"'
    )
  })

  test('serves the Windows installer without a UTF-8 byte-order mark', () => {
    const script = readFileSync('public/scripts/setup-codex-newapi.ps1')

    expect(script.subarray(0, 3)).toEqual(Buffer.from('[Cm'))
  })

  test('switches desktop mode in the default Codex home without moving history', () => {
    const windowsScript = readFileSync(
      'public/scripts/setup-codex-newapi.ps1',
      'utf8'
    )
    const unixScript = readFileSync(
      'public/scripts/setup-codex-newapi.sh',
      'utf8'
    )

    expect(windowsScript).toContain(
      "$Script:ProfileConfig = Join-Path $Script:GlobalHome 'newapi.config.toml'"
    )
    expect(unixScript).toContain(
      'PROFILE_CONFIG="$GLOBAL_HOME/newapi.config.toml"'
    )
    expect(windowsScript).toContain('--profile newapi')
    expect(unixScript).toContain('--profile newapi')
    expect(windowsScript).toContain("'InstallDesktop'")
    expect(unixScript).toContain('desktop)')
    expect(windowsScript).toContain("Set-Mode 'desktop'")
    expect(unixScript).toContain('set_mode "desktop"')
    expect(windowsScript).toContain('[model_providers.newapi.auth]')
    expect(unixScript).toContain('[model_providers.newapi.auth]')
    expect(windowsScript).not.toContain('forced_login_method = "api"')
    expect(unixScript).not.toContain('forced_login_method = "api"')
    expect(windowsScript).not.toContain('requires_openai_auth = true')
    expect(unixScript).not.toContain('requires_openai_auth = true')
    expect(windowsScript).toContain('$Script:AuthOriginalState')
    expect(unixScript).toContain('AUTH_ORIGINAL_STATE=')
    expect(windowsScript).not.toContain('login --with-api-key')
    expect(unixScript).not.toContain('login --with-api-key')
    expect(windowsScript).toContain('Restore-AuthConfig')
    expect(unixScript).toContain('restore_auth_config')
    expect(windowsScript).toContain('function Suspend-AuthConfig')
    expect(windowsScript).toContain(
      'Remove-Item -LiteralPath $Script:AuthConfig -Force'
    )
    expect(unixScript).toContain('suspend_auth_config()')
    expect(unixScript).toContain('rm -f "$AUTH_CONFIG"')
    expect(windowsScript).toContain('auth.json 已备份并暂时移出')
    expect(unixScript).toContain('auth.json 已备份并暂时移出')
    expect(windowsScript).toContain('历史记录始终保留在')
    expect(unixScript).toContain('历史记录始终保留在')
    expect(windowsScript).not.toContain('set "CODEX_HOME=')
    expect(unixScript).not.toContain('CODEX_HOME=$quoted_home')
    expect(windowsScript).not.toContain('请输入 GLOBAL 继续')
    expect(unixScript).not.toContain('请输入 GLOBAL 继续')
  })
})

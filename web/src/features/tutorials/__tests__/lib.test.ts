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
    expect(codexConfig).toContain('[profiles.newapi]')
    expect(codexConfig.startsWith('[model_providers.newapi]')).toBe(true)
  })

  test('builds one-line installers hosted by the current site', () => {
    const origin = 'https://gateway.example/'
    const baseUrl = getApiBaseUrl(origin)

    expect(buildUnixInstallerCommand(origin, baseUrl)).toBe(
      'curl -fsSL "https://gateway.example/scripts/setup-codex-newapi.sh" | bash -s -- --base-url "https://gateway.example/v1"'
    )
    const windowsCommand = buildWindowsInstallerCommand(origin, baseUrl)

    expect(windowsCommand).toContain(
      "$scriptUrl = 'https' + '://gateway.example/scripts/setup-codex-newapi.ps1'"
    )
    expect(windowsCommand).toContain(
      "$baseUrl = 'https' + '://gateway.example/v1'"
    )
    expect(windowsCommand).toContain(
      "$scriptPath = Join-Path $env:TEMP 'setup-codex-newapi.ps1'"
    )
    expect(windowsCommand).toContain(
      'curl.exe --ipv4 --fail --location --retry 3 --http1.1 --ssl-no-revoke'
    )
    expect(windowsCommand).toContain(
      'if ($LASTEXITCODE -ne 0) { Remove-Item -LiteralPath $scriptPath -Force -ErrorAction SilentlyContinue; Start-BitsTransfer -Source $scriptUrl -Destination $scriptPath }'
    )
    expect(windowsCommand).toContain(
      '& powershell.exe -NoProfile -ExecutionPolicy Bypass -File $scriptPath'
    )
    expect(windowsCommand).not.toContain('https://gateway.example')
    expect(windowsCommand).not.toContain('Invoke-RestMethod')
    expect(windowsCommand).not.toContain('ScriptBlock')
  })

  test('serves the Windows installer with a UTF-8 byte-order mark', () => {
    const script = readFileSync('public/scripts/setup-codex-newapi.ps1')

    expect(script.subarray(0, 3)).toEqual(Buffer.from([0xef, 0xbb, 0xbf]))
  })
})

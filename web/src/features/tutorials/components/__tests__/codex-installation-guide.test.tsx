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
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, test } from 'vitest'

import { CodexInstallationGuide } from '../codex-installation-guide'

const guideProps = {
  unixSetupCommand: 'UNIX_SETUP_COMMAND',
  windowsSetupCommand: 'WINDOWS_SETUP_COMMAND',
}

describe('Codex installation guide', () => {
  test('shows the official macOS and Linux installer by default', () => {
    render(<CodexInstallationGuide {...guideProps} />)

    expect(screen.queryByText(/1\. Choose/)).not.toBeInTheDocument()
    expect(screen.queryByText(/2\. Choose/)).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'macOS / Linux' })
    ).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute(
      'aria-expanded',
      'false'
    )
    expect(screen.getByRole('button', { name: 'Codex' })).toHaveAttribute(
      'aria-pressed',
      'true'
    )
    expect(
      screen.getByText('curl -fsSL https://chatgpt.com/codex/install.sh | sh')
    ).toBeInTheDocument()
    expect(screen.getByText('codex --version')).toBeInTheDocument()
    expect(screen.getByText('Codex CLI installation')).toBeInTheDocument()
    expect(screen.getByText('Codex Desktop installation')).toBeInTheDocument()
    expect(screen.getByText('UNIX_SETUP_COMMAND')).toBeInTheDocument()
    expect(screen.queryByText('WINDOWS_SETUP_COMMAND')).not.toBeInTheDocument()
    expect(
      screen.getByText(/temporarily removes auth.json while New API is active/)
    ).toBeInTheDocument()
  })

  test('switches to the official Windows installer', async () => {
    const user = userEvent.setup()
    render(<CodexInstallationGuide {...guideProps} />)

    await user.click(screen.getByRole('button', { name: 'Windows' }))

    expect(screen.getByRole('button', { name: 'Windows' })).toHaveAttribute(
      'aria-expanded',
      'true'
    )
    expect(
      screen.getByRole('button', { name: 'macOS / Linux' })
    ).toHaveAttribute('aria-expanded', 'true')

    const codexButtons = screen.getAllByRole('button', { name: 'Codex' })
    expect(codexButtons[0]).toHaveAttribute('aria-pressed', 'false')
    expect(codexButtons[1]).toHaveAttribute('aria-pressed', 'true')

    expect(
      screen.getByText(
        'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('WINDOWS_SETUP_COMMAND')).toBeInTheDocument()
    expect(screen.queryByText('UNIX_SETUP_COMMAND')).not.toBeInTheDocument()
    expect(
      screen.getByRole('button', {
        name: 'Open the official Codex Desktop installation guide',
      })
    ).toHaveAttribute('href', 'https://developers.openai.com/codex/app/windows')
  })

  test('shows platform-specific placeholder pages without Codex content', async () => {
    const user = userEvent.setup()
    render(<CodexInstallationGuide {...guideProps} />)

    const claudeButton = screen.getByRole('button', { name: 'Claude Code' })
    await user.click(claudeButton)

    expect(screen.getByText('Tutorial coming soon')).toBeInTheDocument()
    expect(claudeButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('UNIX_SETUP_COMMAND')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Open the official Codex guide')
    ).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: 'Windows' }))
    const geminiButtons = await screen.findAllByRole('button', {
      name: 'Gemini CLI',
    })
    const geminiButton = geminiButtons[1]
    await user.click(geminiButton)

    expect(geminiButton).toHaveAttribute('aria-pressed', 'true')
    expect(screen.queryByText('WINDOWS_SETUP_COMMAND')).not.toBeInTheDocument()
  })

  test('collapses a platform without clearing the selected guide', async () => {
    const user = userEvent.setup()
    render(<CodexInstallationGuide {...guideProps} />)

    const unixButton = screen.getByRole('button', { name: 'macOS / Linux' })
    await user.click(unixButton)

    expect(unixButton).toHaveAttribute('aria-expanded', 'false')
    expect(
      screen.queryByRole('button', { name: 'Claude Code' })
    ).not.toBeInTheDocument()
    expect(screen.getByText('UNIX_SETUP_COMMAND')).toBeInTheDocument()
  })

  test('expands and collapses operating systems independently', async () => {
    const user = userEvent.setup()
    render(<CodexInstallationGuide {...guideProps} />)

    const unixButton = screen.getByRole('button', { name: 'macOS / Linux' })
    const windowsButton = screen.getByRole('button', { name: 'Windows' })

    await user.click(windowsButton)

    expect(unixButton).toHaveAttribute('aria-expanded', 'true')
    expect(windowsButton).toHaveAttribute('aria-expanded', 'true')

    await user.click(unixButton)

    expect(unixButton).toHaveAttribute('aria-expanded', 'false')
    expect(windowsButton).toHaveAttribute('aria-expanded', 'true')
  })

  test('links to the official CLI and desktop installation documentation', () => {
    render(<CodexInstallationGuide {...guideProps} />)

    const cliGuideButton = screen.getByRole('button', {
      name: 'Open the official Codex guide',
    })
    const desktopInstallButton = screen.getByRole('button', {
      name: 'Open the official Codex Desktop installation guide',
    })
    const desktopGuideButton = screen.getByRole('button', {
      name: 'Open the official Codex Desktop guide',
    })

    expect(cliGuideButton).toHaveAttribute(
      'href',
      'https://developers.openai.com/codex/cli'
    )
    expect(desktopInstallButton).toHaveAttribute(
      'href',
      'https://developers.openai.com/codex/app'
    )
    expect(desktopGuideButton).toHaveAttribute(
      'href',
      'https://developers.openai.com/codex/app'
    )

    for (const button of [
      cliGuideButton,
      desktopInstallButton,
      desktopGuideButton,
    ]) {
      expect(button).toHaveAttribute('target', '_blank')
      expect(button).toHaveAttribute('rel', 'noopener noreferrer')
    }
  })
})

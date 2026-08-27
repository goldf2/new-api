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

    expect(
      screen.getByText('curl -fsSL https://chatgpt.com/codex/install.sh | sh')
    ).toBeInTheDocument()
    expect(screen.getByText('codex --version')).toBeInTheDocument()
    expect(screen.getByText('UNIX_SETUP_COMMAND')).toBeInTheDocument()
    expect(screen.queryByText('WINDOWS_SETUP_COMMAND')).not.toBeInTheDocument()
    expect(
      screen.getByText(/uses New API from the default Codex home/)
    ).toBeInTheDocument()
  })

  test('switches to the official Windows installer', async () => {
    const user = userEvent.setup()
    render(<CodexInstallationGuide {...guideProps} />)

    await user.click(screen.getByRole('tab', { name: 'Codex Windows' }))

    expect(
      screen.getByText(
        'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"'
      )
    ).toBeInTheDocument()
    expect(screen.getByText('WINDOWS_SETUP_COMMAND')).toBeInTheDocument()
    expect(screen.queryByText('UNIX_SETUP_COMMAND')).not.toBeInTheDocument()
  })

  test('shows platform-specific placeholder pages without Codex content', async () => {
    const user = userEvent.setup()
    render(<CodexInstallationGuide {...guideProps} />)

    const claudeTab = screen.getByRole('tab', {
      name: 'Claude Code macOS / Linux',
    })
    await user.click(claudeTab)

    expect(screen.getByText('Tutorial coming soon')).toBeInTheDocument()
    expect(claudeTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('UNIX_SETUP_COMMAND')).not.toBeInTheDocument()
    expect(
      screen.queryByText('Open the official Codex guide')
    ).not.toBeInTheDocument()

    const geminiTab = screen.getByRole('tab', { name: 'Gemini CLI Windows' })
    await user.click(geminiTab)

    expect(geminiTab).toHaveAttribute('aria-selected', 'true')
    expect(screen.queryByText('WINDOWS_SETUP_COMMAND')).not.toBeInTheDocument()
  })

  test('links only to official OpenAI installation documentation', () => {
    render(<CodexInstallationGuide {...guideProps} />)

    const guideButton = screen.getByRole('button', {
      name: 'Open the official Codex guide',
    })

    expect(guideButton).toHaveAttribute(
      'href',
      'https://learn.chatgpt.com/docs/codex/cli'
    )
    expect(guideButton).toHaveAttribute('target', '_blank')
    expect(guideButton).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

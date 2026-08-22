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
import { TerminalSquare } from 'lucide-react'
import { describe, expect, test } from 'vitest'

import { ClientPrerequisite } from '../client-prerequisite'

describe('client prerequisite', () => {
  test('shows the requirement, verification command, and safe official link', () => {
    render(
      <ClientPrerequisite
        title='Codex CLI'
        status='Required'
        description='Install Codex before setup.'
        href='https://learn.chatgpt.com/docs/codex/cli'
        linkLabel='Open installation guide'
        icon={TerminalSquare}
        command='codex --version'
      />
    )

    expect(screen.getByText('Required')).toBeInTheDocument()
    expect(screen.getByText('codex --version')).toBeInTheDocument()
    const guideButton = screen.getByRole('button', {
      name: 'Open installation guide',
    })

    expect(guideButton).toHaveAttribute(
      'href',
      'https://learn.chatgpt.com/docs/codex/cli'
    )
    expect(guideButton).toHaveAttribute('target', '_blank')
    expect(guideButton).toHaveAttribute('rel', 'noopener noreferrer')
  })
})

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
import { render, screen, within } from '@testing-library/react'
import { createElement, type AnchorHTMLAttributes } from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { useAuthStore } from '@/stores/auth-store'

import { CommunityHomePreview } from '../community-home-preview'
import { SaasHomePreview } from '../saas-home-preview'

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  to: string
}

vi.mock('@tanstack/react-router', () => ({
  Link: (props: MockLinkProps) => {
    const { to, children, ...anchorProps } = props
    return createElement('a', { href: to, ...anchorProps }, children)
  },
}))

describe('commercial homepage previews', () => {
  beforeEach(() => {
    useAuthStore.getState().auth.reset()
  })

  test('focused preview presents one GPT20x service and real purchase links', () => {
    render(<CommunityHomePreview />)

    expect(
      screen.getByRole('heading', { name: /Focus on one product/i })
    ).toBeInTheDocument()
    expect(screen.getByText('GPT Pro 20x')).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Create account' })[0]
    ).toHaveAttribute('href', '/sign-up')
    expect(
      screen.getByRole('link', { name: 'View live pricing' })
    ).toHaveAttribute('href', '/pricing')
    expect(
      screen.queryByText('Vast Range of AI Models')
    ).not.toBeInTheDocument()
  })

  test('saas preview exposes onboarding, billing and FAQ without invented prices', () => {
    render(<SaasHomePreview />)

    expect(
      screen.getByRole('heading', { name: /Developer-first/i })
    ).toBeInTheDocument()
    expect(screen.getByText('Email and SMS verification')).toBeInTheDocument()
    expect(
      screen.getByRole('heading', { name: 'Frequently asked questions' })
    ).toBeInTheDocument()
    expect(
      screen.getAllByRole('link', { name: 'Check current pricing' })[0]
    ).toHaveAttribute('href', '/pricing')
    expect(screen.queryByText(/¥\d/)).not.toBeInTheDocument()
  })

  test('each preview keeps both style choices keyboard-accessible', () => {
    render(<CommunityHomePreview />)

    const styleNavigations = screen.getAllByRole('navigation', {
      name: 'Switch homepage style',
    })
    expect(styleNavigations).toHaveLength(2)

    for (const navigation of styleNavigations) {
      expect(
        within(navigation).getByRole('link', {
          name: 'Style A · Focused service',
        })
      ).toHaveAttribute('aria-current', 'page')
      expect(
        within(navigation).getByRole('link', {
          name: 'Style B · Commercial SaaS',
        })
      ).toHaveAttribute('href', '/home-b')
    }
  })
})

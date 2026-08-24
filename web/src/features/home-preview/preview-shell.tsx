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
import { Link } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { cn } from '@/lib/utils'
import { useAuthStore } from '@/stores/auth-store'

type PreviewStyle = 'focused' | 'saas'

type PreviewShellProps = {
  activeStyle: PreviewStyle
  children: React.ReactNode
}

const styleLinks: { style: PreviewStyle; label: string; to: string }[] = [
  {
    style: 'focused',
    label: 'Style A · Focused service',
    to: '/home-a',
  },
  {
    style: 'saas',
    label: 'Style B · Commercial SaaS',
    to: '/home-b',
  },
]

function getStyleLinkClass(options: {
  isActive: boolean
  isFocused: boolean
  isMobile?: boolean
}) {
  const baseClass = options.isMobile
    ? 'rounded-full px-3 py-1 text-xs font-semibold'
    : 'rounded-full px-3 py-1.5 text-xs font-semibold transition-colors'

  if (options.isActive) {
    return cn(
      baseClass,
      options.isFocused
        ? 'bg-[#b7f36b] text-[#0a1304]'
        : 'bg-[#18211b] text-white'
    )
  }

  if (options.isMobile) {
    return cn(baseClass, 'opacity-55')
  }

  return cn(
    baseClass,
    options.isFocused
      ? 'text-white/55 hover:text-white'
      : 'text-[#18211b]/55 hover:text-[#18211b]'
  )
}

export function PreviewShell(props: PreviewShellProps) {
  const { t } = useTranslation()
  const user = useAuthStore((state) => state.auth.user)
  const isFocused = props.activeStyle === 'focused'

  return (
    <div
      className={cn(
        'min-h-svh overflow-x-clip',
        isFocused
          ? 'bg-[#080a08] text-[#f4f7f1]'
          : 'bg-[#f4f1e9] text-[#18211b]'
      )}
    >
      <header
        className={cn(
          'sticky top-0 z-50 border-b backdrop-blur-xl',
          isFocused
            ? 'border-white/10 bg-[#080a08]/88'
            : 'border-[#18211b]/10 bg-[#f4f1e9]/90'
        )}
      >
        <div className='mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:px-8'>
          <Link to='/' className='flex min-w-0 items-center gap-3'>
            <span
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-xl text-sm font-black',
                isFocused
                  ? 'bg-[#b7f36b] text-[#0a1304]'
                  : 'bg-[#18211b] text-[#f4f1e9]'
              )}
            >
              E
            </span>
            <span className='truncate text-sm font-bold tracking-tight'>
              EBM
            </span>
          </Link>

          <nav
            aria-label={t('Switch homepage style')}
            className={cn(
              'hidden items-center gap-1 rounded-full border p-1 md:flex',
              isFocused
                ? 'border-white/10 bg-white/5'
                : 'border-[#18211b]/10 bg-white/55'
            )}
          >
            {styleLinks.map((item) => (
              <Link
                key={item.style}
                to={item.to}
                aria-current={
                  item.style === props.activeStyle ? 'page' : undefined
                }
                className={getStyleLinkClass({
                  isActive: item.style === props.activeStyle,
                  isFocused,
                })}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>

          <div className='flex items-center gap-2'>
            <Link
              to='/pricing'
              className={cn(
                'hidden rounded-lg px-3 py-2 text-sm font-semibold sm:inline-flex',
                isFocused
                  ? 'text-white/65 hover:text-white'
                  : 'text-[#18211b]/65 hover:text-[#18211b]'
              )}
            >
              {t('Pricing')}
            </Link>
            <Link
              to={user ? '/dashboard' : '/sign-in'}
              className={cn(
                'inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition-transform hover:-translate-y-0.5',
                isFocused ? 'bg-white text-black' : 'bg-[#18211b] text-white'
              )}
            >
              {user ? t('Go to Dashboard') : t('Sign in')}
              <ArrowRight aria-hidden='true' className='size-3.5' />
            </Link>
          </div>
        </div>

        <div className='border-t border-current/10 px-5 py-2 md:hidden'>
          <nav
            aria-label={t('Switch homepage style')}
            className='mx-auto flex max-w-md items-center justify-center gap-2'
          >
            {styleLinks.map((item) => (
              <Link
                key={item.style}
                to={item.to}
                aria-current={
                  item.style === props.activeStyle ? 'page' : undefined
                }
                className={getStyleLinkClass({
                  isActive: item.style === props.activeStyle,
                  isFocused,
                  isMobile: true,
                })}
              >
                {t(item.label)}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {props.children}

      <footer
        className={cn(
          'border-t px-5 py-8 md:px-8',
          isFocused ? 'border-white/10' : 'border-[#18211b]/10'
        )}
      >
        <div className='mx-auto flex max-w-7xl flex-col gap-4 text-xs sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='font-bold'>EBM</p>
            <p className={isFocused ? 'text-white/45' : 'text-[#18211b]/50'}>
              {t('Dedicated GPT Pro 20x service')}
            </p>
          </div>
          <div
            className={cn(
              'flex flex-wrap items-center gap-x-4 gap-y-2',
              isFocused ? 'text-white/55' : 'text-[#18211b]/55'
            )}
          >
            <Link to='/pricing' className='hover:text-current'>
              {t('Pricing')}
            </Link>
            <Link to='/sign-up' className='hover:text-current'>
              {t('Create account')}
            </Link>
            <a
              href='https://github.com/QuantumNous/new-api'
              target='_blank'
              rel='noopener noreferrer'
              className='hover:text-current'
            >
              {t('Powered by New API')}
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

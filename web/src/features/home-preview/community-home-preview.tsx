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
import {
  ArrowRight,
  Check,
  CircleDollarSign,
  KeyRound,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  UserRoundCheck,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PreviewShell } from './preview-shell'

const promises = [
  'Product scope is explicit',
  'Pricing rules stay visible',
  'Usage and balance are traceable',
]

const valueCards = [
  {
    icon: ScanSearch,
    title: 'Less choice, more clarity',
    description:
      'Do not use a crowded model catalog to disguise the real service scope.',
  },
  {
    icon: CircleDollarSign,
    title: 'Simple onboarding',
    description:
      'Registration, verification, top-up and key creation follow one clear path.',
  },
  {
    icon: ShieldCheck,
    title: 'Support with context',
    description:
      'Account activity and usage records make questions easier to trace.',
  },
]

const steps = [
  { icon: UserRoundCheck, text: 'Create and verify your account' },
  { icon: CircleDollarSign, text: 'Choose a plan or top up' },
  { icon: KeyRound, text: 'Create a key and connect' },
]

export function CommunityHomePreview() {
  const { t } = useTranslation()

  return (
    <PreviewShell activeStyle='focused'>
      <main>
        <section className='relative overflow-hidden px-5 pt-20 pb-16 md:px-8 md:pt-28 md:pb-24'>
          <div
            aria-hidden='true'
            className='absolute top-[-18rem] left-1/2 size-[42rem] -translate-x-1/2 rounded-full bg-[#b7f36b]/12 blur-[120px]'
          />
          <div className='relative mx-auto max-w-6xl'>
            <div className='mx-auto max-w-4xl text-center'>
              <span className='inline-flex items-center gap-2 rounded-full border border-[#b7f36b]/25 bg-[#b7f36b]/8 px-3 py-1.5 text-xs font-bold text-[#b7f36b]'>
                <Sparkles aria-hidden='true' className='size-3.5' />
                {t('Style A · Focused service')}
              </span>
              <p className='mt-7 text-sm font-bold tracking-[0.22em] text-white/45 uppercase'>
                {t('Dedicated GPT Pro 20x service')}
              </p>
              <h1 className='mt-5 text-[clamp(2.8rem,8vw,6.8rem)] leading-[0.95] font-black tracking-[-0.06em]'>
                {t('Focus on one product.')}
                <br />
                <span className='text-[#b7f36b]'>
                  {t('Make every step clear.')}
                </span>
              </h1>
              <p className='mx-auto mt-8 max-w-2xl text-base leading-8 text-white/58 md:text-lg'>
                {t(
                  'An uncomplicated relay service experience for individuals and small teams that need GPT Pro 20x, from registration to key creation.'
                )}
              </p>
              <div className='mt-9 flex flex-col justify-center gap-3 sm:flex-row'>
                <Link
                  to='/sign-up'
                  className='inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#b7f36b] px-6 text-sm font-black text-[#0a1304] transition-transform hover:-translate-y-0.5'
                >
                  {t('Create account')}
                  <ArrowRight aria-hidden='true' className='size-4' />
                </Link>
                <Link
                  to='/pricing'
                  className='inline-flex h-12 items-center justify-center rounded-full border border-white/15 bg-white/5 px-6 text-sm font-bold text-white transition-colors hover:bg-white/10'
                >
                  {t('View live pricing')}
                </Link>
              </div>
            </div>

            <div className='mt-16 grid gap-4 lg:grid-cols-[1fr_1.35fr]'>
              <article className='rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 md:p-8'>
                <p className='text-xs font-bold tracking-[0.18em] text-white/35 uppercase'>
                  {t('Current service')}
                </p>
                <div className='mt-8 flex items-start justify-between gap-6'>
                  <div>
                    <p className='text-4xl font-black tracking-[-0.04em]'>
                      GPT Pro 20x
                    </p>
                    <p className='mt-2 text-sm text-white/50'>
                      {t('Dedicated relay access')}
                    </p>
                  </div>
                  <span className='rounded-full bg-[#b7f36b] px-3 py-1 text-xs font-black text-[#0a1304]'>
                    {t('One focused service')}
                  </span>
                </div>
                <div className='mt-10 border-t border-white/10 pt-5'>
                  <p className='text-sm leading-6 text-white/45'>
                    {t(
                      'Available model names and prices are always subject to the live console.'
                    )}
                  </p>
                </div>
              </article>

              <div className='grid gap-3 sm:grid-cols-3'>
                {promises.map((promise, index) => (
                  <article
                    key={promise}
                    className='flex min-h-44 flex-col justify-between rounded-[2rem] border border-white/10 bg-[#111510] p-5'
                  >
                    <span className='text-xs font-bold text-white/25'>
                      0{index + 1}
                    </span>
                    <div>
                      <Check
                        aria-hidden='true'
                        className='mb-3 size-5 text-[#b7f36b]'
                      />
                      <p className='text-sm leading-6 font-bold'>
                        {t(promise)}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className='border-y border-white/10 bg-[#0d100d] px-5 py-20 md:px-8 md:py-28'>
          <div className='mx-auto max-w-6xl'>
            <p className='text-xs font-bold tracking-[0.18em] text-[#b7f36b] uppercase'>
              {t('Why focus on one product')}
            </p>
            <h2 className='mt-4 max-w-2xl text-4xl leading-tight font-black tracking-[-0.04em] md:text-6xl'>
              {t('Clear promises are more valuable than a long model list.')}
            </h2>
            <div className='mt-12 grid gap-4 md:grid-cols-3'>
              {valueCards.map((card) => (
                <article
                  key={card.title}
                  className='rounded-[2rem] border border-white/10 bg-white/[0.025] p-7'
                >
                  <card.icon
                    aria-hidden='true'
                    className='size-6 text-[#b7f36b]'
                  />
                  <h3 className='mt-8 text-xl font-black'>{t(card.title)}</h3>
                  <p className='mt-3 text-sm leading-7 text-white/50'>
                    {t(card.description)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='px-5 py-20 md:px-8 md:py-28'>
          <div className='mx-auto max-w-6xl rounded-[2.5rem] border border-white/10 bg-white/[0.035] p-7 md:p-12'>
            <div className='flex flex-col justify-between gap-6 md:flex-row md:items-end'>
              <div>
                <p className='text-xs font-bold tracking-[0.18em] text-[#b7f36b] uppercase'>
                  {t('Three steps to start')}
                </p>
                <h2 className='mt-4 text-3xl font-black tracking-[-0.04em] md:text-5xl'>
                  {t('From account to first request')}
                </h2>
              </div>
              <Link
                to='/sign-up'
                className='inline-flex items-center gap-2 text-sm font-black text-[#b7f36b]'
              >
                {t('Create account')}
                <ArrowRight aria-hidden='true' className='size-4' />
              </Link>
            </div>
            <ol className='mt-12 grid gap-4 md:grid-cols-3'>
              {steps.map((step, index) => (
                <li
                  key={step.text}
                  className='rounded-3xl border border-white/10 bg-[#0b0d0b] p-6'
                >
                  <div className='flex items-center justify-between'>
                    <step.icon
                      aria-hidden='true'
                      className='size-5 text-[#b7f36b]'
                    />
                    <span className='text-xs font-bold text-white/25'>
                      0{index + 1}
                    </span>
                  </div>
                  <p className='mt-10 text-base font-bold'>{t(step.text)}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className='px-5 pb-20 md:px-8 md:pb-28'>
          <div className='mx-auto max-w-6xl rounded-[2.5rem] bg-[#b7f36b] px-7 py-12 text-[#0a1304] md:px-12 md:py-16'>
            <h2 className='max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-6xl'>
              {t('Ready to use a simpler GPT20x service?')}
            </h2>
            <div className='mt-7 flex flex-col justify-between gap-6 md:flex-row md:items-end'>
              <p className='max-w-2xl text-sm leading-7 text-[#0a1304]/65'>
                {t(
                  'Register first, then review the live model and billing information before purchasing.'
                )}
              </p>
              <Link
                to='/sign-up'
                className='inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-[#0a1304] px-5 text-sm font-black text-white'
              >
                {t('Create account')}
                <ArrowRight aria-hidden='true' className='size-4' />
              </Link>
            </div>
          </div>
        </section>
      </main>
    </PreviewShell>
  )
}

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
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CircleDollarSign,
  Code2,
  KeyRound,
  MailCheck,
  ShieldCheck,
  UserRoundPlus,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { PreviewShell } from './preview-shell'

const proofPoints = [
  { value: '1', label: 'Focused GPT20x service' },
  { value: '2', label: 'Registration verification methods' },
  { value: '3', label: 'Steps to complete onboarding' },
]

const capabilities = [
  {
    icon: ShieldCheck,
    title: 'Account security',
    description:
      'Two verification channels make registration and recovery clearer.',
  },
  {
    icon: BarChart3,
    title: 'Transparent billing',
    description:
      'Check model availability, account balance and usage records in the console.',
  },
  {
    icon: Code2,
    title: 'Developer ready',
    description:
      'Use a familiar API workflow and create a dedicated key for each client.',
  },
  {
    icon: Activity,
    title: 'Operational clarity',
    description:
      'Keep pricing, tutorials and account actions connected instead of scattered.',
  },
]

const workflow = [
  {
    icon: UserRoundPlus,
    title: 'Register',
    description: 'Verify your email or phone number.',
  },
  {
    icon: WalletCards,
    title: 'Top up',
    description: 'Review live pricing before adding balance.',
  },
  {
    icon: KeyRound,
    title: 'Create a key',
    description: 'Generate a private API key in the console.',
  },
  {
    icon: Code2,
    title: 'Connect',
    description: 'Use the model ID enabled for your account.',
  },
]

const faqItems = [
  {
    question: 'Which models are available?',
    answer:
      'EBM currently focuses on GPT20x. The live console is the source of truth for model IDs.',
  },
  {
    question: 'Where do I find setup instructions?',
    answer:
      'After signing in, open Tutorials to copy the correct base URL and client configuration.',
  },
  {
    question: 'Do prices expire?',
    answer:
      'Pricing and balance rules should be confirmed on the purchase page before payment.',
  },
  {
    question: 'How do I get support?',
    answer:
      'Keep your request time and usage record so the issue can be traced accurately.',
  },
]

export function SaasHomePreview() {
  const { t } = useTranslation()

  return (
    <PreviewShell activeStyle='saas'>
      <main>
        <section className='relative overflow-hidden px-5 pt-16 pb-14 md:px-8 md:pt-24 md:pb-20'>
          <div
            aria-hidden='true'
            className='absolute top-0 right-[-12rem] size-[34rem] rounded-full bg-[#ff6a3d]/12 blur-[90px]'
          />
          <div className='relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]'>
            <div>
              <span className='inline-flex items-center gap-2 rounded-full border border-[#18211b]/10 bg-white/55 px-3 py-1.5 text-xs font-bold'>
                <span className='size-2 rounded-full bg-[#ff6a3d]' />
                {t('Style B · Commercial SaaS')}
              </span>
              <h1 className='mt-7 max-w-3xl text-[clamp(3rem,7vw,6.5rem)] leading-[0.95] font-black tracking-[-0.065em]'>
                {t('Developer-first')}
                <br />
                <span className='text-[#ff5b2e]'>GPT20x</span>{' '}
                {t('API service')}
              </h1>
              <p className='mt-7 max-w-2xl text-base leading-8 text-[#18211b]/62 md:text-lg'>
                {t(
                  'From account verification to billing and API keys, everything needed to start is in one place.'
                )}
              </p>
              <div className='mt-9 flex flex-col gap-3 sm:flex-row'>
                <Link
                  to='/sign-up'
                  className='inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#18211b] px-6 text-sm font-black text-white transition-transform hover:-translate-y-0.5'
                >
                  {t('Create account')}
                  <ArrowRight aria-hidden='true' className='size-4' />
                </Link>
                <Link
                  to='/pricing'
                  className='inline-flex h-12 items-center justify-center rounded-full border border-[#18211b]/15 bg-white/50 px-6 text-sm font-black'
                >
                  {t('Check current pricing')}
                </Link>
              </div>
              <div className='mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-[#18211b]/55'>
                {[
                  'OpenAI-compatible API',
                  'Email and SMS verification',
                  'Visible balance and usage',
                ].map((item) => (
                  <span key={item} className='inline-flex items-center gap-2'>
                    <Check
                      aria-hidden='true'
                      className='size-3.5 text-[#ff5b2e]'
                    />
                    {t(item)}
                  </span>
                ))}
              </div>
            </div>

            <div className='relative mx-auto w-full max-w-xl'>
              <div className='absolute -inset-4 rotate-2 rounded-[2.5rem] bg-[#ff6a3d]/12' />
              <article className='relative overflow-hidden rounded-[2.25rem] border border-[#18211b]/10 bg-[#18211b] p-6 text-white shadow-[0_30px_80px_-35px_rgba(24,33,27,0.55)] md:p-8'>
                <div className='flex items-center justify-between'>
                  <div>
                    <p className='text-xs font-bold tracking-[0.16em] text-white/35 uppercase'>
                      {t('Account overview')}
                    </p>
                    <p className='mt-2 text-2xl font-black'>EBM Console</p>
                  </div>
                  <span className='rounded-full bg-[#7ee2a8]/12 px-3 py-1 text-xs font-bold text-[#7ee2a8]'>
                    {t('Service available')}
                  </span>
                </div>
                <div className='mt-8 grid gap-3 sm:grid-cols-2'>
                  <div className='rounded-2xl bg-white/[0.06] p-5'>
                    <p className='text-xs text-white/40'>
                      {t('Available model')}
                    </p>
                    <p className='mt-3 text-xl font-black'>GPT20x</p>
                  </div>
                  <div className='rounded-2xl bg-white/[0.06] p-5'>
                    <p className='text-xs text-white/40'>{t('Billing mode')}</p>
                    <p className='mt-3 text-xl font-black'>
                      {t('Usage-based')}
                    </p>
                  </div>
                </div>
                <div className='mt-3 rounded-2xl bg-[#ff6a3d] p-5 text-[#21100a]'>
                  <div className='flex items-center justify-between gap-4'>
                    <div>
                      <p className='text-xs font-bold opacity-55'>
                        {t('Next action')}
                      </p>
                      <p className='mt-1 font-black'>
                        {t('Create an API key')}
                      </p>
                    </div>
                    <KeyRound aria-hidden='true' className='size-6' />
                  </div>
                </div>
                <p className='mt-5 text-xs leading-5 text-white/35'>
                  {t(
                    'Model names, availability and prices shown in the live console take precedence.'
                  )}
                </p>
              </article>
            </div>
          </div>

          <div className='mx-auto mt-16 grid max-w-7xl divide-y divide-[#18211b]/10 border-y border-[#18211b]/10 sm:grid-cols-3 sm:divide-x sm:divide-y-0'>
            {proofPoints.map((point) => (
              <div
                key={point.label}
                className='flex items-baseline gap-3 py-5 sm:px-6'
              >
                <span className='text-3xl font-black tracking-[-0.04em]'>
                  {point.value}
                </span>
                <span className='text-xs font-bold text-[#18211b]/50'>
                  {t(point.label)}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className='bg-white/55 px-5 py-20 md:px-8 md:py-28'>
          <div className='mx-auto max-w-7xl'>
            <div className='max-w-3xl'>
              <p className='text-xs font-black tracking-[0.18em] text-[#ff5b2e] uppercase'>
                {t('One service, complete workflow')}
              </p>
              <h2 className='mt-4 text-4xl leading-tight font-black tracking-[-0.05em] md:text-6xl'>
                {t(
                  'Designed for a commercial customer journey, not an admin dashboard.'
                )}
              </h2>
            </div>
            <div className='mt-12 grid gap-4 md:grid-cols-2'>
              {capabilities.map((item) => (
                <article
                  key={item.title}
                  className='rounded-[2rem] border border-[#18211b]/10 bg-[#f8f6f0] p-7 md:p-8'
                >
                  <div className='flex size-11 items-center justify-center rounded-2xl bg-[#18211b] text-white'>
                    <item.icon aria-hidden='true' className='size-5' />
                  </div>
                  <h3 className='mt-8 text-2xl font-black tracking-[-0.03em]'>
                    {t(item.title)}
                  </h3>
                  <p className='mt-3 max-w-xl text-sm leading-7 text-[#18211b]/55'>
                    {t(item.description)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='px-5 py-20 md:px-8 md:py-28'>
          <div className='mx-auto max-w-7xl'>
            <div className='grid gap-12 lg:grid-cols-[0.8fr_1.2fr]'>
              <div>
                <p className='text-xs font-black tracking-[0.18em] text-[#ff5b2e] uppercase'>
                  {t('How it works')}
                </p>
                <h2 className='mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl'>
                  {t('Four clear steps to your first request')}
                </h2>
              </div>
              <ol className='grid gap-3 sm:grid-cols-2'>
                {workflow.map((item, index) => (
                  <li
                    key={item.title}
                    className='rounded-[2rem] border border-[#18211b]/10 bg-white/55 p-6'
                  >
                    <div className='flex items-center justify-between'>
                      <item.icon
                        aria-hidden='true'
                        className='size-5 text-[#ff5b2e]'
                      />
                      <span className='text-xs font-black text-[#18211b]/25'>
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className='mt-8 text-xl font-black'>{t(item.title)}</h3>
                    <p className='mt-2 text-sm leading-6 text-[#18211b]/52'>
                      {t(item.description)}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className='px-5 pb-20 md:px-8 md:pb-28'>
          <div className='mx-auto grid max-w-7xl overflow-hidden rounded-[2.5rem] border border-[#18211b]/10 bg-[#18211b] text-white lg:grid-cols-2'>
            <div className='p-7 md:p-12'>
              <CircleDollarSign
                aria-hidden='true'
                className='size-8 text-[#ff7a51]'
              />
              <h2 className='mt-8 text-4xl font-black tracking-[-0.05em] md:text-5xl'>
                {t('Flexible billing without invented packages')}
              </h2>
              <p className='mt-5 max-w-xl text-sm leading-7 text-white/50'>
                {t(
                  'The preview does not invent discounts or subscription numbers. Customers always see the currently enabled model and price.'
                )}
              </p>
              <Link
                to='/pricing'
                className='mt-8 inline-flex h-11 items-center gap-2 rounded-full bg-[#ff6a3d] px-5 text-sm font-black text-[#21100a]'
              >
                {t('Check current pricing')}
                <ArrowRight aria-hidden='true' className='size-4' />
              </Link>
            </div>
            <div className='grid gap-px bg-white/10 sm:grid-cols-2'>
              {[
                {
                  icon: MailCheck,
                  title: 'Live model pricing',
                  text: 'See the actual enabled model and price in the model marketplace.',
                },
                {
                  icon: WalletCards,
                  title: 'Pay as you use',
                  text: 'Balance and usage records are visible in the console.',
                },
              ].map((item) => (
                <article key={item.title} className='bg-[#18211b] p-7 md:p-9'>
                  <item.icon
                    aria-hidden='true'
                    className='size-6 text-[#ff7a51]'
                  />
                  <h3 className='mt-16 text-xl font-black'>{t(item.title)}</h3>
                  <p className='mt-3 text-sm leading-7 text-white/45'>
                    {t(item.text)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='border-y border-[#18211b]/10 bg-white/55 px-5 py-20 md:px-8 md:py-28'>
          <div className='mx-auto max-w-7xl'>
            <p className='text-xs font-black tracking-[0.18em] text-[#ff5b2e] uppercase'>
              FAQ
            </p>
            <h2 className='mt-4 text-4xl font-black tracking-[-0.05em] md:text-6xl'>
              {t('Frequently asked questions')}
            </h2>
            <div className='mt-12 grid gap-4 md:grid-cols-2'>
              {faqItems.map((item) => (
                <article
                  key={item.question}
                  className='rounded-[2rem] border border-[#18211b]/10 bg-[#f8f6f0] p-7'
                >
                  <h3 className='text-lg font-black'>{t(item.question)}</h3>
                  <p className='mt-3 text-sm leading-7 text-[#18211b]/55'>
                    {t(item.answer)}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className='px-5 py-20 md:px-8 md:py-28'>
          <div className='mx-auto flex max-w-7xl flex-col justify-between gap-8 rounded-[2.5rem] bg-[#ff6a3d] px-7 py-12 text-[#21100a] md:flex-row md:items-end md:px-12 md:py-16'>
            <div>
              <h2 className='max-w-3xl text-4xl font-black tracking-[-0.05em] md:text-6xl'>
                {t('Build with a clearer GPT20x workflow')}
              </h2>
              <p className='mt-5 max-w-2xl text-sm leading-7 text-[#21100a]/65'>
                {t(
                  'Create an account, review live pricing, and connect with a dedicated API key.'
                )}
              </p>
            </div>
            <Link
              to='/sign-up'
              className='inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-[#21100a] px-6 text-sm font-black text-white'
            >
              {t('Create account')}
              <ArrowRight aria-hidden='true' className='size-4' />
            </Link>
          </div>
        </section>
      </main>
    </PreviewShell>
  )
}

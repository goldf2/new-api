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
import {
  CheckCircle2,
  ExternalLink,
  Laptop,
  MonitorCog,
  ShieldCheck,
  TerminalSquare,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const UNIX_INSTALL_COMMAND =
  'curl -fsSL https://chatgpt.com/codex/install.sh | sh'
const WINDOWS_INSTALL_COMMAND =
  'powershell -ExecutionPolicy ByPass -c "irm https://chatgpt.com/codex/install.ps1 | iex"'
const NPM_INSTALL_COMMAND = 'npm install -g @openai/codex'
const VERIFY_COMMAND = 'codex --version'

function InstallCommand(props: {
  label: string
  command: string
  description?: string
}) {
  const { t } = useTranslation()

  return (
    <div className='overflow-hidden rounded-xl border'>
      <div className='bg-muted/40 flex items-center justify-between gap-3 border-b px-3 py-2'>
        <span className='text-sm font-medium'>{props.label}</span>
        <CopyButton
          value={props.command}
          variant='ghost'
          size='sm'
          className='size-7 p-0'
          tooltip={t('Copy command')}
          aria-label={t('Copy command')}
        />
      </div>
      <pre className='bg-muted/15 overflow-x-auto p-3 text-xs leading-relaxed'>
        <code>{props.command}</code>
      </pre>
      {props.description && (
        <p className='text-muted-foreground border-t px-3 py-2 text-xs leading-relaxed'>
          {props.description}
        </p>
      )}
    </div>
  )
}

function PlatformGuide(props: {
  title: string
  subtitle: string
  requirement: string
  installCommand: string
  installDescription: string
}) {
  const { t } = useTranslation()

  return (
    <div className='space-y-4'>
      <div>
        <h3 className='text-xl font-semibold tracking-tight'>{props.title}</h3>
        <p className='text-muted-foreground mt-1 text-sm'>{props.subtitle}</p>
      </div>

      <div className='flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4'>
        <CheckCircle2
          className='mt-0.5 size-5 shrink-0 text-emerald-600'
          aria-hidden='true'
        />
        <div>
          <p className='text-sm font-semibold text-emerald-700 dark:text-emerald-400'>
            {t('Official original installation')}
          </p>
          <p className='mt-1 text-xs leading-relaxed text-emerald-700/80 dark:text-emerald-300/80'>
            {t(
              'This guide uses only the official Codex installer and package.'
            )}
          </p>
        </div>
      </div>

      <div className='rounded-xl border p-4'>
        <div className='flex items-start gap-3'>
          <div className='bg-muted flex size-8 shrink-0 items-center justify-center rounded-lg'>
            <MonitorCog className='size-4' aria-hidden='true' />
          </div>
          <div>
            <p className='text-sm font-semibold'>{t('System requirements')}</p>
            <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
              {props.requirement}
            </p>
          </div>
        </div>
      </div>

      <div className='space-y-3 rounded-xl border p-4'>
        <div className='flex items-center gap-3'>
          <div className='bg-primary/10 text-primary flex size-8 shrink-0 items-center justify-center rounded-lg'>
            <TerminalSquare className='size-4' aria-hidden='true' />
          </div>
          <p className='text-sm font-semibold'>{t('Installation steps')}</p>
        </div>
        <InstallCommand
          label={t('1. Install with the official installer')}
          command={props.installCommand}
          description={props.installDescription}
        />
        <InstallCommand
          label={t('Alternative: install with npm')}
          command={NPM_INSTALL_COMMAND}
          description={t(
            'Use this only if Node.js and npm are already installed.'
          )}
        />
        <InstallCommand
          label={t('2. Reopen the terminal and verify the installation')}
          command={VERIFY_COMMAND}
        />
      </div>
    </div>
  )
}

export function CodexInstallationGuide() {
  const { t } = useTranslation()

  return (
    <Card>
      <CardHeader>
        <div className='flex items-start gap-3'>
          <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg'>
            <TerminalSquare className='size-4' aria-hidden='true' />
          </div>
          <div>
            <CardTitle>{t('Install Codex CLI')}</CardTitle>
            <CardDescription className='mt-1'>
              {t(
                'Install the official Codex CLI first, then return here to connect it to New API.'
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Tabs
          defaultValue='unix'
          orientation='vertical'
          className='grid gap-4 lg:grid-cols-[220px_minmax(0,1fr)]'
        >
          <div className='h-fit rounded-xl border p-2'>
            <p className='text-muted-foreground px-2 pb-2 text-xs font-semibold tracking-wide'>
              {t('Installation & tutorials')}
            </p>
            <div className='px-2 py-1 text-sm font-semibold'>
              {t('Codex installation')}
            </div>
            <TabsList variant='line' className='mt-1 w-full items-stretch pl-4'>
              <TabsTrigger value='unix' className='min-h-9 px-3'>
                {t('macOS / Linux')}
              </TabsTrigger>
              <TabsTrigger value='windows' className='min-h-9 px-3'>
                {t('Windows')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='unix'>
            <PlatformGuide
              title={t('macOS / Linux Codex installation guide')}
              subtitle={t('Install the official Codex CLI on macOS or Linux.')}
              requirement={t(
                'A supported macOS or Linux system, a terminal, and internet access.'
              )}
              installCommand={UNIX_INSTALL_COMMAND}
              installDescription={t(
                'Recommended. This installer does not require you to install Node.js first.'
              )}
            />
          </TabsContent>

          <TabsContent value='windows'>
            <PlatformGuide
              title={t('Windows Codex installation guide')}
              subtitle={t('Install the official Codex CLI on Windows.')}
              requirement={t(
                'Windows with PowerShell and internet access. Use a local PowerShell window when possible.'
              )}
              installCommand={WINDOWS_INSTALL_COMMAND}
              installDescription={t(
                'Recommended. Run this command in PowerShell and reopen PowerShell after it finishes.'
              )}
            />
          </TabsContent>
        </Tabs>

        <div className='bg-primary/5 flex gap-3 rounded-xl border p-3'>
          <ShieldCheck
            className='text-primary mt-0.5 size-4 shrink-0'
            aria-hidden='true'
          />
          <div>
            <p className='text-sm font-medium'>
              {t('Keep your existing Codex login')}
            </p>
            <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
              {t(
                'Do not delete the .codex folder or replace auth.json. The next setup step can use an isolated CLI configuration and keep the official desktop login and Remote Control unchanged.'
              )}
            </p>
          </div>
        </div>

        <div className='flex flex-wrap gap-2'>
          <Button
            variant='outline'
            size='sm'
            render={
              <a
                href='https://learn.chatgpt.com/docs/codex/cli'
                target='_blank'
                rel='noopener noreferrer'
              />
            }
          >
            <ExternalLink data-icon='inline-start' />
            {t('Open the official Codex guide')}
          </Button>
          <Button
            variant='ghost'
            size='sm'
            render={
              <a
                href='https://learn.chatgpt.com/docs/app'
                target='_blank'
                rel='noopener noreferrer'
              />
            }
          >
            <Laptop data-icon='inline-start' />
            {t('ChatGPT desktop is optional')}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

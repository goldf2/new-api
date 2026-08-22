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
import { ExternalLink, Laptop, ShieldCheck, TerminalSquare } from 'lucide-react'
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
        <Tabs defaultValue='unix'>
          <TabsList className='grid w-full grid-cols-2 group-data-horizontal/tabs:h-auto'>
            <TabsTrigger value='unix'>{t('macOS / Linux')}</TabsTrigger>
            <TabsTrigger value='windows'>{t('Windows')}</TabsTrigger>
          </TabsList>

          <TabsContent value='unix' className='mt-4 space-y-3'>
            <InstallCommand
              label={t('1. Install with the official installer')}
              command={UNIX_INSTALL_COMMAND}
              description={t(
                'Recommended. This installer does not require you to install Node.js first.'
              )}
            />
            <InstallCommand
              label={t('Alternative: install with npm')}
              command={NPM_INSTALL_COMMAND}
              description={t(
                'Use this only if Node.js and npm are already installed.'
              )}
            />
            <InstallCommand
              label={t('2. Verify the installation')}
              command={VERIFY_COMMAND}
            />
          </TabsContent>

          <TabsContent value='windows' className='mt-4 space-y-3'>
            <InstallCommand
              label={t('1. Install with the official installer')}
              command={WINDOWS_INSTALL_COMMAND}
              description={t(
                'Recommended. Run this command in PowerShell and reopen PowerShell after it finishes.'
              )}
            />
            <InstallCommand
              label={t('Alternative: install with npm')}
              command={NPM_INSTALL_COMMAND}
              description={t(
                'Use this only if Node.js and npm are already installed.'
              )}
            />
            <InstallCommand
              label={t('2. Verify the installation')}
              command={VERIFY_COMMAND}
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

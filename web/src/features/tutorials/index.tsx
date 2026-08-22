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
  BookOpen,
  CircleAlert,
  KeyRound,
  Laptop,
  Network,
  Settings,
  ShieldCheck,
  TerminalSquare,
  UserRound,
} from 'lucide-react'
import { type ReactNode, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { CopyButton } from '@/components/copy-button'
import { SectionPageLayout } from '@/components/layout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useIsAdmin } from '@/hooks/use-admin'

import { CodexInstallationGuide } from './components/codex-installation-guide'
import {
  buildCodexConfig,
  buildResponsesCurl,
  buildUnixInstallerCommand,
  buildWindowsInstallerCommand,
  getApiBaseUrl,
  getSiteOrigin,
  PUBLIC_SITE_ORIGIN,
} from './lib'

type GuideStepProps = {
  index: number
  title: string
  description: string
  icon: typeof KeyRound
}

function GuideStep({ index, title, description, icon: Icon }: GuideStepProps) {
  return (
    <div className='bg-background/70 flex gap-3 rounded-xl border p-3 shadow-xs'>
      <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg'>
        <Icon className='size-4' aria-hidden='true' />
      </div>
      <div className='min-w-0'>
        <p className='text-sm font-medium'>
          <span className='text-muted-foreground mr-1.5 font-mono text-xs'>
            {index}.
          </span>
          {title}
        </p>
        <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
          {description}
        </p>
      </div>
    </div>
  )
}

function CodeExample({ title, value }: { title: string; value: string }) {
  const { t } = useTranslation()

  return (
    <div className='overflow-hidden rounded-xl border'>
      <div className='bg-muted/50 flex items-center justify-between gap-3 border-b px-3 py-2'>
        <span className='text-sm font-medium'>{title}</span>
        <CopyButton
          value={value}
          variant='ghost'
          size='sm'
          className='size-7 p-0'
          tooltip={t('Copy configuration')}
          aria-label={t('Copy configuration')}
        />
      </div>
      <pre className='bg-muted/20 overflow-x-auto p-3 text-xs leading-relaxed'>
        <code>{value}</code>
      </pre>
    </div>
  )
}

function Notice({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof ShieldCheck
  title: string
  children: ReactNode
}) {
  return (
    <div className='bg-muted/35 flex gap-3 rounded-xl border p-3'>
      <Icon
        className='text-primary mt-0.5 size-4 shrink-0'
        aria-hidden='true'
      />
      <div>
        <p className='text-sm font-medium'>{title}</p>
        <div className='text-muted-foreground mt-1 text-xs leading-relaxed'>
          {children}
        </div>
      </div>
    </div>
  )
}

export function Tutorials() {
  const { t } = useTranslation()
  const isAdmin = useIsAdmin()
  const origin = useMemo(() => getSiteOrigin(PUBLIC_SITE_ORIGIN), [])
  const baseUrl = useMemo(() => getApiBaseUrl(origin), [origin])
  const curlExample = useMemo(() => buildResponsesCurl(baseUrl), [baseUrl])
  const codexConfig = useMemo(() => buildCodexConfig(baseUrl), [baseUrl])
  const unixInstaller = useMemo(
    () => buildUnixInstallerCommand(origin, baseUrl),
    [baseUrl, origin]
  )
  const windowsInstaller = useMemo(
    () => buildWindowsInstallerCommand(origin, baseUrl),
    [baseUrl, origin]
  )

  const userSteps: GuideStepProps[] = [
    {
      index: 1,
      title: t('Install Codex CLI'),
      description: t(
        'Use the installation guide above and confirm that codex --version works.'
      ),
      icon: TerminalSquare,
    },
    {
      index: 2,
      title: t('Create your personal API key'),
      description: t(
        'Open API Keys, create a key for your own account, and keep it private.'
      ),
      icon: KeyRound,
    },
    {
      index: 3,
      title: t('Run the command for your system'),
      description: t(
        'Use the copy button below. If you paste through remote desktop, verify that the URL remains plain text and was not converted into a Markdown link.'
      ),
      icon: TerminalSquare,
    },
    {
      index: 4,
      title: t('Choose CLI-only mode'),
      description: t(
        'Choose option 1 to keep Codex App, Cloud and Remote Control on the official login.'
      ),
      icon: ShieldCheck,
    },
    {
      index: 5,
      title: t('Reopen the terminal and run Codex'),
      description: t(
        'After setup finishes, open a new terminal window and enter codex.'
      ),
      icon: Laptop,
    },
  ]

  const adminSteps: GuideStepProps[] = [
    {
      index: 1,
      title: t('Create an API key'),
      description: t(
        'Create a personal key in API Keys. It should start with sk-.'
      ),
      icon: KeyRound,
    },
    {
      index: 2,
      title: t('Choose a model'),
      description: t('Use a model ID available to your account and group.'),
      icon: BookOpen,
    },
    {
      index: 3,
      title: t('Configure your client'),
      description: t(
        'Set the API base URL and use your New API key for authentication.'
      ),
      icon: Network,
    },
    {
      index: 4,
      title: t('Send a streaming test'),
      description: t(
        'For Responses requests, enable streaming when the selected channel requires it.'
      ),
      icon: TerminalSquare,
    },
  ]

  return (
    <SectionPageLayout>
      <SectionPageLayout.Title>{t('Tutorials')}</SectionPageLayout.Title>
      <SectionPageLayout.Actions>
        <Button size='sm' render={<Link to='/keys' />}>
          <KeyRound data-icon='inline-start' />
          {t('Open API Keys')}
        </Button>
      </SectionPageLayout.Actions>
      <SectionPageLayout.Content>
        <Tabs defaultValue='user' className='mx-auto w-full max-w-6xl'>
          <TabsList className='mb-4 w-full justify-start'>
            <TabsTrigger value='user'>
              <UserRound data-icon='inline-start' />
              {t('User guide')}
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value='admin'>
                <Settings data-icon='inline-start' />
                {t('Administrator guide')}
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value='user'>
            <div className='flex flex-col gap-4 pb-6'>
              <Card className='border-primary/20 from-primary/10 via-card to-card relative overflow-hidden bg-linear-to-br'>
                <CardHeader>
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm'>
                      <UserRound className='size-5' aria-hidden='true' />
                    </div>
                    <div>
                      <CardTitle className='text-lg sm:text-xl'>
                        {t('Start using Codex with one command')}
                      </CardTitle>
                      <CardDescription className='mt-1 max-w-3xl leading-relaxed'>
                        {t(
                          'This guide is for regular users. You only need your personal API key and the command for your operating system.'
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <CodexInstallationGuide />

              <Card>
                <CardHeader>
                  <CardTitle>{t('User quick start')}</CardTitle>
                  <CardDescription>
                    {t(
                      'The installer opens an interactive menu and does not change your configuration until you choose a mode.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className='grid gap-3 md:grid-cols-2'>
                  {userSteps.map((step) => (
                    <GuideStep key={step.index} {...step} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t('One-click setup')}</CardTitle>
                  <CardDescription>
                    {t(
                      'Run only the command that matches your operating system.'
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className='space-y-3'>
                  <Tabs defaultValue='unix'>
                    <TabsList className='grid w-full grid-cols-2 group-data-horizontal/tabs:h-auto'>
                      <TabsTrigger value='unix'>
                        {t('macOS / Linux')}
                      </TabsTrigger>
                      <TabsTrigger value='windows'>{t('Windows')}</TabsTrigger>
                    </TabsList>
                    <TabsContent value='unix' className='mt-3'>
                      <CodeExample
                        title={t('macOS / Linux')}
                        value={unixInstaller}
                      />
                    </TabsContent>
                    <TabsContent value='windows' className='mt-3'>
                      <CodeExample
                        title={t('Windows PowerShell')}
                        value={windowsInstaller}
                      />
                    </TabsContent>
                  </Tabs>
                  <Notice icon={ShieldCheck} title={t('What happens next')}>
                    {t(
                      'The script asks which mode to use and then requests your New API key. Key input is hidden. Option 1 is recommended. Option 2 changes the shared default configuration and disables Codex App, Cloud and Remote Control until you restore the official default.'
                    )}
                  </Notice>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {isAdmin && (
            <TabsContent value='admin'>
              <div className='flex flex-col gap-4 pb-6'>
                <Card className='border-primary/20 from-primary/10 via-card to-card relative overflow-hidden bg-linear-to-br'>
                  <CardHeader>
                    <div className='flex items-start gap-3'>
                      <div className='bg-primary text-primary-foreground flex size-10 shrink-0 items-center justify-center rounded-xl shadow-sm'>
                        <BookOpen className='size-5' aria-hidden='true' />
                      </div>
                      <div>
                        <CardTitle className='text-lg sm:text-xl'>
                          {t('Connect your client in minutes')}
                        </CardTitle>
                        <CardDescription className='mt-1 max-w-3xl leading-relaxed'>
                          {t(
                            'Follow the quick start, then copy the configuration for your client and operating system.'
                          )}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className='bg-background/80 flex flex-col gap-2 rounded-xl border p-3 sm:flex-row sm:items-center sm:justify-between'>
                      <div className='min-w-0'>
                        <p className='text-muted-foreground text-xs font-medium uppercase'>
                          {t('Your API base URL')}
                        </p>
                        <code className='mt-1 block truncate text-sm font-semibold'>
                          {baseUrl}
                        </code>
                      </div>
                      <CopyButton
                        value={baseUrl}
                        variant='outline'
                        size='sm'
                        className='w-full sm:w-auto'
                        tooltip={t('Copy base URL')}
                        aria-label={t('Copy base URL')}
                      >
                        {t('Copy base URL')}
                      </CopyButton>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('Quick start')}</CardTitle>
                    <CardDescription>
                      {t(
                        'Complete these four steps before connecting a production client.'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className='grid gap-3 md:grid-cols-2'>
                    {adminSteps.map((step) => (
                      <GuideStep key={step.index} {...step} />
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>{t('Client configuration')}</CardTitle>
                    <CardDescription>
                      {t(
                        'Choose the guide that matches the client you want to connect.'
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue='api'>
                      <TabsList className='w-full justify-start overflow-x-auto'>
                        <TabsTrigger value='api'>
                          <Network data-icon='inline-start' />
                          {t('OpenAI-compatible API')}
                        </TabsTrigger>
                        <TabsTrigger value='codex'>
                          <Laptop data-icon='inline-start' />
                          {t('Codex CLI')}
                        </TabsTrigger>
                        <TabsTrigger value='troubleshooting'>
                          <CircleAlert data-icon='inline-start' />
                          {t('Troubleshooting')}
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value='api' className='mt-4 space-y-3'>
                        <Notice
                          icon={ShieldCheck}
                          title={t('Use a New API key')}
                        >
                          {t(
                            'Replace the placeholders with a key created on this site and a model ID available to your account. Do not paste an upstream provider key here.'
                          )}
                        </Notice>
                        <CodeExample
                          title={t('Responses API request')}
                          value={curlExample}
                        />
                      </TabsContent>

                      <TabsContent value='codex' className='mt-4 space-y-3'>
                        <Notice
                          icon={ShieldCheck}
                          title={t('Keep the official desktop login')}
                        >
                          {t(
                            'Use a dedicated CLI profile and leave auth.json unchanged. Codex Desktop can continue using the official account login.'
                          )}
                        </Notice>
                        <CodeExample
                          title='~/.codex/config.toml'
                          value={codexConfig}
                        />
                        <div className='grid gap-3 md:grid-cols-2'>
                          <CodeExample
                            title={t('macOS / Linux')}
                            value={
                              'export NEWAPI_API_KEY="sk-YOUR_NEW_API_KEY"\ncodex --profile newapi'
                            }
                          />
                          <CodeExample
                            title={t('Windows PowerShell')}
                            value={
                              '$env:NEWAPI_API_KEY="sk-YOUR_NEW_API_KEY"\ncodex --profile newapi'
                            }
                          />
                        </div>
                        <p className='text-muted-foreground text-xs leading-relaxed'>
                          {t(
                            'Replace YOUR_MODEL_ID with an enabled model shown on the Models page. The provider name newapi is a local identifier defined by the configuration block above.'
                          )}
                        </p>
                      </TabsContent>

                      <TabsContent
                        value='troubleshooting'
                        className='mt-4 grid gap-3 md:grid-cols-3'
                      >
                        <Notice
                          icon={CircleAlert}
                          title='503 No available channel'
                        >
                          {t(
                            'The selected model has no available channel in your group. Choose another model or contact the administrator.'
                          )}
                        </Notice>
                        <Notice
                          icon={CircleAlert}
                          title='400 Stream must be set to true'
                        >
                          {t(
                            'Enable streaming in the client or send stream: true in the Responses request.'
                          )}
                        </Notice>
                        <Notice icon={CircleAlert} title='401 Unauthorized'>
                          {t(
                            'Confirm that the key was generated on this site, is enabled, and was copied without extra spaces.'
                          )}
                        </Notice>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </SectionPageLayout.Content>
    </SectionPageLayout>
  )
}

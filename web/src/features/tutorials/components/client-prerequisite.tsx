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
import { ExternalLink, type LucideIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'

type ClientPrerequisiteProps = {
  title: string
  status: string
  description: string
  href: string
  linkLabel: string
  icon: LucideIcon
  command?: string
}

export function ClientPrerequisite(props: ClientPrerequisiteProps) {
  const Icon = props.icon

  return (
    <div className='bg-background/70 flex h-full flex-col gap-3 rounded-xl border p-4 shadow-xs'>
      <div className='flex items-start gap-3'>
        <div className='bg-primary/10 text-primary flex size-9 shrink-0 items-center justify-center rounded-lg'>
          <Icon className='size-4' aria-hidden='true' />
        </div>
        <div className='min-w-0 flex-1'>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='text-sm font-semibold'>{props.title}</p>
            <span className='bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[11px] font-medium'>
              {props.status}
            </span>
          </div>
          <p className='text-muted-foreground mt-1 text-xs leading-relaxed'>
            {props.description}
          </p>
        </div>
      </div>

      {props.command && (
        <code className='bg-muted/50 rounded-lg border px-3 py-2 text-xs'>
          {props.command}
        </code>
      )}

      <Button
        variant='outline'
        size='sm'
        className='mt-auto w-full sm:w-fit'
        render={
          <a href={props.href} target='_blank' rel='noopener noreferrer' />
        }
      >
        <ExternalLink data-icon='inline-start' />
        {props.linkLabel}
      </Button>
    </div>
  )
}

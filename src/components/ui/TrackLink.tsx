'use client'

import Link from 'next/link'
import { track } from '@/lib/analytics'
import type { ComponentProps } from 'react'

type Props = ComponentProps<typeof Link> & {
  event: string
  props?: Record<string, string | number | boolean>
}

export function TrackLink({ event, props: eventProps, onClick, ...rest }: Props) {
  return (
    <Link
      {...rest}
      onClick={(e) => {
        track(event, eventProps)
        if (typeof onClick === 'function') onClick(e)
      }}
    />
  )
}

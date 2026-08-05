'use client'

import Link, { type LinkProps } from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { AnchorHTMLAttributes, MouseEvent } from 'react'

import { useProgress } from '@/hooks/use-progress'

type Props = LinkProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, keyof LinkProps> & {
    loadingMessage?: string
  }

export function TransitionLink({
  href,
  onClick,
  loadingMessage,
  ...props
}: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { beginNavigation } = useProgress()
  const currentSearch = searchParams.toString()
  const currentHref = `${pathname}${currentSearch ? `?${currentSearch}` : ''}`

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event)
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      props.download ||
      props.target === '_blank'
    )
      return

    const rawHref = typeof href === 'string' ? href : (href.pathname ?? '')
    if (!rawHref || /^(https?:|mailto:|tel:|\/\/)/i.test(rawHref)) return
    const target = new URL(rawHref, window.location.href)
    if (target.origin !== window.location.origin) return
    if (
      target.pathname === pathname &&
      target.search === (currentSearch ? `?${currentSearch}` : '') &&
      target.hash
    )
      return
    if (`${target.pathname}${target.search}` === currentHref) return
    beginNavigation(loadingMessage)
  }

  return <Link href={href} onClick={handleClick} {...props} />
}

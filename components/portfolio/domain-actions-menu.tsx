'use client'

import { TransitionLink } from '@/components/ui/transition-link'
import type { PortfolioAction } from '@/lib/portfolio/admin.types'

const label: Readonly<Record<PortfolioAction, string>> = Object.freeze({
  VIEW_DOMAIN: 'View Domain',
  PREPARE_FOR_SALE: 'Prepare for Sale',
  CONTINUE_PREPARATION: 'Continue Preparation',
  MANAGE_LISTING: 'Manage Listing',
  PREVIEW_LISTING: 'Preview Listing',
  VIEW_PUBLIC_PAGE: 'View Public Page',
  ADD_LOGO: 'Add Logo',
  GENERATE_LOGO: 'Generate Logo',
  DELETE_DOMAIN: 'Delete Domain',
})

export function DomainActionsMenu({
  hostname,
  actions,
  publicReference,
  disabled,
  onDelete,
}: Readonly<{
  hostname: string
  actions: readonly PortfolioAction[]
  publicReference?: string | null
  disabled?: boolean
  onDelete?: () => void
}>) {
  const linkFor = (action: PortfolioAction) => {
    if (action === 'VIEW_DOMAIN') return `/admin/domains/${hostname}`
    if (action === 'PREVIEW_LISTING')
      return `/admin/marketplace/domains/${hostname}/preview`
    if (action === 'VIEW_PUBLIC_PAGE') return publicReference
    if (
      action === 'PREPARE_FOR_SALE' ||
      action === 'CONTINUE_PREPARATION' ||
      action === 'MANAGE_LISTING'
    )
      return `/admin/marketplace/domains/${hostname}`
    if (action === 'ADD_LOGO' || action === 'GENERATE_LOGO')
      return `/admin/domains/${hostname}#branding`
    return null
  }

  return (
    <details className="relative">
      <summary
        aria-label={`Actions for ${hostname}`}
        className="list-none cursor-pointer rounded-md border px-3 py-1.5 text-lg leading-none hover:bg-gray-50 dark:hover:bg-gray-800"
      >
        <span aria-hidden="true">&#8942;</span>
      </summary>
      <div className="absolute right-0 z-20 mt-2 min-w-48 rounded-lg border bg-white p-1 shadow-xl dark:bg-gray-900">
        {actions.map((action) => {
          const href = linkFor(action)
          if (action === 'DELETE_DOMAIN')
            return onDelete ? (
              <button
                key={action}
                type="button"
                disabled={disabled}
                onClick={onDelete}
                className="block w-full rounded px-3 py-2 text-left text-sm text-red-700 hover:bg-red-50 disabled:opacity-50"
              >
                {label[action]}
              </button>
            ) : null
          return href ? (
            <TransitionLink
              key={action}
              href={href}
              target={action === 'VIEW_PUBLIC_PAGE' ? '_blank' : undefined}
              rel={action === 'VIEW_PUBLIC_PAGE' ? 'noopener noreferrer' : undefined}
              className="block rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {label[action]}
            </TransitionLink>
          ) : null
        })}
      </div>
    </details>
  )
}

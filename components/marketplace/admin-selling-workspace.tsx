import { TransitionLink } from '@/components/ui/transition-link'
import type { AdminMarketplaceDomainSummary } from '@/lib/marketplace/admin.types'

export function AdminSellingWorkspace({
  domains,
}: Readonly<{ domains: readonly AdminMarketplaceDomainSummary[] }>) {
  if (domains.length === 0)
    return (
      <div className="rounded-xl border border-dashed p-10 text-center">
        <h2 className="font-semibold">No domains are being prepared for sale</h2>
        <p className="mt-2 text-sm text-gray-500">
          Choose Prepare for Sale from Portfolio to begin a selling workflow.
        </p>
        <TransitionLink
          href="/admin/domains"
          className="mt-5 inline-flex rounded-md border px-4 py-2 text-sm font-medium"
        >
          Open Portfolio
        </TransitionLink>
      </div>
    )

  return (
    <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
      {domains.map((domain) => (
        <div
          key={domain.ownedDomainId}
          className="flex flex-wrap items-center justify-between gap-4 border-b p-5 last:border-0"
        >
          <div>
            <p className="font-semibold">{domain.hostname}</p>
            <p className="mt-1 text-xs text-gray-500">
              {domain.preparationReadiness} / {domain.publicationState}
            </p>
          </div>
          <TransitionLink
            href={`/admin/marketplace/domains/${domain.hostname}`}
            className="rounded-md border px-4 py-2 text-sm font-medium"
          >
            {domain.publicationState !== 'NOT_PUBLISHED'
              ? 'Manage Listing'
              : 'Continue Preparation'}
          </TransitionLink>
        </div>
      ))}
    </div>
  )
}

import type { MarketplaceCatalogItem } from '@/lib/marketplace/catalog.types'

export function MarketplaceCard({
  item,
}: Readonly<{ item: MarketplaceCatalogItem }>) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4 border-b border-gray-100 p-6 dark:border-gray-800">
        {item.logo.state === 'AVAILABLE' && item.logo.reference ? (
          // Canonical listing references are explicit upstream facts.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.logo.reference}
            alt={`${item.displayName} logo`}
            className="h-14 w-14 rounded-xl object-contain"
          />
        ) : (
          <div
            aria-label="Logo placeholder"
            className="flex h-14 w-14 items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-lg font-bold text-gray-400 dark:border-gray-700 dark:bg-gray-950"
          >
            {item.displayName.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-700 dark:text-amber-400">
            Premium domain
          </p>
          <h2 className="mt-1 break-all text-xl font-semibold tracking-tight">
            {item.displayName}
          </h2>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-6">
        <p className="flex-1 text-sm leading-6 text-gray-600 dark:text-gray-400">
          {item.description}
        </p>
        <div className="mt-6 border-t border-gray-100 pt-5 dark:border-gray-800">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-gray-500">
            Asking price
          </p>
          <p className="mt-1 text-2xl font-bold">
            {item.currency} {item.askingPrice.toLocaleString('en-US')}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {item.landingPageReference && (
            <a
              href={item.landingPageReference}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-gray-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              View domain
            </a>
          )}
          <a
            href={item.externalSalesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-gray-300 px-5 py-2.5 text-sm font-semibold transition hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            {item.externalSalesCtaLabel}
          </a>
        </div>
      </div>
    </article>
  )
}


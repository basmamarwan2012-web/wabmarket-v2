import type { MarketplaceCatalog as MarketplaceCatalogModel } from '@/lib/marketplace/catalog.types'
import { MarketplaceCard } from './marketplace-card'

export function MarketplaceCatalog({
  catalog,
}: Readonly<{ catalog: MarketplaceCatalogModel }>) {
  if (catalog.items.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-20 text-center dark:border-gray-700 dark:bg-gray-900">
        <h2 className="text-xl font-semibold">No domains are listed yet</h2>
        <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-gray-500">
          Eligible prepared domains will appear here when publication data is
          available.
        </p>
      </section>
    )
  }

  return (
    <section
      aria-label="Available premium domains"
      className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
    >
      {catalog.items.map((item) => (
        <MarketplaceCard key={item.listingId} item={item} />
      ))}
    </section>
  )
}


import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketplaceCatalog } from '@/components/marketplace/marketplace-catalog'
import { listPublishedMarketplaceFromMySql } from '@/infrastructure/mysql/marketplace-read.composition'
import type { MarketplaceCatalog as MarketplaceCatalogModel } from '@/lib/marketplace/catalog.types'

export const metadata: Metadata = {
  title: 'Premium Domain Marketplace | Wabmarket',
  description:
    'Explore prepared premium domains available through external sales providers.',
}

export default async function MarketplacePage() {
  const page = await listPublishedMarketplaceFromMySql()
  const catalog: MarketplaceCatalogModel = Object.freeze({
    items: Object.freeze(
      page.items.map((record) =>
        Object.freeze({
          listingId: record.listingId,
          hostname: record.hostname,
          displayName: record.displayName,
          askingPrice: record.askingPrice,
          currency: record.currency,
          description: record.description,
          logo: Object.freeze({
            state: record.logo.state,
            reference: record.logo.reference,
          }),
          landingPageReference: record.landingPageReference,
          externalSalesUrl: record.externalSalesUrl,
          externalSalesCtaLabel: record.externalSalesCtaLabel,
        })
      )
    ),
    total: page.items.length,
  })

  return (
    <main className="min-h-screen bg-gray-50 text-gray-950 dark:bg-gray-950 dark:text-white">
      <header className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="text-xl font-bold">
            Wabmarket
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium dark:border-gray-700"
          >
            Seller login
          </Link>
        </div>
      </header>

      <section className="border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-16 sm:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700 dark:text-amber-400">
            Premium domain marketplace
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl">
            Find a memorable domain for what comes next.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-gray-600 dark:text-gray-400">
            Browse prepared domain products and complete any transaction directly
            with the listed external sales provider.
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12">
        <MarketplaceCatalog catalog={catalog} />
      </div>
    </main>
  )
}

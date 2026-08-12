import type { Metadata } from 'next'
import Link from 'next/link'

import { MarketplaceCatalog } from '@/components/marketplace/marketplace-catalog'
import { generatePreparationAssetsAndContent } from '@/lib/domain-preparation/generation'
import { createLandingPageRenderModel } from '@/lib/domain-preparation/landing-page'
import { createDomainPreparation } from '@/lib/domain-preparation/preparation'
import { createMarketplaceCatalog } from '@/lib/marketplace/catalog'
import { createMarketplaceListing } from '@/lib/marketplace/listing'
import type { MarketplaceListing } from '@/lib/marketplace/listing.types'

export const metadata: Metadata = {
  title: 'Premium Domain Marketplace | Wabmarket',
  description:
    'Explore prepared premium domains available through external sales providers.',
}

interface MarketplaceFixture {
  readonly hostname: string
  readonly category: string
  readonly city: string
  readonly askingPrice: number
}

const MARKETPLACE_FIXTURES: readonly MarketplaceFixture[] = Object.freeze([
  Object.freeze({
    hostname: 'atlasroofing.example',
    category: 'roofing',
    city: 'Miami',
    askingPrice: 2_495,
  }),
  Object.freeze({
    hostname: 'brightplumbing.example',
    category: 'plumbing',
    city: 'Austin',
    askingPrice: 1_995,
  }),
])

const createFixtureListing = (
  fixture: MarketplaceFixture
): MarketplaceListing => {
  const fixtureKey = fixture.hostname.replace('.', '-')
  const externalSalesUrl = `https://sales.example/domains/${fixtureKey}`
  const landingPageReference = `https://landing.example/domains/${fixtureKey}`
  const logoReference = `https://assets.example/${fixtureKey}/logo.svg`
  const faviconReference = `https://assets.example/${fixtureKey}/favicon.ico`
  const openGraphReference = `https://assets.example/${fixtureKey}/open-graph.png`
  const generation = generatePreparationAssetsAndContent({
    hostname: fixture.hostname,
    ownershipConfirmed: true,
    category: fixture.category,
    city: fixture.city,
    askingPrice: fixture.askingPrice,
    currency: 'USD',
    externalSalesUrl,
    logo: { source: 'MANUAL', reference: logoReference },
    favicon: { source: 'MANUAL', reference: faviconReference },
    openGraphImage: { source: 'MANUAL', reference: openGraphReference },
  })
  if (!generation) throw new Error('Marketplace generation fixture is invalid.')

  const preparation = createDomainPreparation({
    hostname: fixture.hostname,
    ownershipConfirmed: true,
    preparation: {
      logo: { present: true, reference: logoReference },
      favicon: { present: true, reference: faviconReference },
      description: {
        present: true,
        contentOrReference: generation.description.value,
      },
      landingPage: { present: true, reference: landingPageReference },
      sales: {
        askingPrice: fixture.askingPrice,
        currency: 'USD',
        externalSalesUrl,
        ctaConfigured: true,
      },
    },
  })
  if (!preparation) throw new Error('Marketplace preparation fixture is invalid.')

  const landingPage = createLandingPageRenderModel(generation)
  const listing = createMarketplaceListing({
    preparation,
    generation,
    landingPage,
    landingPageReference,
  })
  if (!listing) throw new Error('Marketplace listing fixture is invalid.')
  return listing
}

const createFixtureCatalog = () =>
  createMarketplaceCatalog(MARKETPLACE_FIXTURES.map(createFixtureListing))

export default function MarketplacePage() {
  const catalog = createFixtureCatalog()

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


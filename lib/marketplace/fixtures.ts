import { generatePreparationAssetsAndContent } from '../domain-preparation/generation'
import { createLandingPageRenderModel } from '../domain-preparation/landing-page'
import { createDomainPreparation } from '../domain-preparation/preparation'
import { createMarketplaceListing } from './listing'
import type { MarketplacePublicLandingRecord } from './public-landing.types'

interface MarketplaceFixtureDefinition {
  readonly hostname: string
  readonly category: string
  readonly city: string
  readonly askingPrice: number
}

const MARKETPLACE_FIXTURE_ALLOWLIST = Object.freeze([
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
] as const satisfies readonly MarketplaceFixtureDefinition[])

const createMarketplaceFixtureRecord = (
  fixture: MarketplaceFixtureDefinition
): MarketplacePublicLandingRecord => {
  const fixtureKey = fixture.hostname.replace('.', '-')
  const externalSalesUrl = `https://sales.example/domains/${fixtureKey}`
  const landingPageReference = `/marketplace/domains/${fixture.hostname}`
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

  return Object.freeze({
    hostname: fixture.hostname,
    listing,
    landingPage,
  })
}

const MARKETPLACE_FIXTURE_RECORDS = Object.freeze(
  MARKETPLACE_FIXTURE_ALLOWLIST.map(createMarketplaceFixtureRecord)
)

export const getMarketplaceFixtureRecords = () => MARKETPLACE_FIXTURE_RECORDS


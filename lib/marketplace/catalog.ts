import type { MarketplaceListing } from './listing.types'
import type {
  MarketplaceCatalog,
  MarketplaceCatalogAsset,
  MarketplaceCatalogItem,
} from './catalog.types'

const freezeCatalogAsset = (
  asset: MarketplaceListing['logo']
): MarketplaceCatalogAsset =>
  Object.freeze({ state: asset.state, reference: asset.reference })

const projectMarketplaceCatalogItem = (
  listing: MarketplaceListing
): MarketplaceCatalogItem =>
  Object.freeze({
    listingId: listing.listingId,
    hostname: listing.hostname,
    displayName: listing.displayName,
    askingPrice: listing.askingPrice,
    currency: listing.currency,
    description: listing.description,
    logo: freezeCatalogAsset(listing.logo),
    landingPageReference: listing.landingPageReference,
    externalSalesUrl: listing.externalSalesUrl,
    externalSalesCtaLabel: listing.externalSalesCtaLabel,
  })

export const createMarketplaceCatalog = (
  listings: readonly MarketplaceListing[]
): MarketplaceCatalog => {
  const items = listings
    .filter((listing) => listing.publication.state === 'ELIGIBLE')
    .map(projectMarketplaceCatalogItem)
    .sort(
      (left, right) =>
        left.hostname.localeCompare(right.hostname) ||
        left.listingId.localeCompare(right.listingId)
    )

  return Object.freeze({
    items: Object.freeze(items),
    total: items.length,
  })
}

export type {
  MarketplaceCatalog,
  MarketplaceCatalogAsset,
  MarketplaceCatalogItem,
} from './catalog.types'


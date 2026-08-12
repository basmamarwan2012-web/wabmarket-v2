import { randomUUID } from 'node:crypto'

import type { MarketplaceListing } from '@/lib/marketplace/listing.types'
import type { PublicListingSnapshot } from '../schema/marketplace-listings'

export const createPersistenceId = () => randomUUID()
export const toIso = (value: Date) => value.toISOString()

export const freezeDeep = <T>(value: T): T => {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.freeze(value)
    for (const nested of Object.values(value)) freezeDeep(nested)
  }
  return value
}

export const createPublicListingSnapshot = (
  listing: MarketplaceListing
): PublicListingSnapshot =>
  freezeDeep({
    listingId: listing.listingId,
    hostname: listing.hostname,
    displayName: listing.displayName,
    askingPrice: listing.askingPrice,
    currency: listing.currency,
    description: listing.description,
    logo: { ...listing.logo },
    favicon: { ...listing.favicon },
    openGraphImage: { ...listing.openGraphImage },
    landingPageReference: listing.landingPageReference,
    externalSalesUrl: listing.externalSalesUrl,
    externalSalesCtaLabel: listing.externalSalesCtaLabel,
  })

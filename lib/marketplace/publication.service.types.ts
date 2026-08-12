import type { MarketplacePublicationState } from './publication.repository'

export interface PublishMarketplaceListingCommand {
  readonly ownedDomainId: string
  readonly expectedPublicationVersion: number | null
}

export interface UnpublishMarketplaceListingCommand {
  readonly listingId: string
  readonly expectedPublicationVersion: number
}

export interface MarketplacePublicationApplicationResult {
  readonly ownedDomainId: string
  readonly hostname: string
  readonly listingId: string
  readonly publicationState: MarketplacePublicationState
  readonly publicationVersion: number
}

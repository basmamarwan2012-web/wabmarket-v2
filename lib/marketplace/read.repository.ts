import type { LandingPageRenderModel } from '@/lib/domain-preparation/landing-page.types'
import type { MarketplaceListingAsset } from './listing.types'

export interface MarketplacePublicRecord {
  readonly listingId: string
  readonly hostname: string
  readonly displayName: string
  readonly askingPrice: number
  readonly currency: string
  readonly description: string
  readonly logo: MarketplaceListingAsset
  readonly favicon: MarketplaceListingAsset
  readonly openGraphImage: MarketplaceListingAsset
  readonly landingPageReference: string
  readonly externalSalesUrl: string
  readonly externalSalesCtaLabel: string
  readonly landingPage: LandingPageRenderModel
}

export interface MarketplaceReadCursor {
  readonly hostname: string
  readonly listingId: string
}

export interface MarketplaceReadPage {
  readonly items: readonly MarketplacePublicRecord[]
  readonly nextCursor: MarketplaceReadCursor | null
}

export interface MarketplaceReadRepository {
  listPublished(input?: Readonly<{
    limit?: number
    after?: MarketplaceReadCursor | null
  }>): Promise<MarketplaceReadPage>
  findPublishedByHostname(
    normalizedHostname: string
  ): Promise<MarketplacePublicRecord | null>
}

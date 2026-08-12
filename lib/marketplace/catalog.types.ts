import type { LandingPageAssetRenderState } from '../domain-preparation/landing-page.types'

export interface MarketplaceCatalogAsset {
  readonly state: LandingPageAssetRenderState
  readonly reference: string | null
}

export interface MarketplaceCatalogItem {
  readonly listingId: string
  readonly hostname: string
  readonly displayName: string
  readonly askingPrice: number
  readonly currency: string
  readonly description: string
  readonly logo: MarketplaceCatalogAsset
  readonly landingPageReference: string | null
  readonly externalSalesUrl: string
  readonly externalSalesCtaLabel: string
}

export interface MarketplaceCatalog {
  readonly items: readonly MarketplaceCatalogItem[]
  readonly total: number
}


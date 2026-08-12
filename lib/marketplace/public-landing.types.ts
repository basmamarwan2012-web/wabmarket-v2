import type { LandingPageRenderModel } from '../domain-preparation/landing-page.types'
import type { MarketplaceListing } from './listing.types'

export interface MarketplacePublicLandingRecord {
  readonly hostname: string
  readonly listing: MarketplaceListing
  readonly landingPage: LandingPageRenderModel
}


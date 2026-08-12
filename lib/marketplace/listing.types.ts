import type { DomainPreparation } from '../domain-preparation/preparation.types'
import type { PreparationGenerationResult } from '../domain-preparation/generation.types'
import type {
  LandingPageAssetRenderState,
  LandingPageRenderModel,
} from '../domain-preparation/landing-page.types'

export const MARKETPLACE_PUBLICATION_ELIGIBILITY_STATES = Object.freeze([
  'NOT_ELIGIBLE',
  'ELIGIBLE_WITH_PLACEHOLDERS',
  'ELIGIBLE',
] as const)

export type MarketplacePublicationEligibility =
  (typeof MARKETPLACE_PUBLICATION_ELIGIBILITY_STATES)[number]

export const MARKETPLACE_PUBLICATION_REASONS = Object.freeze([
  'OWNERSHIP_NOT_CONFIRMED',
  'PREPARATION_NOT_MARKETPLACE_READY',
  'UPSTREAM_FACT_MISMATCH',
  'LANDING_PAGE_NOT_RENDERABLE',
  'LANDING_PAGE_REFERENCE_INVALID',
  'LANDING_PAGE_REFERENCE_MISSING',
  'VISUAL_ASSETS_INCOMPLETE',
  'PUBLICATION_REQUIREMENTS_SATISFIED',
] as const)

export type MarketplacePublicationReason =
  (typeof MARKETPLACE_PUBLICATION_REASONS)[number]

export interface MarketplaceListingAsset {
  readonly state: LandingPageAssetRenderState
  readonly reference: string | null
}

export interface MarketplacePublicationResult {
  readonly state: MarketplacePublicationEligibility
  readonly reasons: readonly MarketplacePublicationReason[]
}

export interface MarketplaceListing {
  readonly listingId: string
  readonly hostname: string
  readonly displayName: string
  readonly askingPrice: number
  readonly currency: string
  readonly description: string
  readonly logo: MarketplaceListingAsset
  readonly favicon: MarketplaceListingAsset
  readonly openGraphImage: MarketplaceListingAsset
  readonly landingPageReference: string | null
  readonly externalSalesUrl: string
  readonly externalSalesCtaLabel: string
  readonly publication: MarketplacePublicationResult
  /** Internal provenance only; never part of public display or listing identity. */
  readonly sourcePreparationOpportunityId: string | null
}

export interface MarketplaceListingInput {
  readonly preparation: DomainPreparation
  readonly generation: PreparationGenerationResult
  readonly landingPage: LandingPageRenderModel
  /** Explicit upstream deployment reference; no URL is ever fabricated. */
  readonly landingPageReference?: string | null
}


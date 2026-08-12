import type { CandidateSelectionTier } from '../candidate-domains/quality.types'
import type { DomainAvailabilityStatus } from '../domain-availability/types'

export const ACQUISITION_RECOMMENDATIONS = Object.freeze([
  'RECOMMEND',
  'REVIEW',
  'SKIP',
] as const)

export type AcquisitionRecommendation =
  (typeof ACQUISITION_RECOMMENDATIONS)[number]

export const DOMAIN_ACQUISITION_TYPES = Object.freeze([
  'STANDARD_REGISTRATION',
  'BUY_NOW',
  'MARKETPLACE',
  'PREMIUM',
  'AUCTION',
  'CLOSEOUT',
  'BACKORDER',
  'LIQUIDATION',
] as const)

export type DomainAcquisitionType =
  (typeof DOMAIN_ACQUISITION_TYPES)[number]

export const ACQUISITION_RECOMMENDATION_REASONS = Object.freeze([
  'QUALITY_PREFERRED',
  'QUALITY_ACCEPTABLE',
  'QUALITY_WEAK',
  'QUALITY_REJECTED',
  'CONTRADICTORY_FACTS',
  'AVAILABLE_STANDARD',
  'REGISTERED_NO_OFFER',
  'AVAILABILITY_UNKNOWN',
  'FIXED_PRICE_ACQUISITION',
  'ACQUISITION_PATH_MISSING',
  'AUCTION_REQUIRES_REVIEW',
  'BACKORDER_REQUIRES_REVIEW',
  'PRICE_WITHIN_LIMIT',
  'PRICE_ABOVE_LIMIT',
  'PRICE_UNKNOWN',
  'CURRENCY_UNKNOWN',
  'CURRENCY_MISMATCH_REQUIRES_REVIEW',
  'SOURCE_URL_AVAILABLE',
  'SOURCE_URL_MISSING',
  'SOURCE_URL_INVALID',
] as const)

export type AcquisitionRecommendationReason =
  (typeof ACQUISITION_RECOMMENDATION_REASONS)[number]

export interface AcquisitionRecommendationInput {
  readonly hostname: string
  readonly selectionTier: CandidateSelectionTier
  readonly availabilityStatus: DomainAvailabilityStatus
  readonly acquisitionType: DomainAcquisitionType | null
  readonly observedPrice: number | null
  readonly currency: string | null
  readonly maximumAllowedPrice: number
  readonly maximumAllowedCurrency: string
  readonly provider: string
  /** Must be copied from explicit provider evidence; it is never inferred. */
  readonly sourceUrl: string | null
}

export interface ExternalProviderHandoff {
  readonly action: 'OPEN_PROVIDER' | 'NONE'
  readonly provider: string | null
  readonly sourceUrl: string | null
}

export interface AcquisitionRecommendationResult {
  readonly hostname: string
  readonly recommendation: AcquisitionRecommendation
  readonly reasons: readonly AcquisitionRecommendationReason[]
  readonly handoff: ExternalProviderHandoff
}


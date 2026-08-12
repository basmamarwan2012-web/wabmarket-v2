import type { CandidateSelectionTier } from '../candidate-domains/quality.types'
import type {
  AcquisitionRecommendationReason,
  DomainAcquisitionType,
} from './recommendation.types'

export const RECOMMENDATION_ELIGIBLE_TIERS: readonly CandidateSelectionTier[] =
  Object.freeze(['PREFERRED', 'ACCEPTABLE'])

export const FIXED_PRICE_ACQUISITION_TYPES: readonly DomainAcquisitionType[] =
  Object.freeze([
    'STANDARD_REGISTRATION',
    'BUY_NOW',
    'MARKETPLACE',
    'PREMIUM',
    'CLOSEOUT',
    'LIQUIDATION',
  ])

export const MANUAL_REVIEW_ACQUISITION_TYPES: readonly DomainAcquisitionType[] =
  Object.freeze(['AUCTION', 'BACKORDER'])

export const ACQUISITION_REASON_ORDER: Readonly<
  Record<AcquisitionRecommendationReason, number>
> = Object.freeze({
  QUALITY_PREFERRED: 0,
  QUALITY_ACCEPTABLE: 1,
  QUALITY_WEAK: 2,
  QUALITY_REJECTED: 3,
  CONTRADICTORY_FACTS: 4,
  AVAILABLE_STANDARD: 5,
  REGISTERED_NO_OFFER: 6,
  AVAILABILITY_UNKNOWN: 7,
  FIXED_PRICE_ACQUISITION: 8,
  ACQUISITION_PATH_MISSING: 9,
  AUCTION_REQUIRES_REVIEW: 10,
  BACKORDER_REQUIRES_REVIEW: 11,
  PRICE_WITHIN_LIMIT: 12,
  PRICE_ABOVE_LIMIT: 13,
  PRICE_UNKNOWN: 14,
  CURRENCY_UNKNOWN: 15,
  CURRENCY_MISMATCH_REQUIRES_REVIEW: 16,
  SOURCE_URL_AVAILABLE: 17,
  SOURCE_URL_MISSING: 18,
  SOURCE_URL_INVALID: 19,
})

export const isRecommendationEligibleTier = (
  tier: CandidateSelectionTier
) => RECOMMENDATION_ELIGIBLE_TIERS.includes(tier)

export const isFixedPriceAcquisitionType = (
  type: DomainAcquisitionType | null
) => type !== null && FIXED_PRICE_ACQUISITION_TYPES.includes(type)

export const isManualReviewAcquisitionType = (
  type: DomainAcquisitionType | null
) => type !== null && MANUAL_REVIEW_ACQUISITION_TYPES.includes(type)


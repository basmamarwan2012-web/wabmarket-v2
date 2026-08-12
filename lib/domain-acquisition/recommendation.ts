import {
  isFixedPriceAcquisitionType,
  isManualReviewAcquisitionType,
  isRecommendationEligibleTier,
} from './policy'
import {
  normalizeAcquisitionRecommendationInput,
  orderRecommendationReasons,
  resolveSafeSourceUrl,
} from './recommendation.helpers'
import type {
  AcquisitionRecommendationInput,
  AcquisitionRecommendationReason,
  AcquisitionRecommendationResult,
  ExternalProviderHandoff,
} from './recommendation.types'

const qualityReason = (
  tier: AcquisitionRecommendationInput['selectionTier']
): AcquisitionRecommendationReason => {
  if (tier === 'PREFERRED') return 'QUALITY_PREFERRED'
  if (tier === 'ACCEPTABLE') return 'QUALITY_ACCEPTABLE'
  if (tier === 'WEAK') return 'QUALITY_WEAK'
  return 'QUALITY_REJECTED'
}

export const createAcquisitionRecommendation = (
  input: AcquisitionRecommendationInput
): AcquisitionRecommendationResult | null => {
  const facts = normalizeAcquisitionRecommendationInput(input)
  if (!facts) return null

  const reasons = new Set<AcquisitionRecommendationReason>([
    qualityReason(facts.selectionTier),
  ])
  const sourceUrl = resolveSafeSourceUrl(facts.sourceUrl)
  const isStandardRegistration =
    facts.acquisitionType === 'STANDARD_REGISTRATION'
  const isFixedPrice = isFixedPriceAcquisitionType(facts.acquisitionType)
  const isManualReview = isManualReviewAcquisitionType(facts.acquisitionType)
  const hasSeparateAcquisitionOffer =
    facts.acquisitionType !== null && !isStandardRegistration
  const standardRegistrationActionable =
    isStandardRegistration && facts.availabilityStatus === 'AVAILABLE'
  const fixedInventoryActionable =
    isFixedPrice && !isStandardRegistration
  const actionableFixedPricePath =
    standardRegistrationActionable || fixedInventoryActionable
  const contradictoryFacts =
    facts.observedPrice !== null && facts.acquisitionType === null

  if (standardRegistrationActionable) reasons.add('AVAILABLE_STANDARD')
  if (fixedInventoryActionable) reasons.add('FIXED_PRICE_ACQUISITION')
  if (facts.availabilityStatus === 'UNKNOWN')
    reasons.add('AVAILABILITY_UNKNOWN')
  if (
    facts.availabilityStatus === 'REGISTERED' &&
    !hasSeparateAcquisitionOffer
  )
    reasons.add('REGISTERED_NO_OFFER')
  if (facts.acquisitionType === null) reasons.add('ACQUISITION_PATH_MISSING')
  if (facts.acquisitionType === 'AUCTION')
    reasons.add('AUCTION_REQUIRES_REVIEW')
  if (facts.acquisitionType === 'BACKORDER')
    reasons.add('BACKORDER_REQUIRES_REVIEW')
  if (contradictoryFacts) reasons.add('CONTRADICTORY_FACTS')

  let priceWithinLimit = false
  let priceAboveLimit = false
  let currencyMismatch = false

  if (actionableFixedPricePath) {
    if (facts.observedPrice === null) {
      reasons.add('PRICE_UNKNOWN')
    } else if (facts.currency === null) {
      reasons.add('CURRENCY_UNKNOWN')
    } else if (facts.currency !== facts.maximumAllowedCurrency) {
      currencyMismatch = true
      reasons.add('CURRENCY_MISMATCH_REQUIRES_REVIEW')
    } else if (facts.observedPrice > facts.maximumAllowedPrice) {
      priceAboveLimit = true
      reasons.add('PRICE_ABOVE_LIMIT')
    } else {
      priceWithinLimit = true
      reasons.add('PRICE_WITHIN_LIMIT')
    }
  }

  if (sourceUrl.status === 'VALID') reasons.add('SOURCE_URL_AVAILABLE')
  if (sourceUrl.status === 'MISSING') reasons.add('SOURCE_URL_MISSING')
  if (sourceUrl.status === 'INVALID') reasons.add('SOURCE_URL_INVALID')

  const registeredWithoutOffer =
    facts.availabilityStatus === 'REGISTERED' &&
    !hasSeparateAcquisitionOffer
  const mustSkip =
    facts.selectionTier === 'REJECT' ||
    contradictoryFacts ||
    registeredWithoutOffer ||
    priceAboveLimit
  const mustReview =
    facts.selectionTier === 'WEAK' ||
    facts.availabilityStatus === 'UNKNOWN' ||
    isManualReview ||
    !actionableFixedPricePath ||
    !priceWithinLimit ||
    currencyMismatch ||
    sourceUrl.status !== 'VALID'
  const recommendation = mustSkip
    ? 'SKIP'
    : mustReview
      ? 'REVIEW'
      : isRecommendationEligibleTier(facts.selectionTier)
        ? 'RECOMMEND'
        : 'REVIEW'

  const handoff: ExternalProviderHandoff = Object.freeze(
    recommendation !== 'SKIP' && sourceUrl.status === 'VALID'
      ? {
          action: 'OPEN_PROVIDER',
          provider: facts.provider,
          sourceUrl: sourceUrl.sourceUrl,
        }
      : { action: 'NONE', provider: null, sourceUrl: null }
  )

  return Object.freeze({
    hostname: facts.hostname,
    recommendation,
    reasons: orderRecommendationReasons(reasons),
    handoff,
  })
}

export type {
  AcquisitionRecommendation,
  AcquisitionRecommendationInput,
  AcquisitionRecommendationReason,
  AcquisitionRecommendationResult,
  DomainAcquisitionType,
  ExternalProviderHandoff,
} from './recommendation.types'


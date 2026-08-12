import type {
  MarketplacePublicationEligibility,
  MarketplacePublicationReason,
  MarketplacePublicationResult,
} from './listing.types'

export const MARKETPLACE_PUBLICATION_REASON_ORDER: Readonly<
  Record<MarketplacePublicationReason, number>
> = Object.freeze({
  OWNERSHIP_NOT_CONFIRMED: 0,
  PREPARATION_NOT_MARKETPLACE_READY: 1,
  UPSTREAM_FACT_MISMATCH: 2,
  LANDING_PAGE_NOT_RENDERABLE: 3,
  LANDING_PAGE_REFERENCE_INVALID: 4,
  LANDING_PAGE_REFERENCE_MISSING: 5,
  VISUAL_ASSETS_INCOMPLETE: 6,
  PUBLICATION_REQUIREMENTS_SATISFIED: 7,
})

export interface MarketplacePublicationPolicyInput {
  readonly ownershipConfirmed: boolean
  readonly preparationMarketplaceReady: boolean
  readonly upstreamFactsMatch: boolean
  readonly landingPageReadiness:
    | 'NOT_RENDERABLE'
    | 'RENDERABLE_WITH_PLACEHOLDERS'
    | 'FULLY_RENDERABLE'
  readonly landingPageReferenceStatus: 'MISSING' | 'INVALID' | 'VALID'
  readonly visualAssetsComplete: boolean
}

export const evaluateMarketplacePublication = (
  input: MarketplacePublicationPolicyInput
): MarketplacePublicationResult => {
  const reasons: MarketplacePublicationReason[] = []

  if (!input.ownershipConfirmed) reasons.push('OWNERSHIP_NOT_CONFIRMED')
  if (!input.preparationMarketplaceReady)
    reasons.push('PREPARATION_NOT_MARKETPLACE_READY')
  if (!input.upstreamFactsMatch) reasons.push('UPSTREAM_FACT_MISMATCH')
  if (input.landingPageReadiness === 'NOT_RENDERABLE')
    reasons.push('LANDING_PAGE_NOT_RENDERABLE')
  if (input.landingPageReferenceStatus === 'INVALID')
    reasons.push('LANDING_PAGE_REFERENCE_INVALID')

  const blocking = reasons.length > 0
  if (!blocking && input.landingPageReferenceStatus === 'MISSING')
    reasons.push('LANDING_PAGE_REFERENCE_MISSING')
  if (!blocking && !input.visualAssetsComplete)
    reasons.push('VISUAL_ASSETS_INCOMPLETE')

  let state: MarketplacePublicationEligibility
  if (blocking) {
    state = 'NOT_ELIGIBLE'
  } else if (
    input.landingPageReferenceStatus === 'MISSING' ||
    !input.visualAssetsComplete ||
    input.landingPageReadiness === 'RENDERABLE_WITH_PLACEHOLDERS'
  ) {
    state = 'ELIGIBLE_WITH_PLACEHOLDERS'
  } else {
    state = 'ELIGIBLE'
    reasons.push('PUBLICATION_REQUIREMENTS_SATISFIED')
  }

  return Object.freeze({
    state,
    reasons: Object.freeze(
      [...new Set(reasons)].sort(
        (left, right) =>
          MARKETPLACE_PUBLICATION_REASON_ORDER[left] -
          MARKETPLACE_PUBLICATION_REASON_ORDER[right]
      )
    ),
  })
}


import {
  createMarketplaceListingId,
  normalizeMarketplaceListingProjection,
} from './listing.helpers'
import { evaluateMarketplacePublication } from './publication-policy'
import type {
  MarketplaceListing,
  MarketplaceListingInput,
} from './listing.types'

export const createMarketplaceListing = (
  input: MarketplaceListingInput
): MarketplaceListing | null => {
  const projection = normalizeMarketplaceListingProjection(input)
  if (!projection) return null

  const publication = evaluateMarketplacePublication({
    ownershipConfirmed: input.preparation.ownershipConfirmed,
    preparationMarketplaceReady:
      input.preparation.readiness.readiness !== 'NOT_READY',
    upstreamFactsMatch: projection.upstreamFactsMatch,
    landingPageReadiness: input.landingPage.readiness.state,
    landingPageReferenceStatus: projection.landingPageReferenceStatus,
    visualAssetsComplete: projection.visualAssetsComplete,
  })

  return Object.freeze({
    listingId: createMarketplaceListingId(projection.hostname),
    hostname: projection.hostname,
    displayName: projection.displayName,
    askingPrice: projection.askingPrice,
    currency: projection.currency,
    description: projection.description,
    logo: projection.logo,
    favicon: projection.favicon,
    openGraphImage: projection.openGraphImage,
    landingPageReference: projection.landingPageReference,
    externalSalesUrl: projection.externalSalesUrl,
    externalSalesCtaLabel: projection.externalSalesCtaLabel,
    publication,
    sourcePreparationOpportunityId: projection.sourcePreparationOpportunityId,
  })
}

export type {
  MarketplaceListing,
  MarketplaceListingAsset,
  MarketplaceListingInput,
  MarketplacePublicationEligibility,
  MarketplacePublicationReason,
  MarketplacePublicationResult,
} from './listing.types'


import 'server-only'

import type { DomainAcquisitionIntelligence, DomainAcquisitionOffer, ProviderCoverage } from '@/types/domain-acquisition'

export interface AcquisitionAggregationInput {
  candidateDomain: string
  offers: readonly DomainAcquisitionOffer[]
  providerCoverage: readonly ProviderCoverage[]
}

/** Preserves every legitimate channel; summary references may not destroy alternatives. */
export interface AcquisitionOfferAggregator {
  aggregate(input: Readonly<AcquisitionAggregationInput>): DomainAcquisitionIntelligence | Promise<DomainAcquisitionIntelligence>
}

export function hasValidOfferNumbers(offer: DomainAcquisitionOffer): boolean {
  const money = [
    offer.price,
    offer.renewalPrice,
    offer.currentBid,
    offer.minimumOffer,
    offer.reservePrice,
  ]
  return (
    money.every((value) => value === null || (Number.isFinite(value) && value >= 0)) &&
    (offer.bidCount === null || (Number.isInteger(offer.bidCount) && offer.bidCount >= 0)) &&
    (offer.confidence === null ||
      (Number.isFinite(offer.confidence) && offer.confidence >= 0 && offer.confidence <= 1))
  )
}

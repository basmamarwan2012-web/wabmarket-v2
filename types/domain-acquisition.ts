import type {
  DiscoveryProviderCategory,
  DiscoveryProviderIdentifier,
} from './discovery-provider'

export type AcquisitionChannel =
  | 'registration'
  | 'buy_now'
  | 'auction'
  | 'closeout'
  | 'backorder'
  | 'premium'
  | 'brokerage'

export type AcquisitionOfferStatus =
  | 'available'
  | 'listed'
  | 'auction_active'
  | 'closeout_available'
  | 'backorder_available'
  | 'premium_available'
  | 'registered'
  | 'unavailable'
  | 'unknown'

export type Availability = 'available' | 'unavailable' | 'unknown'

/** Money is finite and non-negative when present; no conversion is implied. */
export interface DomainAcquisitionOffer {
  providerIdentifier: DiscoveryProviderIdentifier
  /** The single category that produced this provider record. */
  providerCategory: DiscoveryProviderCategory
  candidateDomain: string
  channel: AcquisitionChannel
  status: AcquisitionOfferStatus
  registrationAvailability: Availability
  acquisitionAvailability: Availability
  price: number | null
  /** Future providers normalize to uppercase ISO 4217 where available. */
  currency: string | null
  renewalPrice: number | null
  currentBid: number | null
  minimumOffer: number | null
  reservePrice: number | null
  bidCount: number | null
  auctionEndsAt: string | null
  closeoutEndsAt: string | null
  sourceRecordId: string | null
  sourceUrl: string | null
  verifiedAt: string | null
  /** Provider confidence from 0 through 1, or null when unavailable. */
  confidence: number | null
  /** Untrusted provider data; never use for authorization or unsafe rendering. */
  metadata: Readonly<Record<string, unknown>>
}

export interface ProviderCoverage {
  providerIdentifier: DiscoveryProviderIdentifier
  attempted: boolean
  skipped: boolean
  succeeded: boolean
  failed: boolean
  reason: string | null
  categoriesChecked: readonly DiscoveryProviderCategory[]
  checkedAt: string | null
}

export interface AcquisitionConflict {
  code: string
  providerIdentifiers: readonly DiscoveryProviderIdentifier[]
  message: string
}

export interface DomainAcquisitionIntelligence {
  candidateDomain: string
  registrationAvailability: Availability
  acquisitionAvailability: Availability
  /** Complete canonical collection; summaries never replace alternatives. */
  offers: readonly DomainAcquisitionOffer[]
  providerCoverage: readonly ProviderCoverage[]
  lowestRegistrationOffer: DomainAcquisitionOffer | null
  lowestBuyNowOffer: DomainAcquisitionOffer | null
  activeAuctionOffers: readonly DomainAcquisitionOffer[]
  closeoutOffers: readonly DomainAcquisitionOffer[]
  backorderOffers: readonly DomainAcquisitionOffer[]
  premiumOffers: readonly DomainAcquisitionOffer[]
  conflicts: readonly AcquisitionConflict[]
  generatedAt: string | null
}

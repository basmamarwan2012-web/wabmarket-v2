export const KNOWN_DISCOVERY_PROVIDER_IDENTIFIERS = [
  'google',
  'google_places',
  'dynadot',
  'open_discovery',
] as const

export type KnownDiscoveryProviderIdentifier =
  (typeof KNOWN_DISCOVERY_PROVIDER_IDENTIFIERS)[number]

/** Extensible identifier owned by a registered provider implementation. */
export type DiscoveryProviderIdentifier = string

export const DISCOVERY_SEARCH_MODES = [
  'available_domains',
  'business_upgrade',
  'hyphen_upgrade',
  'alternative_extension',
  'local_seo',
  'auction',
  'closeout',
  'expired',
  'premium',
  'ai_suggestions',
] as const

export type DiscoverySearchMode = (typeof DISCOVERY_SEARCH_MODES)[number]

export const DISCOVERY_PROVIDER_CATEGORIES = [
  'business_discovery',
  'domain_discovery',
  'registration',
  'aftermarket',
  'auction',
  'closeout',
  'backorder',
  'premium',
  'portfolio_sync',
  'availability_verification',
] as const

export type DiscoveryProviderCategory =
  (typeof DISCOVERY_PROVIDER_CATEGORIES)[number]

export interface DiscoveryProviderCriteria {
  keyword?: string | null
  city?: string | null
  state?: string | null
  country?: string | null
  language?: string | null
  maxResults?: number | null
  currentDomain?: string | null
  candidateDomain?: string | null
  extensions?: readonly string[]
}

export interface DiscoveryProviderRequest {
  mode: DiscoverySearchMode
  criteria: Readonly<DiscoveryProviderCriteria>
}

/** Server execution metadata, deliberately separate from search criteria. */
export interface DiscoveryProviderExecutionContext {
  discoveryId?: string
  tenantUid?: string
  correlationId?: string
  signal?: AbortSignal
  deadline?: string
}

export interface DiscoveryProviderCapabilities {
  readonly identifier: DiscoveryProviderIdentifier
  readonly displayName: string
  readonly supportedSearchModes: readonly DiscoverySearchMode[]
  readonly categories: readonly DiscoveryProviderCategory[]
  readonly operations: Readonly<{
    registrationPricing: boolean
    renewalPricing: boolean
    buyNowInventory: boolean
    brokerage: boolean
    batchRequests: boolean
  }>
}

export type DiscoveryAcquisitionStatus =
  | 'available'
  | 'registered'
  | 'premium'
  | 'auction'
  | 'closeout'
  | 'expired'
  | 'unknown'

export interface DiscoveryProviderItem {
  provider: DiscoveryProviderIdentifier
  sourceRecordId: string | null
  sourceUrl: string | null
  source: string | null
  sourceTitle: string | null
  currentDomain: string | null
  candidateDomain: string | null
  website: string | null
  businessName: string | null
  city: string | null
  country: string | null
  acquisitionStatus: DiscoveryAcquisitionStatus | null
  /** Untrusted provider data; never use directly for authorization or rendering. */
  metadata: Readonly<Record<string, unknown>>
}

export interface DiscoveryProviderResult {
  provider: DiscoveryProviderIdentifier
  query: DiscoveryProviderRequest
  startedAt: string
  completedAt: string
  durationMs: number
  items: readonly DiscoveryProviderItem[]
}

export const DOMAIN_AVAILABILITY_STATUSES = Object.freeze([
  'AVAILABLE',
  'REGISTERED',
  'UNKNOWN',
] as const)

export type DomainAvailabilityStatus =
  (typeof DOMAIN_AVAILABILITY_STATUSES)[number]

/** Extensible identifier owned by a domain-availability adapter. */
export type DomainAvailabilityProviderIdentifier = string

export interface DomainAvailabilityResult {
  readonly hostname: string
  readonly provider: DomainAvailabilityProviderIdentifier
  readonly availabilityStatus: DomainAvailabilityStatus
  readonly checkedAt: string
}

export interface DomainAvailabilityProviderLimits {
  readonly maxCandidatesPerLookup: number
  readonly timeoutMs: number
  readonly maxRequestsPerLookup: 1
}

export interface DomainAvailabilityLookupContext {
  readonly signal?: AbortSignal
}

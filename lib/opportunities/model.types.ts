import type { CandidateDomainPatternId } from '../candidate-domains/patterns'
import type {
  DomainAvailabilityProviderIdentifier,
  DomainAvailabilityResult,
  DomainAvailabilityStatus,
} from '../domain-availability/types'
import type {
  FlipScorePriority,
  FlipScoreResult,
} from '../flipscore/engine.types'

export const OPPORTUNITY_DISCOVERY_MODES = Object.freeze([
  'BUSINESS_FIRST',
  'DOMAIN_FIRST',
] as const)

export type OpportunityDiscoveryMode =
  (typeof OPPORTUNITY_DISCOVERY_MODES)[number]

export interface CanonicalOpportunityBreakdown {
  readonly need: number
  readonly impact: number
  readonly confidence: number
}

export interface CanonicalOpportunityAvailability {
  readonly provider: DomainAvailabilityProviderIdentifier
  readonly availabilityStatus: DomainAvailabilityStatus
  readonly checkedAt: string
}

export interface CanonicalOpportunity {
  readonly opportunityId: string
  readonly businessName: string
  readonly businessPlaceId: string | null
  readonly primaryType: string | null
  readonly city: string
  readonly state: string | null
  readonly country: string
  readonly currentHostname: string
  readonly candidateHostname: string
  readonly candidatePatternId: CandidateDomainPatternId | null
  readonly flipScore: number
  readonly priority: FlipScorePriority
  readonly breakdown: CanonicalOpportunityBreakdown
  readonly reasons: readonly string[]
  readonly availability: CanonicalOpportunityAvailability
  readonly discoveryMode: OpportunityDiscoveryMode
  readonly discoveredAt: string
}

export interface CanonicalOpportunityInput {
  readonly businessName: string
  readonly businessPlaceId?: string | null
  readonly primaryType?: string | null
  readonly city: string
  readonly state?: string | null
  readonly country: string
  readonly currentHostname: string
  readonly candidateHostname: string
  readonly candidatePatternId?: CandidateDomainPatternId | null
  readonly flipScore: FlipScoreResult
  readonly availability: DomainAvailabilityResult
  readonly discoveryMode: OpportunityDiscoveryMode
  readonly discoveredAt: string
}

import type { FlipScorePriority } from '../flipscore/engine.types'

export interface OpportunityQualificationTestInput {
  readonly businessName: string
  readonly currentDomain: string
  readonly keyword: string
  readonly city: string
  readonly state: string | null
  readonly country: string
  readonly placeId: string | null
  readonly primaryType: string | null
}

export interface OpportunityQualificationSafeResult {
  readonly opportunityId: string
  readonly candidateHostname: string
  readonly candidatePatternId: string | null
  readonly availabilityStatus: 'AVAILABLE'
  readonly provider: string
  readonly flipScore: number
  readonly priority: FlipScorePriority
}

export interface OpportunityQualificationTestReport {
  readonly business: string
  readonly currentDomain: string
  readonly flipScore: number
  readonly priority: FlipScorePriority
  readonly generatedCandidateCount: number
  readonly checkedCandidateCount: number
  readonly availableCandidateCount: number
  readonly opportunities: readonly OpportunityQualificationSafeResult[]
}

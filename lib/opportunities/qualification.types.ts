import type { FlipScoreResult } from '../flipscore/engine.types'
import type { CanonicalOpportunity } from './model.types'

export interface ForwardOpportunityQualificationInput {
  readonly businessName: string
  readonly businessPlaceId?: string | null
  readonly primaryType?: string | null
  readonly city: string
  readonly state?: string | null
  readonly country: string
  readonly currentHostname: string
  readonly flipScore: FlipScoreResult
  readonly primaryKeyword: string
  readonly discoveredAt: string
}

export interface ForwardOpportunityQualificationReport {
  readonly generatedCandidateCount: number
  readonly checkedCandidateCount: number
  readonly availableCandidateCount: number
  readonly opportunities: readonly CanonicalOpportunity[]
}

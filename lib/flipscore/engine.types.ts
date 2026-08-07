import type { FlipScorePolicy, FlipScorePolicyRuleId } from './policy.types'
import type { FlipScoreWeightPolicy } from './weights.types'

export const FLIPSCORE_PRIORITIES = Object.freeze([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const)

export type FlipScorePriority = (typeof FLIPSCORE_PRIORITIES)[number]

export interface FlipScoreEngineInput {
  readonly policy: FlipScorePolicy
  readonly weights: FlipScoreWeightPolicy
}

export interface FlipScoreResult {
  readonly needScore: number
  readonly impactScore: number
  readonly confidenceScore: number
  readonly flipScore: number
  readonly priority: FlipScorePriority
  readonly reasons: readonly string[]
}

export interface FlipScoreRuleConstraintPolicy {
  readonly mutuallyExclusiveFamilies: readonly (
    readonly FlipScorePolicyRuleId[]
  )[]
  readonly independentOpportunityRules: readonly FlipScorePolicyRuleId[]
}

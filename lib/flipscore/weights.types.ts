import type {
  FlipScorePolicy,
  FlipScorePolicyRuleId,
  OpportunityDimension,
} from './policy.types'

export const RULE_MAGNITUDE_PARTICIPATION = Object.freeze([
  'MAGNITUDE_BEARING',
  'EXPLANATION_ONLY',
] as const)

export type RuleMagnitudeParticipation =
  (typeof RULE_MAGNITUDE_PARTICIPATION)[number]

export const RULE_MAGNITUDE_OVERLAP_GROUPS = Object.freeze([
  'brand_mismatch',
] as const)

export type RuleMagnitudeOverlapGroup =
  (typeof RULE_MAGNITUDE_OVERLAP_GROUPS)[number]

export type DimensionAllocation = Readonly<
  Record<OpportunityDimension, number>
>

export interface FlipScoreRuleMagnitude {
  readonly ruleId: FlipScorePolicyRuleId
  readonly dimension: OpportunityDimension
  readonly magnitude: number
  readonly participation: RuleMagnitudeParticipation
  readonly overlapGroup: RuleMagnitudeOverlapGroup | null
}

export interface FlipScoreNormalizationMetadata {
  readonly maximumMagnitude: DimensionAllocation
}

export interface FlipScoreWeightPolicy {
  readonly dimensionAllocation: DimensionAllocation
  readonly ruleMagnitudes: readonly FlipScoreRuleMagnitude[]
  readonly normalization: FlipScoreNormalizationMetadata
}

export interface FlipScoreWeightPolicyInput {
  readonly policy: FlipScorePolicy
}

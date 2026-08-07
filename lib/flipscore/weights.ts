import {
  freezeRuleMagnitudeDefinitions,
  validateDimensionAllocation,
  validateRuleMagnitudeDefinitions,
  validateRuleMagnitudesAgainstPolicy,
} from './weights.helpers'
import type {
  DimensionAllocation,
  FlipScoreRuleMagnitude,
  FlipScoreWeightPolicy,
  FlipScoreWeightPolicyInput,
} from './weights.types'

const DIMENSION_ALLOCATION = Object.freeze({
  NEED: 50,
  IMPACT: 30,
  CONFIDENCE: 20,
}) satisfies DimensionAllocation

const RULE_MAGNITUDE_DEFINITIONS = [
  {
    ruleId: 'unrelated_domain',
    dimension: 'NEED',
    magnitude: 30,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: 'brand_mismatch',
  },
  {
    ruleId: 'keyword_only_domain',
    dimension: 'NEED',
    magnitude: 12,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: null,
  },
  {
    ruleId: 'strong_brand_mismatch',
    dimension: 'NEED',
    magnitude: 0,
    participation: 'EXPLANATION_ONLY',
    overlapGroup: 'brand_mismatch',
  },
  {
    ruleId: 'non_dot_com_domain',
    dimension: 'IMPACT',
    magnitude: 8,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: null,
  },
  {
    ruleId: 'hyphenated_domain',
    dimension: 'IMPACT',
    magnitude: 8,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: null,
  },
  {
    ruleId: 'domain_legal_suffix',
    dimension: 'IMPACT',
    magnitude: 4,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: null,
  },
  {
    ruleId: 'keyword_stuffing',
    dimension: 'IMPACT',
    magnitude: 10,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: null,
  },
  {
    ruleId: 'strong_branded_domain',
    dimension: 'CONFIDENCE',
    magnitude: 12,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: null,
  },
  {
    ruleId: 'compact_branded_domain',
    dimension: 'CONFIDENCE',
    magnitude: 8,
    participation: 'MAGNITUDE_BEARING',
    overlapGroup: null,
  },
] as const satisfies readonly FlipScoreRuleMagnitude[]

validateDimensionAllocation(DIMENSION_ALLOCATION)
validateRuleMagnitudeDefinitions(
  RULE_MAGNITUDE_DEFINITIONS,
  DIMENSION_ALLOCATION
)

const RULE_MAGNITUDES = freezeRuleMagnitudeDefinitions(
  RULE_MAGNITUDE_DEFINITIONS
)

const NORMALIZATION = Object.freeze({
  maximumMagnitude: DIMENSION_ALLOCATION,
})

const WEIGHT_POLICY = Object.freeze({
  dimensionAllocation: DIMENSION_ALLOCATION,
  ruleMagnitudes: RULE_MAGNITUDES,
  normalization: NORMALIZATION,
}) satisfies FlipScoreWeightPolicy

export const createFlipScoreWeightPolicy = (
  input: FlipScoreWeightPolicyInput
): FlipScoreWeightPolicy => {
  validateRuleMagnitudesAgainstPolicy(RULE_MAGNITUDES, input.policy)
  return WEIGHT_POLICY
}

export type {
  DimensionAllocation,
  FlipScoreNormalizationMetadata,
  FlipScoreRuleMagnitude,
  FlipScoreWeightPolicy,
  FlipScoreWeightPolicyInput,
  RuleMagnitudeOverlapGroup,
  RuleMagnitudeParticipation,
} from './weights.types'

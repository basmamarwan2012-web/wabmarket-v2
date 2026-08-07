import {
  clampScore,
  collectActiveOpportunityMagnitude,
  collectActiveProtectiveMagnitude,
  collectActiveReasons,
  deriveMaximumSimultaneousOpportunityMagnitude,
  getFlipScorePriority,
  joinFlipScoreRules,
  normalizeOpportunityMagnitude,
  validateRuleConstraintPolicy,
} from './engine.helpers'
import type {
  FlipScoreEngineInput,
  FlipScoreResult,
  FlipScoreRuleConstraintPolicy,
} from './engine.types'

const VERSION_ONE_RULE_CONSTRAINTS = Object.freeze({
  mutuallyExclusiveFamilies: Object.freeze([
    Object.freeze([
      'unrelated_domain',
      'keyword_only_domain',
      'strong_brand_mismatch',
    ] as const),
  ]),
  independentOpportunityRules: Object.freeze([
    'non_dot_com_domain',
    'hyphenated_domain',
    'domain_legal_suffix',
    'keyword_stuffing',
  ] as const),
}) satisfies FlipScoreRuleConstraintPolicy

export const calculateFlipScore = (
  input: FlipScoreEngineInput
): FlipScoreResult => {
  const joinedRules = joinFlipScoreRules(input.policy, input.weights)
  validateRuleConstraintPolicy(joinedRules, VERSION_ONE_RULE_CONSTRAINTS)

  const maximumNeedMagnitude =
    deriveMaximumSimultaneousOpportunityMagnitude(
      joinedRules,
      'NEED',
      VERSION_ONE_RULE_CONSTRAINTS
    )
  const maximumImpactMagnitude =
    deriveMaximumSimultaneousOpportunityMagnitude(
      joinedRules,
      'IMPACT',
      VERSION_ONE_RULE_CONSTRAINTS
    )
  const activeNeedMagnitude = collectActiveOpportunityMagnitude(
    joinedRules,
    'NEED',
    VERSION_ONE_RULE_CONSTRAINTS
  )
  const activeImpactMagnitude = collectActiveOpportunityMagnitude(
    joinedRules,
    'IMPACT',
    VERSION_ONE_RULE_CONSTRAINTS
  )
  const hasPositiveOpportunityEvidence =
    activeNeedMagnitude > 0 || activeImpactMagnitude > 0

  const needScore = normalizeOpportunityMagnitude(
    activeNeedMagnitude,
    maximumNeedMagnitude,
    input.weights.dimensionAllocation.NEED
  )
  const impactScore = normalizeOpportunityMagnitude(
    activeImpactMagnitude,
    maximumImpactMagnitude,
    input.weights.dimensionAllocation.IMPACT
  )
  const protectiveConfidenceMagnitude =
    collectActiveProtectiveMagnitude(
      joinedRules,
      'CONFIDENCE',
      VERSION_ONE_RULE_CONSTRAINTS
    )
  const confidenceScore = hasPositiveOpportunityEvidence
    ? clampScore(
        input.weights.dimensionAllocation.CONFIDENCE -
          protectiveConfidenceMagnitude,
        0,
        input.weights.dimensionAllocation.CONFIDENCE
      )
    : 0
  const flipScore = clampScore(
    needScore + impactScore + confidenceScore,
    0,
    100
  )

  return Object.freeze({
    needScore,
    impactScore,
    confidenceScore,
    flipScore,
    priority: getFlipScorePriority(flipScore),
    reasons: collectActiveReasons(input.policy),
  })
}

export type {
  FlipScoreEngineInput,
  FlipScorePriority,
  FlipScoreResult,
  FlipScoreRuleConstraintPolicy,
} from './engine.types'

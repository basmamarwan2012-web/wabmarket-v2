import type {
  FlipScorePolicy,
  FlipScorePolicyRule,
  FlipScorePolicyRuleId,
  OpportunityDimension,
} from './policy.types'
import type {
  FlipScoreRuleMagnitude,
  FlipScoreWeightPolicy,
} from './weights.types'
import type {
  FlipScorePriority,
  FlipScoreRuleConstraintPolicy,
} from './engine.types'

export interface JoinedFlipScoreRule {
  readonly policyRule: FlipScorePolicyRule
  readonly magnitude: FlipScoreRuleMagnitude
}

export const clampScore = (
  value: number,
  minimum: number,
  maximum: number
) => Math.min(maximum, Math.max(minimum, value))

export const getFlipScorePriority = (
  flipScore: number
): FlipScorePriority => {
  if (flipScore >= 75) return 'CRITICAL'
  if (flipScore >= 50) return 'HIGH'
  if (flipScore >= 25) return 'MEDIUM'
  return 'LOW'
}

export const collectActiveReasons = (policy: FlipScorePolicy) => {
  const seenMessages = new Set<string>()
  const reasons: string[] = []

  for (const rule of policy.rules) {
    if (!rule.active || seenMessages.has(rule.message)) continue
    seenMessages.add(rule.message)
    reasons.push(rule.message)
  }

  return Object.freeze(reasons)
}

export const joinFlipScoreRules = (
  policy: FlipScorePolicy,
  weights: FlipScoreWeightPolicy
) => {
  const magnitudesByRuleId = new Map<
    FlipScorePolicyRuleId,
    FlipScoreRuleMagnitude
  >()

  for (const magnitude of weights.ruleMagnitudes) {
    if (magnitudesByRuleId.has(magnitude.ruleId)) {
      throw new TypeError(
        `Duplicate FlipScore magnitude definition: ${magnitude.ruleId}.`
      )
    }
    magnitudesByRuleId.set(magnitude.ruleId, magnitude)
  }

  const joined = policy.rules.map((policyRule) => {
    const magnitude = magnitudesByRuleId.get(policyRule.id)
    if (!magnitude) {
      throw new TypeError(
        `Missing FlipScore magnitude definition: ${policyRule.id}.`
      )
    }
    return Object.freeze({ policyRule, magnitude })
  })

  if (joined.length !== weights.ruleMagnitudes.length) {
    throw new TypeError('FlipScore policy and magnitude definitions differ.')
  }

  return Object.freeze(joined)
}

const findExclusiveFamily = (
  ruleId: FlipScorePolicyRuleId,
  constraints: FlipScoreRuleConstraintPolicy
) =>
  constraints.mutuallyExclusiveFamilies.find((family) =>
    family.includes(ruleId)
  )

export const validateRuleConstraintPolicy = (
  joinedRules: readonly JoinedFlipScoreRule[],
  constraints: FlipScoreRuleConstraintPolicy
) => {
  const knownRuleIds = new Set(
    joinedRules.map(({ policyRule }) => policyRule.id)
  )
  const constrainedRuleIds = new Set<FlipScorePolicyRuleId>()

  for (const family of constraints.mutuallyExclusiveFamilies) {
    if (family.length < 2) {
      throw new TypeError(
        'A mutually exclusive FlipScore family requires at least two rules.'
      )
    }
    for (const ruleId of family) {
      if (!knownRuleIds.has(ruleId) || constrainedRuleIds.has(ruleId)) {
        throw new TypeError(
          'FlipScore exclusivity constraints are incomplete or duplicated.'
        )
      }
      constrainedRuleIds.add(ruleId)
    }
  }

  for (const ruleId of constraints.independentOpportunityRules) {
    if (!knownRuleIds.has(ruleId) || constrainedRuleIds.has(ruleId)) {
      throw new TypeError(
        'FlipScore independent-rule constraints are invalid or duplicated.'
      )
    }
    constrainedRuleIds.add(ruleId)
  }

  for (const { policyRule, magnitude } of joinedRules) {
    const isPositiveOpportunityRule =
      policyRule.effect === 'OPPORTUNITY' && magnitude.magnitude > 0
    if (isPositiveOpportunityRule && !constrainedRuleIds.has(policyRule.id)) {
      throw new TypeError(
        `No safe simultaneous-activation constraint exists for FlipScore rule: ${policyRule.id}.`
      )
    }
  }
}

const canAddRule = (
  selected: readonly JoinedFlipScoreRule[],
  candidate: JoinedFlipScoreRule,
  constraints: FlipScoreRuleConstraintPolicy
) => {
  const candidateFamily = findExclusiveFamily(
    candidate.policyRule.id,
    constraints
  )

  return selected.every((existing) => {
    const sharesOverlapGroup =
      candidate.magnitude.overlapGroup !== null &&
      candidate.magnitude.overlapGroup === existing.magnitude.overlapGroup
    const sharesExclusiveFamily =
      candidateFamily?.includes(existing.policyRule.id) ?? false
    return !sharesOverlapGroup && !sharesExclusiveFamily
  })
}

export const deriveMaximumSimultaneousOpportunityMagnitude = (
  joinedRules: readonly JoinedFlipScoreRule[],
  dimension: OpportunityDimension,
  constraints: FlipScoreRuleConstraintPolicy
) => {
  const candidates = joinedRules.filter(
    ({ policyRule, magnitude }) =>
      policyRule.effect === 'OPPORTUNITY' &&
      magnitude.dimension === dimension &&
      magnitude.participation === 'MAGNITUDE_BEARING' &&
      magnitude.magnitude > 0
  )
  let maximum = 0

  const visit = (
    offset: number,
    selected: readonly JoinedFlipScoreRule[],
    total: number
  ) => {
    maximum = Math.max(maximum, total)
    for (let index = offset; index < candidates.length; index += 1) {
      const candidate = candidates[index]
      if (!canAddRule(selected, candidate, constraints)) continue
      visit(
        index + 1,
        [...selected, candidate],
        total + candidate.magnitude.magnitude
      )
    }
  }

  visit(0, [], 0)
  return maximum
}

export const collectActiveOpportunityMagnitude = (
  joinedRules: readonly JoinedFlipScoreRule[],
  dimension: OpportunityDimension,
  constraints: FlipScoreRuleConstraintPolicy
) => {
  const activeRules = joinedRules.filter(
    ({ policyRule, magnitude }) =>
      policyRule.active &&
      policyRule.effect === 'OPPORTUNITY' &&
      magnitude.dimension === dimension &&
      magnitude.participation === 'MAGNITUDE_BEARING' &&
      magnitude.magnitude > 0
  )
  const selected: JoinedFlipScoreRule[] = []

  for (const candidate of activeRules) {
    if (!canAddRule(selected, candidate, constraints)) {
      throw new TypeError(
        'Active FlipScore opportunity rules violate overlap or exclusivity constraints.'
      )
    }
    selected.push(candidate)
  }

  return selected.reduce(
    (total, rule) => total + rule.magnitude.magnitude,
    0
  )
}

export const normalizeOpportunityMagnitude = (
  activeMagnitude: number,
  maximumSimultaneousMagnitude: number,
  dimensionAllocation: number
) => {
  if (activeMagnitude === 0) return 0
  if (
    maximumSimultaneousMagnitude <= 0 ||
    activeMagnitude > maximumSimultaneousMagnitude
  ) {
    throw new TypeError(
      'FlipScore active magnitude exceeds its safe simultaneous maximum.'
    )
  }

  return clampScore(
    Math.round(
      (dimensionAllocation * activeMagnitude) /
        maximumSimultaneousMagnitude
    ),
    0,
    dimensionAllocation
  )
}

export const collectActiveProtectiveMagnitude = (
  joinedRules: readonly JoinedFlipScoreRule[],
  dimension: OpportunityDimension,
  constraints: FlipScoreRuleConstraintPolicy
) => {
  const activeRules = joinedRules.filter(
    ({ policyRule, magnitude }) =>
      policyRule.active &&
      policyRule.effect === 'PROTECTIVE' &&
      magnitude.dimension === dimension &&
      magnitude.participation === 'MAGNITUDE_BEARING' &&
      magnitude.magnitude > 0
  )
  const selected: JoinedFlipScoreRule[] = []

  for (const candidate of activeRules) {
    if (!canAddRule(selected, candidate, constraints)) {
      throw new TypeError(
        'Active FlipScore protective rules violate overlap constraints.'
      )
    }
    selected.push(candidate)
  }

  return selected.reduce(
    (total, rule) => total + rule.magnitude.magnitude,
    0
  )
}

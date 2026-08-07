import {
  FLIPSCORE_POLICY_RULE_IDS,
  OPPORTUNITY_DIMENSIONS,
  type FlipScorePolicy,
  type FlipScorePolicyRuleId,
  type OpportunityDimension,
} from './policy.types'
import type {
  DimensionAllocation,
  FlipScoreRuleMagnitude,
} from './weights.types'

const isKnownDimension = (
  value: string
): value is OpportunityDimension =>
  OPPORTUNITY_DIMENSIONS.some((dimension) => dimension === value)

const isKnownRuleId = (
  value: string
): value is FlipScorePolicyRuleId =>
  FLIPSCORE_POLICY_RULE_IDS.some((ruleId) => ruleId === value)

export const validateDimensionAllocation = (
  allocation: DimensionAllocation
) => {
  const values = OPPORTUNITY_DIMENSIONS.map(
    (dimension) => allocation[dimension]
  )

  if (
    values.some((value) => !Number.isFinite(value) || value < 0) ||
    values.reduce((total, value) => total + value, 0) !== 100
  ) {
    throw new TypeError(
      'FlipScore dimension allocations must be finite, non-negative, and total 100.'
    )
  }
}

export const validateRuleMagnitudeDefinitions = (
  definitions: readonly FlipScoreRuleMagnitude[],
  allocation: DimensionAllocation
) => {
  const seenRuleIds = new Set<string>()
  const positiveOverlapGroups = new Set<string>()

  for (const definition of definitions) {
    if (seenRuleIds.has(definition.ruleId)) {
      throw new TypeError(
        `Duplicate FlipScore rule magnitude: ${definition.ruleId}.`
      )
    }
    seenRuleIds.add(definition.ruleId)

    if (!isKnownRuleId(definition.ruleId)) {
      throw new TypeError('Unknown FlipScore policy rule identifier.')
    }
    if (!isKnownDimension(definition.dimension)) {
      throw new TypeError('Unknown FlipScore opportunity dimension.')
    }
    if (
      !Number.isFinite(definition.magnitude) ||
      definition.magnitude < 0 ||
      definition.magnitude > allocation[definition.dimension]
    ) {
      throw new TypeError(
        'Rule magnitudes must be finite, non-negative, and within their dimension allocation.'
      )
    }
    if (
      definition.participation === 'EXPLANATION_ONLY' &&
      definition.magnitude !== 0
    ) {
      throw new TypeError('Explanation-only rules must use magnitude 0.')
    }

    if (definition.overlapGroup && definition.magnitude > 0) {
      if (positiveOverlapGroups.has(definition.overlapGroup)) {
        throw new TypeError(
          'An overlap group cannot contain multiple positive rule magnitudes.'
        )
      }
      positiveOverlapGroups.add(definition.overlapGroup)
    }
  }
}

export const validateRuleMagnitudesAgainstPolicy = (
  definitions: readonly FlipScoreRuleMagnitude[],
  policy: FlipScorePolicy
) => {
  const definitionsByRuleId = new Map(
    definitions.map((definition) => [definition.ruleId, definition])
  )
  const policyRuleIds = new Set<string>()

  for (const rule of policy.rules) {
    if (policyRuleIds.has(rule.id)) {
      throw new TypeError(`Duplicate FlipScore policy rule: ${rule.id}.`)
    }
    policyRuleIds.add(rule.id)

    const definition = definitionsByRuleId.get(rule.id)
    if (!definition) {
      throw new TypeError(
        `Missing magnitude definition for FlipScore rule: ${rule.id}.`
      )
    }
    if (!rule.dimensions.includes(definition.dimension)) {
      throw new TypeError(
        `Magnitude dimension is not allowed by FlipScore rule: ${rule.id}.`
      )
    }
  }

  for (const definition of definitions) {
    if (!policyRuleIds.has(definition.ruleId)) {
      throw new TypeError(
        `Configured magnitude rule is absent from FlipScore policy: ${definition.ruleId}.`
      )
    }
  }
}

export const freezeRuleMagnitudeDefinitions = (
  definitions: readonly FlipScoreRuleMagnitude[]
) =>
  Object.freeze(
    definitions.map((definition) => Object.freeze({ ...definition }))
  )

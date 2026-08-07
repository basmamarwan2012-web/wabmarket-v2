import type { DomainBusinessTermFacts } from '../domain-analysis/domain-composition.types'
import type { SignalImportanceMetadata } from '../domain-analysis/importance.types'
import {
  OPPORTUNITY_PRIORITIES,
  type FlipScorePolicyRule,
  type OpportunityPriority,
} from './policy.types'

export const createPolicyRule = (
  rule: FlipScorePolicyRule
): FlipScorePolicyRule => {
  if (rule.effect !== 'OPPORTUNITY' && rule.priority !== null) {
    throw new TypeError(
      'Protective and informational policy rules cannot carry priority.'
    )
  }

  if (rule.effect === 'OPPORTUNITY' && rule.priority === null) {
    throw new TypeError('Opportunity policy rules require priority.')
  }

  return Object.freeze({
    ...rule,
    dimensions: Object.freeze([...rule.dimensions]),
  })
}

export const isImportanceBackedSignalActive = (
  signal: boolean,
  metadata: SignalImportanceMetadata
) => signal && metadata.active

export const resolveOpportunityPriority = (
  metadata: SignalImportanceMetadata,
  fallback: OpportunityPriority
): OpportunityPriority =>
  metadata.active &&
  OPPORTUNITY_PRIORITIES.some(
    (priority) => priority === metadata.importance
  )
    ? (metadata.importance as OpportunityPriority)
    : fallback

export const containsDomainLegalBusinessSuffix = (
  facts: DomainBusinessTermFacts
) =>
  facts.containsLLC ||
  facts.containsINC ||
  facts.containsCORP ||
  facts.containsCOMPANY ||
  facts.containsCO

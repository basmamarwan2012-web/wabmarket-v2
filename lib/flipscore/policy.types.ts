import type { BrandDomainComparison } from '../domain-analysis/comparator.types'
import type { DomainCompositionIntelligence } from '../domain-analysis/domain-composition.types'
import type { DomainSignalImportance } from '../domain-analysis/importance.types'
import type { DomainSignals } from '../domain-analysis/signals.types'

export const OPPORTUNITY_DIMENSIONS = Object.freeze([
  'NEED',
  'IMPACT',
  'CONFIDENCE',
] as const)

export type OpportunityDimension = (typeof OPPORTUNITY_DIMENSIONS)[number]

export const OPPORTUNITY_PRIORITIES = Object.freeze([
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW',
] as const)

export type OpportunityPriority = (typeof OPPORTUNITY_PRIORITIES)[number]

export const FLIPSCORE_POLICY_EFFECTS = Object.freeze([
  'OPPORTUNITY',
  'PROTECTIVE',
  'INFORMATIONAL',
] as const)

export type FlipScorePolicyEffect = (typeof FLIPSCORE_POLICY_EFFECTS)[number]

export const FLIPSCORE_POLICY_RULE_IDS = Object.freeze([
  'strong_brand_mismatch',
  'non_dot_com_domain',
  'hyphenated_domain',
  'keyword_only_domain',
  'unrelated_domain',
  'strong_branded_domain',
  'compact_branded_domain',
  'domain_legal_suffix',
  'keyword_stuffing',
] as const)

export type FlipScorePolicyRuleId =
  (typeof FLIPSCORE_POLICY_RULE_IDS)[number]

export const FLIPSCORE_EXPLANATION_CATEGORIES = Object.freeze([
  'STRONG_BRAND_MISMATCH',
  'USES_NON_DOT_COM_DOMAIN',
  'USES_HYPHENATED_DOMAIN',
  'USES_KEYWORD_ONLY_DOMAIN',
  'USES_UNRELATED_DOMAIN',
  'STRONG_BRANDED_DOMAIN',
  'COMPACT_BRANDED_DOMAIN',
  'DOMAIN_CONTAINS_LEGAL_SUFFIX',
  'KEYWORD_STUFFING_DETECTED',
] as const)

export type FlipScoreExplanationCategory =
  (typeof FLIPSCORE_EXPLANATION_CATEGORIES)[number]

export interface FlipScorePolicyInput {
  readonly importance: DomainSignalImportance
  readonly composition: DomainCompositionIntelligence
  readonly signals: DomainSignals
  readonly comparison: BrandDomainComparison
}

export interface FlipScorePolicyRule {
  readonly id: FlipScorePolicyRuleId
  readonly active: boolean
  readonly effect: FlipScorePolicyEffect
  readonly dimensions: readonly OpportunityDimension[]
  readonly priority: OpportunityPriority | null
  readonly category: FlipScoreExplanationCategory
  readonly message: string
}

export interface FlipScorePolicy {
  readonly dimensions: typeof OPPORTUNITY_DIMENSIONS
  readonly priorities: typeof OPPORTUNITY_PRIORITIES
  readonly effects: typeof FLIPSCORE_POLICY_EFFECTS
  readonly rules: readonly FlipScorePolicyRule[]
}

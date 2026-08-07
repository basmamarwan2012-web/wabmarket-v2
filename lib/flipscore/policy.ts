import {
  containsDomainLegalBusinessSuffix,
  createPolicyRule,
  isImportanceBackedSignalActive,
  resolveOpportunityPriority,
} from './policy.helpers'
import {
  FLIPSCORE_POLICY_EFFECTS,
  OPPORTUNITY_DIMENSIONS,
  OPPORTUNITY_PRIORITIES,
  type FlipScorePolicy,
  type FlipScorePolicyInput,
  type OpportunityDimension,
} from './policy.types'

const NEED_AND_IMPACT = Object.freeze([
  'NEED',
  'IMPACT',
] as const satisfies readonly OpportunityDimension[])

const NEED_AND_CONFIDENCE = Object.freeze([
  'NEED',
  'CONFIDENCE',
] as const satisfies readonly OpportunityDimension[])

export const createFlipScorePolicy = (
  input: FlipScorePolicyInput
): FlipScorePolicy => {
  const genericBrandMismatch =
    input.comparison.zeroBrandTokens &&
    input.comparison.classification === 'GENERIC_KEYWORD' &&
    input.signals.brandAlignment.genericKeyword &&
    input.importance.brandAlignment.genericKeyword.active &&
    !input.signals.domainComposition.keywordOnlyDomain

  const rules = Object.freeze([
    createPolicyRule({
      id: 'strong_brand_mismatch',
      active: genericBrandMismatch,
      effect: 'OPPORTUNITY',
      dimensions: NEED_AND_IMPACT,
      priority: resolveOpportunityPriority(
        input.importance.brandAlignment.genericKeyword,
        'HIGH'
      ),
      category: 'STRONG_BRAND_MISMATCH',
      message: 'The current domain does not align with the business brand.',
    }),
    createPolicyRule({
      id: 'non_dot_com_domain',
      active: isImportanceBackedSignalActive(
        input.signals.domainQuality.nonDotCom,
        input.importance.domainQuality.nonDotCom
      ),
      effect: 'OPPORTUNITY',
      dimensions: NEED_AND_IMPACT,
      priority: resolveOpportunityPriority(
        input.importance.domainQuality.nonDotCom,
        'HIGH'
      ),
      category: 'USES_NON_DOT_COM_DOMAIN',
      message: 'The business uses a non-.com domain.',
    }),
    createPolicyRule({
      id: 'hyphenated_domain',
      active: isImportanceBackedSignalActive(
        input.signals.domainQuality.hasHyphen,
        input.importance.domainQuality.hasHyphen
      ),
      effect: 'OPPORTUNITY',
      dimensions: NEED_AND_IMPACT,
      priority: resolveOpportunityPriority(
        input.importance.domainQuality.hasHyphen,
        'HIGH'
      ),
      category: 'USES_HYPHENATED_DOMAIN',
      message: 'The current domain contains a hyphen.',
    }),
    createPolicyRule({
      id: 'keyword_only_domain',
      active: isImportanceBackedSignalActive(
        input.signals.domainComposition.keywordOnlyDomain,
        input.importance.domainComposition.keywordOnlyDomain
      ),
      effect: 'OPPORTUNITY',
      dimensions: NEED_AND_IMPACT,
      priority: resolveOpportunityPriority(
        input.importance.domainComposition.keywordOnlyDomain,
        'HIGH'
      ),
      category: 'USES_KEYWORD_ONLY_DOMAIN',
      message: 'The domain relies mainly on generic keyword terms.',
    }),
    createPolicyRule({
      id: 'unrelated_domain',
      active:
        input.comparison.classification === 'UNRELATED' &&
        isImportanceBackedSignalActive(
          input.signals.brandAlignment.unrelated,
          input.importance.brandAlignment.unrelated
        ),
      effect: 'OPPORTUNITY',
      dimensions: NEED_AND_IMPACT,
      priority: resolveOpportunityPriority(
        input.importance.brandAlignment.unrelated,
        'CRITICAL'
      ),
      category: 'USES_UNRELATED_DOMAIN',
      message: 'The current domain is unrelated to the business name.',
    }),
    createPolicyRule({
      id: 'strong_branded_domain',
      active:
        input.comparison.classification === 'BRANDED' &&
        input.signals.brandAlignment.branded,
      effect: 'PROTECTIVE',
      dimensions: NEED_AND_CONFIDENCE,
      priority: null,
      category: 'STRONG_BRANDED_DOMAIN',
      message: 'The current domain strongly matches the business brand.',
    }),
    createPolicyRule({
      id: 'compact_branded_domain',
      active:
        input.composition.domainStyle.compactBrandDomain &&
        input.signals.domainComposition.compactBrandDomain,
      effect: 'PROTECTIVE',
      dimensions: NEED_AND_CONFIDENCE,
      priority: null,
      category: 'COMPACT_BRANDED_DOMAIN',
      message: 'The current domain is a compact branded name.',
    }),
    createPolicyRule({
      id: 'domain_legal_suffix',
      active: containsDomainLegalBusinessSuffix(
        input.composition.businessTerms
      ),
      effect: 'OPPORTUNITY',
      dimensions: NEED_AND_IMPACT,
      priority: 'MEDIUM',
      category: 'DOMAIN_CONTAINS_LEGAL_SUFFIX',
      message: 'The domain contains a legal business suffix.',
    }),
    createPolicyRule({
      id: 'keyword_stuffing',
      active: input.composition.domainStyle.keywordStuffedDomain,
      effect: 'OPPORTUNITY',
      dimensions: NEED_AND_IMPACT,
      priority: 'HIGH',
      category: 'KEYWORD_STUFFING_DETECTED',
      message: 'The domain repeats the primary keyword.',
    }),
  ])

  return Object.freeze({
    dimensions: OPPORTUNITY_DIMENSIONS,
    priorities: OPPORTUNITY_PRIORITIES,
    effects: FLIPSCORE_POLICY_EFFECTS,
    rules,
  })
}

export type {
  FlipScoreExplanationCategory,
  FlipScorePolicy,
  FlipScorePolicyEffect,
  FlipScorePolicyInput,
  FlipScorePolicyRule,
  FlipScorePolicyRuleId,
  OpportunityDimension,
  OpportunityPriority,
} from './policy.types'

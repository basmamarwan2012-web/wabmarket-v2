import {
  createBrandAlignmentSignals,
  isCityOnlyDomain,
  isCompactBrandDomain,
  isKeywordOnlyDomain,
} from './signals.helpers'
import type { DomainSignals, DomainSignalsInput } from './signals.types'

export const createDomainSignals = (
  input: DomainSignalsInput
): DomainSignals =>
  Object.freeze({
    domainQuality: Object.freeze({
      nonDotCom: input.analysis.domain.isNonDotCom,
      hasHyphen: input.analysis.domain.hasHyphen,
      hasDigits: input.analysis.domain.hasNumericCharacters,
      hasSubdomain: input.analysis.domain.hasSubdomain,
    }),
    brandAlignment: createBrandAlignmentSignals(
      input.comparison.classification
    ),
    businessNaming: Object.freeze({
      containsLegalSuffix:
        input.analysis.business.containsLegalSuffix,
    }),
    domainComposition: Object.freeze({
      compactBrandDomain: isCompactBrandDomain(
        input.analysis,
        input.comparison
      ),
      keywordOnlyDomain: isKeywordOnlyDomain(input.comparison),
      cityOnlyDomain: isCityOnlyDomain(input.comparison),
    }),
  })

export type {
  BrandAlignmentSignals,
  BusinessNamingSignals,
  DomainCompositionSignals,
  DomainQualitySignals,
  DomainSignals,
  DomainSignalsInput,
} from './signals.types'

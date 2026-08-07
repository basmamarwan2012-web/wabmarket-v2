import type { DomainOpportunityAnalysis } from './analyzer.types'
import type { BrandDomainComparison } from './comparator.types'

export interface DomainSignalsInput {
  readonly analysis: DomainOpportunityAnalysis
  readonly comparison: BrandDomainComparison
}

export interface DomainQualitySignals {
  readonly nonDotCom: boolean
  readonly hasHyphen: boolean
  readonly hasDigits: boolean
  readonly hasSubdomain: boolean
}

export interface BrandAlignmentSignals {
  readonly branded: boolean
  readonly partiallyBranded: boolean
  readonly genericKeyword: boolean
  readonly unrelated: boolean
}

export interface BusinessNamingSignals {
  readonly containsLegalSuffix: boolean
}

export interface DomainCompositionSignals {
  readonly compactBrandDomain: boolean
  readonly keywordOnlyDomain: boolean
  readonly cityOnlyDomain: boolean
}

export interface DomainSignals {
  readonly domainQuality: DomainQualitySignals
  readonly brandAlignment: BrandAlignmentSignals
  readonly businessNaming: BusinessNamingSignals
  readonly domainComposition: DomainCompositionSignals
}

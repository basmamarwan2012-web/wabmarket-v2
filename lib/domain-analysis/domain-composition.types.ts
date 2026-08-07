import type { DomainOpportunityAnalysis } from './analyzer.types'

export interface DomainCompositionInput {
  readonly analysis: DomainOpportunityAnalysis
  readonly primaryKeyword: string
  readonly city: string
}

export interface DomainBusinessTermFacts {
  readonly containsLLC: boolean
  readonly containsINC: boolean
  readonly containsCORP: boolean
  readonly containsCOMPANY: boolean
  readonly containsCO: boolean
}

export interface DomainKeywordCompositionFacts {
  readonly containsPrimaryKeyword: boolean
  readonly containsCity: boolean
}

export interface DomainStructureFacts {
  readonly repeatedKeyword: boolean
  readonly repeatedCity: boolean
  readonly repeatedBusinessToken: boolean
}

export interface DomainStyleFacts {
  readonly compactBrandDomain: boolean
  readonly keywordStuffedDomain: boolean
}

export interface DomainCompositionIntelligence {
  readonly businessTerms: DomainBusinessTermFacts
  readonly keywordComposition: DomainKeywordCompositionFacts
  readonly structure: DomainStructureFacts
  readonly domainStyle: DomainStyleFacts
}

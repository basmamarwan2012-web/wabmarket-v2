export type BusinessLegalSuffix =
  'llc' | 'inc' | 'corp' | 'corporation' | 'ltd' | 'limited' | 'company' | 'co'

export interface DomainAnalyzerInput {
  readonly businessName: string
  readonly domain: string
}

export interface BusinessNameFacts {
  readonly originalBusinessName: string
  readonly normalizedBusinessName: string
  readonly businessTokens: readonly string[]
  readonly businessTokensWithoutLegalSuffixes: readonly string[]
  readonly containsLegalSuffix: boolean
  readonly legalSuffixes: readonly BusinessLegalSuffix[]
}

export interface HostnameParsingFacts {
  readonly hostname: string
  readonly hostnameLabels: readonly string[]
  readonly rightmostLabel: string
  readonly immediateLeftLabel: string | null
  readonly subdomainLabelsCandidate: readonly string[]
  /** Label-count heuristic only; not authoritative without Public Suffix List data. */
  readonly hasSubdomain: boolean
  readonly publicSuffixResolution: 'unavailable'
  readonly authoritativeEtldPlusOne: null
}

export interface DomainFacts extends HostnameParsingFacts {
  readonly originalDomain: string
  readonly domainTokens: readonly string[]
  readonly hostnameLength: number
  readonly isDotCom: boolean
  readonly isNonDotCom: boolean
  readonly hasHyphen: boolean
  readonly hasNumericCharacters: boolean
  readonly hasBasicDomainWeakness: boolean
}

export interface DomainOpportunityAnalysis {
  readonly business: BusinessNameFacts
  readonly domain: DomainFacts
}

export type DomainAnalyzerFailureReason =
  'invalid_input' | 'invalid_business_name' | 'invalid_hostname'

export type DomainAnalyzerResult =
  | {
      readonly success: true
      readonly analysis: DomainOpportunityAnalysis
    }
  | {
      readonly success: false
      readonly reason: DomainAnalyzerFailureReason
    }

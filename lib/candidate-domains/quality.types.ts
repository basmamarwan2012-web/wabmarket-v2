import type { DomainAvailabilityResult } from '../domain-availability/types'
import type { GeneratedCandidateDomain } from './generator.types'
import type { CandidateDomainPatternId } from './patterns'

export const CANDIDATE_SELECTION_TIERS = Object.freeze([
  'PREFERRED',
  'ACCEPTABLE',
  'WEAK',
  'REJECT',
] as const)

export type CandidateSelectionTier =
  (typeof CANDIDATE_SELECTION_TIERS)[number]

export type CandidateTokenOrder =
  | 'BUSINESS_ORDER'
  | 'CITY_FIRST'
  | 'KEYWORD_FIRST'
  | 'GENERIC_SUFFIX'
  | 'OTHER'

export type CandidateCompactness = 'COMPACT' | 'MODERATE' | 'LONG'

export interface CandidateDomainQualityFacts {
  readonly isDotCom: boolean
  readonly hasNoHyphen: boolean
  readonly hasNoInventedDigits: boolean
  readonly hostnameLength: number
  readonly labelLength: number
  readonly matchesDeclaredPattern: boolean
  readonly hasDistinctiveBrandTokens: boolean
  readonly containsDistinctiveBrandEvidence: boolean
  readonly exactBrandCoverage: boolean
  readonly keywordCoverage: boolean
  readonly cityCoverage: boolean
  readonly tokenOrder: CandidateTokenOrder
  readonly usesUnnecessaryGenericWord: boolean
  readonly hasRepeatedTokens: boolean
  readonly compactness: CandidateCompactness
}

export interface CandidateDomainQualityContext {
  readonly businessName: string
  readonly primaryKeyword: string
  readonly city: string
}

export interface CandidateDomainQualityInput
  extends CandidateDomainQualityContext {
  readonly candidate: GeneratedCandidateDomain
  readonly availability?: DomainAvailabilityResult | null
}

export interface CandidateDomainQualityResult {
  readonly hostname: string
  readonly patternId: CandidateDomainPatternId
  readonly qualityFacts: CandidateDomainQualityFacts
  readonly selectionTier: CandidateSelectionTier
  /** Optional passthrough fact; never used for quality or ordering. */
  readonly availability: DomainAvailabilityResult | null
}

export interface CandidateDomainSelectionInput
  extends CandidateDomainQualityContext {
  readonly candidates: readonly GeneratedCandidateDomain[]
  readonly availabilityFacts?: readonly DomainAvailabilityResult[]
}

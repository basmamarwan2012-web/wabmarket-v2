import type { CandidateDomainPatternId } from './patterns'

export interface CandidateDomainGeneratorInput {
  readonly businessName: string
  readonly primaryKeyword: string
  readonly city: string
  readonly country?: string | null
}

export interface GeneratedCandidateDomain {
  readonly hostname: string
  readonly patternId: CandidateDomainPatternId
}

export interface CandidateDomainGenerationResult {
  readonly candidates: readonly GeneratedCandidateDomain[]
}

export interface NormalizedCandidateDomainContext {
  readonly brandTokens: readonly string[]
  readonly keywordTokens: readonly string[]
  readonly cityTokens: readonly string[]
}

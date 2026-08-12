import { normalizeBusinessName } from '../domain-analysis/analyzer.helpers'
import { detectBusinessLegalSuffixes } from '../domain-analysis/rules'
import { tokenizeNormalizedBusinessName } from '../domain-analysis/tokenizer'
import type {
  CandidateDomainGeneratorInput,
  NormalizedCandidateDomainContext,
} from './generator.types'
import type { CandidateDomainPatternSegment } from './patterns'

export const MAXIMUM_CANDIDATE_LABEL_LENGTH = 32

const normalizeRequiredTokens = (
  value: unknown,
  allowDigits: boolean
) => {
  const normalized = normalizeBusinessName(value)
  if (!normalized) return null

  const tokens = tokenizeNormalizedBusinessName(normalized)
  const tokenPattern = allowDigits ? /^[a-z0-9]+$/ : /^[a-z]+$/
  return tokens.length > 0 && tokens.every((token) => tokenPattern.test(token))
    ? tokens
    : null
}

export const normalizeCandidateDomainContext = (
  input: CandidateDomainGeneratorInput
): NormalizedCandidateDomainContext | null => {
  if (!input || typeof input !== 'object') return null

  const businessTokens = normalizeRequiredTokens(input.businessName, true)
  const keywordTokens = normalizeRequiredTokens(input.primaryKeyword, false)
  const cityTokens = normalizeRequiredTokens(input.city, false)
  if (!businessTokens || !keywordTokens || !cityTokens) return null

  if (
    input.country !== undefined &&
    input.country !== null &&
    !normalizeBusinessName(input.country)
  )
    return null

  const legalSuffixFacts = detectBusinessLegalSuffixes(businessTokens)
  if (legalSuffixFacts.tokensWithoutLegalSuffixes.length === 0) return null

  return Object.freeze({
    brandTokens: Object.freeze([
      ...legalSuffixFacts.tokensWithoutLegalSuffixes,
    ]),
    keywordTokens: Object.freeze([...keywordTokens]),
    cityTokens: Object.freeze([...cityTokens]),
  })
}

const tokensForSegment = (
  segment: CandidateDomainPatternSegment,
  context: NormalizedCandidateDomainContext
) => {
  if (segment === 'brand') return context.brandTokens
  if (segment === 'keyword') return context.keywordTokens
  if (segment === 'city') return context.cityTokens
  return Object.freeze([segment])
}

/**
 * Composes only explicit normalized tokens. Exact repeats are retained at their
 * first position so patterns cannot create roofingroofing or miamimiami forms.
 */
export const composeCandidateLabel = (
  segments: readonly CandidateDomainPatternSegment[],
  context: NormalizedCandidateDomainContext
) => {
  const composedTokens: string[] = []
  const seenTokens = new Set<string>()

  for (const segment of segments) {
    for (const token of tokensForSegment(segment, context)) {
      if (seenTokens.has(token)) continue
      seenTokens.add(token)
      composedTokens.push(token)
    }
  }

  const label = composedTokens.join('')
  return isValidCandidateLabel(label) ? label : null
}

export const isValidCandidateLabel = (label: string) =>
  label.length > 0 &&
  label.length <= MAXIMUM_CANDIDATE_LABEL_LENGTH &&
  /^[a-z0-9]+$/.test(label)

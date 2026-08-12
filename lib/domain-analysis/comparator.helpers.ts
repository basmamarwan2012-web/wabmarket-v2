import { normalizeBusinessName } from './analyzer.helpers'
import {
  tokenizeHostnameLabels,
  tokenizeNormalizedBusinessName,
} from './tokenizer'

const NON_BRAND_TOKENS = new Set([
  'service',
  'services',
  'roofing',
  'company',
  'solutions',
  'group',
  'llc',
  'inc',
  'corp',
  'corporation',
  'ltd',
  'limited',
  'co',
])

const uniqueTokens = (tokens: readonly string[]) =>
  Object.freeze([...new Set(tokens)])

export const normalizeComparatorTokens = (value: unknown) => {
  const normalized = normalizeBusinessName(value)
  return normalized
    ? uniqueTokens(tokenizeNormalizedBusinessName(normalized))
    : null
}

export const containsEveryToken = (
  haystack: ReadonlySet<string>,
  needles: readonly string[]
) => needles.length > 0 && needles.every((token) => haystack.has(token))

export const getDomainStemTokens = (
  immediateLeftLabel: string,
  rightmostLabel: string
) => tokenizeHostnameLabels([immediateLeftLabel, rightmostLabel])

export const compactTokens = (tokens: readonly string[]) => tokens.join('')

export interface ControlledBusinessStemMatch {
  readonly kind: 'EXACT' | 'NUMERIC_SUFFIX'
  readonly matchedTokens: readonly string[]
}

const hasAnalyzerConfirmedTrailingLegalSuffixes = (
  businessTokens: readonly string[],
  businessTokensWithoutLegalSuffixes: readonly string[],
  legalSuffixes: readonly string[]
) =>
  legalSuffixes.length > 0 &&
  businessTokens.length ===
    businessTokensWithoutLegalSuffixes.length + legalSuffixes.length &&
  legalSuffixes.every(
    (suffix, index) =>
      businessTokens[businessTokensWithoutLegalSuffixes.length + index] ===
      suffix
  )

/**
 * Matches only complete, anchored compact forms derived from known business
 * tokens. A remainder is accepted only when it is non-empty and entirely
 * numeric; unmatched alphabetic text is never inferred.
 */
export const matchControlledBusinessStem = (
  compactDomainStem: string,
  businessTokensWithoutLegalSuffixes: readonly string[],
  businessTokens: readonly string[],
  legalSuffixes: readonly string[]
): ControlledBusinessStemMatch | null => {
  const controlledForms: ReadonlyArray<readonly string[]> = [
    businessTokensWithoutLegalSuffixes,
    ...(hasAnalyzerConfirmedTrailingLegalSuffixes(
      businessTokens,
      businessTokensWithoutLegalSuffixes,
      legalSuffixes
    )
      ? [businessTokens]
      : []),
  ]

  for (const matchedTokens of controlledForms) {
    const compactForm = compactTokens(matchedTokens)
    if (compactForm && compactDomainStem === compactForm)
      return Object.freeze({
        kind: 'EXACT',
        matchedTokens: Object.freeze([...matchedTokens]),
      })
  }

  for (const matchedTokens of controlledForms) {
    const compactForm = compactTokens(matchedTokens)
    if (!compactForm || !compactDomainStem.startsWith(compactForm)) continue

    const remainder = compactDomainStem.slice(compactForm.length)
    if (/^\d+$/.test(remainder))
      return Object.freeze({
        kind: 'NUMERIC_SUFFIX',
        matchedTokens: Object.freeze([...matchedTokens]),
      })
  }

  return null
}

export const createContiguousTokenSequences = (tokens: readonly string[]) => {
  const sequences: ReadonlyArray<readonly string[]> = tokens.flatMap(
    (_, startIndex) =>
      tokens
        .slice(startIndex)
        .map((__, offset) =>
          Object.freeze(tokens.slice(startIndex, startIndex + offset + 1))
        )
  )
  return Object.freeze(sequences)
}

export const createContextTokenSequences = (
  primaryKeywordTokens: readonly string[],
  cityTokens: readonly string[]
) =>
  Object.freeze([
    Object.freeze([...primaryKeywordTokens]),
    Object.freeze([...cityTokens]),
    Object.freeze([...primaryKeywordTokens, ...cityTokens]),
    Object.freeze([...cityTokens, ...primaryKeywordTokens]),
  ])

export const findWholeStemSequenceMatches = (
  compactDomainStem: string,
  sequences: readonly (readonly string[])[]
) =>
  Object.freeze(
    sequences.filter(
      (sequence) =>
        sequence.length > 0 && compactTokens(sequence) === compactDomainStem
    )
  )

export const getBrandTokens = (
  businessTokens: readonly string[],
  primaryKeywordTokens: readonly string[],
  cityTokens: readonly string[]
) => {
  const contextualTokens = new Set([
    ...primaryKeywordTokens,
    ...cityTokens,
  ])

  return uniqueTokens(
    businessTokens.filter(
      (token) =>
        !contextualTokens.has(token) && !NON_BRAND_TOKENS.has(token)
    )
  )
}

export const containsOnlyGenericTokens = (
  domainTokens: readonly string[],
  primaryKeywordTokens: readonly string[],
  cityTokens: readonly string[]
) => {
  if (domainTokens.length === 0) return false
  const contextualTokens = new Set([
    ...primaryKeywordTokens,
    ...cityTokens,
  ])

  return domainTokens.every(
    (token) => contextualTokens.has(token) || NON_BRAND_TOKENS.has(token)
  )
}

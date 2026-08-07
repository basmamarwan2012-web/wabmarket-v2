import { normalizeBusinessName } from './analyzer.helpers'
import {
  tokenizeHostnameLabels,
  tokenizeNormalizedBusinessName,
} from './tokenizer'

export const CONTROLLED_DOMAIN_BUSINESS_TERMS = Object.freeze([
  'llc',
  'inc',
  'corp',
  'company',
  'co',
] as const)

const uniqueTokens = (tokens: readonly string[]) =>
  Object.freeze([...new Set(tokens)])

export const normalizeCompositionContextTokens = (value: unknown) => {
  const normalized = normalizeBusinessName(value)
  return normalized
    ? uniqueTokens(tokenizeNormalizedBusinessName(normalized))
    : null
}

export const getCompositionDomainStemTokens = (
  immediateLeftLabel: string,
  rightmostLabel: string
) => tokenizeHostnameLabels([immediateLeftLabel, rightmostLabel])

const sortVocabulary = (tokens: readonly string[]) =>
  [...new Set(tokens)]
    .filter(Boolean)
    .sort(
      (left, right) =>
        right.length - left.length || left.localeCompare(right)
    )

/**
 * Segments only when the entire value can be represented by controlled known
 * tokens. Tokens may repeat, but unmatched prefixes or suffixes fail closed.
 */
export const segmentControlledCompactToken = (
  value: string,
  vocabulary: readonly string[]
): readonly string[] | null => {
  const orderedVocabulary = sortVocabulary(vocabulary)
  const memo = new Map<number, readonly string[] | null>()

  const visit = (offset: number): readonly string[] | null => {
    if (offset === value.length) return Object.freeze([])
    if (memo.has(offset)) return memo.get(offset) ?? null

    for (const token of orderedVocabulary) {
      if (!value.startsWith(token, offset)) continue
      const remainder = visit(offset + token.length)
      if (remainder) {
        const result = Object.freeze([token, ...remainder])
        memo.set(offset, result)
        return result
      }
    }

    memo.set(offset, null)
    return null
  }

  return value ? visit(0) : null
}

export const recognizeControlledDomainTokens = (
  domainStemTokens: readonly string[],
  vocabulary: readonly string[]
) => {
  const recognized = domainStemTokens.flatMap((token) => {
    if (vocabulary.includes(token)) return [token]
    return segmentControlledCompactToken(token, vocabulary) ?? []
  })
  return Object.freeze(recognized)
}

export const containsTokenSequence = (
  tokens: readonly string[],
  sequence: readonly string[]
) => countTokenSequence(tokens, sequence) > 0

export const countTokenSequence = (
  tokens: readonly string[],
  sequence: readonly string[]
) => {
  if (sequence.length === 0 || sequence.length > tokens.length) return 0
  let count = 0

  for (let index = 0; index <= tokens.length - sequence.length; ) {
    const matches = sequence.every(
      (token, offset) => tokens[index + offset] === token
    )
    if (matches) {
      count += 1
      index += sequence.length
    } else {
      index += 1
    }
  }

  return count
}

export const hasRepeatedKnownToken = (
  tokens: readonly string[],
  knownTokens: readonly string[]
) => {
  const counts = new Map<string, number>()
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
  return knownTokens.some((token) => (counts.get(token) ?? 0) > 1)
}

export const isControlledCompactBusinessDomain = (
  compactStem: string,
  domainStemTokens: readonly string[],
  businessTokens: readonly string[]
) => {
  if (domainStemTokens.length !== 1 || businessTokens.length < 2) return false

  for (let start = 0; start < businessTokens.length - 1; start += 1) {
    for (let end = start + 2; end <= businessTokens.length; end += 1) {
      if (businessTokens.slice(start, end).join('') === compactStem) return true
    }
  }

  return false
}

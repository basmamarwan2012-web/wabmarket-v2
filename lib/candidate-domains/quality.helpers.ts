import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import {
  freezeDomainAvailabilityResult,
  isDomainAvailabilityStatus,
} from '../domain-availability/helpers'
import type { DomainAvailabilityResult } from '../domain-availability/types'
import {
  composeCandidateLabel,
  MAXIMUM_CANDIDATE_LABEL_LENGTH,
  normalizeCandidateDomainContext,
} from './generator.helpers'
import type {
  CandidateDomainQualityContext,
  CandidateDomainQualityFacts,
  CandidateCompactness,
  CandidateSelectionTier,
  CandidateTokenOrder,
} from './quality.types'
import {
  APPROVED_CANDIDATE_GENERIC_WORDS,
  CANDIDATE_DOMAIN_PATTERNS,
  type CandidateDomainPattern,
  type CandidateDomainPatternId,
  type CandidateDomainPatternSegment,
} from './patterns'

export interface CandidateQualityAnalysisContext {
  readonly brandTokens: readonly string[]
  readonly keywordTokens: readonly string[]
  readonly cityTokens: readonly string[]
  readonly distinctiveBrandTokens: readonly string[]
  readonly businessTokenSet: ReadonlySet<string>
  readonly allowedDigitRuns: ReadonlySet<string>
}

export const resolveCandidateQualityContext = (
  input: CandidateDomainQualityContext
): CandidateQualityAnalysisContext | null => {
  const context = normalizeCandidateDomainContext({
    businessName: input.businessName,
    primaryKeyword: input.primaryKeyword,
    city: input.city,
  })
  if (!context) return null

  const genericWords = new Set<string>(APPROVED_CANDIDATE_GENERIC_WORDS)
  const contextualTokens = new Set([
    ...context.keywordTokens,
    ...context.cityTokens,
  ])
  const distinctiveBrandTokens = context.brandTokens.filter(
    (token) => !contextualTokens.has(token) && !genericWords.has(token)
  )
  const allowedDigitRuns = context.brandTokens.flatMap(
    (token) => token.match(/\d+/g) ?? []
  )

  return Object.freeze({
    brandTokens: context.brandTokens,
    keywordTokens: context.keywordTokens,
    cityTokens: context.cityTokens,
    distinctiveBrandTokens: Object.freeze(distinctiveBrandTokens),
    businessTokenSet: new Set(context.brandTokens),
    allowedDigitRuns: new Set(allowedDigitRuns),
  })
}

export const resolveCandidatePattern = (
  patternId: CandidateDomainPatternId
): CandidateDomainPattern | null =>
  CANDIDATE_DOMAIN_PATTERNS.find((pattern) => pattern.id === patternId) ?? null

const tokensForSegment = (
  segment: CandidateDomainPatternSegment,
  context: CandidateQualityAnalysisContext
) => {
  if (segment === 'brand') return context.brandTokens
  if (segment === 'keyword') return context.keywordTokens
  if (segment === 'city') return context.cityTokens
  return Object.freeze([segment])
}

export const composeDeclaredCandidateTokens = (
  pattern: CandidateDomainPattern,
  context: CandidateQualityAnalysisContext
) => {
  const tokens: string[] = []
  const seen = new Set<string>()
  for (const segment of pattern.segments) {
    for (const token of tokensForSegment(segment, context)) {
      if (seen.has(token)) continue
      seen.add(token)
      tokens.push(token)
    }
  }
  return Object.freeze(tokens)
}

export const resolveCandidateTokenOrder = (
  pattern: CandidateDomainPattern,
  matchesDeclaredPattern: boolean
): CandidateTokenOrder => {
  if (!matchesDeclaredPattern) return 'OTHER'
  const first = pattern.segments[0]
  const last = pattern.segments.at(-1)
  if (
    last !== undefined &&
    APPROVED_CANDIDATE_GENERIC_WORDS.includes(
      last as (typeof APPROVED_CANDIDATE_GENERIC_WORDS)[number]
    )
  )
    return 'GENERIC_SUFFIX'
  if (first === 'brand') return 'BUSINESS_ORDER'
  if (first === 'city') return 'CITY_FIRST'
  if (first === 'keyword') return 'KEYWORD_FIRST'
  return 'OTHER'
}

export const resolveCandidateCompactness = (
  labelLength: number
): CandidateCompactness => {
  if (labelLength <= 18) return 'COMPACT'
  if (labelLength <= 24) return 'MODERATE'
  return 'LONG'
}

const countTokens = (tokens: readonly string[]) => {
  const counts = new Map<string, number>()
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1)
  return counts
}

const findControlledTokenization = (
  label: string,
  knownTokens: readonly string[]
): readonly string[] | null => {
  const tokens = [...new Set(knownTokens)]
    .filter(Boolean)
    .sort((left, right) => right.length - left.length || left.localeCompare(right))
  const memo = new Map<number, readonly string[] | null>()

  const visit = (offset: number): readonly string[] | null => {
    if (offset === label.length) return Object.freeze([])
    if (memo.has(offset)) return memo.get(offset) ?? null

    for (const token of tokens) {
      if (!label.startsWith(token, offset)) continue
      const suffix = visit(offset + token.length)
      if (!suffix) continue
      const resolved = Object.freeze([token, ...suffix])
      memo.set(offset, resolved)
      return resolved
    }
    memo.set(offset, null)
    return null
  }

  return visit(0)
}

export const detectControlledRepeatedTokens = (
  label: string,
  knownTokens: readonly string[]
) => {
  const tokenization = findControlledTokenization(label, knownTokens)
  if (!tokenization) return false
  return [...countTokens(tokenization).values()].some((count) => count > 1)
}

const containsAll = (haystack: readonly string[], needles: readonly string[]) => {
  const tokens = new Set(haystack)
  return needles.every((token) => tokens.has(token))
}

export const buildCandidateQualityFacts = (input: Readonly<{
  rawHostname: string
  pattern: CandidateDomainPattern
  context: CandidateQualityAnalysisContext
}>): CandidateDomainQualityFacts => {
  const normalizedHostname = normalizeHostname(input.rawHostname)
  const safeHostname =
    typeof input.rawHostname === 'string'
      ? input.rawHostname.normalize('NFKC').trim().toLowerCase().replace(/\.$/, '')
      : ''
  const hostname = normalizedHostname ?? safeHostname
  const labels = hostname.split('.')
  const label = labels.length >= 2 ? labels.slice(0, -1).join('.') : hostname
  const declaredTokens = composeDeclaredCandidateTokens(input.pattern, input.context)
  const expectedLabel = composeCandidateLabel(input.pattern.segments, {
    brandTokens: input.context.brandTokens,
    keywordTokens: input.context.keywordTokens,
    cityTokens: input.context.cityTokens,
  })
  const matchesDeclaredPattern =
    normalizedHostname !== null &&
    expectedLabel !== null &&
    normalizedHostname === `${expectedLabel}.com`
  const evidenceTokens = matchesDeclaredPattern
    ? declaredTokens
    : (findControlledTokenization(label, [
        ...input.context.brandTokens,
        ...input.context.keywordTokens,
        ...input.context.cityTokens,
        ...APPROVED_CANDIDATE_GENERIC_WORDS,
      ]) ?? Object.freeze([]))
  const distinctiveEvidenceCount = input.context.distinctiveBrandTokens.filter(
    (token) => evidenceTokens.includes(token)
  ).length
  const digitRuns = hostname.match(/\d+/g) ?? []
  const patternGenericWord = input.pattern.segments.find((segment) =>
    APPROVED_CANDIDATE_GENERIC_WORDS.includes(
      segment as (typeof APPROVED_CANDIDATE_GENERIC_WORDS)[number]
    )
  )

  return Object.freeze({
    isDotCom:
      normalizedHostname !== null &&
      normalizedHostname.endsWith('.com') &&
      normalizedHostname.split('.').length === 2,
    hasNoHyphen: !hostname.includes('-'),
    hasNoInventedDigits: digitRuns.every((run) =>
      input.context.allowedDigitRuns.has(run)
    ),
    hostnameLength: hostname.length,
    labelLength: label.length,
    matchesDeclaredPattern,
    hasDistinctiveBrandTokens:
      input.context.distinctiveBrandTokens.length > 0,
    containsDistinctiveBrandEvidence: distinctiveEvidenceCount > 0,
    exactBrandCoverage:
      input.context.distinctiveBrandTokens.length > 0 &&
      distinctiveEvidenceCount === input.context.distinctiveBrandTokens.length,
    keywordCoverage: containsAll(evidenceTokens, input.context.keywordTokens),
    cityCoverage: containsAll(evidenceTokens, input.context.cityTokens),
    tokenOrder: resolveCandidateTokenOrder(
      input.pattern,
      matchesDeclaredPattern
    ),
    usesUnnecessaryGenericWord:
      patternGenericWord !== undefined &&
      !input.context.businessTokenSet.has(patternGenericWord),
    hasRepeatedTokens: detectControlledRepeatedTokens(label, [
      ...input.context.brandTokens,
      ...input.context.keywordTokens,
      ...input.context.cityTokens,
      ...APPROVED_CANDIDATE_GENERIC_WORDS,
    ]),
    compactness: resolveCandidateCompactness(label.length),
  })
}

export const selectCandidateTier = (
  facts: CandidateDomainQualityFacts
): CandidateSelectionTier => {
  const integrityFailure =
    !facts.isDotCom ||
    !facts.hasNoHyphen ||
    !facts.hasNoInventedDigits ||
    facts.labelLength > MAXIMUM_CANDIDATE_LABEL_LENGTH ||
    !facts.matchesDeclaredPattern ||
    facts.hasRepeatedTokens ||
    (facts.hasDistinctiveBrandTokens &&
      !facts.containsDistinctiveBrandEvidence)
  if (integrityFailure) return 'REJECT'

  if (!facts.hasDistinctiveBrandTokens) return 'WEAK'
  if (
    facts.exactBrandCoverage &&
    facts.tokenOrder === 'BUSINESS_ORDER' &&
    !facts.usesUnnecessaryGenericWord &&
    facts.compactness !== 'LONG'
  )
    return 'PREFERRED'
  if (
    facts.exactBrandCoverage &&
    facts.tokenOrder === 'CITY_FIRST' &&
    !facts.usesUnnecessaryGenericWord
  )
    return 'ACCEPTABLE'
  return 'WEAK'
}

export const freezeCandidateAvailability = (
  availability: DomainAvailabilityResult | null | undefined,
  hostname: string
): DomainAvailabilityResult | null => {
  if (availability === null || availability === undefined) return null
  const normalized = normalizeHostname(availability.hostname)
  if (
    normalized !== hostname ||
    availability.hostname !== normalized ||
    typeof availability.provider !== 'string' ||
    availability.provider.length === 0 ||
    !isDomainAvailabilityStatus(availability.availabilityStatus) ||
    typeof availability.checkedAt !== 'string' ||
    !Number.isFinite(Date.parse(availability.checkedAt))
  )
    return null
  return freezeDomainAvailabilityResult(availability)
}

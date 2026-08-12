import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import { evaluateCandidateDomainQuality } from './quality'
import type {
  CandidateCompactness,
  CandidateDomainQualityResult,
  CandidateDomainSelectionInput,
  CandidateSelectionTier,
  CandidateTokenOrder,
} from './quality.types'

const tierOrder: Readonly<Record<CandidateSelectionTier, number>> =
  Object.freeze({ PREFERRED: 0, ACCEPTABLE: 1, WEAK: 2, REJECT: 3 })

const tokenOrder: Readonly<Record<CandidateTokenOrder, number>> = Object.freeze({
  BUSINESS_ORDER: 0,
  CITY_FIRST: 1,
  KEYWORD_FIRST: 2,
  GENERIC_SUFFIX: 3,
  OTHER: 4,
})

const compactnessOrder: Readonly<Record<CandidateCompactness, number>> =
  Object.freeze({ COMPACT: 0, MODERATE: 1, LONG: 2 })

export const selectCandidateDomains = (
  input: CandidateDomainSelectionInput
): readonly CandidateDomainQualityResult[] | null => {
  if (!input || typeof input !== 'object' || !Array.isArray(input.candidates))
    return null

  const availabilityByHostname = new Map(
    (input.availabilityFacts ?? []).map((fact) => [
      normalizeHostname(fact.hostname),
      fact,
    ])
  )
  const evaluated = input.candidates.map((candidate, originalIndex) => {
    const result = evaluateCandidateDomainQuality({
      businessName: input.businessName,
      primaryKeyword: input.primaryKeyword,
      city: input.city,
      candidate,
      availability:
        availabilityByHostname.get(normalizeHostname(candidate.hostname)) ?? null,
    })
    return result ? Object.freeze({ result, originalIndex }) : null
  })
  if (evaluated.some((entry) => entry === null)) return null

  return Object.freeze(
    evaluated
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .sort((left, right) => {
        const a = left.result
        const b = right.result
        return (
          tierOrder[a.selectionTier] - tierOrder[b.selectionTier] ||
          Number(b.qualityFacts.exactBrandCoverage) -
            Number(a.qualityFacts.exactBrandCoverage) ||
          tokenOrder[a.qualityFacts.tokenOrder] -
            tokenOrder[b.qualityFacts.tokenOrder] ||
          Number(a.qualityFacts.usesUnnecessaryGenericWord) -
            Number(b.qualityFacts.usesUnnecessaryGenericWord) ||
          compactnessOrder[a.qualityFacts.compactness] -
            compactnessOrder[b.qualityFacts.compactness] ||
          a.qualityFacts.hostnameLength - b.qualityFacts.hostnameLength ||
          left.originalIndex - right.originalIndex
        )
      })
      .map(({ result }) => result)
  )
}

export type { CandidateDomainSelectionInput } from './quality.types'

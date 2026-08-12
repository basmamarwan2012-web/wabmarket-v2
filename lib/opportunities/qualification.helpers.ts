import type { GeneratedCandidateDomain } from '../candidate-domains/generator.types'
import type { CanonicalOpportunity } from './model.types'
import type { ForwardOpportunityQualificationReport } from './qualification.types'

export const FORWARD_QUALIFICATION_MAX_CANDIDATES = 5

export const selectForwardQualificationCandidates = (
  candidates: readonly GeneratedCandidateDomain[],
  providerMaximum: number
): readonly GeneratedCandidateDomain[] => {
  if (!Number.isInteger(providerMaximum) || providerMaximum < 1)
    throw new TypeError('Availability provider candidate capacity is invalid.')

  return Object.freeze(
    candidates.slice(
      0,
      Math.min(FORWARD_QUALIFICATION_MAX_CANDIDATES, providerMaximum)
    )
  )
}

export const freezeForwardQualificationReport = (input: Readonly<{
  generatedCandidateCount: number
  checkedCandidateCount: number
  opportunities: readonly CanonicalOpportunity[]
}>): ForwardOpportunityQualificationReport =>
  Object.freeze({
    generatedCandidateCount: input.generatedCandidateCount,
    checkedCandidateCount: input.checkedCandidateCount,
    availableCandidateCount: input.opportunities.length,
    opportunities: Object.freeze([...input.opportunities]),
  })

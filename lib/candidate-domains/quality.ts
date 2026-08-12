import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import {
  buildCandidateQualityFacts,
  freezeCandidateAvailability,
  resolveCandidatePattern,
  resolveCandidateQualityContext,
  selectCandidateTier,
} from './quality.helpers'
import type {
  CandidateDomainQualityInput,
  CandidateDomainQualityResult,
} from './quality.types'

export const evaluateCandidateDomainQuality = (
  input: CandidateDomainQualityInput
): CandidateDomainQualityResult | null => {
  if (!input || typeof input !== 'object' || !input.candidate) return null
  const context = resolveCandidateQualityContext(input)
  const pattern = resolveCandidatePattern(input.candidate.patternId)
  if (!context || !pattern || typeof input.candidate.hostname !== 'string')
    return null

  const normalizedHostname = normalizeHostname(input.candidate.hostname)
  const hostname =
    normalizedHostname ??
    input.candidate.hostname.normalize('NFKC').trim().toLowerCase()
  const qualityFacts = buildCandidateQualityFacts({
    rawHostname: input.candidate.hostname,
    pattern,
    context,
  })
  const availability = freezeCandidateAvailability(
    input.availability,
    hostname
  )
  if (input.availability !== undefined && input.availability !== null && !availability)
    return null

  return Object.freeze({
    hostname,
    patternId: pattern.id,
    qualityFacts,
    selectionTier: selectCandidateTier(qualityFacts),
    availability,
  })
}

export type {
  CandidateCompactness,
  CandidateDomainQualityContext,
  CandidateDomainQualityFacts,
  CandidateDomainQualityInput,
  CandidateDomainQualityResult,
  CandidateSelectionTier,
  CandidateTokenOrder,
} from './quality.types'

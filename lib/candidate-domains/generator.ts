import {
  composeCandidateLabel,
  normalizeCandidateDomainContext,
} from './generator.helpers'
import type {
  CandidateDomainGenerationResult,
  CandidateDomainGeneratorInput,
  GeneratedCandidateDomain,
} from './generator.types'
import { CANDIDATE_DOMAIN_PATTERNS } from './patterns'

export const generateCandidateDomains = (
  input: CandidateDomainGeneratorInput
): CandidateDomainGenerationResult | null => {
  const context = normalizeCandidateDomainContext(input)
  if (!context) return null

  const seenHostnames = new Set<string>()
  const candidates: GeneratedCandidateDomain[] = []

  for (const pattern of CANDIDATE_DOMAIN_PATTERNS) {
    const label = composeCandidateLabel(pattern.segments, context)
    if (!label) continue

    const hostname = `${label}.com`
    if (seenHostnames.has(hostname)) continue
    seenHostnames.add(hostname)
    candidates.push(
      Object.freeze({ hostname, patternId: pattern.id })
    )
  }

  return Object.freeze({ candidates: Object.freeze(candidates) })
}

export type {
  CandidateDomainGenerationResult,
  CandidateDomainGeneratorInput,
  GeneratedCandidateDomain,
  NormalizedCandidateDomainContext,
} from './generator.types'
export {
  APPROVED_CANDIDATE_GENERIC_WORDS,
  CANDIDATE_DOMAIN_PATTERNS,
} from './patterns'
export type {
  CandidateDomainPattern,
  CandidateDomainPatternId,
  CandidateDomainPatternSegment,
} from './patterns'

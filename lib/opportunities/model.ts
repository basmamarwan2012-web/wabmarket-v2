import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import {
  createCanonicalBusinessIdentity,
  createOpportunityId,
  isCandidateDomainPatternId,
  isCanonicalIsoTimestamp,
  isOpportunityDiscoveryMode,
  normalizeOpportunityDisplayText,
  normalizeOpportunityLocation,
  normalizeOpportunityOptionalLocation,
  normalizeOpportunityPlaceId,
  normalizeOpportunityPrimaryType,
  validateAndFreezeAvailability,
  validateAndFreezeFlipScore,
} from './model.helpers'
import type {
  CanonicalOpportunity,
  CanonicalOpportunityInput,
} from './model.types'

export const createCanonicalOpportunity = (
  input: CanonicalOpportunityInput
): CanonicalOpportunity | null => {
  if (!input || typeof input !== 'object') return null

  const businessName = normalizeOpportunityDisplayText(input.businessName, 512)
  const businessPlaceId = normalizeOpportunityPlaceId(input.businessPlaceId)
  const primaryType = normalizeOpportunityPrimaryType(input.primaryType)
  const city = normalizeOpportunityLocation(input.city)
  const state = normalizeOpportunityOptionalLocation(input.state)
  const country = normalizeOpportunityLocation(input.country)
  const currentHostname = normalizeHostname(input.currentHostname)
  const candidateHostname = normalizeHostname(input.candidateHostname)
  const candidatePatternId = input.candidatePatternId ?? null
  const flipScore = validateAndFreezeFlipScore(input.flipScore)

  if (
    !businessName ||
    businessPlaceId === undefined ||
    primaryType === undefined ||
    !city ||
    state === undefined ||
    !country ||
    !currentHostname ||
    !candidateHostname ||
    (candidatePatternId !== null &&
      !isCandidateDomainPatternId(candidatePatternId)) ||
    !flipScore ||
    !isOpportunityDiscoveryMode(input.discoveryMode) ||
    !isCanonicalIsoTimestamp(input.discoveredAt)
  )
    return null

  const availability = validateAndFreezeAvailability(
    input.availability,
    candidateHostname
  )
  if (!availability) return null

  const businessIdentity = createCanonicalBusinessIdentity({
    businessPlaceId,
    businessName,
    city,
    state,
    country,
  })
  if (!businessIdentity) return null

  return Object.freeze({
    opportunityId: createOpportunityId({
      businessIdentity,
      currentHostname,
      candidateHostname,
    }),
    businessName,
    businessPlaceId,
    primaryType,
    city,
    state,
    country,
    currentHostname,
    candidateHostname,
    candidatePatternId,
    flipScore: flipScore.flipScore,
    priority: flipScore.priority,
    breakdown: flipScore.breakdown,
    reasons: flipScore.reasons,
    availability,
    discoveryMode: input.discoveryMode,
    discoveredAt: input.discoveredAt,
  })
}

export type {
  CanonicalOpportunity,
  CanonicalOpportunityAvailability,
  CanonicalOpportunityBreakdown,
  CanonicalOpportunityInput,
  OpportunityDiscoveryMode,
} from './model.types'

import { createHash } from 'node:crypto'

import { normalizeBusinessName, normalizeHostname } from '../domain-analysis/analyzer.helpers'
import {
  DOMAIN_AVAILABILITY_STATUSES,
  type DomainAvailabilityResult,
} from '../domain-availability/types'
import { FLIPSCORE_PRIORITIES, type FlipScoreResult } from '../flipscore/engine.types'
import { getFlipScorePriority } from '../flipscore/engine.helpers'
import { CANDIDATE_DOMAIN_PATTERNS, type CandidateDomainPatternId } from '../candidate-domains/patterns'
import {
  OPPORTUNITY_DISCOVERY_MODES,
  type CanonicalOpportunityAvailability,
  type CanonicalOpportunityBreakdown,
  type OpportunityDiscoveryMode,
} from './model.types'

const MAXIMUM_PLACE_ID_LENGTH = 1_024
const MAXIMUM_PRIMARY_TYPE_LENGTH = 128
const MAXIMUM_LOCATION_LENGTH = 256
const MAXIMUM_PROVIDER_IDENTIFIER_LENGTH = 128
const MAXIMUM_REASON_LENGTH = 512
const MAXIMUM_REASONS = 64

export const normalizeOpportunityDisplayText = (
  value: unknown,
  maximumLength: number
): string | null => {
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized.length > 0 && normalized.length <= maximumLength
    ? normalized
    : null
}

export const normalizeOpportunityOptionalText = (
  value: unknown,
  maximumLength: number
): string | null | undefined => {
  if (value === null || value === undefined) return null
  return normalizeOpportunityDisplayText(value, maximumLength) ?? undefined
}

export const normalizeOpportunityPlaceId = (
  value: unknown
): string | null | undefined =>
  normalizeOpportunityOptionalText(value, MAXIMUM_PLACE_ID_LENGTH)

export const normalizeOpportunityPrimaryType = (
  value: unknown
): string | null | undefined =>
  normalizeOpportunityOptionalText(value, MAXIMUM_PRIMARY_TYPE_LENGTH)

export const normalizeOpportunityLocation = (value: unknown) =>
  normalizeOpportunityDisplayText(value, MAXIMUM_LOCATION_LENGTH)

export const normalizeOpportunityOptionalLocation = (value: unknown) =>
  normalizeOpportunityOptionalText(value, MAXIMUM_LOCATION_LENGTH)

export const isCanonicalIsoTimestamp = (value: unknown): value is string => {
  if (typeof value !== 'string' || value.length === 0) return false
  const milliseconds = Date.parse(value)
  return Number.isFinite(milliseconds) && new Date(milliseconds).toISOString() === value
}

export const isCandidateDomainPatternId = (
  value: unknown
): value is CandidateDomainPatternId =>
  typeof value === 'string' &&
  CANDIDATE_DOMAIN_PATTERNS.some((pattern) => pattern.id === value)

export const isOpportunityDiscoveryMode = (
  value: unknown
): value is OpportunityDiscoveryMode =>
  OPPORTUNITY_DISCOVERY_MODES.includes(value as OpportunityDiscoveryMode)

const isIntegerInRange = (value: unknown, minimum: number, maximum: number) =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= minimum &&
  value <= maximum

export const validateAndFreezeFlipScore = (
  value: FlipScoreResult
): Readonly<{
  flipScore: number
  priority: FlipScoreResult['priority']
  breakdown: CanonicalOpportunityBreakdown
  reasons: readonly string[]
}> | null => {
  if (!value || typeof value !== 'object') return null
  if (
    !isIntegerInRange(value.needScore, 0, 50) ||
    !isIntegerInRange(value.impactScore, 0, 30) ||
    !isIntegerInRange(value.confidenceScore, 0, 20) ||
    !isIntegerInRange(value.flipScore, 0, 100) ||
    value.flipScore !==
      value.needScore + value.impactScore + value.confidenceScore ||
    !FLIPSCORE_PRIORITIES.includes(value.priority) ||
    getFlipScorePriority(value.flipScore) !== value.priority ||
    !Array.isArray(value.reasons) ||
    value.reasons.length > MAXIMUM_REASONS
  )
    return null

  const reasons: string[] = []
  for (const reason of value.reasons) {
    const normalized = normalizeOpportunityDisplayText(
      reason,
      MAXIMUM_REASON_LENGTH
    )
    if (!normalized) return null
    reasons.push(normalized)
  }

  return Object.freeze({
    flipScore: value.flipScore,
    priority: value.priority,
    breakdown: Object.freeze({
      need: value.needScore,
      impact: value.impactScore,
      confidence: value.confidenceScore,
    }),
    reasons: Object.freeze(reasons),
  })
}

export const validateAndFreezeAvailability = (
  value: DomainAvailabilityResult,
  candidateHostname: string
): CanonicalOpportunityAvailability | null => {
  if (!value || typeof value !== 'object') return null

  const hostname = normalizeHostname(value.hostname)
  const provider = normalizeOpportunityDisplayText(
    value.provider,
    MAXIMUM_PROVIDER_IDENTIFIER_LENGTH
  )
  if (
    !hostname ||
    hostname !== candidateHostname ||
    !provider ||
    !/^[a-z0-9][a-z0-9_-]*$/.test(provider) ||
    provider !== provider.toLowerCase() ||
    !DOMAIN_AVAILABILITY_STATUSES.includes(value.availabilityStatus) ||
    !isCanonicalIsoTimestamp(value.checkedAt)
  )
    return null

  return Object.freeze({
    provider,
    availabilityStatus: value.availabilityStatus,
    checkedAt: value.checkedAt,
  })
}

const encodeIdentityParts = (parts: readonly string[]) =>
  parts.map((part) => `${Buffer.byteLength(part, 'utf8')}:${part}`).join('|')

export const createCanonicalBusinessIdentity = (input: Readonly<{
  businessPlaceId: string | null
  businessName: string
  city: string
  state: string | null
  country: string
}>): string | null => {
  if (input.businessPlaceId !== null)
    return encodeIdentityParts(['place_id', input.businessPlaceId])

  const normalizedBusinessName = normalizeBusinessName(input.businessName)
  const normalizedCity = normalizeBusinessName(input.city)
  const normalizedState =
    input.state === null ? '' : normalizeBusinessName(input.state)
  const normalizedCountry = normalizeBusinessName(input.country)
  if (
    !normalizedBusinessName ||
    !normalizedCity ||
    normalizedState === null ||
    !normalizedCountry
  )
    return null

  return encodeIdentityParts([
    'fallback',
    normalizedBusinessName,
    normalizedCity,
    normalizedState,
    normalizedCountry,
  ])
}

export const createOpportunityId = (input: Readonly<{
  businessIdentity: string
  currentHostname: string
  candidateHostname: string
}>) => {
  const canonicalTuple = encodeIdentityParts([
    'opportunity:v1',
    input.businessIdentity,
    input.currentHostname,
    input.candidateHostname,
  ])
  return `opp_${createHash('sha256').update(canonicalTuple, 'utf8').digest('hex')}`
}

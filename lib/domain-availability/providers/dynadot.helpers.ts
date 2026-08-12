import {
  DOMAIN_AVAILABILITY_FOUNDATION_MAX_CANDIDATES,
  freezeDomainAvailabilityResult,
  normalizeDomainAvailabilityHostname,
} from '../helpers'
import type {
  DomainAvailabilityResult,
  DomainAvailabilityStatus,
} from '../types'

export const DYNADOT_AVAILABILITY_POLICY = Object.freeze({
  maxCandidatesPerLookup: DOMAIN_AVAILABILITY_FOUNDATION_MAX_CANDIDATES,
  timeoutMs: 10_000,
  maxRequestsPerLookup: 1 as const,
  retries: 0,
  pagination: false,
})

interface DynadotDomainEvidence {
  readonly hostname: string | null
  readonly available: boolean | null
  readonly premium: 'yes' | 'no' | 'unknown' | null
  readonly hasDetailError: boolean
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const parseBooleanEvidence = (value: unknown): boolean | null => {
  if (typeof value === 'boolean') return value
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  if (normalized === 'yes' || normalized === 'true') return true
  if (normalized === 'no' || normalized === 'false') return false
  return null
}

const parsePremiumEvidence = (
  value: unknown
): DynadotDomainEvidence['premium'] => {
  if (typeof value !== 'string') return null
  const normalized = value.trim().toLowerCase()
  return normalized === 'yes' ||
    normalized === 'no' ||
    normalized === 'unknown'
    ? normalized
    : null
}

const parseDomainEvidence = (value: unknown): DynadotDomainEvidence => {
  if (!isRecord(value))
    return Object.freeze({
      hostname: null,
      available: null,
      premium: null,
      hasDetailError: false,
    })

  const detailsError = value.details_error_message
  return Object.freeze({
    hostname: normalizeDomainAvailabilityHostname(value.domain_name),
    available: parseBooleanEvidence(value.available),
    premium: parsePremiumEvidence(value.premium),
    hasDetailError:
      typeof detailsError === 'string' && detailsError.trim().length > 0,
  })
}

const resolveStatus = (
  evidence: DynadotDomainEvidence | null
): DomainAvailabilityStatus => {
  if (!evidence || evidence.hasDetailError) return 'UNKNOWN'
  if (evidence.available === false) return 'REGISTERED'
  if (evidence.available === true && evidence.premium === 'no')
    return 'AVAILABLE'
  return 'UNKNOWN'
}

const extractEvidence = (payload: unknown): readonly DynadotDomainEvidence[] => {
  if (!isRecord(payload) || payload.code !== 200 || !isRecord(payload.data))
    return Object.freeze([])

  const records = payload.data.domain_result_list
  if (
    !Array.isArray(records) ||
    records.length > DOMAIN_AVAILABILITY_FOUNDATION_MAX_CANDIDATES
  )
    return Object.freeze([])
  return Object.freeze(records.map(parseDomainEvidence))
}

export const mapDynadotAvailabilityResults = (
  payload: unknown,
  requestedHostnames: readonly string[],
  checkedAt: string
): readonly DomainAvailabilityResult[] => {
  const evidence = extractEvidence(payload)

  return Object.freeze(
    requestedHostnames.map((hostname) => {
      const matches = evidence.filter((item) => item.hostname === hostname)
      return freezeDomainAvailabilityResult({
        hostname,
        provider: 'dynadot',
        availabilityStatus:
          matches.length === 1 ? resolveStatus(matches[0]) : 'UNKNOWN',
        checkedAt,
      })
    })
  )
}

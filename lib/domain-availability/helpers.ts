import {
  DOMAIN_AVAILABILITY_STATUSES,
  type DomainAvailabilityResult,
  type DomainAvailabilityStatus,
} from './types'

export const DOMAIN_AVAILABILITY_FOUNDATION_MAX_CANDIDATES = 5

const hostnameLabelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/

export const normalizeDomainAvailabilityHostname = (
  value: unknown
): string | null => {
  if (typeof value !== 'string') return null

  const lowered = value.trim().toLowerCase()
  const hostname = lowered.endsWith('.') ? lowered.slice(0, -1) : lowered
  if (
    !hostname ||
    hostname.length > 253 ||
    hostname.includes('://') ||
    hostname.includes('/') ||
    hostname.includes(':') ||
    /\s/.test(hostname)
  )
    return null

  const labels = hostname.split('.')
  if (
    labels.length < 2 ||
    labels.some(
      (label) =>
        label.length === 0 ||
        label.length > 63 ||
        !hostnameLabelPattern.test(label)
    )
  )
    return null

  const topLevelLabel = labels.at(-1)
  if (!topLevelLabel || /^\d+$/.test(topLevelLabel)) return null

  return hostname
}

export const normalizeOrderedCandidateHostnames = (
  values: readonly string[],
  maximumCount: number
): readonly string[] | null => {
  if (
    !Array.isArray(values) ||
    !Number.isInteger(maximumCount) ||
    maximumCount < 1 ||
    values.length < 1 ||
    values.length > maximumCount
  )
    return null

  const normalized: string[] = []
  const seen = new Set<string>()

  for (const value of values) {
    const hostname = normalizeDomainAvailabilityHostname(value)
    if (!hostname || seen.has(hostname)) return null
    seen.add(hostname)
    normalized.push(hostname)
  }

  return Object.freeze(normalized)
}

export const isDomainAvailabilityStatus = (
  value: unknown
): value is DomainAvailabilityStatus =>
  DOMAIN_AVAILABILITY_STATUSES.includes(value as DomainAvailabilityStatus)

export const freezeDomainAvailabilityResult = (
  result: DomainAvailabilityResult
): DomainAvailabilityResult =>
  Object.freeze({
    hostname: result.hostname,
    provider: result.provider,
    availabilityStatus: result.availabilityStatus,
    checkedAt: result.checkedAt,
  })

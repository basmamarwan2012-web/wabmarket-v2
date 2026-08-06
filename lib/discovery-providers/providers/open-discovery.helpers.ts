import type {
  DiscoveryProviderRequest,
  DiscoverySearchMode,
} from '@/types/discovery-provider'

export const OPEN_DISCOVERY_SUPPORTED_MODES = Object.freeze([
  'business_upgrade',
  'local_seo',
] as const satisfies readonly DiscoverySearchMode[])

const normalizeWhitespace = (value: unknown) => {
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized || null
}

export const normalizeOpenDiscoveryKeyword = (value: unknown) =>
  normalizeWhitespace(value)

export const normalizeOpenDiscoveryLocation = (value: unknown) =>
  normalizeWhitespace(value)

const isOptionalTextValid = (value: unknown) =>
  value === null || value === undefined || normalizeWhitespace(value) !== null

export const isOpenDiscoveryRequestSupported = (
  request: DiscoveryProviderRequest
) => {
  if (
    !OPEN_DISCOVERY_SUPPORTED_MODES.includes(
      request.mode as (typeof OPEN_DISCOVERY_SUPPORTED_MODES)[number]
    )
  )
    return false

  const { keyword, city, country, state, language, maxResults } =
    request.criteria
  if (
    !normalizeOpenDiscoveryKeyword(keyword) ||
    !normalizeOpenDiscoveryLocation(city) ||
    !normalizeOpenDiscoveryLocation(country)
  )
    return false
  if (!isOptionalTextValid(state) || !isOptionalTextValid(language))
    return false
  if (
    maxResults !== null &&
    maxResults !== undefined &&
    (!Number.isInteger(maxResults) || maxResults < 1)
  )
    return false
  return true
}

export const normalizeOpenDiscoveryHostname = (value: unknown) => {
  if (typeof value !== 'string') return null
  const candidate = value.trim()
  if (!candidate) return null

  try {
    const url = new URL(
      /^[A-Za-z][A-Za-z\d+.-]*:\/\//.test(candidate)
        ? candidate
        : `https://${candidate}`
    )
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null
    const hostname = url.hostname.toLowerCase().replace(/\.$/, '')
    return hostname || null
  } catch {
    return null
  }
}

export const isOpenDiscoverySourceRecord = (
  value: unknown
): value is Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

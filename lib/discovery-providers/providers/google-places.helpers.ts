import type { DiscoveryProviderRequest } from '@/types/discovery-provider'
import type {
  GooglePlacesDomainAnalysis,
  GooglePlacesSearchCriteria,
} from './google-places.types'
import { resolveGooglePlacesMaxResults } from './google-places.usage-policy'

const normalizeText = (value: unknown, maximumLength = 160) => {
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized.length > 0 && normalized.length <= maximumLength
    ? normalized
    : null
}

const normalizeOptionalText = (value: unknown) => {
  if (value === null || value === undefined) return null
  return normalizeText(value)
}

const normalizeLanguage = (value: unknown) => {
  const language = normalizeOptionalText(value)
  if (language === null) return null

  try {
    const canonical = Intl.getCanonicalLocales(language)
    return canonical.length === 1 ? canonical[0] : null
  } catch {
    return null
  }
}

const hasUnsupportedCriteria = (request: DiscoveryProviderRequest) => {
  const { currentDomain, candidateDomain, extensions } = request.criteria
  return (
    (currentDomain !== null && currentDomain !== undefined) ||
    (candidateDomain !== null && candidateDomain !== undefined) ||
    (extensions !== undefined && extensions.length > 0)
  )
}

export const getGooglePlacesSearchCriteria = (
  request: DiscoveryProviderRequest
): GooglePlacesSearchCriteria | null => {
  if (request.mode !== 'business_upgrade' || hasUnsupportedCriteria(request))
    return null

  const keyword = normalizeText(request.criteria.keyword)
  const city = normalizeText(request.criteria.city)
  const country = normalizeText(request.criteria.country)
  const stateWasProvided =
    request.criteria.state !== null && request.criteria.state !== undefined
  const state = normalizeOptionalText(request.criteria.state)
  const languageWasProvided =
    request.criteria.language !== null &&
    request.criteria.language !== undefined
  const language = normalizeLanguage(request.criteria.language)
  const maxResults = resolveGooglePlacesMaxResults(request.criteria.maxResults)

  if (
    !keyword ||
    !city ||
    !country ||
    (stateWasProvided && !state) ||
    (languageWasProvided && !language) ||
    maxResults === null
  )
    return null

  const location = [city, state, country].filter(Boolean).join(', ')
  return Object.freeze({
    keyword,
    city,
    state,
    country,
    language,
    maxResults,
    textQuery: `${keyword} in ${location}`,
  })
}

const isValidHostname = (hostname: string) => {
  if (hostname.length > 253 || !hostname.includes('.')) return false
  const labels = hostname.split('.')
  return labels.every(
    (label) =>
      label.length > 0 &&
      label.length <= 63 &&
      /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i.test(label)
  )
}

export const normalizeGooglePlacesWebsite = (value: unknown) => {
  if (typeof value !== 'string') return null

  try {
    const url = new URL(value.trim())
    if (
      (url.protocol !== 'http:' && url.protocol !== 'https:') ||
      url.username ||
      url.password
    )
      return null

    const normalizedHostname = url.hostname
      .toLowerCase()
      .replace(/\.$/, '')
      .replace(/^www\./, '')
    if (!isValidHostname(normalizedHostname)) return null

    return Object.freeze({
      websiteUri: url.toString(),
      normalizedHostname,
    })
  } catch {
    return null
  }
}

/**
 * Conservative hostname-only analysis. It does not calculate registrable
 * eTLD+1 boundaries and must not be treated as an opportunity decision.
 */
export const analyzeGooglePlacesHostname = (
  normalizedHostname: string
): GooglePlacesDomainAnalysis => {
  const isDotCom = normalizedHostname.endsWith('.com')
  const isNonDotCom = !isDotCom
  const hasHyphen = normalizedHostname.includes('-')
  return Object.freeze({
    isDotCom,
    isNonDotCom,
    hasHyphen,
    hasBasicDomainWeakness: isNonDotCom || hasHyphen,
  })
}

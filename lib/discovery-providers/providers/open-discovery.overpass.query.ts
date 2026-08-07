import type {
  DiscoveryProviderRequest,
  DiscoverySearchMode,
} from '@/types/discovery-provider'
import {
  normalizeOpenDiscoveryKeyword,
  normalizeOpenDiscoveryLocation,
} from './open-discovery.helpers'

export const OPEN_DISCOVERY_OVERPASS_SUPPORTED_MODES = Object.freeze([
  'business_upgrade',
] as const satisfies readonly DiscoverySearchMode[])

export const OPEN_DISCOVERY_OVERPASS_SERVER_TIMEOUT_SECONDS = 20
export const OPEN_DISCOVERY_OVERPASS_RESULT_LIMIT = 25
export const OPEN_DISCOVERY_OVERPASS_SEARCH_BRANCH_COUNT = 4

export interface OpenDiscoveryOverpassCriteria {
  readonly keyword: string
  readonly city: string
  readonly state: string | null
  readonly country: string
}

const hasUnsupportedCriteria = (request: DiscoveryProviderRequest) => {
  const { language, maxResults, currentDomain, candidateDomain, extensions } =
    request.criteria

  return (
    (language !== null && language !== undefined) ||
    (maxResults !== null && maxResults !== undefined) ||
    (currentDomain !== null && currentDomain !== undefined) ||
    (candidateDomain !== null && candidateDomain !== undefined) ||
    (extensions !== undefined && extensions.length > 0)
  )
}

export const getOpenDiscoveryOverpassCriteria = (
  request: DiscoveryProviderRequest
): OpenDiscoveryOverpassCriteria | null => {
  if (request.mode !== 'business_upgrade' || hasUnsupportedCriteria(request))
    return null

  const keyword = normalizeOpenDiscoveryKeyword(request.criteria.keyword)
  const city = normalizeOpenDiscoveryLocation(request.criteria.city)
  const country = normalizeOpenDiscoveryLocation(request.criteria.country)
  const stateValue = request.criteria.state
  const state =
    stateValue === null || stateValue === undefined
      ? null
      : normalizeOpenDiscoveryLocation(stateValue)

  if (!keyword || !city || !country || (stateValue != null && !state))
    return null

  return Object.freeze({ keyword, city, state, country })
}

const escapeOverpassQuotedString = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')

const escapePosixExtendedRegularExpressionLiteral = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const buildBusinessMatchStatements = (
  keywordExpression: string,
  areaName: string
) => `
      node(area.${areaName})["name"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
      way(area.${areaName})["name"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
      node(area.${areaName})["brand"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
      way(area.${areaName})["brand"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];`

const buildGuardedCitySearch = (
  parentAreaName: string,
  city: string,
  keywordExpression: string
) => `area(area.${parentAreaName})["boundary"="administrative"]["name"="${city}"]->.cityAreas;
  if (.cityAreas.count(deriveds) == 1)
  {
    (${buildBusinessMatchStatements(keywordExpression, 'cityAreas')}
    )->.results;
  }`

export const buildOpenDiscoveryOverpassQuery = (
  criteria: OpenDiscoveryOverpassCriteria
) => {
  const country = escapeOverpassQuotedString(criteria.country)
  const city = escapeOverpassQuotedString(criteria.city)
  const state = criteria.state
    ? escapeOverpassQuotedString(criteria.state)
    : null
  const keywordExpression = escapeOverpassQuotedString(
    escapePosixExtendedRegularExpressionLiteral(criteria.keyword)
  )

  const guardedLocationSearch = state
    ? `area(area.countryAreas)["boundary"="administrative"]["name"="${state}"]->.stateAreas;
  if (.stateAreas.count(deriveds) == 1)
  {
    ${buildGuardedCitySearch('stateAreas', city, keywordExpression)}
  }`
    : buildGuardedCitySearch('countryAreas', city, keywordExpression)

  return `[out:json][timeout:${OPEN_DISCOVERY_OVERPASS_SERVER_TIMEOUT_SECONDS}];
area["boundary"="administrative"]["name"="${country}"]->.countryAreas;
(
  .countryAreas;
  - .countryAreas;
)->.results;
if (.countryAreas.count(deriveds) == 1)
{
  ${guardedLocationSearch}
}
.results out tags center ${OPEN_DISCOVERY_OVERPASS_RESULT_LIMIT};`
}

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

export const OPEN_DISCOVERY_OVERPASS_SERVER_TIMEOUT_SECONDS = 10
export const OPEN_DISCOVERY_OVERPASS_RESULT_LIMIT = 50

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
  nwr(area.${areaName})["name"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
  nwr(area.${areaName})["brand"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
  nwr(area.${areaName})["operator"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
  nwr(area.${areaName})["description"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];`

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

  const locationStatements = state
    ? `area(area.countryArea)["boundary"="administrative"]["name"="${state}"]->.stateArea;
area(area.stateArea)["boundary"="administrative"]["name"="${city}"]->.searchArea;`
    : `area(area.countryArea)["boundary"="administrative"]["name"="${city}"]->.searchArea;`

  return `[out:json][timeout:${OPEN_DISCOVERY_OVERPASS_SERVER_TIMEOUT_SECONDS}];
area["boundary"="administrative"]["name"="${country}"]->.countryArea;
${locationStatements}
(${buildBusinessMatchStatements(keywordExpression, 'searchArea')}
);
out tags center qt ${OPEN_DISCOVERY_OVERPASS_RESULT_LIMIT};`
}

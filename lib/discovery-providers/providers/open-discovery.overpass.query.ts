import type {
  DiscoveryProviderRequest,
  DiscoverySearchMode,
} from '@/types/discovery-provider'
import {
  normalizeOpenDiscoveryKeyword,
  normalizeOpenDiscoveryLocation,
} from './open-discovery.helpers'
import { resolveOpenDiscoveryTaxonomy } from './open-discovery.taxonomy'
import type { OpenDiscoveryTaxonomyEntry } from './open-discovery.taxonomy.types'

export const OPEN_DISCOVERY_OVERPASS_SUPPORTED_MODES = Object.freeze([
  'business_upgrade',
] as const satisfies readonly DiscoverySearchMode[])

export const OPEN_DISCOVERY_OVERPASS_SERVER_TIMEOUT_SECONDS = 20
export const OPEN_DISCOVERY_OVERPASS_RESULT_LIMIT = 25
export const OPEN_DISCOVERY_OVERPASS_STRUCTURED_BRANCH_COUNT = 2
export const OPEN_DISCOVERY_OVERPASS_TEXT_FALLBACK_BRANCH_COUNT = 4

export type OpenDiscoveryOverpassRetrievalStrategy =
  'taxonomy_structured' | 'text_fallback'

export interface OpenDiscoveryOverpassRetrievalMetadata {
  readonly retrievalStrategy: OpenDiscoveryOverpassRetrievalStrategy
  readonly taxonomyEntryId: string | null
}

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

const TEXT_FALLBACK_RETRIEVAL_METADATA = Object.freeze({
  retrievalStrategy: 'text_fallback',
  taxonomyEntryId: null,
}) satisfies OpenDiscoveryOverpassRetrievalMetadata

export const resolveOpenDiscoveryOverpassRetrievalMetadata = (
  keyword: unknown
): OpenDiscoveryOverpassRetrievalMetadata => {
  const taxonomyResolution = resolveOpenDiscoveryTaxonomy(keyword)
  if (!taxonomyResolution.matched) return TEXT_FALLBACK_RETRIEVAL_METADATA

  return Object.freeze({
    retrievalStrategy: 'taxonomy_structured',
    taxonomyEntryId: taxonomyResolution.entry.id,
  })
}

const buildTextFallbackMatchStatements = (
  keywordExpression: string,
  areaName: string
) => `
      node(area.${areaName})["name"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
      way(area.${areaName})["name"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
      node(area.${areaName})["brand"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];
      way(area.${areaName})["brand"~"${keywordExpression}",i][~"^(website|contact:website|url|contact:url)$"~"."];`

const buildStructuredMatchStatements = (
  entry: OpenDiscoveryTaxonomyEntry,
  areaName: string
) => {
  if (entry.selectors.length !== 1) {
    throw new Error(
      `Open Discovery taxonomy selector combination is undefined: ${entry.id}`
    )
  }

  const selector = entry.selectors[0]
  const selectorKey = escapeOverpassQuotedString(selector.key)
  const selectorValue = escapeOverpassQuotedString(selector.value)
  const selectorFilter = `["${selectorKey}"="${selectorValue}"]`

  return `
      node(area.${areaName})${selectorFilter}[~"^(website|contact:website|url|contact:url)$"~"."];
      way(area.${areaName})${selectorFilter}[~"^(website|contact:website|url|contact:url)$"~"."];`
}

const buildGuardedCitySearch = (
  parentAreaName: string,
  city: string,
  businessMatchStatements: string
) => `area(area.${parentAreaName})["boundary"="administrative"]["name"="${city}"]->.cityAreas;
  if (.cityAreas.count(deriveds) == 1)
  {
    (${businessMatchStatements}
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
  const retrievalMetadata = resolveOpenDiscoveryOverpassRetrievalMetadata(
    criteria.keyword
  )
  const taxonomyResolution = resolveOpenDiscoveryTaxonomy(criteria.keyword)
  const retrievalIsConsistent = taxonomyResolution.matched
    ? retrievalMetadata.retrievalStrategy === 'taxonomy_structured' &&
      taxonomyResolution.entry.id === retrievalMetadata.taxonomyEntryId
    : retrievalMetadata.retrievalStrategy === 'text_fallback' &&
      retrievalMetadata.taxonomyEntryId === null

  if (!retrievalIsConsistent) {
    throw new Error('Open Discovery retrieval metadata is inconsistent.')
  }

  const businessMatchStatements = taxonomyResolution.matched
    ? buildStructuredMatchStatements(taxonomyResolution.entry, 'cityAreas')
    : buildTextFallbackMatchStatements(keywordExpression, 'cityAreas')

  const guardedLocationSearch = state
    ? `area(area.countryAreas)["boundary"="administrative"]["name"="${state}"]->.stateAreas;
  if (.stateAreas.count(deriveds) == 1)
  {
    ${buildGuardedCitySearch('stateAreas', city, businessMatchStatements)}
  }`
    : buildGuardedCitySearch('countryAreas', city, businessMatchStatements)

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

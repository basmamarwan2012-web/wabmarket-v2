import 'server-only'

import { z } from 'zod'

import {
  loadGooglePlacesConfiguration,
  type GooglePlacesConfigurationLoader,
} from '@/lib/config/google-places'
import type {
  DiscoveryProviderCapabilities,
  DiscoveryProviderExecutionContext,
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
} from '@/types/discovery-provider'
import { DiscoveryProviderError, type DiscoveryProvider } from '../provider'
import { GOOGLE_PLACES_TEXT_SEARCH_FIELD_MASK } from './google-places.field-mask'
import {
  analyzeGooglePlacesHostname,
  getGooglePlacesSearchCriteria,
  normalizeGooglePlacesWebsite,
} from './google-places.helpers'
import type {
  GooglePlacesNormalizationOutcome,
  GooglePlacesTextSearchPlace,
  GooglePlacesTextSearchResponse,
  GooglePlacesTransientResult,
} from './google-places.types'
import { GOOGLE_PLACES_USAGE_POLICY } from './google-places.usage-policy'

const GOOGLE_PLACES_TEXT_SEARCH_ENDPOINT =
  'https://places.googleapis.com/v1/places:searchText'

const GOOGLE_PLACES_CAPABILITIES = Object.freeze({
  identifier: 'google_places',
  displayName: 'Google Places API (New)',
  supportedSearchModes: Object.freeze(['business_upgrade'] as const),
  categories: Object.freeze(['business_discovery'] as const),
  operations: Object.freeze({
    registrationPricing: false,
    renewalPricing: false,
    buyNowInventory: false,
    brokerage: false,
    batchRequests: false,
  }),
}) satisfies DiscoveryProviderCapabilities

const displayNameSchema = z.object({
  text: z.string().trim().min(1).max(512),
  languageCode: z.string().trim().min(1).max(35).optional(),
})

const placeSchema = z.object({
  id: z.string().trim().min(1).max(1024).optional(),
  displayName: displayNameSchema.optional(),
  formattedAddress: z.string().trim().min(1).max(2048).optional(),
  primaryType: z.string().trim().min(1).max(128).optional(),
  types: z.array(z.string().trim().min(1).max(128)).max(64).optional(),
  businessStatus: z.string().trim().min(1).max(64).optional(),
  websiteUri: z.string().trim().min(1).max(4096).optional(),
  pureServiceAreaBusiness: z.boolean().optional(),
})

const responseSchema = z.object({
  places: z
    .array(placeSchema)
    .max(GOOGLE_PLACES_USAGE_POLICY.maxResultsPerSearch)
    .optional(),
})

const googleErrorSchema = z.object({
  error: z
    .object({
      status: z.string().trim().max(100).optional(),
    })
    .optional(),
})

const freezePlace = (
  place: z.infer<typeof placeSchema>
): GooglePlacesTextSearchPlace =>
  Object.freeze({
    ...(place.id === undefined ? {} : { id: place.id }),
    ...(place.displayName === undefined
      ? {}
      : { displayName: Object.freeze({ ...place.displayName }) }),
    ...(place.formattedAddress === undefined
      ? {}
      : { formattedAddress: place.formattedAddress }),
    ...(place.primaryType === undefined
      ? {}
      : { primaryType: place.primaryType }),
    ...(place.types === undefined
      ? {}
      : { types: Object.freeze([...place.types]) }),
    ...(place.businessStatus === undefined
      ? {}
      : { businessStatus: place.businessStatus }),
    ...(place.websiteUri === undefined ? {} : { websiteUri: place.websiteUri }),
    ...(place.pureServiceAreaBusiness === undefined
      ? {}
      : { pureServiceAreaBusiness: place.pureServiceAreaBusiness }),
  })

const validateResponse = (value: unknown): GooglePlacesTextSearchResponse => {
  const parsed = responseSchema.safeParse(value)
  if (!parsed.success)
    throw new DiscoveryProviderError(
      'PROVIDER_INVALID_RESPONSE',
      'Google Places returned an invalid response.'
    )

  return Object.freeze({
    places: Object.freeze((parsed.data.places ?? []).map(freezePlace)),
  })
}

const responseReportsResourceExhaustion = async (response: Response) => {
  try {
    const parsed = googleErrorSchema.safeParse(await response.json())
    return parsed.success && parsed.data.error?.status === 'RESOURCE_EXHAUSTED'
  } catch {
    return false
  }
}

const normalizeTransientPlace = (
  place: GooglePlacesTextSearchPlace
): GooglePlacesTransientResult | null => {
  if (
    !place.id ||
    place.businessStatus !== 'OPERATIONAL' ||
    !place.displayName?.text
  )
    return null

  const website = normalizeGooglePlacesWebsite(place.websiteUri)
  if (!website) return null

  const domainAnalysis = analyzeGooglePlacesHostname(website.normalizedHostname)
  return Object.freeze({
    placeId: place.id,
    displayName: place.displayName.text,
    formattedAddress: place.formattedAddress ?? null,
    primaryType: place.primaryType ?? null,
    types: Object.freeze([...(place.types ?? [])]),
    businessStatus: 'OPERATIONAL',
    websiteUri: website.websiteUri,
    normalizedHostname: website.normalizedHostname,
    pureServiceAreaBusiness: place.pureServiceAreaBusiness ?? null,
    ...domainAnalysis,
  })
}

const toCanonicalItem = (
  result: GooglePlacesTransientResult
): DiscoveryProviderItem =>
  Object.freeze({
    provider: 'google_places',
    sourceRecordId: result.placeId,
    sourceUrl: null,
    source: 'google_places_text_search',
    sourceTitle: result.displayName,
    currentDomain: result.normalizedHostname,
    candidateDomain: null,
    website: result.websiteUri,
    businessName: result.displayName,
    city: null,
    country: null,
    acquisitionStatus: null,
    metadata: Object.freeze({
      formattedAddress: result.formattedAddress,
      primaryType: result.primaryType,
      types: result.types,
      businessStatus: result.businessStatus,
      pureServiceAreaBusiness: result.pureServiceAreaBusiness,
      isDotCom: result.isDotCom,
      isNonDotCom: result.isNonDotCom,
      hasHyphen: result.hasHyphen,
      hasBasicDomainWeakness: result.hasBasicDomainWeakness,
    }),
  })

export class GooglePlacesDiscoveryProvider implements DiscoveryProvider<GooglePlacesTextSearchResponse> {
  readonly capabilities = GOOGLE_PLACES_CAPABILITIES

  constructor(
    private readonly loadConfiguration: GooglePlacesConfigurationLoader = loadGooglePlacesConfiguration
  ) {}

  name() {
    return 'google_places' as const
  }

  supports(request: DiscoveryProviderRequest) {
    return getGooglePlacesSearchCriteria(request) !== null
  }

  async search(
    request: DiscoveryProviderRequest,
    context: Readonly<DiscoveryProviderExecutionContext> = {}
  ): Promise<GooglePlacesTextSearchResponse> {
    const criteria = getGooglePlacesSearchCriteria(request)
    if (!criteria)
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'Google Places does not support this request.'
      )

    if (context.signal?.aborted)
      throw new DiscoveryProviderError(
        'PROVIDER_CANCELLED',
        'Google Places request was cancelled.'
      )

    const configuration = this.loadConfiguration()
    if (!configuration.success)
      throw new DiscoveryProviderError(
        'PROVIDER_CONFIGURATION_MISSING',
        'Google Places configuration is missing.'
      )

    const controller = new AbortController()
    let callerCancelled = false
    let clientTimedOut = false
    const cancelFromCaller = () => {
      callerCancelled = true
      controller.abort()
    }
    context.signal?.addEventListener('abort', cancelFromCaller, { once: true })
    const timeout = setTimeout(() => {
      clientTimedOut = true
      controller.abort()
    }, GOOGLE_PLACES_USAGE_POLICY.clientTimeoutMs)

    try {
      const response = await fetch(GOOGLE_PLACES_TEXT_SEARCH_ENDPOINT, {
        method: 'POST',
        headers: configuration.credentials.createRequestHeaders(
          GOOGLE_PLACES_TEXT_SEARCH_FIELD_MASK
        ),
        body: JSON.stringify({
          textQuery: criteria.textQuery,
          includePureServiceAreaBusinesses: true,
          pageSize: criteria.maxResults,
          ...(criteria.language === null
            ? {}
            : { languageCode: criteria.language }),
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        if (response.status === 429)
          throw new DiscoveryProviderError(
            'PROVIDER_RATE_LIMITED',
            'Google Places is temporarily rate limited.'
          )
        if (await responseReportsResourceExhaustion(response))
          throw new DiscoveryProviderError(
            'PROVIDER_QUOTA_EXCEEDED',
            'Google Places quota is exhausted.'
          )
        throw new DiscoveryProviderError(
          'PROVIDER_HTTP_ERROR',
          'Google Places request failed.'
        )
      }

      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        throw new DiscoveryProviderError(
          'PROVIDER_INVALID_RESPONSE',
          'Google Places returned an invalid response.'
        )
      }
      return validateResponse(payload)
    } catch (error: unknown) {
      if (error instanceof DiscoveryProviderError) throw error
      if (callerCancelled || context.signal?.aborted)
        throw new DiscoveryProviderError(
          'PROVIDER_CANCELLED',
          'Google Places request was cancelled.'
        )
      if (clientTimedOut)
        throw new DiscoveryProviderError(
          'PROVIDER_TIMEOUT',
          'Google Places request timed out.'
        )
      throw new DiscoveryProviderError(
        'PROVIDER_NETWORK_ERROR',
        'Google Places network request failed.'
      )
    } finally {
      clearTimeout(timeout)
      context.signal?.removeEventListener('abort', cancelFromCaller)
    }
  }

  normalizeWithDiagnostics(
    response: GooglePlacesTextSearchResponse,
    _request: DiscoveryProviderRequest
  ): GooglePlacesNormalizationOutcome {
    const seenHostnames = new Set<string>()
    const transientResults: GooglePlacesTransientResult[] = []

    for (const place of response.places) {
      const result = normalizeTransientPlace(place)
      if (!result || seenHostnames.has(result.normalizedHostname)) continue
      seenHostnames.add(result.normalizedHostname)
      transientResults.push(result)
    }

    const frozenResults = Object.freeze(transientResults)
    const items = Object.freeze(frozenResults.map(toCanonicalItem))
    return Object.freeze({
      items,
      diagnostics: Object.freeze({
        received: response.places.length,
        accepted: frozenResults.length,
        rejected: response.places.length - frozenResults.length,
        transientResults: frozenResults,
      }),
    })
  }

  normalize(
    response: GooglePlacesTextSearchResponse,
    request: DiscoveryProviderRequest
  ): readonly DiscoveryProviderItem[] {
    return this.normalizeWithDiagnostics(response, request).items
  }
}

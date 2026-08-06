import 'server-only'

import { z } from 'zod'

import {
  loadGoogleCustomSearchConfiguration,
  type GoogleCustomSearchConfigurationLoader,
} from '@/lib/config/google-custom-search'
import type {
  DiscoveryProviderCapabilities,
  DiscoveryProviderExecutionContext,
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
} from '@/types/discovery-provider'
import { DiscoveryProviderError, type DiscoveryProvider } from '../provider'
import {
  buildGoogleBusinessQuery,
  mapGoogleLanguageRestriction,
  normalizeGoogleMaxResults,
  normalizeGoogleResultUrl,
} from './google-discovery.helpers'
import type {
  GoogleCustomSearchItem,
  GoogleCustomSearchResponse,
} from './google-discovery.types'

const GOOGLE_TIMEOUT_MS = 10_000
const supportedModes = Object.freeze(['business_upgrade', 'local_seo'] as const)

const googleItemSchema = z.object({
  link: z.string(),
  title: z.string().nullable().optional(),
  cacheId: z.string().nullable().optional(),
  snippet: z.string().nullable().optional(),
  displayLink: z.string().nullable().optional(),
  formattedUrl: z.string().nullable().optional(),
})
const googleResponseSchema = z.object({
  items: z.array(googleItemSchema).optional(),
})
const googleErrorSchema = z.object({
  error: z
    .object({
      errors: z.array(z.object({ reason: z.string() })).optional(),
    })
    .optional(),
})

const quotaReasons = new Set([
  'dailyLimitExceeded',
  'dailyLimitExceededUnreg',
  'quotaExceeded',
])
const rateLimitReasons = new Set(['rateLimitExceeded', 'userRateLimitExceeded'])

const configurationMessage = (
  reason: Exclude<
    ReturnType<GoogleCustomSearchConfigurationLoader>,
    { success: true }
  >['reason']
) => {
  if (reason === 'missing_api_key')
    return 'Google Custom Search API configuration is missing.'
  if (reason === 'missing_search_engine_id')
    return 'Google Custom Search engine configuration is missing.'
  return 'Google Custom Search configuration is empty or invalid.'
}

const parseGoogleResponse = (value: unknown): GoogleCustomSearchResponse => {
  const parsed = googleResponseSchema.safeParse(value)
  if (!parsed.success)
    throw new DiscoveryProviderError(
      'PROVIDER_INVALID_RESPONSE',
      'Google Custom Search returned an invalid response.',
      { cause: parsed.error }
    )
  return {
    items: (parsed.data.items ?? []).map(
      (item): GoogleCustomSearchItem => ({
        link: item.link,
        title: item.title ?? null,
        cacheId: item.cacheId ?? null,
        snippet: item.snippet ?? null,
        displayLink: item.displayLink ?? null,
        formattedUrl: item.formattedUrl ?? null,
      })
    ),
  }
}

const mapGoogleHttpError = (status: number, value: unknown) => {
  const parsed = googleErrorSchema.safeParse(value)
  const reasons = parsed.success
    ? (parsed.data.error?.errors ?? []).map((error) => error.reason)
    : []
  if (reasons.some((reason) => quotaReasons.has(reason)))
    return new DiscoveryProviderError(
      'PROVIDER_QUOTA_EXCEEDED',
      'Google Custom Search quota is exhausted.'
    )
  if (
    status === 429 ||
    reasons.some((reason) => rateLimitReasons.has(reason))
  )
    return new DiscoveryProviderError(
      'PROVIDER_RATE_LIMITED',
      'Google Custom Search is temporarily rate limited.'
    )
  return new DiscoveryProviderError(
    'PROVIDER_HTTP_ERROR',
    'Google Custom Search request failed.'
  )
}

export class GoogleDiscoveryProvider
  implements DiscoveryProvider<GoogleCustomSearchResponse>
{
  readonly capabilities: DiscoveryProviderCapabilities = Object.freeze({
    identifier: 'google',
    displayName: 'Google',
    supportedSearchModes: supportedModes,
    categories: Object.freeze(['business_discovery'] as const),
    operations: Object.freeze({
      registrationPricing: false,
      renewalPricing: false,
      buyNowInventory: false,
      brokerage: false,
      batchRequests: false,
    }),
  })

  constructor(
    private readonly configurationLoader: GoogleCustomSearchConfigurationLoader =
      loadGoogleCustomSearchConfiguration
  ) {}

  name() {
    return this.capabilities.identifier
  }

  supports(request: DiscoveryProviderRequest) {
    if (
      !supportedModes.includes(request.mode as (typeof supportedModes)[number])
    )
      return false
    const keyword = request.criteria.keyword?.trim()
    const city = request.criteria.city?.trim()
    const country = request.criteria.country?.trim()
    return Boolean(
      keyword &&
        city &&
        country &&
        normalizeGoogleMaxResults(request.criteria.maxResults) !== null
    )
  }

  async search(
    request: DiscoveryProviderRequest,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<GoogleCustomSearchResponse> {
    if (!this.supports(request))
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'Google Custom Search supports business discovery requests with keyword, city, country, and at most 10 results.'
      )
    if (context?.signal?.aborted)
      throw new DiscoveryProviderError(
        'PROVIDER_CANCELLED',
        'Google Custom Search request was cancelled.'
      )

    const configuration = this.configurationLoader()
    if (!configuration.success)
      throw new DiscoveryProviderError(
        'PROVIDER_CONFIGURATION_MISSING',
        configurationMessage(configuration.reason)
      )

    const maxResults = normalizeGoogleMaxResults(request.criteria.maxResults)
    if (maxResults === null)
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'Google Custom Search accepts between 1 and 10 results.'
      )
    const requestUrl = configuration.credentials.createRequestUrl({
      query: buildGoogleBusinessQuery(request.criteria),
      maxResults,
      languageRestriction: mapGoogleLanguageRestriction(
        request.criteria.language
      ),
    })

    const controller = new AbortController()
    let timedOut = false
    let callerCancelled = false
    const cancelFromCaller = () => {
      callerCancelled = true
      controller.abort()
    }
    context?.signal?.addEventListener('abort', cancelFromCaller, { once: true })
    const timeout = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, GOOGLE_TIMEOUT_MS)

    try {
      const response = await fetch(requestUrl, {
        method: 'GET',
        signal: controller.signal,
      })
      let value: unknown
      try {
        value = await response.json()
      } catch (error) {
        if (response.ok)
          throw new DiscoveryProviderError(
            'PROVIDER_INVALID_RESPONSE',
            'Google Custom Search returned an invalid response.',
            { cause: error }
          )
        throw mapGoogleHttpError(response.status, null)
      }
      if (!response.ok) throw mapGoogleHttpError(response.status, value)
      return parseGoogleResponse(value)
    } catch (error) {
      if (error instanceof DiscoveryProviderError) throw error
      if (callerCancelled || context?.signal?.aborted)
        throw new DiscoveryProviderError(
          'PROVIDER_CANCELLED',
          'Google Custom Search request was cancelled.',
          { cause: error }
        )
      if (timedOut)
        throw new DiscoveryProviderError(
          'PROVIDER_TIMEOUT',
          'Google Custom Search request timed out.',
          { cause: error }
        )
      throw new DiscoveryProviderError(
        'PROVIDER_NETWORK_ERROR',
        'Google Custom Search network request failed.',
        { cause: error }
      )
    } finally {
      clearTimeout(timeout)
      context?.signal?.removeEventListener('abort', cancelFromCaller)
    }
  }

  normalize(
    response: GoogleCustomSearchResponse,
    _request: DiscoveryProviderRequest
  ): readonly DiscoveryProviderItem[] {
    return response.items.map((item) => {
      const resultUrl = normalizeGoogleResultUrl(item.link)
      return {
        provider: 'google',
        sourceRecordId: item.cacheId,
        sourceUrl: resultUrl?.website ?? null,
        source: 'google_custom_search',
        sourceTitle: item.title,
        currentDomain: resultUrl?.currentDomain ?? null,
        candidateDomain: null,
        website: resultUrl?.website ?? null,
        businessName: null,
        city: null,
        country: null,
        acquisitionStatus: null,
        metadata: Object.freeze({
          snippet: item.snippet,
          displayLink: item.displayLink,
          formattedUrl: item.formattedUrl,
        }),
      }
    })
  }
}

import 'server-only'

import { channel } from 'node:diagnostics_channel'
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
} from './google-discovery.helpers'
import { getGoogleQueryProfile } from './google-query-profile'
import {
  applyGoogleResultQualityGate,
  type GoogleQualityDiagnostics,
} from './google-result-quality'
import type {
  GoogleCustomSearchItem,
  GoogleCustomSearchResponse,
} from './google-discovery.types'

const GOOGLE_TIMEOUT_MS = 10_000
const GOOGLE_HTTP_DIAGNOSTIC_CHANNEL_NAME =
  'wabmarket.discovery.google.http-error.manual'
const supportedModes = Object.freeze(['business_upgrade', 'local_seo'] as const)
const googleHttpDiagnosticChannel = channel(
  GOOGLE_HTTP_DIAGNOSTIC_CHANNEL_NAME
)

type GoogleHttpDiagnosticCategory =
  | 'api_not_enabled'
  | 'api_key_invalid'
  | 'api_key_restricted'
  | 'custom_search_access_denied'
  | 'search_engine_invalid'
  | 'quota_exceeded'
  | 'rate_limited'
  | 'invalid_request'
  | 'service_deprecated'
  | 'unknown_http_error'

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
      code: z.number().int().optional(),
      status: z.string().optional(),
      message: z.string().optional(),
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

const safeDiagnosticToken = (value: string | undefined) => {
  const token = value?.trim()
  return token && /^[A-Za-z0-9_.-]{1,100}$/.test(token) ? token : null
}

const includesAny = (value: string, terms: readonly string[]) =>
  terms.some((term) => value.includes(term))

const redactExactSecrets = (
  value: string | undefined,
  secrets: readonly (string | null)[]
) => {
  let redacted = value ?? ''
  for (const secret of secrets) {
    if (secret) redacted = redacted.split(secret).join('[redacted]')
  }
  return redacted.toLowerCase().replace(/\s+/g, ' ').trim().slice(0, 1_000)
}

const classifyGoogleHttpError = (
  httpStatus: number,
  googleStatus: string | null,
  reason: string | null,
  redactedMessage: string
): GoogleHttpDiagnosticCategory => {
  const normalizedStatus = googleStatus?.toLowerCase() ?? ''
  const normalizedReason = reason?.toLowerCase() ?? ''

  if (
    quotaReasons.has(reason ?? '') ||
    includesAny(normalizedReason, ['quota', 'dailylimit']) ||
    includesAny(redactedMessage, ['quota exceeded', 'daily limit exceeded'])
  )
    return 'quota_exceeded'
  if (
    httpStatus === 429 ||
    rateLimitReasons.has(reason ?? '') ||
    includesAny(normalizedReason, ['ratelimit', 'rate_limit'])
  )
    return 'rate_limited'
  if (
    includesAny(normalizedReason, ['accessnotconfigured', 'servicedisabled']) ||
    includesAny(redactedMessage, [
      'api has not been used',
      'api is not enabled',
      'service is disabled',
      'access not configured',
    ])
  )
    return 'api_not_enabled'
  if (
    includesAny(normalizedReason, ['keyinvalid', 'badrequestkeyinvalid']) ||
    includesAny(redactedMessage, ['api key not valid', 'invalid api key'])
  )
    return 'api_key_invalid'
  if (
    includesAny(normalizedReason, [
      'iprefererblocked',
      'refererblocked',
      'keyrestricted',
    ]) ||
    includesAny(redactedMessage, [
      'api key restriction',
      'referer restrictions',
      'requests from referer',
      'requests from this ip',
    ])
  )
    return 'api_key_restricted'
  if (
    includesAny(redactedMessage, [
      'custom search engine is invalid',
      'invalid custom search engine',
      'invalid search engine',
      'invalid value for cx',
    ])
  )
    return 'search_engine_invalid'
  if (
    includesAny(redactedMessage, [
      'deprecated',
      'discontinued',
      'no longer available',
    ])
  )
    return 'service_deprecated'
  if (
    httpStatus === 400 ||
    normalizedStatus === 'invalid_argument' ||
    includesAny(normalizedReason, ['invalid', 'badrequest'])
  )
    return 'invalid_request'
  if (
    httpStatus === 403 ||
    normalizedStatus === 'permission_denied' ||
    normalizedReason === 'forbidden'
  )
    return 'custom_search_access_denied'
  return 'unknown_http_error'
}

const publishGoogleHttpDiagnostic = (
  httpStatus: number,
  parsed: z.infer<typeof googleErrorSchema>,
  requestUrl: URL
) => {
  if (!googleHttpDiagnosticChannel.hasSubscribers) return

  try {
    const googleError = parsed.error
    const reason = safeDiagnosticToken(googleError?.errors?.[0]?.reason)
    const googleStatus = safeDiagnosticToken(googleError?.status)
    const redactedMessage = redactExactSecrets(googleError?.message, [
      requestUrl.searchParams.get('key'),
      requestUrl.searchParams.get('cx'),
    ])
    const category = classifyGoogleHttpError(
      httpStatus,
      googleStatus,
      reason,
      redactedMessage
    )

    googleHttpDiagnosticChannel.publish(
      Object.freeze({
        provider: 'google',
        httpStatus,
        googleCode: googleError?.code ?? null,
        googleStatus,
        reason,
        category,
      })
    )
  } catch {
    // Diagnostics must never affect provider execution or error mapping.
  }
}

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

const mapGoogleHttpError = (
  status: number,
  value: unknown,
  requestUrl: URL
) => {
  const parsed = googleErrorSchema.safeParse(value)
  if (parsed.success) publishGoogleHttpDiagnostic(status, parsed.data, requestUrl)
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
    if (!getGoogleQueryProfile(request.mode))
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
    const profile = getGoogleQueryProfile(request.mode)
    if (!profile)
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'Google query profile is unavailable for this mode.'
      )
    const requestUrl = configuration.credentials.createRequestUrl({
      query: buildGoogleBusinessQuery(request.criteria),
      maxResults,
      languageRestriction: mapGoogleLanguageRestriction(
        request.criteria.language
      ),
      exactTerms: profile.exactTerms,
      excludeTerms: profile.excludeTerms,
      orTerms: profile.orTerms,
      safe: profile.safe,
      filter: profile.filter,
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
        throw mapGoogleHttpError(response.status, null, requestUrl)
      }
      if (!response.ok)
        throw mapGoogleHttpError(response.status, value, requestUrl)
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
    request: DiscoveryProviderRequest
  ): readonly DiscoveryProviderItem[] {
    return this.normalizeWithDiagnostics(response, request).items
  }

  normalizeWithDiagnostics(
    response: GoogleCustomSearchResponse,
    request: DiscoveryProviderRequest
  ): {
    readonly items: readonly DiscoveryProviderItem[]
    readonly diagnostics: GoogleQualityDiagnostics
  } {
    const profile = getGoogleQueryProfile(request.mode)
    if (!profile)
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'Google query profile is unavailable for this mode.'
      )
    const quality = applyGoogleResultQualityGate(
      response.items,
      request.criteria,
      profile
    )
    const items = quality.accepted.map((accepted) => {
      const item = accepted.item
      return {
        provider: 'google',
        sourceRecordId: item.cacheId,
        sourceUrl: accepted.website,
        source: 'google_custom_search',
        sourceTitle: item.title,
        currentDomain: accepted.currentDomain,
        candidateDomain: null,
        website: accepted.website,
        businessName: null,
        city: null,
        country: null,
        acquisitionStatus: null,
        metadata: Object.freeze({
          snippet: item.snippet,
          displayLink: item.displayLink,
          formattedUrl: item.formattedUrl,
          qualityScore: accepted.qualityScore,
          positiveSignals: accepted.positiveSignals,
          negativeSignals: accepted.negativeSignals,
        }),
      }
    })
    return Object.freeze({ items: Object.freeze(items), diagnostics: quality.diagnostics })
  }
}

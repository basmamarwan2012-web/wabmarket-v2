import 'server-only'

import {
  loadDynadotConfiguration,
  type DynadotConfigurationLoader,
} from '@/lib/config/dynadot'
import { normalizeOrderedCandidateHostnames } from '../helpers'
import {
  DomainAvailabilityError,
  type DomainAvailabilityProvider,
} from '../provider'
import type {
  DomainAvailabilityLookupContext,
  DomainAvailabilityResult,
} from '../types'
import {
  DYNADOT_AVAILABILITY_POLICY,
  mapDynadotAvailabilityResults,
} from './dynadot.helpers'

const DYNADOT_BULK_SEARCH_ENDPOINT =
  'https://api.dynadot.com/restful/v2/domains/bulk_search'

type FetchImplementation = typeof fetch
type Clock = () => Date

export class DynadotDomainAvailabilityProvider implements DomainAvailabilityProvider {
  readonly identifier = 'dynadot' as const
  readonly limits = DYNADOT_AVAILABILITY_POLICY

  constructor(
    private readonly loadConfiguration: DynadotConfigurationLoader = loadDynadotConfiguration,
    private readonly fetchImplementation: FetchImplementation = fetch,
    private readonly clock: Clock = () => new Date()
  ) {}

  async lookup(
    hostnames: readonly string[],
    context: Readonly<DomainAvailabilityLookupContext> = {}
  ): Promise<readonly DomainAvailabilityResult[]> {
    const normalizedHostnames = normalizeOrderedCandidateHostnames(
      hostnames,
      this.limits.maxCandidatesPerLookup
    )
    if (!normalizedHostnames)
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_INVALID_INPUT',
        'Candidate hostnames are invalid.'
      )

    if (context.signal?.aborted)
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_CANCELLED',
        'Dynadot availability lookup was cancelled.'
      )

    const configuration = this.loadConfiguration()
    if (!configuration.success)
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_CONFIGURATION_MISSING',
        'Dynadot availability configuration is missing.'
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
    }, this.limits.timeoutMs)

    try {
      const endpoint = new URL(DYNADOT_BULK_SEARCH_ENDPOINT)
      endpoint.searchParams.set(
        'domain_name_list',
        normalizedHostnames.join(',')
      )
      endpoint.searchParams.set('show_price', 'true')

      const response = await this.fetchImplementation(endpoint, {
        method: 'GET',
        headers: configuration.credentials.createRequestHeaders(),
        signal: controller.signal,
      })

      if (!response.ok) {
        if (response.status === 429)
          throw new DomainAvailabilityError(
            'DOMAIN_AVAILABILITY_RATE_LIMITED',
            'Dynadot availability lookup is temporarily rate limited.'
          )
        throw new DomainAvailabilityError(
          'DOMAIN_AVAILABILITY_HTTP_ERROR',
          'Dynadot availability lookup failed.'
        )
      }

      let payload: unknown
      try {
        payload = await response.json()
      } catch {
        throw new DomainAvailabilityError(
          'DOMAIN_AVAILABILITY_INVALID_RESPONSE',
          'Dynadot returned an invalid availability response.'
        )
      }

      const checkedAt = this.clock().toISOString()
      return mapDynadotAvailabilityResults(
        payload,
        normalizedHostnames,
        checkedAt
      )
    } catch (error: unknown) {
      if (error instanceof DomainAvailabilityError) throw error
      if (callerCancelled || context.signal?.aborted)
        throw new DomainAvailabilityError(
          'DOMAIN_AVAILABILITY_CANCELLED',
          'Dynadot availability lookup was cancelled.'
        )
      if (clientTimedOut)
        throw new DomainAvailabilityError(
          'DOMAIN_AVAILABILITY_TIMEOUT',
          'Dynadot availability lookup timed out.'
        )
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_NETWORK_ERROR',
        'Dynadot availability network request failed.',
        { cause: error }
      )
    } finally {
      clearTimeout(timeout)
      context.signal?.removeEventListener('abort', cancelFromCaller)
    }
  }
}

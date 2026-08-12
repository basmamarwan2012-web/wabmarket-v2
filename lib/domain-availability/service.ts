import 'server-only'

import {
  freezeDomainAvailabilityResult,
  isDomainAvailabilityStatus,
  normalizeDomainAvailabilityHostname,
  normalizeOrderedCandidateHostnames,
} from './helpers'
import {
  DomainAvailabilityError,
  type DomainAvailabilityProvider,
} from './provider'
import type {
  DomainAvailabilityLookupContext,
  DomainAvailabilityResult,
} from './types'

const isValidCheckedAt = (value: unknown): value is string =>
  typeof value === 'string' &&
  value.length > 0 &&
  Number.isFinite(Date.parse(value))

export class DomainAvailabilityService {
  constructor(private readonly provider: DomainAvailabilityProvider) {}

  async lookup(
    hostnames: readonly string[],
    context: Readonly<DomainAvailabilityLookupContext> = {}
  ): Promise<readonly DomainAvailabilityResult[]> {
    const normalizedHostnames = normalizeOrderedCandidateHostnames(
      hostnames,
      this.provider.limits.maxCandidatesPerLookup
    )
    if (!normalizedHostnames)
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_INVALID_INPUT',
        'Candidate hostnames are invalid.'
      )

    if (context.signal?.aborted)
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_CANCELLED',
        'Domain availability lookup was cancelled.'
      )

    let providerResults: readonly DomainAvailabilityResult[]
    try {
      providerResults = await this.provider.lookup(normalizedHostnames, context)
    } catch (error: unknown) {
      if (error instanceof DomainAvailabilityError) throw error
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_EXECUTION_FAILED',
        'Domain availability provider execution failed.',
        { cause: error }
      )
    }

    if (!Array.isArray(providerResults))
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_INVALID_RESULT',
        'The domain availability provider returned an invalid result.'
      )

    const requested = new Set(normalizedHostnames)
    const byHostname = new Map<string, DomainAvailabilityResult>()

    for (const result of providerResults) {
      if (!result || typeof result !== 'object')
        throw new DomainAvailabilityError(
          'DOMAIN_AVAILABILITY_INVALID_RESULT',
          'The domain availability provider returned an invalid result.'
        )

      const hostname = normalizeDomainAvailabilityHostname(result.hostname)
      if (
        !hostname ||
        hostname !== result.hostname ||
        !requested.has(hostname) ||
        byHostname.has(hostname) ||
        result.provider !== this.provider.identifier ||
        !isDomainAvailabilityStatus(result.availabilityStatus) ||
        !isValidCheckedAt(result.checkedAt)
      )
        throw new DomainAvailabilityError(
          'DOMAIN_AVAILABILITY_INVALID_RESULT',
          'The domain availability provider returned an invalid result.'
        )

      byHostname.set(hostname, result)
    }

    if (byHostname.size !== normalizedHostnames.length)
      throw new DomainAvailabilityError(
        'DOMAIN_AVAILABILITY_INVALID_RESULT',
        'The domain availability provider returned an incomplete result.'
      )

    return Object.freeze(
      normalizedHostnames.map((hostname) =>
        freezeDomainAvailabilityResult(byHostname.get(hostname)!)
      )
    )
  }
}

import 'server-only'

import type {
  DomainAvailabilityLookupContext,
  DomainAvailabilityProviderIdentifier,
  DomainAvailabilityProviderLimits,
  DomainAvailabilityResult,
} from './types'

export const DOMAIN_AVAILABILITY_ERROR_CODES = Object.freeze([
  'DOMAIN_AVAILABILITY_INVALID_INPUT',
  'DOMAIN_AVAILABILITY_CONFIGURATION_MISSING',
  'DOMAIN_AVAILABILITY_HTTP_ERROR',
  'DOMAIN_AVAILABILITY_RATE_LIMITED',
  'DOMAIN_AVAILABILITY_TIMEOUT',
  'DOMAIN_AVAILABILITY_CANCELLED',
  'DOMAIN_AVAILABILITY_INVALID_RESPONSE',
  'DOMAIN_AVAILABILITY_NETWORK_ERROR',
  'DOMAIN_AVAILABILITY_EXECUTION_FAILED',
  'DOMAIN_AVAILABILITY_INVALID_RESULT',
] as const)

export type DomainAvailabilityErrorCode =
  (typeof DOMAIN_AVAILABILITY_ERROR_CODES)[number]

export class DomainAvailabilityError extends Error {
  private readonly internalCause?: unknown

  constructor(
    public readonly code: DomainAvailabilityErrorCode,
    message: string,
    options?: Readonly<{ cause?: unknown }>
  ) {
    super(message)
    this.name = 'DomainAvailabilityError'
    this.internalCause = options?.cause
  }
}

export interface DomainAvailabilityProvider {
  readonly identifier: DomainAvailabilityProviderIdentifier
  readonly limits: DomainAvailabilityProviderLimits
  lookup(
    hostnames: readonly string[],
    context?: Readonly<DomainAvailabilityLookupContext>
  ): Promise<readonly DomainAvailabilityResult[]>
}

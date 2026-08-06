import 'server-only'

import type {
  DiscoveryProviderCapabilities,
  DiscoveryProviderExecutionContext,
  DiscoveryProviderIdentifier,
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
} from '@/types/discovery-provider'

export const DISCOVERY_PROVIDER_ERROR_CODES = [
  'PROVIDER_DUPLICATE',
  'PROVIDER_UNKNOWN',
  'PROVIDER_INVALID_CONFIGURATION',
  'PROVIDER_UNSUPPORTED_REQUEST',
  'PROVIDER_NOT_IMPLEMENTED',
  'PROVIDER_CONFIGURATION_MISSING',
  'PROVIDER_HTTP_ERROR',
  'PROVIDER_TIMEOUT',
  'PROVIDER_CANCELLED',
  'PROVIDER_INVALID_RESPONSE',
  'PROVIDER_QUOTA_EXCEEDED',
  'PROVIDER_RATE_LIMITED',
  'PROVIDER_NETWORK_ERROR',
  'PROVIDER_EXECUTION_FAILED',
  'PROVIDER_NORMALIZATION_FAILED',
  'PROVIDER_INVALID_NORMALIZED_RESULT',
] as const

export type DiscoveryProviderErrorCode =
  (typeof DISCOVERY_PROVIDER_ERROR_CODES)[number]

export class DiscoveryProviderError extends Error {
  private readonly internalCause?: unknown

  constructor(
    public readonly code: DiscoveryProviderErrorCode,
    message: string,
    options?: { cause?: unknown }
  ) {
    super(message)
    this.name = 'DiscoveryProviderError'
    this.internalCause = options?.cause
  }
}

export interface DiscoveryProvider<TRawResponse = unknown> {
  readonly capabilities: DiscoveryProviderCapabilities
  name(): DiscoveryProviderIdentifier
  supports(request: DiscoveryProviderRequest): boolean
  search(
    request: DiscoveryProviderRequest,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<TRawResponse>
  normalize(
    response: TRawResponse,
    request: DiscoveryProviderRequest
  ):
    readonly DiscoveryProviderItem[] | Promise<readonly DiscoveryProviderItem[]>
}

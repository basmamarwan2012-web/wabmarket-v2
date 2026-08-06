import 'server-only'

import { performance } from 'node:perf_hooks'
import { z } from 'zod'

import type {
  DiscoveryProviderExecutionContext,
  DiscoveryProviderItem,
  DiscoveryProviderRequest,
  DiscoveryProviderResult,
} from '@/types/discovery-provider'
import { DiscoveryProviderError, type DiscoveryProvider } from './provider'

const itemSchema = z
  .object({
    provider: z.string().trim().min(1),
    sourceRecordId: z.string().nullable(),
    sourceUrl: z.string().url().nullable(),
    source: z.string().nullable(),
    sourceTitle: z.string().nullable(),
    currentDomain: z.string().nullable(),
    candidateDomain: z.string().nullable(),
    website: z.string().url().nullable(),
    businessName: z.string().nullable(),
    city: z.string().nullable(),
    country: z.string().nullable(),
    acquisitionStatus: z
      .enum([
        'available',
        'registered',
        'premium',
        'auction',
        'closeout',
        'expired',
        'unknown',
      ])
      .nullable(),
    metadata: z.record(z.unknown()),
  })
  .strict()

export class DiscoveryEngine<TRawResponse = unknown> {
  constructor(private readonly provider: DiscoveryProvider<TRawResponse>) {}

  async execute(
    request: DiscoveryProviderRequest,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<DiscoveryProviderResult> {
    let supported: boolean
    try {
      supported = this.provider.supports(request)
    } catch (error) {
      throw new DiscoveryProviderError(
        'PROVIDER_EXECUTION_FAILED',
        'Provider support validation failed.',
        { cause: error }
      )
    }
    if (!supported) {
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'The provider does not support this discovery request.'
      )
    }

    const startedAt = new Date()
    const monotonicStart = performance.now()
    let rawResponse: TRawResponse
    try {
      rawResponse = await this.provider.search(request, context)
    } catch (error) {
      if (error instanceof DiscoveryProviderError) throw error
      throw new DiscoveryProviderError(
        'PROVIDER_EXECUTION_FAILED',
        'The provider search failed.',
        { cause: error }
      )
    }

    let normalized: readonly DiscoveryProviderItem[]
    try {
      normalized = await this.provider.normalize(rawResponse, request)
    } catch (error) {
      throw new DiscoveryProviderError(
        'PROVIDER_NORMALIZATION_FAILED',
        'The provider response could not be normalized.',
        { cause: error }
      )
    }

    const parsed = z.array(itemSchema).safeParse(normalized)
    const providerIdentifier = this.provider.name()
    if (
      !parsed.success ||
      parsed.data.some((item) => item.provider !== providerIdentifier)
    ) {
      throw new DiscoveryProviderError(
        'PROVIDER_INVALID_NORMALIZED_RESULT',
        'The provider returned an invalid normalized result.',
        { cause: parsed.success ? undefined : parsed.error }
      )
    }

    const completedAt = new Date()
    return {
      provider: providerIdentifier,
      query: request,
      startedAt: startedAt.toISOString(),
      completedAt: completedAt.toISOString(),
      durationMs: Math.max(0, performance.now() - monotonicStart),
      items: parsed.data,
    }
  }
}

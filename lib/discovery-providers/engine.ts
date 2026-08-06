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

interface DiagnosticProvider<TRawResponse> extends DiscoveryProvider<TRawResponse> {
  normalizeWithDiagnostics(
    response: TRawResponse,
    request: DiscoveryProviderRequest
  ): {
    readonly items: readonly DiscoveryProviderItem[]
    readonly diagnostics: unknown
  }
}

export interface DiscoveryEngineDiagnosticResult {
  readonly result: DiscoveryProviderResult
  readonly diagnostics: unknown
}

const supportsDiagnostics = <TRawResponse>(
  provider: DiscoveryProvider<TRawResponse>
): provider is DiagnosticProvider<TRawResponse> =>
  'normalizeWithDiagnostics' in provider &&
  typeof provider.normalizeWithDiagnostics === 'function'

export class DiscoveryEngine<TRawResponse = unknown> {
  constructor(private readonly provider: DiscoveryProvider<TRawResponse>) {}

  get providerIdentifier() {
    return this.provider.name()
  }

  async execute(
    request: DiscoveryProviderRequest,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<DiscoveryProviderResult> {
    return (await this.executeInternal(request, context, false)).result
  }

  async executeWithDiagnostics(
    request: DiscoveryProviderRequest,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<DiscoveryEngineDiagnosticResult> {
    return this.executeInternal(request, context, true)
  }

  private async executeInternal(
    request: DiscoveryProviderRequest,
    context: Readonly<DiscoveryProviderExecutionContext> | undefined,
    includeDiagnostics: boolean
  ): Promise<DiscoveryEngineDiagnosticResult> {
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
    if (!supported)
      throw new DiscoveryProviderError(
        'PROVIDER_UNSUPPORTED_REQUEST',
        'The provider does not support this discovery request.'
      )

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
    let diagnostics: unknown = null
    try {
      if (includeDiagnostics) {
        if (!supportsDiagnostics(this.provider))
          throw new DiscoveryProviderError(
            'PROVIDER_INVALID_CONFIGURATION',
            'Provider diagnostics are unavailable.'
          )
        const outcome = this.provider.normalizeWithDiagnostics(
          rawResponse,
          request
        )
        normalized = outcome.items
        diagnostics = outcome.diagnostics
      } else {
        normalized = await this.provider.normalize(rawResponse, request)
      }
    } catch (error) {
      if (error instanceof DiscoveryProviderError) throw error
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
    )
      throw new DiscoveryProviderError(
        'PROVIDER_INVALID_NORMALIZED_RESULT',
        'The provider returned an invalid normalized result.',
        { cause: parsed.success ? undefined : parsed.error }
      )

    const completedAt = new Date()
    return Object.freeze({
      result: Object.freeze({
        provider: providerIdentifier,
        query: request,
        startedAt: startedAt.toISOString(),
        completedAt: completedAt.toISOString(),
        durationMs: Math.max(0, performance.now() - monotonicStart),
        items: parsed.data,
      }),
      diagnostics,
    })
  }
}

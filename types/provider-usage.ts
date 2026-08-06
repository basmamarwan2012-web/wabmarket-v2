import type { DiscoveryProviderIdentifier } from './discovery-provider'
import type { RequestCostMeasurement } from './provider-budget'

export interface ProviderUsageSnapshot {
  readonly providerIdentifier: DiscoveryProviderIdentifier
  readonly requests: number
  readonly successfulRequests: number
  readonly failedRequests: number
  readonly cacheHits: number
  readonly cacheMisses: number
  readonly quotaDenials: number
  readonly budgetDenials: number
  readonly healthDenials: number
  readonly totalDurationMs: number
  readonly measuredRequestCount: number
  readonly lastExecutionAt: string | null
  readonly lastSuccessAt: string | null
  readonly lastFailureAt: string | null
  readonly estimatedRequestCost: RequestCostMeasurement | null
  readonly actualRequestCost: RequestCostMeasurement | null
}

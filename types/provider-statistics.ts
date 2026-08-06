import type { DiscoveryProviderIdentifier } from './discovery-provider'
import type { RequestCostMeasurement } from './provider-budget'

export type ProviderStatisticsEventType =
  | 'provider_selected'
  | 'provider_skipped'
  | 'provider_success'
  | 'provider_failure'
  | 'fallback_executed'
  | 'aggregation_executed'
  | 'cache_hit'
  | 'cache_miss'
  | 'quota_denied'
  | 'budget_denied'
  | 'health_denied'

/** One future measurement, distinct from accumulated usage snapshots. */
export interface ProviderStatisticsEvent {
  readonly event: ProviderStatisticsEventType
  readonly providerIdentifier: DiscoveryProviderIdentifier | null
  readonly occurredAt: string | null
  readonly executionDurationMs: number | null
  readonly offersReturned: number | null
  readonly estimatedCost: RequestCostMeasurement | null
  readonly actualCost: RequestCostMeasurement | null
  readonly reasonCode: string | null
}

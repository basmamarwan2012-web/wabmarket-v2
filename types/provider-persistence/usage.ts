import type { NonNegativeFiniteNumber, NonNegativeInteger, PersistenceDocumentMetadata, PersistenceMoney, PersistenceTimestamp } from './base'

export const PROVIDER_USAGE_SCHEMA_VERSION = 1 as const
export type UsageScope = 'provider' | 'tenant'
export type UsagePeriod = 'daily' | 'monthly'

/** Immutable snapshot; average duration is derived from total/count. */
export interface ProviderUsageSnapshotPersistence extends PersistenceDocumentMetadata {
  readonly scope: UsageScope
  readonly provider_identifier: string | null
  readonly period: UsagePeriod
  readonly period_start: PersistenceTimestamp
  readonly period_end: PersistenceTimestamp
  readonly requests: NonNegativeInteger
  readonly successful_requests: NonNegativeInteger
  readonly failed_requests: NonNegativeInteger
  readonly cache_hits: NonNegativeInteger
  readonly cache_misses: NonNegativeInteger
  readonly quota_denials: NonNegativeInteger
  readonly budget_denials: NonNegativeInteger
  readonly health_denials: NonNegativeInteger
  readonly total_duration_ms: NonNegativeFiniteNumber
  readonly measured_request_count: NonNegativeInteger
  readonly estimated_request_cost_total: PersistenceMoney
  readonly actual_request_cost_total: PersistenceMoney
}

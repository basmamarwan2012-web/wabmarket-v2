import type { DiscoveryProviderCategory, DiscoverySearchMode } from '../discovery-provider'
import type { OrchestrationStrategy } from '../discovery-orchestrator'
import type { ProviderStatisticsEventType } from '../provider-statistics'
import type { NonNegativeFiniteNumber, NonNegativeInteger, PersistenceDocumentMetadata, PersistenceMoney, PersistenceTimestamp, SafePersistenceValue } from './base'

export const PROVIDER_STATISTICS_SCHEMA_VERSION = 1 as const

/** Append-only safe event; raw errors, requests, credentials, and tokens are forbidden. */
export interface ProviderStatisticsEventPersistence extends PersistenceDocumentMetadata {
  readonly event_type: ProviderStatisticsEventType
  readonly provider_identifier: string | null
  readonly strategy: OrchestrationStrategy | null
  readonly search_mode: DiscoverySearchMode | null
  readonly provider_category: DiscoveryProviderCategory | null
  readonly reason_code: string | null
  readonly duration_ms: NonNegativeFiniteNumber | null
  readonly result_count: NonNegativeInteger | null
  readonly offer_count: NonNegativeInteger | null
  readonly estimated_request_cost: PersistenceMoney | null
  readonly actual_request_cost: PersistenceMoney | null
  readonly occurred_at: PersistenceTimestamp
  readonly correlation_reference: string | null
  readonly provider_api_version: string | null
  readonly metadata: Readonly<Record<string, SafePersistenceValue>>
}

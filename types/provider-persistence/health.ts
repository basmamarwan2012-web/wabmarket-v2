import type { ProviderHealthState } from '../provider-health'
import type { NonNegativeInteger, PersistenceDocumentMetadata, PersistenceTimestamp } from './base'

export const PROVIDER_HEALTH_SCHEMA_VERSION = 1 as const

/** Immutable health history snapshot. Quota remains a separate decision domain. */
export interface ProviderHealthSnapshotPersistence extends PersistenceDocumentMetadata {
  readonly provider_identifier: string
  readonly state: ProviderHealthState
  readonly last_success_at: PersistenceTimestamp | null
  readonly last_failure_at: PersistenceTimestamp | null
  readonly retry_after: PersistenceTimestamp | null
  readonly consecutive_failures: NonNegativeInteger
  readonly availability_score: number | null
  readonly safe_reason: string | null
  readonly observed_at: PersistenceTimestamp
}

import type { NonNegativeInteger, PersistenceDocumentMetadata, PersistenceTimestamp } from './base'

export const PROVIDER_QUOTA_RESERVATION_SCHEMA_VERSION = 1 as const
export type PersistedReservationStatus = 'reserved' | 'committed' | 'released' | 'expired'
export type QuotaUnitType = 'request' | 'result_page' | 'item' | 'batch_item'

export interface QuotaReservationPersistence extends PersistenceDocumentMetadata {
  readonly provider_identifier: string
  readonly token_digest: string
  readonly idempotency_key: string
  readonly operation_type: string
  readonly request_fingerprint: string | null
  readonly correlation_reference: string | null
  readonly status: PersistedReservationStatus
  readonly estimated_units: NonNegativeInteger
  readonly committed_units: NonNegativeInteger | null
  readonly unit_type: QuotaUnitType
  readonly reserved_at: PersistenceTimestamp
  readonly expires_at: PersistenceTimestamp
  readonly committed_at: PersistenceTimestamp | null
  readonly released_at: PersistenceTimestamp | null
  readonly expired_at: PersistenceTimestamp | null
}

import type { PersistedReservationStatus } from './quota-reservation'
import type { NonNegativeFiniteNumber, PersistenceDocumentMetadata, PersistenceTimestamp } from './base'

export const PROVIDER_BUDGET_RESERVATION_SCHEMA_VERSION = 1 as const

export interface BudgetReservationPersistence extends PersistenceDocumentMetadata {
  readonly provider_identifier: string
  readonly token_digest: string
  readonly idempotency_key: string
  readonly operation_type: string
  readonly request_fingerprint: string | null
  readonly correlation_reference: string | null
  readonly status: PersistedReservationStatus
  readonly estimated_amount: NonNegativeFiniteNumber
  readonly committed_amount: NonNegativeFiniteNumber | null
  readonly currency: string
  readonly pricing_tier_identifier: string | null
  readonly reserved_at: PersistenceTimestamp
  readonly expires_at: PersistenceTimestamp
  readonly committed_at: PersistenceTimestamp | null
  readonly released_at: PersistenceTimestamp | null
  readonly expired_at: PersistenceTimestamp | null
}

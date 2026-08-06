import 'server-only'

import type { QuotaReservationPersistence } from '@/types/provider-persistence'
import type { NonNegativeInteger } from '@/types/provider-persistence'
import type { RepositoryContext } from './repository-context'

export interface QuotaCommitTransition { readonly committedUnits: NonNegativeInteger; readonly committedAt: string; readonly idempotencyKey: string }
export interface ReservationReleaseTransition { readonly releasedAt: string; readonly idempotencyKey: string }
export interface ReservationExpireTransition { readonly expiredAt: string; readonly idempotencyKey: string }

export interface ProviderQuotaRepository {
  findByTokenDigest(context: RepositoryContext, tokenDigest: string): Promise<QuotaReservationPersistence | null>
  createReservation(context: RepositoryContext, document: QuotaReservationPersistence): Promise<void>
  commitReserved(context: RepositoryContext, id: string, transition: QuotaCommitTransition): Promise<QuotaReservationPersistence>
  releaseReserved(context: RepositoryContext, id: string, transition: ReservationReleaseTransition): Promise<QuotaReservationPersistence>
  expireReserved(context: RepositoryContext, id: string, transition: ReservationExpireTransition): Promise<QuotaReservationPersistence>
}

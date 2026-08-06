import 'server-only'

import type { BudgetReservationPersistence } from '@/types/provider-persistence'
import type { NonNegativeFiniteNumber } from '@/types/provider-persistence'
import type { RepositoryContext } from './repository-context'
import type { ReservationExpireTransition, ReservationReleaseTransition } from './provider-quota.repository'

export interface BudgetCommitTransition { readonly committedAmount: NonNegativeFiniteNumber; readonly currency: string; readonly committedAt: string; readonly idempotencyKey: string }

export interface ProviderBudgetRepository {
  findByTokenDigest(context: RepositoryContext, tokenDigest: string): Promise<BudgetReservationPersistence | null>
  createReservation(context: RepositoryContext, document: BudgetReservationPersistence): Promise<void>
  commitReserved(context: RepositoryContext, id: string, transition: BudgetCommitTransition): Promise<BudgetReservationPersistence>
  releaseReserved(context: RepositoryContext, id: string, transition: ReservationReleaseTransition): Promise<BudgetReservationPersistence>
  expireReserved(context: RepositoryContext, id: string, transition: ReservationExpireTransition): Promise<BudgetReservationPersistence>
}

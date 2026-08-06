import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { QuotaDecision, QuotaReservation, QuotaReservationToken } from '@/types/provider-quota'

export interface QuotaManager {
  validate(providerIdentifier: DiscoveryProviderIdentifier, expectedRequests: number): Promise<QuotaDecision>
  reserve(providerIdentifier: DiscoveryProviderIdentifier, expectedRequests: number, idempotencyKey: string): Promise<QuotaReservation>
  commit(token: QuotaReservationToken, actualRequests: number, idempotencyKey: string): Promise<QuotaReservation>
  reconcile(token: QuotaReservationToken, actualRequests: number, idempotencyKey: string): Promise<QuotaReservation>
  release(token: QuotaReservationToken, idempotencyKey: string): Promise<QuotaReservation>
}

import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { QuotaDecision } from '@/types/discovery-orchestrator'

export interface QuotaReservation { reservationId: string; providerIdentifier: DiscoveryProviderIdentifier }
export interface QuotaManager {
  check(providerIdentifier: DiscoveryProviderIdentifier): Promise<QuotaDecision>
  reserve(providerIdentifier: DiscoveryProviderIdentifier): Promise<QuotaReservation>
  recordActualUsage(reservation: QuotaReservation, requestCount: number): Promise<void>
  release(reservation: QuotaReservation): Promise<void>
}

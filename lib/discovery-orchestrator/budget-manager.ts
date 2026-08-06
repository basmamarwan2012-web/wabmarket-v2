import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { BudgetDecision } from '@/types/discovery-orchestrator'

export interface BudgetReservation { reservationId: string; providerIdentifier: DiscoveryProviderIdentifier; estimatedCost: number; currency: string | null }
export interface BudgetManager {
  check(providerIdentifier: DiscoveryProviderIdentifier, estimatedCost: number | null): Promise<BudgetDecision>
  reserve(providerIdentifier: DiscoveryProviderIdentifier, estimatedCost: number, currency: string | null): Promise<BudgetReservation>
  recordActualUsage(reservation: BudgetReservation, actualCost: number): Promise<void>
  reconcile(reservation: BudgetReservation, actualCost: number): Promise<void>
  release(reservation: BudgetReservation): Promise<void>
}

export function isValidMoney(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

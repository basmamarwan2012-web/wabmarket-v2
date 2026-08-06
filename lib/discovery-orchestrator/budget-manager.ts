import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type {
  BudgetDecision,
  BudgetReservation,
  BudgetReservationToken,
  RequestCostMeasurement,
  RequestPricingContext,
} from '@/types/provider-budget'

export interface BudgetManager {
  validate(context: Readonly<RequestPricingContext>): Promise<BudgetDecision>
  reserve(estimatedCost: RequestCostMeasurement, idempotencyKey: string): Promise<BudgetReservation>
  commit(token: BudgetReservationToken, actualCost: RequestCostMeasurement, idempotencyKey: string): Promise<BudgetReservation>
  reconcile(token: BudgetReservationToken, actualCost: RequestCostMeasurement, idempotencyKey: string): Promise<BudgetReservation>
  release(token: BudgetReservationToken, idempotencyKey: string): Promise<BudgetReservation>
}

export function isValidMoney(value: number): boolean {
  return Number.isFinite(value) && value >= 0
}

import type { DiscoveryProviderIdentifier, DiscoverySearchMode } from './discovery-provider'

export interface MoneyAmount { readonly amount: number; readonly currency: string | null }
export interface RequestPricingContext {
  readonly providerIdentifier: DiscoveryProviderIdentifier
  readonly operation: string
  readonly searchMode: DiscoverySearchMode
  readonly tierIdentifier: string | null
  readonly resultPage: number | null
  readonly requestSize: number | null
  readonly batchSize: number | null
}
export interface RequestCostMeasurement extends MoneyAmount {
  readonly providerIdentifier: DiscoveryProviderIdentifier
  readonly pricingTierIdentifier: string | null
  readonly measuredAt: string | null
}
export interface BudgetLimits {
  readonly providerDaily: MoneyAmount
  readonly providerMonthly: MoneyAmount
  readonly tenantDaily: MoneyAmount
  readonly tenantMonthly: MoneyAmount
}
export interface BudgetPolicy {
  readonly paidProvidersEnabled: boolean
  readonly emergencyStop: boolean
  readonly limits: BudgetLimits
}
export type BudgetDecisionStatus = 'allowed' | 'blocked' | 'daily_limit_reached' | 'monthly_limit_reached' | 'paid_disabled' | 'emergency_stop' | 'unknown_cost'
export interface BudgetDecision {
  readonly status: BudgetDecisionStatus
  readonly reasonCode: string
  readonly estimatedCost: RequestCostMeasurement | null
  readonly providerRemaining: MoneyAmount | null
  readonly tenantRemaining: MoneyAmount | null
  readonly costKnown: boolean
  readonly currencyCompatible: boolean
}
declare const budgetReservationBrand: unique symbol
export type BudgetReservationToken = string & { readonly [budgetReservationBrand]: true }
export type ReservationStatus = 'reserved' | 'committed' | 'released' | 'expired' | 'unknown'
export interface BudgetReservation { readonly token: BudgetReservationToken; readonly status: ReservationStatus; readonly estimatedCost: RequestCostMeasurement; readonly idempotencyKey: string }

import type { DiscoveryProviderIdentifier } from './discovery-provider'
import type { ReservationStatus } from './provider-budget'

export interface QuotaLimits { readonly providerDaily: number | null; readonly providerMonthly: number | null; readonly tenantDaily: number | null; readonly tenantMonthly: number | null }
export type QuotaDecisionStatus = 'allowed' | 'denied' | 'exhausted' | 'unknown'
export interface QuotaDecision { readonly status: QuotaDecisionStatus; readonly reasonCode: string; readonly providerDailyRemaining: number | null; readonly providerMonthlyRemaining: number | null; readonly tenantDailyRemaining: number | null; readonly tenantMonthlyRemaining: number | null; readonly freeQuotaRemaining: number | null; readonly resetsAt: string | null; readonly decisionKnown: boolean }
declare const quotaReservationBrand: unique symbol
export type QuotaReservationToken = string & { readonly [quotaReservationBrand]: true }
export interface QuotaReservation { readonly token: QuotaReservationToken; readonly providerIdentifier: DiscoveryProviderIdentifier; readonly expectedRequests: number; readonly status: ReservationStatus; readonly idempotencyKey: string }

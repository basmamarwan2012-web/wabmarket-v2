import type { DiscoveryProviderCategory, DiscoveryProviderIdentifier, DiscoveryProviderRequest, DiscoveryProviderResult, DiscoverySearchMode } from './discovery-provider'
import type { DomainAcquisitionIntelligence, DomainAcquisitionOffer, ProviderCoverage } from './domain-acquisition'

export type OrchestrationStrategy = 'priority_fallback' | 'parallel_aggregation'

export interface ProviderPolicy {
  providerIdentifier: DiscoveryProviderIdentifier
  enabled: boolean
  priority: number
  categories: readonly DiscoveryProviderCategory[]
  /** Restricts execution to a zero-request-cost tier. */
  freeOnly: boolean
  requiresPaidAccess: boolean
  /** Account-level opt-in to request-cost-incurring providers. */
  paidProvidersEnabled: boolean
  dailyRequestLimit: number | null
  monthlyRequestLimit: number | null
  dailyCostLimit: number
  monthlyCostLimit: number
  emergencyStop: boolean
  supportsBatch: boolean
  fallbackAllowed: boolean
  aggregationAllowed: boolean
  searchModePriorities: Readonly<Partial<Record<DiscoverySearchMode, number>>>
}

export type QuotaDecisionStatus = 'allowed' | 'denied' | 'exhausted' | 'unknown'
export interface QuotaDecision { status: QuotaDecisionStatus; reasonCode: string; dailyRemaining: number | null; monthlyRemaining: number | null; freeQuotaRemaining: number | null; resetsAt: string | null }

export type BudgetDecisionStatus = 'allowed' | 'denied' | 'emergency_stop' | 'paid_provider_disabled' | 'daily_limit_reached' | 'monthly_limit_reached' | 'unknown_cost'
export interface BudgetDecision { status: BudgetDecisionStatus; reasonCode: string; estimatedRequestCost: number | null; currency: string | null }

export type ProviderHealthState = 'healthy' | 'degraded' | 'offline' | 'quota_exhausted' | 'disabled' | 'unknown'
export interface ProviderHealthDecision { state: ProviderHealthState; allowed: boolean; reason: string | null; lastSuccessAt: string | null; lastFailureAt: string | null; consecutiveFailures: number; retryAfter: string | null }

export interface CanonicalFingerprintCriteria { searchMode: DiscoverySearchMode; keyword: string | null; city: string | null; state: string | null; country: string | null; language: string | null; candidateDomain: string | null; requestedExtensions: readonly string[]; providerCategory: DiscoveryProviderCategory; strategy: OrchestrationStrategy }

export type OrchestrationCacheValue = { kind: 'discovery'; value: DiscoveryProviderResult } | { kind: 'acquisition'; value: DomainAcquisitionIntelligence }
export interface CacheRecord<T extends OrchestrationCacheValue> { fingerprint: string; createdAt: string; expiresAt: string; providerIdentifiers: readonly DiscoveryProviderIdentifier[]; sourceStrategy: OrchestrationStrategy; cacheHit: boolean; stale: boolean; value: T }

export type FailoverFailureCategory = 'quota_exhausted' | 'budget_blocked' | 'provider_unhealthy' | 'unsupported_request' | 'temporary_failure' | 'permanent_failure' | 'provider_not_implemented'
export type FailoverDecision = { action: 'next_provider'; providerIdentifier: DiscoveryProviderIdentifier } | { action: 'stop' } | { action: 'retry_later' } | { action: 'no_free_provider_available' }

export const ORCHESTRATION_RESULT_CODES = ['ORCHESTRATOR_CACHE_HIT', 'ORCHESTRATOR_PROVIDER_SUCCESS', 'ORCHESTRATOR_FALLBACK_SUCCESS', 'ORCHESTRATOR_AGGREGATED_SUCCESS', 'ORCHESTRATOR_NO_PROVIDER', 'ORCHESTRATOR_NO_FREE_PROVIDER', 'ORCHESTRATOR_QUOTA_EXHAUSTED', 'ORCHESTRATOR_BUDGET_BLOCKED', 'ORCHESTRATOR_EMERGENCY_STOP', 'ORCHESTRATOR_PROVIDER_UNHEALTHY', 'ORCHESTRATOR_UNSUPPORTED_REQUEST', 'ORCHESTRATOR_EXECUTION_FAILED', 'ORCHESTRATOR_AGGREGATION_FAILED', 'ORCHESTRATOR_DORMANT'] as const
export type OrchestrationResultCode = (typeof ORCHESTRATION_RESULT_CODES)[number]
type SuccessCode = 'ORCHESTRATOR_CACHE_HIT' | 'ORCHESTRATOR_PROVIDER_SUCCESS' | 'ORCHESTRATOR_FALLBACK_SUCCESS'
export type SafeOrchestrationResult =
  | { success: true; code: SuccessCode; strategy: 'priority_fallback'; result: DiscoveryProviderResult }
  | { success: true; code: 'ORCHESTRATOR_AGGREGATED_SUCCESS'; strategy: 'parallel_aggregation'; result: DomainAcquisitionIntelligence; coverage: readonly ProviderCoverage[] }
  | { success: false; code: Exclude<OrchestrationResultCode, SuccessCode | 'ORCHESTRATOR_AGGREGATED_SUCCESS'>; message: string; partialOffers?: readonly DomainAcquisitionOffer[]; coverage?: readonly ProviderCoverage[] }

export interface ProviderSelectionRequest { request: DiscoveryProviderRequest; category: DiscoveryProviderCategory; strategy: OrchestrationStrategy }

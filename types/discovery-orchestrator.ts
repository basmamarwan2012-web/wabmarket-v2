import type { DiscoveryProviderCategory, DiscoveryProviderIdentifier, DiscoveryProviderRequest, DiscoveryProviderResult, DiscoverySearchMode } from './discovery-provider'
import type { DomainAcquisitionIntelligence, DomainAcquisitionOffer, ProviderCoverage } from './domain-acquisition'
import type { BudgetDecision } from './provider-budget'
import type { ProviderHealthDecision } from './provider-health'
import type { ProviderSettings } from './provider-policy'
import type { QuotaDecision } from './provider-quota'

export type OrchestrationStrategy = 'priority_fallback' | 'parallel_aggregation'

export interface CanonicalFingerprintCriteria { searchMode: DiscoverySearchMode; keyword: string | null; city: string | null; state: string | null; country: string | null; language: string | null; candidateDomain: string | null; requestedExtensions: readonly string[]; providerCategory: DiscoveryProviderCategory; strategy: OrchestrationStrategy }

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
export interface EligibleProviderCandidate { providerIdentifier: DiscoveryProviderIdentifier; settings: ProviderSettings; eligibility: ProviderEligibilityResult }

export type EligibilitySeverity = 'blocking' | 'warning' | 'informational'
export type EligibilityReasonCode = 'POLICY_INVALID_CONFIGURATION' | 'POLICY_UNKNOWN_PROVIDER' | 'POLICY_PROVIDER_DISABLED' | 'POLICY_CATEGORY_UNSUPPORTED' | 'POLICY_CAPABILITY_UNSUPPORTED' | 'POLICY_SEARCH_MODE_UNSUPPORTED' | 'POLICY_REQUEST_INCOMPATIBLE' | 'POLICY_PAID_PROVIDER_DISABLED' | 'POLICY_FREE_ONLY_REQUIRED' | 'POLICY_EMERGENCY_STOP' | 'POLICY_PROVIDER_UNHEALTHY' | 'POLICY_QUOTA_EXHAUSTED' | 'POLICY_BUDGET_BLOCKED'
export interface EligibilityReason { readonly code: EligibilityReasonCode; readonly severity: EligibilitySeverity; readonly message: string }
export interface ProviderEligibilityResult { readonly providerIdentifier: DiscoveryProviderIdentifier; readonly eligible: boolean; readonly reasons: readonly EligibilityReason[] }
export interface ProviderEligibilityInput {
  readonly providerIdentifier: DiscoveryProviderIdentifier
  readonly configurationValid: boolean
  readonly providerKnown: boolean
  readonly enabled: boolean
  readonly categorySupported: boolean
  readonly capabilitySupported: boolean
  readonly searchModeSupported: boolean
  readonly requestCompatible: boolean
  readonly executionPolicyAllowed: boolean
  readonly executionPolicyReason: EligibilityReasonCode | null
  readonly emergencyStopBlocked: boolean
  readonly healthDecision: ProviderHealthDecision
  readonly quotaDecision: QuotaDecision
  readonly budgetDecision: BudgetDecision
}

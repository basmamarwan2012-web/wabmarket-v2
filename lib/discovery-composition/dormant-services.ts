import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { DomainAcquisitionIntelligence } from '@/types/domain-acquisition'
import type { EligibleProviderCandidate, FailoverDecision, ProviderSelectionRequest } from '@/types/discovery-orchestrator'
import type { BudgetDecision, BudgetReservation, BudgetReservationToken, RequestCostMeasurement, RequestPricingContext } from '@/types/provider-budget'
import type { FingerprintInput, ProviderCacheRecord, ProviderCacheValue } from '@/types/provider-cache'
import type { ProviderHealthDecision } from '@/types/provider-health'
import type { ProviderPolicyBundle } from '@/types/provider-policy'
import type { QuotaDecision, QuotaReservation, QuotaReservationToken } from '@/types/provider-quota'
import type { ProviderStatisticsEvent } from '@/types/provider-statistics'
import type { ReadonlyDiscoveryProviderRegistry, RegisteredProviderView } from '@/types/discovery-composition'
import type { DiscoveryProvider } from '@/lib/discovery-providers'
import type { AcquisitionAggregationInput, AcquisitionOfferAggregator } from '@/lib/discovery-orchestrator/acquisition-offer-aggregator'
import type { BudgetManager } from '@/lib/discovery-orchestrator/budget-manager'
import type { CacheManager } from '@/lib/discovery-orchestrator/cache-manager'
import { DiscoveryOrchestrationError } from '@/lib/discovery-orchestrator/errors'
import type { FailoverContext, FailoverManager } from '@/lib/discovery-orchestrator/failover-manager'
import type { HealthMonitor } from '@/lib/discovery-orchestrator/health-monitor'
import { ProviderPolicyError } from '@/lib/discovery-orchestrator/policy-errors'
import type { ProviderPolicyManager } from '@/lib/discovery-orchestrator/provider-policy'
import type { ProviderSelector } from '@/lib/discovery-orchestrator/provider-selector'
import type { QuotaManager } from '@/lib/discovery-orchestrator/quota-manager'
import type { RequestFingerprint } from '@/lib/discovery-orchestrator/request-fingerprint'
import type { StatisticsCollector } from '@/lib/discovery-orchestrator/statistics-collector'
import type { EligibilityEvaluator } from './eligibility-evaluator'

const dormant = (): never => {
  throw new DiscoveryOrchestrationError(
    'ORCHESTRATOR_DORMANT',
    'Discovery composition is dormant.'
  )
}

export class ReadonlyRegistryView implements ReadonlyDiscoveryProviderRegistry {
  private readonly views: readonly RegisteredProviderView[]

  constructor(providers: readonly DiscoveryProvider[]) {
    this.views = Object.freeze(
      providers.map((provider) =>
        Object.freeze({
          identifier: provider.name(),
          displayName: provider.capabilities.displayName,
          capabilities: provider.capabilities,
        })
      )
    )
  }

  get(identifier: DiscoveryProviderIdentifier) {
    return this.views.find((provider) => provider.identifier === identifier) ?? null
  }
  has(identifier: DiscoveryProviderIdentifier) {
    return this.views.some((provider) => provider.identifier === identifier)
  }
  listIdentifiers() {
    return Object.freeze(this.views.map((provider) => provider.identifier))
  }
  listProviders() {
    return Object.freeze([...this.views])
  }
}

export class InactiveProviderPolicyManager implements ProviderPolicyManager {
  private readonly policies: ReadonlyMap<DiscoveryProviderIdentifier, ProviderPolicyBundle>

  constructor(policies: readonly ProviderPolicyBundle[]) {
    this.policies = new Map(
      policies.map((policy) => [policy.declaration.identifier, policy])
    )
  }

  getPolicy(providerIdentifier: DiscoveryProviderIdentifier) {
    const policy = this.policies.get(providerIdentifier)
    if (!policy)
      throw new ProviderPolicyError(
        'POLICY_UNKNOWN_PROVIDER',
        'Provider policy is unavailable.'
      )
    return policy
  }
}

export class DormantProviderSelector implements ProviderSelector {
  constructor(private readonly eligibilityEvaluator: EligibilityEvaluator) {}

  select(
    _request: Readonly<ProviderSelectionRequest>,
    _candidates: readonly EligibleProviderCandidate[]
  ): readonly EligibleProviderCandidate[] {
    void this.eligibilityEvaluator
    return dormant()
  }
}

export class DormantCacheManager implements CacheManager {
  lookup<T extends ProviderCacheValue>(_fingerprint: string, _namespace: string): Promise<ProviderCacheRecord<T> | null> { return dormant() }
  store<T extends ProviderCacheValue>(_record: ProviderCacheRecord<T>): Promise<void> { return dormant() }
  invalidate(_fingerprint: string): Promise<void> { return dormant() }
  invalidateByProvider(_providerIdentifier: string): Promise<void> { return dormant() }
  invalidateByFingerprint(_fingerprint: string): Promise<void> { return dormant() }
}

export class DormantBudgetManager implements BudgetManager {
  validate(_context: Readonly<RequestPricingContext>): Promise<BudgetDecision> { return dormant() }
  reserve(_cost: RequestCostMeasurement, _key: string): Promise<BudgetReservation> { return dormant() }
  commit(_token: BudgetReservationToken, _cost: RequestCostMeasurement, _key: string): Promise<BudgetReservation> { return dormant() }
  reconcile(_token: BudgetReservationToken, _cost: RequestCostMeasurement, _key: string): Promise<BudgetReservation> { return dormant() }
  release(_token: BudgetReservationToken, _key: string): Promise<BudgetReservation> { return dormant() }
}

export class DormantQuotaManager implements QuotaManager {
  validate(_provider: DiscoveryProviderIdentifier, _requests: number): Promise<QuotaDecision> { return dormant() }
  reserve(_provider: DiscoveryProviderIdentifier, _requests: number, _key: string): Promise<QuotaReservation> { return dormant() }
  commit(_token: QuotaReservationToken, _requests: number, _key: string): Promise<QuotaReservation> { return dormant() }
  reconcile(_token: QuotaReservationToken, _requests: number, _key: string): Promise<QuotaReservation> { return dormant() }
  release(_token: QuotaReservationToken, _key: string): Promise<QuotaReservation> { return dormant() }
}

export class DormantHealthMonitor implements HealthMonitor {
  check(_provider: DiscoveryProviderIdentifier): Promise<ProviderHealthDecision> { return dormant() }
  recordSuccess(_provider: DiscoveryProviderIdentifier): Promise<void> { return dormant() }
  recordFailure(_provider: DiscoveryProviderIdentifier, _reason: string): Promise<void> { return dormant() }
}

export class DormantStatisticsCollector implements StatisticsCollector {
  record(_event: Readonly<ProviderStatisticsEvent>): Promise<void> { return dormant() }
}

export class DormantRequestFingerprint implements RequestFingerprint {
  create(_input: Readonly<FingerprintInput>): Promise<string> { return dormant() }
}

export class DormantFailoverManager implements FailoverManager {
  decide(_context: Readonly<FailoverContext>): FailoverDecision { return dormant() }
}

export class DormantAcquisitionOfferAggregator implements AcquisitionOfferAggregator {
  aggregate(_input: Readonly<AcquisitionAggregationInput>): DomainAcquisitionIntelligence { return dormant() }
}

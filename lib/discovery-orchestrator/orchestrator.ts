import 'server-only'

import type { DiscoveryProviderCategory, DiscoveryProviderExecutionContext, DiscoveryProviderIdentifier, DiscoveryProviderRequest, DiscoveryProviderResult } from '@/types/discovery-provider'
import type { SafeOrchestrationResult } from '@/types/discovery-orchestrator'
import type { DiscoveryProviderRegistry } from '@/lib/discovery-providers'
import type { AcquisitionOfferAggregator } from './acquisition-offer-aggregator'
import type { BudgetManager } from './budget-manager'
import type { CacheManager } from './cache-manager'
import { DiscoveryOrchestrationError } from './errors'
import type { FailoverManager } from './failover-manager'
import type { HealthMonitor } from './health-monitor'
import type { ProviderPolicyManager } from './provider-policy'
import type { ProviderSelector } from './provider-selector'
import type { QuotaManager } from './quota-manager'
import type { RequestFingerprint } from './request-fingerprint'
import type { StatisticsCollector } from './statistics-collector'

export interface DiscoveryOrchestratorDependencies {
  registry: DiscoveryProviderRegistry
  providerSelector: ProviderSelector
  providerPolicyManager: ProviderPolicyManager
  cacheManager: CacheManager
  quotaManager: QuotaManager
  budgetManager: BudgetManager
  healthMonitor: HealthMonitor
  statisticsCollector: StatisticsCollector
  failoverManager: FailoverManager
  acquisitionOfferAggregator: AcquisitionOfferAggregator
  requestFingerprint: RequestFingerprint
  engineGateway: DiscoveryEngineGateway
}

export interface DiscoveryEngineGateway {
  executeProvider(
    providerIdentifier: DiscoveryProviderIdentifier,
    request: DiscoveryProviderRequest,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<DiscoveryProviderResult>
}

export class DiscoveryOrchestrator {
  constructor(private readonly dependencies: DiscoveryOrchestratorDependencies) {}

  executePriorityFallback(
    _request: DiscoveryProviderRequest,
    _category: DiscoveryProviderCategory
  ): Promise<SafeOrchestrationResult> {
    void this.dependencies
    throw new DiscoveryOrchestrationError('ORCHESTRATOR_DORMANT', 'Discovery orchestration is not implemented.')
  }

  executeParallelAggregation(_candidateDomain: string): Promise<SafeOrchestrationResult> {
    void this.dependencies
    throw new DiscoveryOrchestrationError('ORCHESTRATOR_DORMANT', 'Acquisition orchestration is not implemented.')
  }
}

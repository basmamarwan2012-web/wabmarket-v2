import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { BudgetDecision, FailoverDecision, FailoverFailureCategory, ProviderHealthDecision, ProviderPolicy, QuotaDecision } from '@/types/discovery-orchestrator'

export interface FailoverContext {
  failedProviderIdentifier: DiscoveryProviderIdentifier
  failureCategory: FailoverFailureCategory
  remainingProviderIdentifiers: readonly DiscoveryProviderIdentifier[]
  attemptNumber: number
  policies: readonly ProviderPolicy[]
  healthDecisions: ReadonlyMap<DiscoveryProviderIdentifier, ProviderHealthDecision>
  quotaDecisions: ReadonlyMap<DiscoveryProviderIdentifier, QuotaDecision>
  budgetDecisions: ReadonlyMap<DiscoveryProviderIdentifier, BudgetDecision>
}
export interface FailoverManager { decide(context: Readonly<FailoverContext>): FailoverDecision | Promise<FailoverDecision> }

import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { FailoverDecision, FailoverFailureCategory } from '@/types/discovery-orchestrator'
import type { BudgetDecision } from '@/types/provider-budget'
import type { ProviderHealthDecision } from '@/types/provider-health'
import type { ProviderSettings } from '@/types/provider-policy'
import type { QuotaDecision } from '@/types/provider-quota'

export interface FailoverContext {
  failedProviderIdentifier: DiscoveryProviderIdentifier
  failureCategory: FailoverFailureCategory
  remainingProviderIdentifiers: readonly DiscoveryProviderIdentifier[]
  attemptNumber: number
  policies: readonly ProviderSettings[]
  healthDecisions: ReadonlyMap<DiscoveryProviderIdentifier, ProviderHealthDecision>
  quotaDecisions: ReadonlyMap<DiscoveryProviderIdentifier, QuotaDecision>
  budgetDecisions: ReadonlyMap<DiscoveryProviderIdentifier, BudgetDecision>
}
export interface FailoverManager { decide(context: Readonly<FailoverContext>): FailoverDecision | Promise<FailoverDecision> }

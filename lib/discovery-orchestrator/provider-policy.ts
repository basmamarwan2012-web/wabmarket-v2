import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { ProviderPolicy } from '@/types/discovery-orchestrator'

export interface ProviderPolicyManager {
  getPolicy(providerIdentifier: DiscoveryProviderIdentifier): ProviderPolicy
  isEligible(policy: ProviderPolicy): boolean
}

export function createDefaultProviderPolicy(
  providerIdentifier: DiscoveryProviderIdentifier
): ProviderPolicy {
  return Object.freeze({
    providerIdentifier,
    enabled: false,
    priority: Number.MAX_SAFE_INTEGER,
    categories: Object.freeze([]),
    freeOnly: true,
    requiresPaidAccess: false,
    paidProvidersEnabled: false,
    dailyRequestLimit: null,
    monthlyRequestLimit: null,
    dailyCostLimit: 0,
    monthlyCostLimit: 0,
    emergencyStop: true,
    supportsBatch: false,
    fallbackAllowed: false,
    aggregationAllowed: false,
    searchModePriorities: Object.freeze({}),
  })
}

export function isPaidExecutionEligible(policy: ProviderPolicy): boolean {
  if (!policy.requiresPaidAccess) return true
  return Boolean(
    policy.paidProvidersEnabled &&
      policy.dailyCostLimit > 0 &&
      policy.monthlyCostLimit > 0 &&
      !policy.emergencyStop
  )
}

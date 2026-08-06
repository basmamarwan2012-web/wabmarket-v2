import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { ProviderPolicyBundle } from '@/types/provider-policy'

export interface ProviderPolicyManager {
  getPolicy(providerIdentifier: DiscoveryProviderIdentifier): ProviderPolicyBundle
}

/** Zero-cost free tiers are allowed; potentially paid or unknown-cost tiers fail closed. */
export function isExecutionPolicyAllowed(
  policy: ProviderPolicyBundle,
  estimatedRequestCost: number | null
): boolean {
  const { declaration, settings, budget } = policy
  if (!settings.enabled) return false
  if (estimatedRequestCost === 0 && !declaration.requiresPaidAccess) return true
  if (estimatedRequestCost === null) return false
  return Boolean(
    estimatedRequestCost > 0 &&
      budget.paidProvidersEnabled &&
      budget.limits.providerDaily.amount > 0 &&
      budget.limits.providerMonthly.amount > 0 &&
      budget.limits.tenantDaily.amount > 0 &&
      budget.limits.tenantMonthly.amount > 0 &&
      !budget.emergencyStop &&
      !settings.freeOnly
  )
}

import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { ProviderHealthDecision } from '@/types/provider-health'

export interface HealthMonitor {
  check(providerIdentifier: DiscoveryProviderIdentifier): Promise<ProviderHealthDecision>
  recordSuccess(providerIdentifier: DiscoveryProviderIdentifier): Promise<void>
  recordFailure(providerIdentifier: DiscoveryProviderIdentifier, safeReason: string): Promise<void>
}

import 'server-only'

import type { DiscoveryProviderIdentifier } from '@/types/discovery-provider'
import type { ProviderPolicy, ProviderSelectionRequest } from '@/types/discovery-orchestrator'

export interface ProviderSelectionCandidate { providerIdentifier: DiscoveryProviderIdentifier; policy: ProviderPolicy }
export interface ProviderSelector {
  select(request: Readonly<ProviderSelectionRequest>, candidates: readonly ProviderSelectionCandidate[]): readonly ProviderSelectionCandidate[]
}

import 'server-only'

import type { EligibleProviderCandidate, ProviderSelectionRequest } from '@/types/discovery-orchestrator'

export interface ProviderSelector {
  select(request: Readonly<ProviderSelectionRequest>, candidates: readonly EligibleProviderCandidate[]): readonly EligibleProviderCandidate[]
}

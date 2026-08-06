import 'server-only'

import type { DiscoveryProviderExecutionContext, DiscoveryProviderIdentifier, DiscoveryProviderRequest, DiscoveryProviderResult } from '@/types/discovery-provider'
import type { DiscoveryEngine } from '@/lib/discovery-providers'
import { DiscoveryOrchestrationError } from '@/lib/discovery-orchestrator/errors'
import type { DiscoveryEngineGateway } from '@/lib/discovery-orchestrator/orchestrator'

export class DormantDiscoveryEngineGateway implements DiscoveryEngineGateway {
  private readonly engines: readonly DiscoveryEngine[]

  constructor(engines: readonly DiscoveryEngine[]) {
    this.engines = Object.freeze([...engines])
  }

  execute(
    _providerIdentifier: DiscoveryProviderIdentifier,
    _request: DiscoveryProviderRequest,
    _context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<DiscoveryProviderResult> {
    void this.engines
    throw new DiscoveryOrchestrationError(
      'ORCHESTRATOR_DORMANT',
      'Discovery engine execution is dormant.'
    )
  }
}

import 'server-only'

import type {
  DiscoveryProviderExecutionContext,
  DiscoveryProviderIdentifier,
  DiscoveryProviderRequest,
  DiscoveryProviderResult,
} from '@/types/discovery-provider'
import type {
  DiscoveryEngine,
  DiscoveryEngineDiagnosticResult,
} from '@/lib/discovery-providers'
import { DiscoveryOrchestrationError } from '@/lib/discovery-orchestrator/errors'
import type { DiscoveryEngineGateway } from '@/lib/discovery-orchestrator/orchestrator'

export class DormantDiscoveryEngineGateway implements DiscoveryEngineGateway {
  private readonly engines: ReadonlyMap<DiscoveryProviderIdentifier, DiscoveryEngine>

  constructor(
    engines: readonly DiscoveryEngine[],
    private readonly internalTestCapability?: object
  ) {
    this.engines = new Map(
      engines.map((engine) => [engine.providerIdentifier, engine])
    )
  }

  executeProvider(
    _providerIdentifier: DiscoveryProviderIdentifier,
    _request: DiscoveryProviderRequest,
    _context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<DiscoveryProviderResult> {
    return this.rejectDormant()
  }

  executeProviderForInternalTest(
    providerIdentifier: DiscoveryProviderIdentifier,
    request: DiscoveryProviderRequest,
    capability: object,
    context?: Readonly<DiscoveryProviderExecutionContext>
  ): Promise<DiscoveryEngineDiagnosticResult> {
    if (
      !this.internalTestCapability ||
      capability !== this.internalTestCapability ||
      providerIdentifier !== 'google'
    )
      return this.rejectDormant()

    const engine = this.engines.get(providerIdentifier)
    if (!engine) return this.rejectDormant()
    return engine.executeWithDiagnostics(request, context)
  }

  private rejectDormant(): never {
    throw new DiscoveryOrchestrationError(
      'ORCHESTRATOR_DORMANT',
      'Discovery engine execution is dormant.'
    )
  }
}

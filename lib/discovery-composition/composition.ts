import 'server-only'

import type { DiscoveryComposition, DiscoveryCompositionResult } from '@/types/discovery-composition'
import { DiscoveryEngine, DiscoveryProviderError, DiscoveryProviderRegistry, DynadotDiscoveryProvider, GoogleDiscoveryProvider } from '@/lib/discovery-providers'
import { DiscoveryOrchestrator } from '@/lib/discovery-orchestrator/orchestrator'
import { createDefaultProviderDeclaration, createDefaultProviderPolicy } from '@/lib/discovery-orchestrator/provider-configuration'
import { isValidProviderPolicy } from '@/lib/discovery-orchestrator/policy-validation'
import { DiscoveryCompositionError, toSafeCompositionError } from './composition-errors'
import {
  DormantAcquisitionOfferAggregator,
  DormantBudgetManager,
  DormantCacheManager,
  DormantFailoverManager,
  DormantHealthMonitor,
  DormantProviderSelector,
  DormantQuotaManager,
  DormantRequestFingerprint,
  DormantStatisticsCollector,
  InactiveProviderPolicyManager,
  ReadonlyRegistryView,
} from './dormant-services'
import { DormantDiscoveryEngineGateway } from './engine-gateway'
import { PureEligibilityEvaluator } from './eligibility-evaluator'

const requireDependency = <T>(value: T | null | undefined): T => {
  if (value === null || value === undefined)
    throw new DiscoveryCompositionError(
      'COMPOSITION_MISSING_DEPENDENCY',
      'A required discovery dependency is missing.'
    )
  return value
}

const buildComposition = (): DiscoveryComposition => {
  const googleProvider = new GoogleDiscoveryProvider()
  const dynadotProvider = new DynadotDiscoveryProvider()
  const providers = Object.freeze([googleProvider, dynadotProvider])
  const registry = new DiscoveryProviderRegistry(providers)

  const declarations = Object.freeze([
    createDefaultProviderDeclaration(
      googleProvider.capabilities,
      'Dormant business discovery provider.'
    ),
    createDefaultProviderDeclaration(
      dynadotProvider.capabilities,
      'Dormant domain acquisition provider.'
    ),
  ])
  const policies = Object.freeze(
    declarations.map((declaration) => createDefaultProviderPolicy(declaration))
  )
  if (
    policies.some(
      ({ declaration, settings }) =>
        !isValidProviderPolicy(settings, declaration)
    )
  )
    throw new DiscoveryCompositionError(
      'COMPOSITION_INVALID_CONFIGURATION',
      'Default provider policy construction is invalid.'
    )

  const policyManager = new InactiveProviderPolicyManager(policies)
  const eligibilityEvaluator = new PureEligibilityEvaluator()
  const providerSelector = new DormantProviderSelector(eligibilityEvaluator)
  const cacheManager = new DormantCacheManager()
  const budgetManager = new DormantBudgetManager()
  const quotaManager = new DormantQuotaManager()
  const healthMonitor = new DormantHealthMonitor()
  const statisticsCollector = new DormantStatisticsCollector()
  const requestFingerprint = new DormantRequestFingerprint()
  const failoverManager = new DormantFailoverManager()
  const acquisitionOfferAggregator = new DormantAcquisitionOfferAggregator()
  const engines = Object.freeze(
    providers.map((provider) => new DiscoveryEngine(provider))
  )
  const engineGateway = new DormantDiscoveryEngineGateway(engines)

  const orchestrator = new DiscoveryOrchestrator({
    registry: requireDependency(registry),
    providerSelector: requireDependency(providerSelector),
    providerPolicyManager: requireDependency(policyManager),
    cacheManager: requireDependency(cacheManager),
    quotaManager: requireDependency(quotaManager),
    budgetManager: requireDependency(budgetManager),
    healthMonitor: requireDependency(healthMonitor),
    statisticsCollector: requireDependency(statisticsCollector),
    failoverManager: requireDependency(failoverManager),
    acquisitionOfferAggregator: requireDependency(acquisitionOfferAggregator),
    requestFingerprint: requireDependency(requestFingerprint),
    engineGateway: requireDependency(engineGateway),
  })

  return Object.freeze({
    registry: new ReadonlyRegistryView(registry.providers),
    orchestrator,
  })
}

export function createDiscoveryComposition(): DiscoveryCompositionResult {
  try {
    return Object.freeze({ success: true, composition: buildComposition() })
  } catch (error) {
    if (error instanceof DiscoveryCompositionError)
      return Object.freeze({ success: false, error: toSafeCompositionError(error) })
    if (error instanceof DiscoveryProviderError) {
      const code =
        error.code === 'PROVIDER_DUPLICATE'
          ? 'COMPOSITION_DUPLICATE_PROVIDER'
          : 'COMPOSITION_INVALID_CONFIGURATION'
      return Object.freeze({
        success: false,
        error: Object.freeze({
          code,
          message: 'Discovery providers could not be registered.',
        }),
      })
    }
    const internal = new DiscoveryCompositionError(
      'COMPOSITION_INVALID_CONFIGURATION',
      'Discovery composition could not be constructed.',
      error
    )
    return Object.freeze({ success: false, error: toSafeCompositionError(internal) })
  }
}

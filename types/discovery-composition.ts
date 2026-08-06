import type { DiscoveryOrchestrator } from '@/lib/discovery-orchestrator/orchestrator'
import type { DiscoveryProviderCapabilities, DiscoveryProviderIdentifier } from './discovery-provider'

export interface RegisteredProviderView {
  readonly identifier: DiscoveryProviderIdentifier
  readonly displayName: string
  readonly capabilities: DiscoveryProviderCapabilities
}

export interface ReadonlyDiscoveryProviderRegistry {
  get(identifier: DiscoveryProviderIdentifier): RegisteredProviderView | null
  has(identifier: DiscoveryProviderIdentifier): boolean
  listIdentifiers(): readonly DiscoveryProviderIdentifier[]
  listProviders(): readonly RegisteredProviderView[]
}

export interface DiscoveryComposition {
  readonly registry: ReadonlyDiscoveryProviderRegistry
  readonly orchestrator: DiscoveryOrchestrator
}

export type DiscoveryCompositionErrorCode =
  | 'COMPOSITION_INVALID_CONFIGURATION'
  | 'COMPOSITION_DUPLICATE_PROVIDER'
  | 'COMPOSITION_MISSING_DEPENDENCY'

export interface SafeDiscoveryCompositionError {
  readonly code: DiscoveryCompositionErrorCode
  readonly message: string
}

export type DiscoveryCompositionResult =
  | { readonly success: true; readonly composition: DiscoveryComposition }
  | { readonly success: false; readonly error: SafeDiscoveryCompositionError }

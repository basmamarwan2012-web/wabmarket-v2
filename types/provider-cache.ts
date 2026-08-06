import type { DiscoveryProviderIdentifier } from './discovery-provider'
import type { DomainAcquisitionIntelligence } from './domain-acquisition'
import type { DiscoveryProviderResult } from './discovery-provider'
import type { CanonicalFingerprintCriteria, OrchestrationStrategy } from './discovery-orchestrator'

export type CacheState = 'hit' | 'miss' | 'stale' | 'expired' | 'unknown'
export interface FingerprintInput { readonly fingerprintVersion: number; readonly namespace: string; readonly canonicalCriteria: CanonicalFingerprintCriteria; readonly futureHashAlgorithm: string | null }
export type ProviderCacheValue = { readonly valueType: 'discovery_result'; readonly value: DiscoveryProviderResult } | { readonly valueType: 'acquisition_intelligence'; readonly value: DomainAcquisitionIntelligence }
export interface ProviderCacheRecord<T extends ProviderCacheValue = ProviderCacheValue> {
  readonly fingerprint: string
  readonly namespace: string
  readonly fingerprintVersion: number
  readonly schemaVersion: number
  readonly providerIdentifiers: readonly DiscoveryProviderIdentifier[]
  readonly sourceStrategy: OrchestrationStrategy
  readonly state: CacheState
  readonly createdAt: string
  readonly expiresAt: string
  readonly value: T
}

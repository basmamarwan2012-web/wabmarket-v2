import type { OrchestrationStrategy } from '../discovery-orchestrator'
import type { PersistenceDocumentMetadata, PersistenceTimestamp } from './base'

export const PROVIDER_CACHE_METADATA_SCHEMA_VERSION = 1 as const
export type CacheMetadataState = 'planned' | 'available' | 'stale' | 'expired' | 'invalidated' | 'unknown'

/** Metadata only. This document cannot serve or deserialize a cached payload. */
export interface ProviderCacheMetadataPersistence extends PersistenceDocumentMetadata {
  readonly namespace: string
  readonly fingerprint: string
  readonly fingerprint_version: number
  readonly provider_identifiers: readonly string[]
  readonly source_strategy: OrchestrationStrategy
  readonly state: CacheMetadataState
  readonly expires_at: PersistenceTimestamp
  readonly invalidated_at: PersistenceTimestamp | null
  readonly payload_reference: string | null
}

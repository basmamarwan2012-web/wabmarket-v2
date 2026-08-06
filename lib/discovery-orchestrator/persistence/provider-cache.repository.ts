import 'server-only'

import type { ProviderCacheMetadataPersistence } from '@/types/provider-persistence'
import type { RepositoryContext } from './repository-context'

export interface CacheMetadataInvalidation {
  readonly namespace?: string
  readonly fingerprint?: string
  readonly providerIdentifier?: string
  readonly schemaVersion?: number
  readonly expiresBefore?: string
}

export interface ProviderCacheRepository {
  lookupMetadata(context: RepositoryContext, namespace: string, fingerprint: string): Promise<ProviderCacheMetadataPersistence | null>
  saveMetadata(context: RepositoryContext, metadata: ProviderCacheMetadataPersistence): Promise<void>
  invalidateMetadata(context: RepositoryContext, criteria: CacheMetadataInvalidation): Promise<number>
}

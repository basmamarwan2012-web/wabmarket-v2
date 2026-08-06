import 'server-only'

import type { ProviderHealthSnapshotPersistence } from '@/types/provider-persistence'
import type { BoundedReadOptions, RepositoryContext, RepositoryPage } from './repository-context'

export interface ProviderHealthRepository {
  saveSnapshot(context: RepositoryContext, snapshot: ProviderHealthSnapshotPersistence): Promise<void>
  getLatest(context: RepositoryContext, providerIdentifier: string): Promise<ProviderHealthSnapshotPersistence | null>
  listHistory(context: RepositoryContext, providerIdentifier: string, options: BoundedReadOptions): Promise<RepositoryPage<ProviderHealthSnapshotPersistence>>
}

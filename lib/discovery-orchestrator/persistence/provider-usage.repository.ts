import 'server-only'

import type { ProviderUsageSnapshotPersistence, UsagePeriod, UsageScope } from '@/types/provider-persistence'
import type { BoundedReadOptions, RepositoryContext, RepositoryPage } from './repository-context'

export interface UsageSnapshotQuery {
  readonly scope: UsageScope
  readonly providerIdentifier: string | null
  readonly period: UsagePeriod
  readonly periodStart: string
}

export interface ProviderUsageRepository {
  saveImmutableSnapshot(context: RepositoryContext, snapshot: ProviderUsageSnapshotPersistence): Promise<void>
  findByIdentity(context: RepositoryContext, query: UsageSnapshotQuery): Promise<ProviderUsageSnapshotPersistence | null>
  listByPeriod(context: RepositoryContext, query: Omit<UsageSnapshotQuery, 'periodStart'>, options: BoundedReadOptions): Promise<RepositoryPage<ProviderUsageSnapshotPersistence>>
}

import 'server-only'

import type { ProviderStatisticsEventPersistence } from '@/types/provider-persistence'
import type { BoundedReadOptions, RepositoryContext, RepositoryPage } from './repository-context'

export interface ProviderStatisticsRepository {
  append(context: RepositoryContext, event: ProviderStatisticsEventPersistence): Promise<void>
  listRecent(context: RepositoryContext, options: BoundedReadOptions): Promise<RepositoryPage<ProviderStatisticsEventPersistence>>
}

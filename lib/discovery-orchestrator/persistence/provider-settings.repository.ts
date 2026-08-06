import 'server-only'

import type { ProviderSettingsPersistence } from '@/types/provider-persistence'
import type { RepositoryContext } from './repository-context'

export interface ProviderSettingsRepository {
  findByProvider(context: RepositoryContext, providerIdentifier: string): Promise<ProviderSettingsPersistence | null>
  list(context: RepositoryContext): Promise<readonly ProviderSettingsPersistence[]>
  saveTenantRestrictions(context: RepositoryContext, document: ProviderSettingsPersistence): Promise<void>
}

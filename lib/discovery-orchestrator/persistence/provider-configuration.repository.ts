import 'server-only'

import type { ProviderConfigurationPersistence } from '@/types/provider-persistence'
import type { RepositoryContext } from './repository-context'

export interface ProviderConfigurationRepository {
  findByProvider(context: RepositoryContext, providerIdentifier: string): Promise<ProviderConfigurationPersistence | null>
  list(context: RepositoryContext): Promise<readonly ProviderConfigurationPersistence[]>
  savePlatformConfiguration(context: RepositoryContext, document: ProviderConfigurationPersistence): Promise<void>
}

import 'server-only'

import type { AuthenticatedSession } from '@/lib/auth/session'
import { AssetUploadApplicationService } from '@/lib/assets/asset-upload.service'
import { DeterministicBrandAssetGenerator } from '@/lib/branding/deterministic-generator'
import {
  AssetStorageConfigurationError,
  getAssetStorageConfig,
} from '@/lib/config/asset-storage'
import { getDatabaseConfig } from '@/lib/config/database'
import { PrepareDomainError } from '@/lib/domain-preparation/prepare-domain.errors'
import { PrepareDomainApplicationService } from '@/lib/domain-preparation/prepare-domain.service'
import {
  createPersistenceAccountContext,
  createPersistenceIdentityContext,
} from '@/lib/persistence/context'
import { sanitizePersistenceError } from '@/lib/persistence/errors'
import { FileSystemAssetStore } from '@/infrastructure/assets/filesystem/filesystem-asset-store'
import { createWabmarketMySqlClient } from './client'
import { MySqlAccountRepository } from './repositories/account.repository'
import { MySqlPersistenceUnitOfWork } from './unit-of-work'

export const executeAdminDomainPreparationOperation = async <T>(
  session: AuthenticatedSession,
  operation: (
    service: PrepareDomainApplicationService,
    context: ReturnType<typeof createPersistenceAccountContext>
  ) => Promise<T>
): Promise<T> => {
  let client: ReturnType<typeof createWabmarketMySqlClient> | null = null
  try {
    client = createWabmarketMySqlClient(getDatabaseConfig())
    const identity = createPersistenceIdentityContext(session)
    const account = await new MySqlAccountRepository(
      client.database
    ).resolveOrProvision(identity)
    const context = createPersistenceAccountContext(identity, account)
    const unitOfWork = new MySqlPersistenceUnitOfWork(client.database)
    const store = new FileSystemAssetStore(getAssetStorageConfig().root)
    const uploader = new AssetUploadApplicationService(unitOfWork, store)
    const service = new PrepareDomainApplicationService(
      unitOfWork,
      uploader,
      new DeterministicBrandAssetGenerator()
    )
    return await operation(service, context)
  } catch (error) {
    if (error instanceof PrepareDomainError) throw error
    if (error instanceof AssetStorageConfigurationError)
      throw new PrepareDomainError(
        'PREPARE_DOMAIN_ASSET_STORAGE_NOT_CONFIGURED'
      )
    const sanitized = sanitizePersistenceError(error)
    throw sanitized.code === 'PERSISTENCE_VERSION_CONFLICT'
      ? new PrepareDomainError('PREPARE_DOMAIN_VERSION_CONFLICT')
      : new PrepareDomainError('PREPARE_DOMAIN_DATABASE_UNAVAILABLE')
  } finally {
    if (client) await client.close().catch(() => undefined)
  }
}


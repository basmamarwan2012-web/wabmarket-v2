import 'server-only'

import type { AuthenticatedSession } from '@/lib/auth/session'
import { AssetUploadApplicationService } from '@/lib/assets/asset-upload.service'
import { BrandingGenerationService } from '@/lib/branding/generation.service'
import { DeterministicBrandAssetGenerator } from '@/lib/branding/deterministic-generator'
import { AssetError } from '@/lib/assets/asset.errors'
import { getAssetStorageConfig } from '@/lib/config/asset-storage'
import { getDatabaseConfig } from '@/lib/config/database'
import { createPersistenceAccountContext, createPersistenceIdentityContext } from '@/lib/persistence/context'
import { sanitizePersistenceError } from '@/lib/persistence/errors'
import { FileSystemAssetStore } from '@/infrastructure/assets/filesystem/filesystem-asset-store'
import { createWabmarketMySqlClient } from './client'
import { MySqlAccountRepository } from './repositories/account.repository'
import { MySqlPersistenceUnitOfWork } from './unit-of-work'

const executeAssetComposition = async <T>(
  session: AuthenticatedSession,
  operation: (service: AssetUploadApplicationService, unitOfWork: MySqlPersistenceUnitOfWork, context: ReturnType<typeof createPersistenceAccountContext>) => Promise<T>
) => {
  let client: ReturnType<typeof createWabmarketMySqlClient> | null = null
  try {
    client = createWabmarketMySqlClient(getDatabaseConfig())
    const identity = createPersistenceIdentityContext(session)
    const account = await new MySqlAccountRepository(client.database).resolveOrProvision(identity)
    const context = createPersistenceAccountContext(identity, account)
    const unitOfWork = new MySqlPersistenceUnitOfWork(client.database)
    const service = new AssetUploadApplicationService(
      unitOfWork,
      new FileSystemAssetStore(getAssetStorageConfig().root)
    )
    return await operation(service, unitOfWork, context)
  } catch (error) { throw error instanceof AssetError ? error : sanitizePersistenceError(error) }
  finally { if (client) await client.close().catch(() => undefined) }
}

export const executeAdminAssetOperation = async <T>(
  session: AuthenticatedSession,
  operation: (service: AssetUploadApplicationService, context: ReturnType<typeof createPersistenceAccountContext>) => Promise<T>
) => executeAssetComposition(session, (service, _unitOfWork, context) => operation(service, context))

export const executeAdminBrandingOperation = async <T>(
  session: AuthenticatedSession,
  operation: (service: BrandingGenerationService, context: ReturnType<typeof createPersistenceAccountContext>) => Promise<T>
) => executeAssetComposition(session, (uploader, unitOfWork, context) => operation(
  new BrandingGenerationService(
    unitOfWork,
    uploader,
    new DeterministicBrandAssetGenerator()
  ),
  context
))

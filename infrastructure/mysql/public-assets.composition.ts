import 'server-only'

import { FileSystemAssetStore } from '@/infrastructure/assets/filesystem/filesystem-asset-store'
import { PublicAssetService } from '@/lib/assets/public-asset.service'
import { getAssetStorageConfig } from '@/lib/config/asset-storage'
import { getDatabaseConfig } from '@/lib/config/database'
import { sanitizePersistenceError } from '@/lib/persistence/errors'
import { createWabmarketMySqlClient } from './client'
import { MySqlPublicAssetRepository } from './repositories/public-asset.repository'

export const resolvePublishedAssetFromMySql = async (assetId: string) => {
  let client: ReturnType<typeof createWabmarketMySqlClient> | null = null
  try {
    client = createWabmarketMySqlClient(getDatabaseConfig())
    return await new PublicAssetService(
      new MySqlPublicAssetRepository(client.database),
      new FileSystemAssetStore(getAssetStorageConfig().root)
    ).resolve(assetId)
  } catch (error) { throw sanitizePersistenceError(error) }
  finally { if (client) await client.close().catch(() => undefined) }
}

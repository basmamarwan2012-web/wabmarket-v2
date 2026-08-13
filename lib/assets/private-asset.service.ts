import 'server-only'

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import { validateAssetUpload } from './asset-upload.helpers'
import type { AssetStore } from './asset-store'
import { AssetError } from './asset.errors'
import type {
  PrivateAssetContent,
  ResolvePrivateAssetCommand,
} from './private-asset.service.types'

const ASSET_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

export class PrivateAssetService {
  constructor(
    private readonly unitOfWork: PersistenceUnitOfWork,
    private readonly store: AssetStore
  ) {}

  async resolve(
    context: PersistenceAccountContext,
    command: ResolvePrivateAssetCommand
  ): Promise<PrivateAssetContent | null> {
    if (!ASSET_ID.test(command.assetId)) return null
    const asset = await this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findByHostname(
        context,
        command.hostname
      )
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      const found = await repositories.assetMetadata.findById(
        context,
        command.assetId
      )
      return found?.ownedDomainId === domain.id && found.status === 'AVAILABLE'
        ? found
        : null
    })
    if (!asset) return null

    const stored = await this.store.read(asset.storageKey)
    if (stored.byteSize !== asset.byteSize)
      throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
    const validated = validateAssetUpload(asset.kind, {
      declaredMimeType: asset.mimeType,
      contents: stored.contents,
    })
    if (validated.checksum !== asset.checksum)
      throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
    return Object.freeze({
      contents: stored.contents.slice(),
      mimeType: validated.mimeType,
      byteSize: asset.byteSize,
    })
  }
}

export type {
  PrivateAssetContent,
  ResolvePrivateAssetCommand,
} from './private-asset.service.types'


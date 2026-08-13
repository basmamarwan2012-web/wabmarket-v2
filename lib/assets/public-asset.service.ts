import 'server-only'

import type { AssetStore } from './asset-store'
import type { PublicAssetRepository } from './public-asset.repository'
import { AssetError } from './asset.errors'
import { validateAssetUpload } from './asset-upload.helpers'

const ASSET_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/

export class PublicAssetService {
  constructor(
    private readonly repository: PublicAssetRepository,
    private readonly store: AssetStore
  ) {}

  async resolve(assetId: string) {
    if (!ASSET_ID.test(assetId)) return null
    const record = await this.repository.findPublishedReference(assetId)
    if (!record) return null
    const stored = await this.store.read(record.storageKey)
    if (stored.byteSize !== record.byteSize)
      throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
    const validated = validateAssetUpload(record.kind, {
      declaredMimeType: record.mimeType,
      contents: stored.contents,
    })
    if (validated.checksum !== record.checksum)
      throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
    return Object.freeze({
      contents: stored.contents,
      mimeType: validated.mimeType,
      byteSize: record.byteSize,
    })
  }
}

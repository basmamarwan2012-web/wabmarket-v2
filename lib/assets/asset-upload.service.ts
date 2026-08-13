import 'server-only'

import { randomUUID } from 'node:crypto'

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import type { AssetStore } from './asset-store'
import { AssetError } from './asset.errors'
import { validateAssetUpload } from './asset-upload.helpers'
import type { DeleteDomainAssetCommand, DomainAssetDto, UploadDomainAssetCommand } from './asset-upload.types'

const dto = (asset: Readonly<{
  id: string; ownedDomainId: string; kind: DomainAssetDto['kind']; publicReference: string | null;
  mimeType: string; byteSize: number; checksum: string; status: string; createdAt: string; updatedAt: string
}>): DomainAssetDto => {
  if (!asset.publicReference || asset.status !== 'AVAILABLE') throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
  return Object.freeze({ ...asset, publicReference: asset.publicReference, status: 'AVAILABLE' })
}

export class AssetUploadApplicationService {
  constructor(private readonly unitOfWork: PersistenceUnitOfWork, private readonly store: AssetStore) {}

  async upload(context: PersistenceAccountContext, command: UploadDomainAssetCommand) {
    const domain = await this.unitOfWork.run((repositories) => repositories.ownedDomains.findByHostname(context, command.hostname))
    if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const validated = validateAssetUpload(command.kind, command.file)
    const assetId = randomUUID()
    const stored = await this.store.store(context, { assetId, ownedDomainId: domain.id, kind: command.kind, mimeType: validated.mimeType, extension: validated.extension, contents: validated.contents })
    if (!stored.publicReference || stored.byteSize !== validated.byteSize || stored.checksum !== validated.checksum) {
      await this.compensateUpload(context, stored.storageKey)
      throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
    }
    try {
      const record = await this.unitOfWork.run((repositories) => repositories.assetMetadata.create(context, {
        id: assetId,
        ownedDomainId: domain.id,
        kind: command.kind,
        storageKey: stored.storageKey,
        publicReference: stored.publicReference,
        mimeType: validated.mimeType,
        byteSize: validated.byteSize,
        checksum: validated.checksum,
        status: 'AVAILABLE',
      }))
      return dto(record)
    } catch (error) {
      await this.compensateUpload(context, stored.storageKey)
      throw error
    }
  }

  async delete(context: PersistenceAccountContext, command: DeleteDomainAssetCommand) {
    const state = await this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findByHostname(context, command.hostname)
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      const asset = await repositories.assetMetadata.findById(context, command.assetId)
      if (!asset || asset.ownedDomainId !== domain.id) throw new AssetError('ASSET_NOT_FOUND')
      const preparation = await repositories.preparations.getCurrent(context, domain.id)
      if (preparation && Object.values(preparation.assets).includes(asset.id)) throw new AssetError('ASSET_IN_USE')
      if (await repositories.assetMetadata.isReferencedByPublishedListing(context, asset.id)) throw new AssetError('ASSET_IN_USE')
      return asset
    })
    const backup = await this.store.read(state.storageKey)
    await this.store.remove(context, state.storageKey)
    try {
      const deleted = await this.unitOfWork.run(async (repositories) => {
        const current = await repositories.assetMetadata.findById(context, state.id)
        if (!current || current.ownedDomainId !== state.ownedDomainId) throw new AssetError('ASSET_NOT_FOUND')
        const preparation = await repositories.preparations.getCurrent(context, state.ownedDomainId)
        if (preparation && Object.values(preparation.assets).includes(state.id)) throw new AssetError('ASSET_IN_USE')
        if (await repositories.assetMetadata.isReferencedByPublishedListing(context, state.id)) throw new AssetError('ASSET_IN_USE')
        return repositories.assetMetadata.delete(context, state.id)
      })
      if (!deleted) throw new AssetError('ASSET_NOT_FOUND')
    } catch (error) {
      try { await this.store.restore(state.storageKey, backup.contents) }
      catch { throw new AssetError('ASSET_COMPENSATION_FAILED') }
      throw error
    }
    return Object.freeze({ assetId: state.id, deleted: true as const })
  }

  private async compensateUpload(context: PersistenceAccountContext, storageKey: string) {
    try { await this.store.remove(context, storageKey) }
    catch { throw new AssetError('ASSET_COMPENSATION_FAILED') }
  }
}

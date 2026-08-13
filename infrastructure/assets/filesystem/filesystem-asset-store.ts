import 'server-only'

import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import path from 'node:path'

import type { AssetStore, AssetStoreWrite, StoredAssetContents } from '@/lib/assets/asset-store'
import { AssetError } from '@/lib/assets/asset.errors'
import { createScopeHash } from '@/lib/assets/asset-upload.helpers'
import type { PersistenceAccountContext } from '@/lib/persistence/context'

const STORAGE_KEY_PATTERN = /^v1\/[a-f0-9]{16}\/[a-f0-9]{16}\/[0-9a-f-]{36}\/asset\.(png|jpg|webp|ico)$/
const insideRoot = (root: string, candidate: string) => {
  const relative = path.relative(root, candidate)
  return relative !== '' && relative !== '..' && !relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative)
}

export class FileSystemAssetStore implements AssetStore {
  private readonly root: string

  constructor(root: string) {
    if (!path.isAbsolute(root)) throw new AssetError('ASSET_INVALID_INPUT')
    this.root = path.resolve(root)
  }

  async store(context: PersistenceAccountContext, input: AssetStoreWrite) {
    const storageKey = ['v1', createScopeHash(context.accountId), createScopeHash(input.ownedDomainId), input.assetId, `asset.${input.extension}`].join('/')
    const destination = this.resolveStorageKey(storageKey)
    const temporary = `${destination}.tmp`
    try {
      await mkdir(path.dirname(destination), { recursive: true })
      await writeFile(temporary, input.contents, { flag: 'wx' })
      await rename(temporary, destination)
      return Object.freeze({ storageKey, publicReference: `/media/domain-assets/${input.assetId}`, byteSize: input.contents.byteLength, checksum: createHash('sha256').update(input.contents).digest('hex') })
    } catch {
      await rm(temporary, { force: true }).catch(() => undefined)
      throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
    }
  }

  async read(storageKey: string): Promise<StoredAssetContents> {
    try {
      const contents = await readFile(this.resolveStorageKey(storageKey))
      return Object.freeze({ contents: new Uint8Array(contents), byteSize: contents.byteLength })
    } catch (error) {
      if (error instanceof AssetError) throw error
      throw new AssetError('ASSET_STORAGE_UNAVAILABLE')
    }
  }

  async remove(_context: PersistenceAccountContext, storageKey: string) {
    try { await rm(this.resolveStorageKey(storageKey), { force: true }) }
    catch (error) { if (error instanceof AssetError) throw error; throw new AssetError('ASSET_STORAGE_UNAVAILABLE') }
  }

  async restore(storageKey: string, contents: Uint8Array) {
    const destination = this.resolveStorageKey(storageKey)
    try { await mkdir(path.dirname(destination), { recursive: true }); await writeFile(destination, contents, { flag: 'wx' }) }
    catch (error) { if (error instanceof AssetError) throw error; throw new AssetError('ASSET_COMPENSATION_FAILED') }
  }

  private resolveStorageKey(storageKey: string) {
    if (!STORAGE_KEY_PATTERN.test(storageKey) || storageKey.includes('..')) throw new AssetError('ASSET_INVALID_INPUT')
    const destination = path.resolve(this.root, ...storageKey.split('/'))
    if (!insideRoot(this.root, destination)) throw new AssetError('ASSET_INVALID_INPUT')
    return destination
  }
}

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { DomainAssetKind } from './asset-metadata.repository'

export interface AssetStoreWrite {
  readonly assetId: string
  readonly ownedDomainId: string
  readonly kind: DomainAssetKind
  readonly mimeType: string
  readonly extension: 'png' | 'jpg' | 'webp' | 'ico'
  readonly contents: Uint8Array
}

export interface StoredAssetContents {
  readonly contents: Uint8Array
  readonly byteSize: number
}

export interface StoredAssetReference {
  readonly storageKey: string
  readonly publicReference: string | null
  readonly byteSize: number
  readonly checksum: string
}

export interface AssetStore {
  store(
    context: PersistenceAccountContext,
    input: AssetStoreWrite
  ): Promise<StoredAssetReference>
  remove(
    context: PersistenceAccountContext,
    storageKey: string
  ): Promise<void>
  read(storageKey: string): Promise<StoredAssetContents>
  restore(storageKey: string, contents: Uint8Array): Promise<void>
}

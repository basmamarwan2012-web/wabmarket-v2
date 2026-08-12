import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { DomainAssetKind } from './asset-metadata.repository'

export interface AssetStoreWrite {
  readonly ownedDomainId: string
  readonly kind: DomainAssetKind
  readonly mimeType: string
  readonly contents: Uint8Array
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
}

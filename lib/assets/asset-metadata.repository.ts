import type { PersistenceAccountContext } from '@/lib/persistence/context'

export const DOMAIN_ASSET_KINDS = Object.freeze([
  'LOGO',
  'FAVICON',
  'OPEN_GRAPH_IMAGE',
] as const)
export type DomainAssetKind = (typeof DOMAIN_ASSET_KINDS)[number]

export const DOMAIN_ASSET_STATUSES = Object.freeze([
  'PENDING',
  'AVAILABLE',
] as const)
export type DomainAssetStatus = (typeof DOMAIN_ASSET_STATUSES)[number]

export interface AssetMetadataRecord {
  readonly id: string
  readonly ownedDomainId: string
  readonly kind: DomainAssetKind
  readonly storageKey: string
  readonly publicReference: string | null
  readonly mimeType: string
  readonly byteSize: number
  readonly checksum: string
  readonly status: DomainAssetStatus
  readonly createdAt: string
  readonly updatedAt: string
}

export type CreateAssetMetadataRecord = Omit<
  AssetMetadataRecord,
  'id' | 'createdAt' | 'updatedAt'
> &
  Readonly<{ id?: string }>

export interface AssetMetadataRepository {
  create(
    context: PersistenceAccountContext,
    input: CreateAssetMetadataRecord
  ): Promise<AssetMetadataRecord>
  findById(
    context: PersistenceAccountContext,
    assetId: string
  ): Promise<AssetMetadataRecord | null>
  listForOwnedDomain(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<readonly AssetMetadataRecord[]>
  delete(
    context: PersistenceAccountContext,
    assetId: string
  ): Promise<boolean>
  isReferencedByPublishedListing(
    context: PersistenceAccountContext,
    assetId: string
  ): Promise<boolean>
}

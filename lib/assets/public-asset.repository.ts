import type { DomainAssetKind } from './asset-metadata.repository'

export interface PublicAssetRecord {
  readonly kind: DomainAssetKind
  readonly storageKey: string
  readonly mimeType: string
  readonly byteSize: number
  readonly checksum: string
}

/** Public reads must return a record only when an AVAILABLE asset is referenced
 * by the current public snapshot of a PUBLISHED listing. */
export interface PublicAssetRepository {
  findPublishedReference(assetId: string): Promise<PublicAssetRecord | null>
}

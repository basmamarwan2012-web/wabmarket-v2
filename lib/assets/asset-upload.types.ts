import type { DomainAssetKind } from './asset-metadata.repository'

export interface UploadedAssetPayload {
  readonly declaredMimeType: string
  readonly contents: Uint8Array
}

export interface UploadDomainAssetCommand {
  readonly hostname: string
  readonly kind: DomainAssetKind
  readonly file: UploadedAssetPayload
}

export interface DeleteDomainAssetCommand {
  readonly hostname: string
  readonly assetId: string
}

export interface DomainAssetDto {
  readonly id: string
  readonly ownedDomainId: string
  readonly kind: DomainAssetKind
  readonly publicReference: string
  readonly mimeType: string
  readonly byteSize: number
  readonly checksum: string
  readonly status: 'AVAILABLE'
  readonly createdAt: string
  readonly updatedAt: string
}

export interface DeleteDomainAssetResult {
  readonly assetId: string
  readonly deleted: true
}

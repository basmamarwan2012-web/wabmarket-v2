import type { DomainAssetKind } from '@/lib/assets/asset-metadata.repository'
import type { BrandIdentity } from './brand-identity.types'

export type BrandAssetGenerationSource = 'DETERMINISTIC' | 'MANUAL' | 'PROVIDER'

export interface GeneratedBrandAsset {
  readonly kind: DomainAssetKind
  readonly source: BrandAssetGenerationSource
  readonly mimeType: 'image/png'
  readonly width: number
  readonly height: number
  readonly identitySeed: string
  readonly contents: Uint8Array
}

export interface BrandAssetGenerator {
  generate(identity: BrandIdentity, kind: DomainAssetKind): GeneratedBrandAsset
}

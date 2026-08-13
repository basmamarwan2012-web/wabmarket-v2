import type { DomainAssetKind } from '@/lib/assets/asset-metadata.repository'
import type { DomainAssetDto } from '@/lib/assets/asset-upload.types'

export type BrandingGenerationAction = 'GENERATE_ONE' | 'GENERATE_MISSING'

export interface GenerateBrandingAssetsCommand {
  readonly hostname: string
  readonly action: BrandingGenerationAction
  readonly kind?: DomainAssetKind
}

export interface BrandingGenerationResult {
  readonly hostname: string
  readonly action: BrandingGenerationAction
  readonly generated: readonly DomainAssetDto[]
  readonly skippedSelectedKinds: readonly DomainAssetKind[]
}

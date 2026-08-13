import type { DomainAssetKind } from '@/lib/assets/asset-metadata.repository'
import type { PreparationAssetAssociations } from './preparation.repository'
import type {
  DomainPreparationReadiness,
  DomainPreparationRequirement,
} from './preparation.types'
import type { LandingPageRenderReadiness } from './landing-page.types'

export interface PrepareDomainCommand {
  readonly hostname: string
  readonly askingPrice: number
  readonly currency: string
  readonly externalSalesUrl: string
  readonly manualDescription?: string | null
  readonly expectedVersion: number | null
}

export interface PrepareDomainResult {
  readonly hostname: string
  readonly preparationVersion: number
  readonly readiness: DomainPreparationReadiness
  readonly missingRequirements: readonly DomainPreparationRequirement[]
  readonly landingPageReadiness: LandingPageRenderReadiness
  readonly generatedAssetKinds: readonly DomainAssetKind[]
  readonly selectedAssets: PreparationAssetAssociations
}

export interface NormalizedPrepareDomainCommand {
  readonly hostname: string
  readonly askingPrice: number
  readonly currency: string
  readonly externalSalesUrl: string
  readonly manualDescription: string | null
  readonly expectedVersion: number | null
}


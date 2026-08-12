import type { PreparationAssetAssociations } from './preparation.repository'
import type { PreparationGenerationResult } from './generation.types'
import type { LandingPageRenderModel } from './landing-page.types'
import type {
  DomainPreparation,
  DomainPreparationReadiness,
} from './preparation.types'

export interface SaveDomainPreparationCommand {
  readonly ownedDomainId: string
  readonly preparation: DomainPreparation
  readonly generation: PreparationGenerationResult
  readonly landingPage: LandingPageRenderModel
  readonly assets: PreparationAssetAssociations
  readonly expectedVersion: number | null
}

export interface SaveDomainPreparationResult {
  readonly ownedDomainId: string
  readonly hostname: string
  readonly preparationVersion: number
  readonly readiness: DomainPreparationReadiness
}

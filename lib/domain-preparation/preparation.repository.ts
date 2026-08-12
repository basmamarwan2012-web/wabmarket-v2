import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { PreparationGenerationResult } from './generation.types'
import type { LandingPageRenderModel } from './landing-page.types'
import type { DomainPreparation } from './preparation.types'

export interface PreparationAssetAssociations {
  readonly logoAssetId: string | null
  readonly faviconAssetId: string | null
  readonly openGraphAssetId: string | null
}

export interface SaveCurrentPreparation {
  readonly ownedDomainId: string
  readonly preparation: DomainPreparation
  readonly generation: PreparationGenerationResult
  readonly landingPage: LandingPageRenderModel
  readonly assets: PreparationAssetAssociations
  /** null creates the first version; updates require the exact current version. */
  readonly expectedVersion: number | null
}

export interface StoredDomainPreparation {
  readonly id: string
  readonly ownedDomainId: string
  readonly preparation: DomainPreparation
  readonly generation: PreparationGenerationResult
  readonly landingPage: LandingPageRenderModel
  readonly assets: PreparationAssetAssociations
  readonly version: number
  readonly createdAt: string
  readonly updatedAt: string
}

export interface DomainPreparationRepository {
  getCurrent(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<StoredDomainPreparation | null>
  saveCurrent(
    context: PersistenceAccountContext,
    input: SaveCurrentPreparation
  ): Promise<StoredDomainPreparation>
}

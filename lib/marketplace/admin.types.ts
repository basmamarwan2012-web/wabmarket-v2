import type {
  DomainAssetKind,
  DomainAssetStatus,
} from '@/lib/assets/asset-metadata.repository'
import type { DomainPreparationRequirement } from '@/lib/domain-preparation/preparation.types'
import type { MarketplacePublicationState } from './publication.repository'

export interface AdminMarketplaceDomainSummary {
  readonly ownedDomainId: string
  readonly hostname: string
  readonly ownershipConfirmed: boolean
  readonly preparationVersion: number | null
  readonly preparationReadiness: 'NOT_PREPARED' | 'NOT_READY' | 'READY_FOR_MARKETPLACE' | 'READY_FOR_MARKETING'
  readonly missingRequirements: readonly DomainPreparationRequirement[]
  readonly publicationState: 'NOT_PUBLISHED' | MarketplacePublicationState
  readonly publicationVersion: number | null
}

export interface AdminMarketplaceAssetOption {
  readonly id: string
  readonly kind: DomainAssetKind
  readonly status: DomainAssetStatus
  readonly publicReference: string | null
}

export interface AdminMarketplaceDomainDetail extends AdminMarketplaceDomainSummary {
  readonly askingPrice: number | null
  readonly currency: string | null
  readonly description: string | null
  readonly manualDescription: string | null
  readonly externalSalesUrl: string | null
  readonly ctaConfigured: boolean
  readonly selectedAssets: Readonly<{
    logoAssetId: string | null
    faviconAssetId: string | null
    openGraphAssetId: string | null
  }>
  readonly availableAssets: readonly AdminMarketplaceAssetOption[]
  readonly listingId: string | null
}

export interface SaveAdminMarketplacePreparationInput {
  readonly askingPrice: number
  readonly currency: string
  readonly manualDescription?: string | null
  readonly externalSalesUrl: string
  readonly ctaConfigured: boolean
  readonly logoAssetId?: string | null
  readonly faviconAssetId?: string | null
  readonly openGraphAssetId?: string | null
  readonly expectedVersion: number | null
}

export interface PublishAdminMarketplaceInput {
  readonly expectedPublicationVersion: number | null
}

export interface UnpublishAdminMarketplaceInput {
  readonly listingId: string
  readonly expectedPublicationVersion: number
}

export interface AdminMarketplaceMutationResult {
  readonly hostname: string
  readonly preparationVersion?: number
  readonly preparationReadiness?: string
  readonly listingId?: string
  readonly publicationState?: MarketplacePublicationState
  readonly publicationVersion?: number
}

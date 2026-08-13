import type { DomainPreparationReadiness } from '@/lib/domain-preparation/preparation.types'
import type { DomainPreparationRequirement } from '@/lib/domain-preparation/preparation.types'
import type { DomainAssetKind, DomainAssetStatus } from '@/lib/assets/asset-metadata.repository'
import type { MarketplacePublicationState } from '@/lib/marketplace/publication.repository'
import type {
  CreateOwnedDomainCommand,
  CreateOwnedDomainResult,
  DeleteOwnedDomainResult,
  OwnedDomainDeletionEligibility,
} from '@/lib/owned-domains/owned-domain-management.types'
import type {
  RegistrarAssociationSyncState,
  StoredOwnedDomainRegistrarAssociation,
} from '@/lib/registrar-sync/association.repository'
import type {
  RegistrarDomainStatus,
  RegistrarOwnedDomainSyncReport,
} from '@/lib/registrar-sync/types'

export const PORTFOLIO_DOMAIN_STATES = Object.freeze([
  'OWNED',
  'PREPARING',
  'READY',
  'PUBLISHED',
  'UNPUBLISHED',
] as const)

export type PortfolioDomainState = (typeof PORTFOLIO_DOMAIN_STATES)[number]

export const PORTFOLIO_NEXT_ACTIONS = Object.freeze([
  'PREPARE_FOR_SALE',
  'CONTINUE_PREPARATION',
  'MANAGE_LISTING',
] as const)

export type PortfolioNextAction = (typeof PORTFOLIO_NEXT_ACTIONS)[number]

export const PORTFOLIO_ACTIONS = Object.freeze([
  'VIEW_DOMAIN',
  'PREPARE_FOR_SALE',
  'CONTINUE_PREPARATION',
  'MANAGE_LISTING',
  'PREVIEW_LISTING',
  'VIEW_PUBLIC_PAGE',
  'ADD_LOGO',
  'GENERATE_LOGO',
  'DELETE_DOMAIN',
] as const)

export type PortfolioAction = (typeof PORTFOLIO_ACTIONS)[number]

export interface AdminPortfolioAsset {
  readonly id: string
  readonly kind: DomainAssetKind
  readonly status: DomainAssetStatus
  readonly contentReference: string
  readonly selectedForPreparation: boolean
  readonly createdAt: string
  readonly updatedAt: string
}

export interface AdminPortfolioLogo {
  readonly assetId: string
  readonly contentReference: string
  readonly source: 'PREPARATION_SELECTED' | 'DISPLAY_FALLBACK'
}

export interface AdminPortfolioPreparationSummary {
  readonly exists: boolean
  readonly readiness: 'NOT_PREPARED' | DomainPreparationReadiness
  readonly missingRequirements: readonly DomainPreparationRequirement[]
  readonly version: number | null
  readonly askingPrice: number | null
  readonly currency: string | null
  readonly createdAt: string | null
  readonly updatedAt: string | null
}

export interface AdminPortfolioPublicationSummary {
  readonly state: 'NOT_PUBLISHED' | MarketplacePublicationState
  readonly version: number | null
  readonly eligibility: string | null
  readonly listingId: string | null
  readonly publicReference: string | null
  readonly askingPrice: number | null
  readonly currency: string | null
  readonly publishedAt: string | null
  readonly unpublishedAt: string | null
  readonly createdAt: string | null
  readonly updatedAt: string | null
}

export interface AdminPortfolioLifecycleEvent {
  readonly id: string
  readonly occurredAt: string
  readonly type:
    | 'OWNERSHIP_CONFIRMED'
    | 'REGISTRAR_FIRST_SEEN'
    | 'REGISTRAR_LAST_SEEN'
    | 'REGISTRAR_LAST_SYNCED'
    | 'PREPARATION_CREATED'
    | 'PREPARATION_UPDATED'
    | 'LISTING_PUBLISHED'
    | 'LISTING_UNPUBLISHED'
  readonly label: string
}

export interface AdminPortfolioRegistrarAssociation {
  readonly providerIdentifier: string
  readonly providerDomainIdentifier: string | null
  readonly registrarStatus: RegistrarDomainStatus
  readonly expiresAt: string | null
  readonly autoRenew: boolean | null
  readonly firstSeenAt: string
  readonly lastSeenAt: string
  readonly lastSyncedAt: string
  readonly syncState: RegistrarAssociationSyncState
}

export interface AdminPortfolioDomainSummary {
  readonly ownedDomainId: string
  readonly hostname: string
  readonly ownershipConfirmed: boolean
  readonly registrarAssociations: readonly AdminPortfolioRegistrarAssociation[]
  readonly displayLogo: AdminPortfolioLogo | null
  readonly preparationVersion: number | null
  readonly preparationReadiness: 'NOT_PREPARED' | DomainPreparationReadiness
  readonly publicationState: 'NOT_PUBLISHED' | MarketplacePublicationState
  readonly publicationVersion: number | null
  readonly publicationPublicReference: string | null
  readonly askingPrice: number | null
  readonly currency: string | null
  readonly portfolioState: PortfolioDomainState
  readonly nextAction: PortfolioNextAction
  readonly actions: readonly PortfolioAction[]
  readonly deletion: OwnedDomainDeletionEligibility
}

export interface AdminPortfolioDomainProfile extends AdminPortfolioDomainSummary {
  readonly domainStatus: string
  readonly ownershipConfirmedAt: string | null
  readonly ownershipSource: 'MANUAL' | 'REGISTRAR_SYNCHRONIZED'
  readonly assets: readonly AdminPortfolioAsset[]
  readonly preparation: AdminPortfolioPreparationSummary
  readonly publication: AdminPortfolioPublicationSummary
  readonly lifecycle: readonly AdminPortfolioLifecycleEvent[]
}

export type CreateAdminPortfolioDomainInput = CreateOwnedDomainCommand
export type CreateAdminPortfolioDomainResult = CreateOwnedDomainResult
export type DeleteAdminPortfolioDomainResult = DeleteOwnedDomainResult
export type AdminPortfolioRegistrarSyncReport = RegistrarOwnedDomainSyncReport

export const toAdminPortfolioRegistrarAssociation = (
  association: StoredOwnedDomainRegistrarAssociation
): AdminPortfolioRegistrarAssociation =>
  Object.freeze({
    providerIdentifier: association.providerIdentifier,
    providerDomainIdentifier: association.providerDomainIdentifier,
    registrarStatus: association.registrarStatus,
    expiresAt: association.expiresAt,
    autoRenew: association.autoRenew,
    firstSeenAt: association.firstSeenAt,
    lastSeenAt: association.lastSeenAt,
    lastSyncedAt: association.lastSyncedAt,
    syncState: association.syncState,
  })

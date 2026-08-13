import type { DomainPreparationReadiness } from '@/lib/domain-preparation/preparation.types'
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
  readonly preparationVersion: number | null
  readonly preparationReadiness: 'NOT_PREPARED' | DomainPreparationReadiness
  readonly publicationState: 'NOT_PUBLISHED' | MarketplacePublicationState
  readonly publicationVersion: number | null
  readonly portfolioState: PortfolioDomainState
  readonly nextAction: PortfolioNextAction
  readonly deletion: OwnedDomainDeletionEligibility
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

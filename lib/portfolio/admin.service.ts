import 'server-only'

import type { AssetMetadataRecord } from '@/lib/assets/asset-metadata.repository'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import { OwnedDomainManagementService } from '@/lib/owned-domains/owned-domain-management.service'
import type { StoredOwnedDomain } from '@/lib/owned-domains/owned-domain.repository'
import type {
  PortfolioReadPublication,
  PortfolioReadSnapshot,
} from './read.repository'
import {
  toAdminPortfolioRegistrarAssociation,
  type AdminPortfolioDomainProfile,
  type AdminPortfolioDomainSummary,
  type AdminPortfolioLifecycleEvent,
  type AdminPortfolioLogo,
  type PortfolioAction,
  type CreateAdminPortfolioDomainInput,
} from './admin.types'

export class AdminPortfolioService {
  private readonly ownedDomains: OwnedDomainManagementService

  constructor(private readonly unitOfWork: PersistenceUnitOfWork) {
    this.ownedDomains = new OwnedDomainManagementService(unitOfWork)
  }

  list(context: PersistenceAccountContext) {
    return this.unitOfWork.run(async (repositories) => {
      const snapshot = await repositories.portfolioRead.list(context)
      return Object.freeze(
        snapshot.domains.map((domain) => this.summary(snapshot, domain))
      )
    })
  }

  get(context: PersistenceAccountContext, hostname: string) {
    return this.unitOfWork.run(async (repositories) => {
      const snapshot = await repositories.portfolioRead.findByHostname(
        context,
        hostname
      )
      if (!snapshot || snapshot.domains.length !== 1) return null
      return this.profile(snapshot, snapshot.domains[0])
    })
  }

  create(
    context: PersistenceAccountContext,
    input: CreateAdminPortfolioDomainInput
  ) {
    return this.ownedDomains.create(context, input)
  }

  delete(context: PersistenceAccountContext, hostname: string) {
    return this.ownedDomains.delete(context, { hostname })
  }

  private summary(
    snapshot: PortfolioReadSnapshot,
    domain: StoredOwnedDomain
  ): AdminPortfolioDomainSummary {
    const preparation = snapshot.preparations.find(
      (item) => item.ownedDomainId === domain.id
    )
    const publication = snapshot.publications.find(
      (item) => item.ownedDomainId === domain.id
    )
    const associations = snapshot.registrarAssociations.filter(
      (item) => item.ownedDomainId === domain.id
    )
    const assets = snapshot.assets.filter(
      (item) => item.ownedDomainId === domain.id
    )
    const displayLogo = resolveDisplayLogo(domain.normalizedHostname, assets, preparation?.assets.logoAssetId ?? null)
    const preparationReadiness =
      preparation?.preparation.readiness.readiness ?? 'NOT_PREPARED'
    const publicationState = publication?.state ?? 'NOT_PUBLISHED'
    const portfolioState =
      publicationState === 'PUBLISHED'
        ? 'PUBLISHED'
        : publicationState === 'UNPUBLISHED'
          ? 'UNPUBLISHED'
          : publicationState === 'DRAFT'
            ? 'PREPARING'
            : preparationReadiness === 'NOT_PREPARED'
              ? 'OWNED'
              : preparationReadiness === 'NOT_READY'
                ? 'PREPARING'
                : 'READY'
    const nextAction = publication
      ? 'MANAGE_LISTING'
      : preparation
        ? 'CONTINUE_PREPARATION'
        : 'PREPARE_FOR_SALE'
    const deletion = deletionEligibility(preparation !== undefined, assets.length, publication)
    const actions: PortfolioAction[] = ['VIEW_DOMAIN', nextAction]
    if (preparation && preparation.landingPage.readiness.state !== 'NOT_RENDERABLE')
      actions.push('PREVIEW_LISTING')
    if (
      publication?.state === 'PUBLISHED' &&
      publication.publicReference
    )
      actions.push('VIEW_PUBLIC_PAGE')
    if (!displayLogo) actions.push('ADD_LOGO', 'GENERATE_LOGO')
    if (deletion.allowed) actions.push('DELETE_DOMAIN')

    return Object.freeze({
      ownedDomainId: domain.id,
      hostname: domain.normalizedHostname,
      ownershipConfirmed: domain.ownership.confirmed,
      registrarAssociations: Object.freeze(
        associations.map(toAdminPortfolioRegistrarAssociation)
      ),
      displayLogo,
      preparationVersion: preparation?.version ?? null,
      preparationReadiness,
      publicationState,
      publicationVersion: publication?.version ?? null,
      publicationPublicReference:
        publication?.state === 'PUBLISHED'
          ? publication.publicReference
          : null,
      askingPrice:
        preparation?.preparation.preparation.sales.askingPrice ?? null,
      currency: preparation?.preparation.preparation.sales.currency ?? null,
      portfolioState,
      nextAction,
      actions: Object.freeze(actions),
      deletion,
    })
  }

  private profile(
    snapshot: PortfolioReadSnapshot,
    domain: StoredOwnedDomain
  ): AdminPortfolioDomainProfile {
    const summary = this.summary(snapshot, domain)
    const preparation = snapshot.preparations.find(
      (item) => item.ownedDomainId === domain.id
    )
    const publication = snapshot.publications.find(
      (item) => item.ownedDomainId === domain.id
    )
    const selected = new Set(
      preparation ? Object.values(preparation.assets).filter(Boolean) : []
    )
    const assets = snapshot.assets.filter(
      (item) => item.ownedDomainId === domain.id
    )

    return Object.freeze({
      ...summary,
      domainStatus: domain.status,
      ownershipConfirmedAt: domain.ownership.confirmed
        ? domain.ownership.confirmedAt
        : null,
      ownershipSource: summary.registrarAssociations.length
        ? domain.ownership.confirmed &&
          domain.ownership.evidenceReference?.startsWith('registrar:')
          ? 'REGISTRAR_SYNCHRONIZED'
          : 'MANUAL'
        : 'MANUAL',
      assets: Object.freeze(
        assets.map((asset) =>
          Object.freeze({
            id: asset.id,
            kind: asset.kind,
            status: asset.status,
            contentReference: privateAssetReference(
              domain.normalizedHostname,
              asset.id
            ),
            selectedForPreparation: selected.has(asset.id),
            createdAt: asset.createdAt,
            updatedAt: asset.updatedAt,
          })
        )
      ),
      preparation: Object.freeze({
        exists: preparation !== undefined,
        readiness: summary.preparationReadiness,
        missingRequirements:
          preparation?.preparation.readiness.missingRequirements ??
          Object.freeze([]),
        version: preparation?.version ?? null,
        askingPrice: summary.askingPrice,
        currency: summary.currency,
        createdAt: preparation?.createdAt ?? null,
        updatedAt: preparation?.updatedAt ?? null,
      }),
      publication: Object.freeze({
        state: summary.publicationState,
        version: publication?.version ?? null,
        eligibility: publication?.eligibility.state ?? null,
        listingId: publication?.listingId ?? null,
        publicReference:
          publication?.state === 'PUBLISHED'
            ? publication.publicReference
            : null,
        askingPrice: publication?.askingPrice ?? null,
        currency: publication?.currency ?? null,
        publishedAt: publication?.publishedAt ?? null,
        unpublishedAt: publication?.unpublishedAt ?? null,
        createdAt: publication?.createdAt ?? null,
        updatedAt: publication?.updatedAt ?? null,
      }),
      lifecycle: createLifecycle(domain, summary, preparation, publication),
    })
  }
}

const privateAssetReference = (hostname: string, assetId: string) =>
  `/api/admin/marketplace/domains/${hostname}/assets/${assetId}/content`

const resolveDisplayLogo = (
  hostname: string,
  assets: readonly AssetMetadataRecord[],
  selectedLogoId: string | null
): AdminPortfolioLogo | null => {
  const available = assets.filter(
    (asset) => asset.kind === 'LOGO' && asset.status === 'AVAILABLE'
  )
  const logo =
    available.find((asset) => asset.id === selectedLogoId) ?? available[0]
  if (!logo) return null
  return Object.freeze({
    assetId: logo.id,
    contentReference: privateAssetReference(hostname, logo.id),
    source:
      logo.id === selectedLogoId
        ? 'PREPARATION_SELECTED'
        : 'DISPLAY_FALLBACK',
  })
}

const deletionEligibility = (
  hasPreparation: boolean,
  assetCount: number,
  publication: PortfolioReadPublication | undefined
) => {
  if (publication?.state === 'PUBLISHED')
    return Object.freeze({ allowed: false as const, reason: 'DOMAIN_IS_PUBLISHED' as const })
  if (publication)
    return Object.freeze({ allowed: false as const, reason: 'DOMAIN_DELETE_NOT_ALLOWED' as const })
  if (hasPreparation)
    return Object.freeze({ allowed: false as const, reason: 'DOMAIN_HAS_PREPARATION' as const })
  if (assetCount > 0)
    return Object.freeze({ allowed: false as const, reason: 'DOMAIN_HAS_ASSETS' as const })
  return Object.freeze({ allowed: true as const, reason: null })
}

const createLifecycle = (
  domain: StoredOwnedDomain,
  summary: AdminPortfolioDomainSummary,
  preparation: PortfolioReadSnapshot['preparations'][number] | undefined,
  publication: PortfolioReadPublication | undefined
) => {
  const events: AdminPortfolioLifecycleEvent[] = []
  if (domain.ownership.confirmed)
    events.push(event('ownership-confirmed', domain.ownership.confirmedAt, 'OWNERSHIP_CONFIRMED', 'Ownership confirmed'))
  for (const association of summary.registrarAssociations) {
    events.push(event(`${association.providerIdentifier}-first-seen`, association.firstSeenAt, 'REGISTRAR_FIRST_SEEN', `${association.providerIdentifier} first seen`))
    events.push(event(`${association.providerIdentifier}-last-seen`, association.lastSeenAt, 'REGISTRAR_LAST_SEEN', `${association.providerIdentifier} last seen`))
    events.push(event(`${association.providerIdentifier}-last-synced`, association.lastSyncedAt, 'REGISTRAR_LAST_SYNCED', `${association.providerIdentifier} last synchronized`))
  }
  if (preparation) {
    events.push(event('preparation-created', preparation.createdAt, 'PREPARATION_CREATED', 'Preparation created'))
    if (preparation.updatedAt !== preparation.createdAt)
      events.push(event('preparation-updated', preparation.updatedAt, 'PREPARATION_UPDATED', 'Preparation updated'))
  }
  if (publication?.publishedAt)
    events.push(event('listing-published', publication.publishedAt, 'LISTING_PUBLISHED', 'Listing published'))
  if (publication?.unpublishedAt)
    events.push(event('listing-unpublished', publication.unpublishedAt, 'LISTING_UNPUBLISHED', 'Listing unpublished'))
  return Object.freeze(
    events.sort((left, right) =>
      right.occurredAt.localeCompare(left.occurredAt) || left.id.localeCompare(right.id)
    )
  )
}

const event = (
  id: string,
  occurredAt: string,
  type: AdminPortfolioLifecycleEvent['type'],
  label: string
): AdminPortfolioLifecycleEvent => Object.freeze({ id, occurredAt, type, label })

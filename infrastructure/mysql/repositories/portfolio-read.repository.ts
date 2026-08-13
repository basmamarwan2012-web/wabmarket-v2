import 'server-only'

import { and, asc, eq, inArray } from 'drizzle-orm'

import type { AssetMetadataRecord } from '@/lib/assets/asset-metadata.repository'
import type { StoredDomainPreparation } from '@/lib/domain-preparation/preparation.repository'
import type {
  OwnershipConfirmation,
  StoredOwnedDomain,
} from '@/lib/owned-domains/owned-domain.repository'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type {
  PortfolioReadRepository,
  PortfolioReadPublication,
  PortfolioReadSnapshot,
} from '@/lib/portfolio/read.repository'
import type { StoredOwnedDomainRegistrarAssociation } from '@/lib/registrar-sync/association.repository'
import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type { WabmarketMySqlDatabase } from '../client'
import {
  domainAssets,
  domainPreparations,
  marketplaceListings,
  ownedDomainRegistrarAssociations,
  ownedDomains,
} from '../schema'
import { freezeDeep, toIso } from './helpers'

export class MySqlPortfolioReadRepository implements PortfolioReadRepository {
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async list(context: PersistenceAccountContext) {
    const domains = await this.database
      .select()
      .from(ownedDomains)
      .where(eq(ownedDomains.accountId, context.accountId))
      .orderBy(asc(ownedDomains.normalizedHostname), asc(ownedDomains.id))
      .limit(500)
    return this.load(context, domains)
  }

  async findByHostname(
    context: PersistenceAccountContext,
    normalizedHostname: string
  ) {
    const hostname = normalizeHostname(normalizedHostname)
    if (!hostname || hostname !== normalizedHostname) return null
    const domains = await this.database
      .select()
      .from(ownedDomains)
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(ownedDomains.normalizedHostname, hostname)
        )
      )
      .limit(1)
    return domains.length === 0 ? null : this.load(context, domains)
  }

  private async load(
    context: PersistenceAccountContext,
    domainRows: readonly (typeof ownedDomains.$inferSelect)[]
  ): Promise<PortfolioReadSnapshot> {
    if (domainRows.length === 0) return emptySnapshot()
    const domainIds = domainRows.map((domain) => domain.id)
    const [associationRows, assetRows, preparationRows, publicationRows] =
      await Promise.all([
        this.database
          .select()
          .from(ownedDomainRegistrarAssociations)
          .where(
            and(
              eq(
                ownedDomainRegistrarAssociations.accountId,
                context.accountId
              ),
              inArray(
                ownedDomainRegistrarAssociations.ownedDomainId,
                domainIds
              )
            )
          )
          .orderBy(
            asc(ownedDomainRegistrarAssociations.ownedDomainId),
            asc(ownedDomainRegistrarAssociations.providerIdentifier),
            asc(ownedDomainRegistrarAssociations.id)
          ),
        this.database
          .select()
          .from(domainAssets)
          .where(
            and(
              eq(domainAssets.accountId, context.accountId),
              inArray(domainAssets.ownedDomainId, domainIds)
            )
          )
          .orderBy(
            asc(domainAssets.ownedDomainId),
            asc(domainAssets.kind),
            asc(domainAssets.createdAt),
            asc(domainAssets.id)
          ),
        this.database
          .select({ preparation: domainPreparations })
          .from(domainPreparations)
          .innerJoin(
            ownedDomains,
            eq(domainPreparations.ownedDomainId, ownedDomains.id)
          )
          .where(
            and(
              eq(ownedDomains.accountId, context.accountId),
              inArray(domainPreparations.ownedDomainId, domainIds)
            )
          )
          .orderBy(asc(domainPreparations.ownedDomainId)),
        this.database
          .select({ listing: marketplaceListings })
          .from(marketplaceListings)
          .innerJoin(
            ownedDomains,
            eq(marketplaceListings.ownedDomainId, ownedDomains.id)
          )
          .where(
            and(
              eq(ownedDomains.accountId, context.accountId),
              inArray(marketplaceListings.ownedDomainId, domainIds)
            )
          )
          .orderBy(asc(marketplaceListings.ownedDomainId)),
      ])

    return freezeDeep({
      domains: domainRows.map(mapDomain),
      registrarAssociations: associationRows.map(mapAssociation),
      assets: assetRows.map(mapAsset),
      preparations: preparationRows.map(({ preparation }) =>
        mapPreparation(preparation)
      ),
      publications: publicationRows.map(({ listing }) => mapPublication(listing)),
    })
  }
}

const emptySnapshot = (): PortfolioReadSnapshot =>
  freezeDeep({
    domains: [],
    registrarAssociations: [],
    assets: [],
    preparations: [],
    publications: [],
  })

const mapDomain = (row: typeof ownedDomains.$inferSelect): StoredOwnedDomain => {
  const ownership: OwnershipConfirmation = row.ownershipConfirmed
    ? Object.freeze({
        confirmed: true,
        confirmedAt: row.ownershipConfirmedAt!.toISOString(),
        confirmedByFirebaseUid: row.ownershipConfirmedByFirebaseUid!,
        evidenceReference: row.ownershipEvidenceReference,
      })
    : Object.freeze({
        confirmed: false,
        confirmedAt: null,
        confirmedByFirebaseUid: null,
        evidenceReference: null,
      })
  return Object.freeze({
    id: row.id,
    normalizedHostname: row.normalizedHostname,
    status: row.status,
    ownership,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  })
}

const mapAssociation = (
  row: typeof ownedDomainRegistrarAssociations.$inferSelect
): StoredOwnedDomainRegistrarAssociation =>
  Object.freeze({
    id: row.id,
    ownedDomainId: row.ownedDomainId,
    providerIdentifier: row.providerIdentifier,
    providerDomainIdentifier: row.providerDomainIdentifier,
    registrarStatus: row.registrarStatus,
    expiresAt: row.expiresAt ? toIso(row.expiresAt) : null,
    autoRenew: row.autoRenew,
    firstSeenAt: toIso(row.firstSeenAt),
    lastSeenAt: toIso(row.lastSeenAt),
    lastSyncedAt: toIso(row.lastSyncedAt),
    syncState: row.syncState,
    provenanceReference: row.provenanceReference,
    version: row.version,
  })

const mapAsset = (row: typeof domainAssets.$inferSelect): AssetMetadataRecord =>
  Object.freeze({
    id: row.id,
    ownedDomainId: row.ownedDomainId,
    kind: row.kind,
    storageKey: row.storageKey,
    publicReference: row.publicReference,
    mimeType: row.mimeType,
    byteSize: row.byteSize,
    checksum: row.checksum,
    status: row.status,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  })

const mapPreparation = (
  row: typeof domainPreparations.$inferSelect
): StoredDomainPreparation =>
  freezeDeep({
    id: row.id,
    ownedDomainId: row.ownedDomainId,
    preparation: row.preparationSnapshot,
    generation: row.generationSnapshot,
    landingPage: row.landingPageSnapshot,
    assets: {
      logoAssetId: row.logoAssetId,
      faviconAssetId: row.faviconAssetId,
      openGraphAssetId: row.openGraphAssetId,
    },
    version: row.version,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
  })

const mapPublication = (
  row: typeof marketplaceListings.$inferSelect
): PortfolioReadPublication =>
  freezeDeep({
    listingId: row.listingId,
    ownedDomainId: row.ownedDomainId,
    hostname: row.normalizedHostname,
    eligibility: {
      state: row.eligibilityState,
      reasons: row.eligibilityReasons,
    },
    state: row.publicationState,
    version: row.version,
    publishedAt: row.publishedAt ? toIso(row.publishedAt) : null,
    unpublishedAt: row.unpublishedAt ? toIso(row.unpublishedAt) : null,
    createdAt: toIso(row.createdAt),
    updatedAt: toIso(row.updatedAt),
    publicReference: row.landingPageReference,
    askingPrice: Number(row.askingPrice),
    currency: row.currency,
  })

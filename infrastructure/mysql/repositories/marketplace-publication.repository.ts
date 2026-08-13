import 'server-only'

import { and, eq } from 'drizzle-orm'

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError, sanitizePersistenceError } from '@/lib/persistence/errors'
import type {
  MarketplacePublicationRecord,
  MarketplacePublicationRepository,
  MarketplacePublicationState,
  MarketplacePublicationWrite,
} from '@/lib/marketplace/publication.repository'
import type { WabmarketMySqlDatabase } from '../client'
import { domainPreparations, marketplaceListings, ownedDomains } from '../schema'
import {
  createPublicListingSnapshot,
  freezeDeep,
  toIso,
} from './helpers'

export class MySqlMarketplacePublicationRepository
  implements MarketplacePublicationRepository
{
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async findByOwnedDomain(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ) {
    const [row] = await this.database
      .select({ listing: marketplaceListings })
      .from(marketplaceListings)
      .innerJoin(ownedDomains, eq(marketplaceListings.ownedDomainId, ownedDomains.id))
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(marketplaceListings.ownedDomainId, ownedDomainId)
        )
      )
      .limit(1)
    return row ? this.map(row.listing) : null
  }

  saveDraft(
    context: PersistenceAccountContext,
    input: MarketplacePublicationWrite
  ) {
    return this.save(context, input, 'DRAFT')
  }

  publish(
    context: PersistenceAccountContext,
    input: MarketplacePublicationWrite
  ) {
    if (input.listing.publication.state !== 'ELIGIBLE')
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')
    return this.save(context, input, 'PUBLISHED')
  }

  async unpublish(
    context: PersistenceAccountContext,
    listingId: string,
    expectedVersion: number
  ) {
    const existing = await this.findOwned(context, listingId)
    if (!existing) throw new PersistenceError('PERSISTENCE_NOT_FOUND')

    const result = await this.database
      .update(marketplaceListings)
      .set({
        publicationState: 'UNPUBLISHED',
        publishedHostname: null,
        unpublishedAt: new Date(),
        version: expectedVersion + 1,
      })
      .where(
        and(
          eq(marketplaceListings.listingId, listingId),
          eq(marketplaceListings.ownedDomainId, existing.ownedDomainId),
          eq(marketplaceListings.version, expectedVersion),
        )
      )
    if (result[0].affectedRows !== 1)
      throw new PersistenceError('PERSISTENCE_VERSION_CONFLICT')
    const row = await this.findOwned(context, listingId)
    if (!row) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    return this.map(row)
  }

  private async save(
    context: PersistenceAccountContext,
    input: MarketplacePublicationWrite,
    state: MarketplacePublicationState
  ): Promise<MarketplacePublicationRecord> {
    const publicSnapshot = createPublicListingSnapshot(input.listing)
    if (input.landingPage.hostname !== input.listing.hostname)
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    if (
      state === 'PUBLISHED' &&
      (input.listing.publication.state !== 'ELIGIBLE' ||
        publicSnapshot.landingPageReference === null ||
        input.landingPage.readiness.state === 'NOT_RENDERABLE')
    )
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const preparation = await this.findPreparation(
      context,
      input.ownedDomainId,
      input.listing.hostname
    )
    if (!preparation)
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const now = new Date()
    const values = {
      preparationId: preparation.id,
      normalizedHostname: input.listing.hostname,
      publishedHostname: state === 'PUBLISHED' ? input.listing.hostname : null,
      publicationState: state,
      eligibilityState: input.listing.publication.state,
      eligibilityReasons: input.listing.publication.reasons,
      displayName: input.listing.displayName,
      askingPrice: input.listing.askingPrice.toString(),
      currency: input.listing.currency,
      description: input.listing.description,
      landingPageReference: publicSnapshot.landingPageReference,
      externalSalesUrl: input.listing.externalSalesUrl,
      externalSalesCtaLabel: input.listing.externalSalesCtaLabel,
      publicSnapshot,
      landingPageSnapshot: input.landingPage,
      publishedAt: state === 'PUBLISHED' ? now : null,
      unpublishedAt: null,
    } as const

    try {
      if (input.expectedVersion === null) {
        await this.database.insert(marketplaceListings).values({
          listingId: input.listing.listingId,
          ownedDomainId: input.ownedDomainId,
          ...values,
          version: 1,
        })
      } else {
        const result = await this.database
          .update(marketplaceListings)
          .set({ ...values, version: input.expectedVersion + 1 })
          .where(
            and(
              eq(marketplaceListings.listingId, input.listing.listingId),
              eq(marketplaceListings.ownedDomainId, input.ownedDomainId),
              eq(marketplaceListings.version, input.expectedVersion)
            )
          )
        if (result[0].affectedRows !== 1)
          throw new PersistenceError('PERSISTENCE_VERSION_CONFLICT')
      }
      const row = await this.findOwned(context, input.listing.listingId)
      if (!row) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      return this.map(row)
    } catch (error) {
      throw sanitizePersistenceError(error)
    }
  }

  private async findPreparation(
    context: PersistenceAccountContext,
    ownedDomainId: string,
    hostname: string
  ) {
    const [row] = await this.database
      .select({ id: domainPreparations.id })
      .from(domainPreparations)
      .innerJoin(ownedDomains, eq(domainPreparations.ownedDomainId, ownedDomains.id))
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(ownedDomains.id, ownedDomainId),
          eq(ownedDomains.normalizedHostname, hostname)
        )
      )
      .limit(1)
    return row ?? null
  }

  private async findOwned(
    context: PersistenceAccountContext,
    listingId: string
  ) {
    const [row] = await this.database
      .select({ listing: marketplaceListings })
      .from(marketplaceListings)
      .innerJoin(ownedDomains, eq(marketplaceListings.ownedDomainId, ownedDomains.id))
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(marketplaceListings.listingId, listingId)
        )
      )
      .limit(1)
    return row?.listing ?? null
  }

  private map(
    row: typeof marketplaceListings.$inferSelect
  ): MarketplacePublicationRecord {
    return freezeDeep({
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
    })
  }
}

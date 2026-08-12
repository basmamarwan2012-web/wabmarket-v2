import 'server-only'

import { and, eq } from 'drizzle-orm'

import type {
  DomainPreparationRepository,
  SaveCurrentPreparation,
  StoredDomainPreparation,
} from '@/lib/domain-preparation/preparation.repository'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError, sanitizePersistenceError } from '@/lib/persistence/errors'
import type { WabmarketMySqlDatabase } from '../client'
import { domainPreparations, ownedDomains } from '../schema'
import { createPersistenceId, freezeDeep, toIso } from './helpers'

export class MySqlDomainPreparationRepository
  implements DomainPreparationRepository
{
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async getCurrent(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ) {
    const [row] = await this.database
      .select({ preparation: domainPreparations })
      .from(domainPreparations)
      .innerJoin(
        ownedDomains,
        eq(domainPreparations.ownedDomainId, ownedDomains.id)
      )
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(domainPreparations.ownedDomainId, ownedDomainId)
        )
      )
      .limit(1)
    return row ? this.map(row.preparation) : null
  }

  async saveCurrent(
    context: PersistenceAccountContext,
    input: SaveCurrentPreparation
  ) {
    if (
      input.preparation.hostname !== input.generation.hostname ||
      input.preparation.hostname !== input.landingPage.hostname
    )
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const domain = await this.findOwnedDomain(context, input.ownedDomainId)
    if (!domain || domain.normalizedHostname !== input.preparation.hostname)
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const values = {
      hostname: input.preparation.hostname,
      ownershipConfirmed: input.preparation.ownershipConfirmed ? 1 : 0,
      readiness: input.preparation.readiness.readiness,
      askingPrice: input.preparation.preparation.sales.askingPrice?.toString() ?? null,
      currency: input.preparation.preparation.sales.currency,
      externalSalesUrl: input.preparation.preparation.sales.externalSalesUrl,
      ctaConfigured: input.preparation.preparation.sales.ctaConfigured ? 1 : 0,
      description: input.preparation.preparation.description.contentOrReference,
      landingPageReference: input.preparation.preparation.landingPage.reference,
      logoAssetId: input.assets.logoAssetId,
      faviconAssetId: input.assets.faviconAssetId,
      openGraphAssetId: input.assets.openGraphAssetId,
      sourceOpportunityId: input.preparation.sourceOpportunityId,
      preparationSnapshot: input.preparation,
      generationSnapshot: input.generation,
      landingPageSnapshot: input.landingPage,
    } as const

    try {
      if (input.expectedVersion === null) {
        await this.database.insert(domainPreparations).values({
          id: createPersistenceId(),
          ownedDomainId: input.ownedDomainId,
          ...values,
          version: 1,
        })
      } else {
        const result = await this.database
          .update(domainPreparations)
          .set({ ...values, version: input.expectedVersion + 1 })
          .where(
            and(
              eq(domainPreparations.ownedDomainId, input.ownedDomainId),
              eq(domainPreparations.version, input.expectedVersion)
            )
          )
        if (result[0].affectedRows !== 1)
          throw new PersistenceError('PERSISTENCE_VERSION_CONFLICT')
      }
      const saved = await this.getCurrent(context, input.ownedDomainId)
      if (!saved) throw new PersistenceError('PERSISTENCE_UNAVAILABLE')
      return saved
    } catch (error) {
      throw sanitizePersistenceError(error)
    }
  }

  private async findOwnedDomain(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ) {
    const [row] = await this.database
      .select({
        id: ownedDomains.id,
        normalizedHostname: ownedDomains.normalizedHostname,
      })
      .from(ownedDomains)
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(ownedDomains.id, ownedDomainId)
        )
      )
      .limit(1)
    return row ?? null
  }

  private map(
    row: typeof domainPreparations.$inferSelect
  ): StoredDomainPreparation {
    return freezeDeep({
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
  }
}

import 'server-only'

import { and, asc, eq, gt, or } from 'drizzle-orm'

import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type {
  MarketplacePublicRecord,
  MarketplaceReadRepository,
} from '@/lib/marketplace/read.repository'
import { PersistenceError } from '@/lib/persistence/errors'
import type { WabmarketMySqlDatabase } from '../client'
import { marketplaceListings } from '../schema'
import { freezeDeep } from './helpers'

const DEFAULT_LIMIT = 24
const MAXIMUM_LIMIT = 100

export class MySqlMarketplaceReadRepository
  implements MarketplaceReadRepository
{
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async listPublished(input: Parameters<MarketplaceReadRepository['listPublished']>[0] = {}) {
    const limit = Math.min(
      MAXIMUM_LIMIT,
      Math.max(1, Math.trunc(input.limit ?? DEFAULT_LIMIT))
    )
    const cursor = input.after
    const cursorClause = cursor
      ? or(
          gt(marketplaceListings.normalizedHostname, cursor.hostname),
          and(
            eq(marketplaceListings.normalizedHostname, cursor.hostname),
            gt(marketplaceListings.listingId, cursor.listingId)
          )
        )
      : undefined
    const rows = await this.database
      .select({
        snapshot: marketplaceListings.publicSnapshot,
        landingPage: marketplaceListings.landingPageSnapshot,
      })
      .from(marketplaceListings)
      .where(
        cursorClause
          ? and(
              eq(marketplaceListings.publicationState, 'PUBLISHED'),
              cursorClause
            )
          : eq(marketplaceListings.publicationState, 'PUBLISHED')
      )
      .orderBy(
        asc(marketplaceListings.normalizedHostname),
        asc(marketplaceListings.listingId)
      )
      .limit(limit + 1)
    const pageRows = rows.slice(0, limit)
    const items = pageRows.map((row) =>
      this.map(row.snapshot, row.landingPage)
    )
    const last = items.at(-1)
    return freezeDeep({
      items,
      nextCursor:
        rows.length > limit && last
          ? { hostname: last.hostname, listingId: last.listingId }
          : null,
    })
  }

  async findPublishedByHostname(normalizedHostname: string) {
    const hostname = normalizeHostname(normalizedHostname)
    if (!hostname || hostname !== normalizedHostname) return null
    const [row] = await this.database
      .select({
        snapshot: marketplaceListings.publicSnapshot,
        landingPage: marketplaceListings.landingPageSnapshot,
      })
      .from(marketplaceListings)
      .where(
        and(
          eq(marketplaceListings.publicationState, 'PUBLISHED'),
          eq(marketplaceListings.normalizedHostname, hostname)
        )
      )
      .limit(1)
    return row ? this.map(row.snapshot, row.landingPage) : null
  }

  private map(
    snapshot: typeof marketplaceListings.$inferSelect.publicSnapshot,
    landingPage: typeof marketplaceListings.$inferSelect.landingPageSnapshot
  ): MarketplacePublicRecord {
    if (snapshot.landingPageReference === null)
      throw new PersistenceError('PERSISTENCE_UNAVAILABLE')
    return freezeDeep({
      ...snapshot,
      landingPageReference: snapshot.landingPageReference,
      landingPage,
    })
  }
}

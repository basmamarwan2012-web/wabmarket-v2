import 'server-only'

import { and, asc, eq } from 'drizzle-orm'

import type {
  AssetMetadataRecord,
  AssetMetadataRepository,
  CreateAssetMetadataRecord,
} from '@/lib/assets/asset-metadata.repository'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { sanitizePersistenceError } from '@/lib/persistence/errors'
import type { WabmarketMySqlDatabase } from '../client'
import { domainAssets } from '../schema'
import { createPersistenceId, toIso } from './helpers'

export class MySqlAssetMetadataRepository
  implements AssetMetadataRepository
{
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async create(
    context: PersistenceAccountContext,
    input: CreateAssetMetadataRecord
  ) {
    const id = input.id ?? createPersistenceId()
    try {
      await this.database.insert(domainAssets).values({
        id,
        accountId: context.accountId,
        ownedDomainId: input.ownedDomainId,
        kind: input.kind,
        storageKey: input.storageKey,
        publicReference: input.publicReference,
        mimeType: input.mimeType,
        byteSize: input.byteSize,
        checksum: input.checksum,
        status: input.status,
      })
      const created = await this.findById(context, id)
      if (!created) throw sanitizePersistenceError(null)
      return created
    } catch (error) {
      throw sanitizePersistenceError(error)
    }
  }

  async findById(context: PersistenceAccountContext, assetId: string) {
    const [row] = await this.database
      .select()
      .from(domainAssets)
      .where(
        and(
          eq(domainAssets.accountId, context.accountId),
          eq(domainAssets.id, assetId)
        )
      )
      .limit(1)
    return row ? this.map(row) : null
  }

  async listForOwnedDomain(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ) {
    const rows = await this.database
      .select()
      .from(domainAssets)
      .where(
        and(
          eq(domainAssets.accountId, context.accountId),
          eq(domainAssets.ownedDomainId, ownedDomainId)
        )
      )
      .orderBy(asc(domainAssets.kind), asc(domainAssets.id))
    return Object.freeze(rows.map((row) => this.map(row)))
  }

  private map(row: typeof domainAssets.$inferSelect): AssetMetadataRecord {
    return Object.freeze({
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
  }
}

import 'server-only'

import { and, asc, eq } from 'drizzle-orm'

import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError, sanitizePersistenceError } from '@/lib/persistence/errors'
import type {
  CreateOwnedDomainRecord,
  OwnedDomainRepository,
  OwnershipConfirmation,
  OwnershipConfirmationInput,
  StoredOwnedDomain,
} from '@/lib/owned-domains/owned-domain.repository'
import type { WabmarketMySqlDatabase } from '../client'
import { ownedDomains } from '../schema'
import { createPersistenceId, toIso } from './helpers'

export class MySqlOwnedDomainRepository implements OwnedDomainRepository {
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async list(context: PersistenceAccountContext) {
    const rows = await this.database
      .select()
      .from(ownedDomains)
      .where(eq(ownedDomains.accountId, context.accountId))
      .orderBy(asc(ownedDomains.normalizedHostname), asc(ownedDomains.id))
    return Object.freeze(rows.map((row) => this.map(row)))
  }

  async create(
    context: PersistenceAccountContext,
    input: CreateOwnedDomainRecord
  ) {
    const hostname = normalizeHostname(input.normalizedHostname)
    if (!hostname || hostname !== input.normalizedHostname)
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const id = input.id ?? createPersistenceId()
    try {
      await this.database.insert(ownedDomains).values({
        id,
        accountId: context.accountId,
        normalizedHostname: hostname,
        status: input.status,
        ...this.ownershipValues(context, input.ownership),
      })
      const created = await this.findById(context, id)
      if (!created) throw new PersistenceError('PERSISTENCE_UNAVAILABLE')
      return created
    } catch (error) {
      throw sanitizePersistenceError(error)
    }
  }

  async findById(context: PersistenceAccountContext, ownedDomainId: string) {
    const [row] = await this.database
      .select()
      .from(ownedDomains)
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(ownedDomains.id, ownedDomainId)
        )
      )
      .limit(1)
    return row ? this.map(row) : null
  }

  async findByHostname(
    context: PersistenceAccountContext,
    normalizedHostname: string
  ) {
    const [row] = await this.database
      .select()
      .from(ownedDomains)
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(ownedDomains.normalizedHostname, normalizedHostname)
        )
      )
      .limit(1)
    return row ? this.map(row) : null
  }

  async setOwnershipConfirmation(
    context: PersistenceAccountContext,
    ownedDomainId: string,
    ownership: OwnershipConfirmationInput
  ) {
    const result = await this.database
      .update(ownedDomains)
      .set(this.ownershipValues(context, ownership))
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(ownedDomains.id, ownedDomainId)
        )
      )
    if (result[0].affectedRows !== 1)
      throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const updated = await this.findById(context, ownedDomainId)
    if (!updated) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    return updated
  }

  private ownershipValues(
    context: PersistenceAccountContext,
    ownership: OwnershipConfirmationInput
  ) {
    return ownership.confirmed
      ? {
          ownershipConfirmed: true,
          ownershipConfirmedAt: new Date(ownership.confirmedAt),
          ownershipConfirmedByFirebaseUid: context.firebaseUid,
          ownershipEvidenceReference: ownership.evidenceReference,
        }
      : {
          ownershipConfirmed: false,
          ownershipConfirmedAt: null,
          ownershipConfirmedByFirebaseUid: null,
          ownershipEvidenceReference: null,
        }
  }

  private map(row: typeof ownedDomains.$inferSelect): StoredOwnedDomain {
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
}

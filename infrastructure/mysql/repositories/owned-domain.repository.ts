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
import {
  domainAssets,
  domainPreparations,
  marketplaceListings,
  ownedDomains,
} from '../schema'
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

  async deleteIfUnreferenced(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ) {
    try {
      // MySqlPersistenceUnitOfWork supplies one transaction. The parent row
      // lock also conflicts with concurrent FK child insertion, closing the
      // check/delete race before cascade-capable foreign keys are reached.
      const [domain] = await this.database
        .select({ id: ownedDomains.id })
        .from(ownedDomains)
        .where(
          and(
            eq(ownedDomains.accountId, context.accountId),
            eq(ownedDomains.id, ownedDomainId)
          )
        )
        .limit(1)
        .for('update')
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')

      const [publication] = await this.database
        .select({ state: marketplaceListings.publicationState })
        .from(marketplaceListings)
        .where(eq(marketplaceListings.ownedDomainId, ownedDomainId))
        .limit(1)
      if (publication?.state === 'PUBLISHED')
        return Object.freeze({
          deleted: false as const,
          reason: 'DOMAIN_IS_PUBLISHED' as const,
        })
      if (publication)
        return Object.freeze({
          deleted: false as const,
          reason: 'DOMAIN_DELETE_NOT_ALLOWED' as const,
        })

      const [preparation] = await this.database
        .select({ id: domainPreparations.id })
        .from(domainPreparations)
        .where(eq(domainPreparations.ownedDomainId, ownedDomainId))
        .limit(1)
      if (preparation)
        return Object.freeze({
          deleted: false as const,
          reason: 'DOMAIN_HAS_PREPARATION' as const,
        })

      const [asset] = await this.database
        .select({ id: domainAssets.id })
        .from(domainAssets)
        .where(eq(domainAssets.ownedDomainId, ownedDomainId))
        .limit(1)
      if (asset)
        return Object.freeze({
          deleted: false as const,
          reason: 'DOMAIN_HAS_ASSETS' as const,
        })

      const deleted = await this.database
        .delete(ownedDomains)
        .where(
          and(
            eq(ownedDomains.accountId, context.accountId),
            eq(ownedDomains.id, ownedDomainId)
          )
        )
      if (deleted[0].affectedRows !== 1)
        throw new PersistenceError('PERSISTENCE_CONFLICT')
      return Object.freeze({ deleted: true as const, reason: null })
    } catch (error) {
      const referenceConflict =
        typeof error === 'object' &&
        error !== null &&
        (('errno' in error && error.errno === 1451) ||
          ('code' in error && error.code === 'ER_ROW_IS_REFERENCED_2'))
      if (referenceConflict)
        return Object.freeze({
          deleted: false as const,
          reason: 'DOMAIN_DELETE_NOT_ALLOWED' as const,
        })
      throw sanitizePersistenceError(error)
    }
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

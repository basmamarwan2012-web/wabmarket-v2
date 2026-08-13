import 'server-only'

import { and, asc, eq, notInArray, sql } from 'drizzle-orm'

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError, sanitizePersistenceError } from '@/lib/persistence/errors'
import type {
  ObserveOwnedDomainRegistrarAssociationInput,
  OwnedDomainRegistrarAssociationRepository,
  StoredOwnedDomainRegistrarAssociation,
} from '@/lib/registrar-sync/association.repository'
import { REGISTRAR_DOMAIN_STATUSES } from '@/lib/registrar-sync/types'
import type { WabmarketMySqlDatabase } from '../client'
import { ownedDomainRegistrarAssociations, ownedDomains } from '../schema'
import { createPersistenceId, toIso } from './helpers'

const providerIsValid = (value: string) => /^[a-z][a-z0-9_]{0,63}$/.test(value)

const dateFrom = (value: string): Date | null => {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) || date.toISOString() !== value
    ? null
    : date
}

export class MySqlOwnedDomainRegistrarAssociationRepository
  implements OwnedDomainRegistrarAssociationRepository
{
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async listForOwnedDomain(
    context: PersistenceAccountContext,
    ownedDomainId: string
  ) {
    const rows = await this.database
      .select()
      .from(ownedDomainRegistrarAssociations)
      .where(
        and(
          eq(ownedDomainRegistrarAssociations.accountId, context.accountId),
          eq(ownedDomainRegistrarAssociations.ownedDomainId, ownedDomainId)
        )
      )
      .orderBy(
        asc(ownedDomainRegistrarAssociations.providerIdentifier),
        asc(ownedDomainRegistrarAssociations.id)
      )
    return Object.freeze(rows.map((row) => this.map(row)))
  }

  async observe(
    context: PersistenceAccountContext,
    input: ObserveOwnedDomainRegistrarAssociationInput
  ) {
    const observedAt = dateFrom(input.observedAt)
    const expiresAt = input.expiresAt === null ? null : dateFrom(input.expiresAt)
    if (
      !ownedDomainIdIsValid(input.ownedDomainId) ||
      !providerIsValid(input.providerIdentifier) ||
      !input.provenanceReference ||
      input.provenanceReference.length > 255 ||
      !REGISTRAR_DOMAIN_STATUSES.includes(input.registrarStatus) ||
      !observedAt ||
      (input.expiresAt !== null && !expiresAt) ||
      (input.providerDomainIdentifier !== null &&
        (!input.providerDomainIdentifier || input.providerDomainIdentifier.length > 255))
    )
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const [domain] = await this.database
      .select({ id: ownedDomains.id })
      .from(ownedDomains)
      .where(
        and(
          eq(ownedDomains.accountId, context.accountId),
          eq(ownedDomains.id, input.ownedDomainId)
        )
      )
      .limit(1)
    if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')

    try {
      await this.database
        .insert(ownedDomainRegistrarAssociations)
        .values({
          id: createPersistenceId(),
          accountId: context.accountId,
          ownedDomainId: input.ownedDomainId,
          providerIdentifier: input.providerIdentifier,
          providerDomainIdentifier: input.providerDomainIdentifier,
          registrarStatus: input.registrarStatus,
          expiresAt,
          autoRenew: input.autoRenew,
          firstSeenAt: observedAt,
          lastSeenAt: observedAt,
          lastSyncedAt: observedAt,
          syncState: 'SEEN',
          provenanceReference: input.provenanceReference,
        })
        .onDuplicateKeyUpdate({
          set: {
            providerDomainIdentifier: input.providerDomainIdentifier,
            registrarStatus: input.registrarStatus,
            expiresAt,
            autoRenew: input.autoRenew,
            lastSeenAt: observedAt,
            lastSyncedAt: observedAt,
            syncState: 'SEEN',
            provenanceReference: input.provenanceReference,
            version: sql`${ownedDomainRegistrarAssociations.version} + 1`,
          },
        })
    } catch (error) {
      throw sanitizePersistenceError(error)
    }

    const association = await this.find(
      context,
      input.ownedDomainId,
      input.providerIdentifier
    )
    if (!association) throw new PersistenceError('PERSISTENCE_UNAVAILABLE')
    return association
  }

  async markMissingAfterCompleteSync(
    context: PersistenceAccountContext,
    input: Parameters<
      OwnedDomainRegistrarAssociationRepository['markMissingAfterCompleteSync']
    >[1]
  ) {
    const syncedAt = dateFrom(input.syncedAt)
    if (
      !providerIsValid(input.providerIdentifier) ||
      !syncedAt ||
      input.seenOwnedDomainIds.some((id) => !ownedDomainIdIsValid(id)) ||
      new Set(input.seenOwnedDomainIds).size !== input.seenOwnedDomainIds.length
    )
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const predicate = and(
      eq(ownedDomainRegistrarAssociations.accountId, context.accountId),
      eq(
        ownedDomainRegistrarAssociations.providerIdentifier,
        input.providerIdentifier
      ),
      input.seenOwnedDomainIds.length > 0
          ? notInArray(
            ownedDomainRegistrarAssociations.ownedDomainId,
            [...input.seenOwnedDomainIds]
          )
        : undefined
    )
    try {
      const missing = await this.database
        .select({ id: ownedDomainRegistrarAssociations.id })
        .from(ownedDomainRegistrarAssociations)
        .where(predicate)
      if (missing.length === 0) return 0
      await this.database
        .update(ownedDomainRegistrarAssociations)
        .set({
          syncState: 'MISSING',
          lastSyncedAt: syncedAt,
          version: sql`${ownedDomainRegistrarAssociations.version} + 1`,
        })
        .where(predicate)
      return missing.length
    } catch (error) {
      throw sanitizePersistenceError(error)
    }
  }

  private async find(
    context: PersistenceAccountContext,
    ownedDomainId: string,
    providerIdentifier: string
  ) {
    const [row] = await this.database
      .select()
      .from(ownedDomainRegistrarAssociations)
      .where(
        and(
          eq(ownedDomainRegistrarAssociations.accountId, context.accountId),
          eq(ownedDomainRegistrarAssociations.ownedDomainId, ownedDomainId),
          eq(
            ownedDomainRegistrarAssociations.providerIdentifier,
            providerIdentifier
          )
        )
      )
      .limit(1)
    return row ? this.map(row) : null
  }

  private map(
    row: typeof ownedDomainRegistrarAssociations.$inferSelect
  ): StoredOwnedDomainRegistrarAssociation {
    return Object.freeze({
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
  }
}

const ownedDomainIdIsValid = (value: string) =>
  typeof value === 'string' && value.length > 0 && value.length <= 36

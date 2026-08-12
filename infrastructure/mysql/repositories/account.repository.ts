import 'server-only'

import { eq } from 'drizzle-orm'

import type {
  AccountProvisioningInput,
  AccountRecord,
  AccountRepository,
} from '@/lib/accounts/account.repository'
import type { PersistenceIdentityContext } from '@/lib/persistence/context'
import { sanitizePersistenceError } from '@/lib/persistence/errors'
import { accounts } from '../schema'
import type { WabmarketMySqlDatabase } from '../client'
import { createPersistenceId, toIso } from './helpers'

export class MySqlAccountRepository implements AccountRepository {
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  async findByFirebaseIdentity(identity: PersistenceIdentityContext) {
    try {
      const [row] = await this.database
        .select()
        .from(accounts)
        .where(eq(accounts.firebaseUid, identity.firebaseUid))
        .limit(1)
      return row ? this.map(row) : null
    } catch (error) {
      throw sanitizePersistenceError(error)
    }
  }

  async resolveOrProvision(
    identity: PersistenceIdentityContext,
    input: AccountProvisioningInput = {}
  ) {
    const existing = await this.findByFirebaseIdentity(identity)
    if (existing) return existing

    const id = createPersistenceId()
    try {
      await this.database.insert(accounts).values({
        id,
        firebaseUid: identity.firebaseUid,
        email: identity.email,
        displayName: input.displayName?.trim() || null,
      })
    } catch (error) {
      const concurrentlyCreated = await this.findByFirebaseIdentity(identity)
      if (concurrentlyCreated) return concurrentlyCreated
      throw sanitizePersistenceError(error)
    }

    const created = await this.findByFirebaseIdentity(identity)
    if (!created) throw sanitizePersistenceError(null)
    return created
  }

  private map(row: typeof accounts.$inferSelect): AccountRecord {
    return Object.freeze({
      id: row.id,
      firebaseUid: row.firebaseUid,
      email: row.email,
      displayName: row.displayName,
      createdAt: toIso(row.createdAt),
      updatedAt: toIso(row.updatedAt),
    })
  }
}

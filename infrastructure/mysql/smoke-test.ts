import 'server-only'

import { randomUUID } from 'node:crypto'

import { getDatabaseConfig } from '@/lib/config/database'
import {
  createPersistenceAccountContext,
  createPersistenceIdentityContext,
} from '@/lib/persistence/context'
import { createWabmarketMySqlClient } from './client'
import {
  DatabaseOperatorError,
  toSafeDatabaseOperatorError,
} from './operator-errors'
import { MySqlPersistenceUnitOfWork } from './unit-of-work'

export interface DatabaseSmokeTestResult {
  readonly readBackVerified: true
  readonly tenantIsolationVerified: true
  readonly rolledBack: true
}

class SuccessfulSmokeRollback extends Error {}

/** Uses synthetic .example records and intentionally rolls back every write. */
export const runDatabaseSmokeTest = async (): Promise<DatabaseSmokeTestResult> => {
  let client: ReturnType<typeof createWabmarketMySqlClient> | null = null
  let completed = false
  let failure: ReturnType<typeof toSafeDatabaseOperatorError> | null = null

  try {
    client = createWabmarketMySqlClient(getDatabaseConfig())
    const unitOfWork = new MySqlPersistenceUnitOfWork(client.database)
    const suffix = randomUUID().replaceAll('-', '')
    const hostname = `wabmarket-smoke-${suffix}.example`
    const firstIdentity = createPersistenceIdentityContext({
      uid: `wabmarket-smoke-owner-${suffix}`,
      email: `owner-${suffix}@wabmarket.example`,
      role: 'administrator',
    })
    const secondIdentity = createPersistenceIdentityContext({
      uid: `wabmarket-smoke-other-${suffix}`,
      email: `other-${suffix}@wabmarket.example`,
      role: 'viewer',
    })

    try {
      await unitOfWork.run(async (repositories) => {
        const firstAccount = await repositories.accounts.resolveOrProvision(
          firstIdentity
        )
        const firstContext = createPersistenceAccountContext(
          firstIdentity,
          firstAccount
        )
        const domain = await repositories.ownedDomains.create(firstContext, {
          normalizedHostname: hostname,
          status: 'active',
          ownership: {
            confirmed: false,
            confirmedAt: null,
            evidenceReference: null,
          },
        })
        const readBack = await repositories.ownedDomains.findById(
          firstContext,
          domain.id
        )
        if (!readBack || readBack.normalizedHostname !== hostname)
          throw new DatabaseOperatorError('DATABASE_SMOKE_TEST_FAILED')

        const secondAccount = await repositories.accounts.resolveOrProvision(
          secondIdentity
        )
        const secondContext = createPersistenceAccountContext(
          secondIdentity,
          secondAccount
        )
        const crossTenantById = await repositories.ownedDomains.findById(
          secondContext,
          domain.id
        )
        const crossTenantByHostname =
          await repositories.ownedDomains.findByHostname(secondContext, hostname)
        if (crossTenantById || crossTenantByHostname)
          throw new DatabaseOperatorError('DATABASE_SMOKE_TEST_FAILED')

        throw new SuccessfulSmokeRollback()
      })
    } catch (error) {
      if (!(error instanceof SuccessfulSmokeRollback)) throw error
      completed = true
    }
  } catch (error) {
    failure = toSafeDatabaseOperatorError(error, 'DATABASE_SMOKE_TEST_FAILED')
  } finally {
    if (client) {
      try {
        await client.close()
      } catch {
        failure ??= new DatabaseOperatorError('DATABASE_SMOKE_TEST_FAILED')
      }
    }
  }

  if (failure || !completed)
    throw failure ?? new DatabaseOperatorError('DATABASE_SMOKE_TEST_FAILED')

  return Object.freeze({
    readBackVerified: true,
    tenantIsolationVerified: true,
    rolledBack: true,
  })
}

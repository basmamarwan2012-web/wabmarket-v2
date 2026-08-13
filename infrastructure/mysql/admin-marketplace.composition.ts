import 'server-only'

import {
  DatabaseConfigurationError,
  getDatabaseConfig,
  type DatabaseConfig,
} from '@/lib/config/database'
import type { AuthenticatedSession } from '@/lib/auth/session'
import { AdminMarketplaceService } from '@/lib/marketplace/admin.service'
import {
  createPersistenceAccountContext,
  createPersistenceIdentityContext,
} from '@/lib/persistence/context'
import { PersistenceError, sanitizePersistenceError } from '@/lib/persistence/errors'
import {
  createWabmarketMySqlClient,
  type WabmarketMySqlClient,
} from './client'
import { MySqlAccountRepository } from './repositories/account.repository'
import { MySqlPersistenceUnitOfWork } from './unit-of-work'

export interface AdminMarketplaceCompositionDependencies {
  readonly getConfig: () => DatabaseConfig
  readonly createClient: (config: DatabaseConfig) => WabmarketMySqlClient
  readonly createService: (
    client: WabmarketMySqlClient
  ) => AdminMarketplaceService
}

const DEFAULT_DEPENDENCIES: AdminMarketplaceCompositionDependencies = Object.freeze({
  getConfig: getDatabaseConfig,
  createClient: createWabmarketMySqlClient,
  createService: (client: WabmarketMySqlClient) =>
    new AdminMarketplaceService(new MySqlPersistenceUnitOfWork(client.database)),
})

export const executeAdminMarketplaceOperation = async <T>(
  session: AuthenticatedSession,
  operation: (
    service: AdminMarketplaceService,
    context: ReturnType<typeof createPersistenceAccountContext>
  ) => Promise<T>,
  dependencies: AdminMarketplaceCompositionDependencies = DEFAULT_DEPENDENCIES
): Promise<T> => {
  let client: WabmarketMySqlClient | null = null
  let result: T | undefined
  let failure: unknown = null

  try {
    client = dependencies.createClient(dependencies.getConfig())
    const identity = createPersistenceIdentityContext(session)
    const account = await new MySqlAccountRepository(
      client.database
    ).resolveOrProvision(identity)
    const context = createPersistenceAccountContext(identity, account)
    result = await operation(dependencies.createService(client), context)
  } catch (error) {
    failure = error
  } finally {
    if (client) {
      try {
        await client.close()
      } catch (error) {
        failure ??= error
      }
    }
  }

  if (failure)
    throw failure instanceof DatabaseConfigurationError
      ? new PersistenceError('PERSISTENCE_CONFIGURATION_INVALID')
      : sanitizePersistenceError(failure)
  return result as T
}

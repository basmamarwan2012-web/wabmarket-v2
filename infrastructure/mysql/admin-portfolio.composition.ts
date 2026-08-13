import 'server-only'

import type { AuthenticatedSession } from '@/lib/auth/session'
import {
  DatabaseConfigurationError,
  getDatabaseConfig,
  type DatabaseConfig,
} from '@/lib/config/database'
import {
  createPersistenceAccountContext,
  createPersistenceIdentityContext,
} from '@/lib/persistence/context'
import {
  PersistenceError,
  sanitizePersistenceError,
} from '@/lib/persistence/errors'
import { AdminPortfolioService } from '@/lib/portfolio/admin.service'
import {
  createWabmarketMySqlClient,
  type WabmarketMySqlClient,
} from './client'
import { MySqlAccountRepository } from './repositories/account.repository'
import { MySqlPersistenceUnitOfWork } from './unit-of-work'

export interface AdminPortfolioCompositionDependencies {
  readonly getConfig: () => DatabaseConfig
  readonly createClient: (config: DatabaseConfig) => WabmarketMySqlClient
  readonly createService: (client: WabmarketMySqlClient) => AdminPortfolioService
}

const DEFAULT_DEPENDENCIES: AdminPortfolioCompositionDependencies =
  Object.freeze({
    getConfig: getDatabaseConfig,
    createClient: createWabmarketMySqlClient,
    createService: (client: WabmarketMySqlClient) =>
      new AdminPortfolioService(
        new MySqlPersistenceUnitOfWork(client.database)
      ),
  })

export const executeAdminPortfolioOperation = async <T>(
  session: AuthenticatedSession,
  operation: (
    service: AdminPortfolioService,
    context: ReturnType<typeof createPersistenceAccountContext>
  ) => Promise<T>,
  dependencies: AdminPortfolioCompositionDependencies = DEFAULT_DEPENDENCIES
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

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
import { PersistenceError, sanitizePersistenceError } from '@/lib/persistence/errors'
import { DynadotRegistrarOwnedDomainProvider } from '@/lib/registrar-sync/providers/dynadot-owned-domain.provider'
import { RegistrarSyncError } from '@/lib/registrar-sync/errors'
import { RegistrarOwnedDomainSyncService } from '@/lib/registrar-sync/sync.service'
import type { RegistrarOwnedDomainSyncReport } from '@/lib/registrar-sync/types'
import {
  createWabmarketMySqlClient,
  type WabmarketMySqlClient,
} from './client'
import { MySqlAccountRepository } from './repositories/account.repository'
import { MySqlPersistenceUnitOfWork } from './unit-of-work'

export interface AdminRegistrarSyncCompositionDependencies {
  readonly getConfig: () => DatabaseConfig
  readonly createClient: (config: DatabaseConfig) => WabmarketMySqlClient
  readonly createProvider: () => DynadotRegistrarOwnedDomainProvider
  readonly createService: (
    client: WabmarketMySqlClient
  ) => RegistrarOwnedDomainSyncService
}

const DEFAULT_DEPENDENCIES: AdminRegistrarSyncCompositionDependencies =
  Object.freeze({
    getConfig: getDatabaseConfig,
    createClient: createWabmarketMySqlClient,
    createProvider: () => new DynadotRegistrarOwnedDomainProvider(),
    createService: (client: WabmarketMySqlClient) =>
      new RegistrarOwnedDomainSyncService(
        new MySqlPersistenceUnitOfWork(client.database)
      ),
  })

export const executeDynadotOwnedDomainSync = async (
  session: AuthenticatedSession,
  dependencies: AdminRegistrarSyncCompositionDependencies = DEFAULT_DEPENDENCIES
): Promise<RegistrarOwnedDomainSyncReport> => {
  let client: WabmarketMySqlClient | null = null
  let result: RegistrarOwnedDomainSyncReport | undefined
  let failure: unknown = null

  try {
    client = dependencies.createClient(dependencies.getConfig())
    const identity = createPersistenceIdentityContext(session)
    const account = await new MySqlAccountRepository(
      client.database
    ).resolveOrProvision(identity)
    const context = createPersistenceAccountContext(identity, account)
    result = await dependencies
      .createService(client)
      .sync(context, dependencies.createProvider(), { mode: 'MANUAL' })
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

  if (failure) {
    if (failure instanceof DatabaseConfigurationError)
      throw new PersistenceError('PERSISTENCE_CONFIGURATION_INVALID')
    if (failure instanceof PersistenceError) throw failure
    if (failure instanceof RegistrarSyncError) throw failure
    throw sanitizePersistenceError(failure)
  }
  return result as RegistrarOwnedDomainSyncReport
}

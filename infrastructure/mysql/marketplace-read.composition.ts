import 'server-only'

import {
  DatabaseConfigurationError,
  getDatabaseConfig,
  type DatabaseConfig,
} from '@/lib/config/database'
import type { MarketplaceReadRepository } from '@/lib/marketplace/read.repository'
import { MarketplaceReadService } from '@/lib/marketplace/read.service'
import type {
  ListPublishedMarketplaceInput,
  MarketplaceReadServiceContract,
} from '@/lib/marketplace/read.service.types'
import {
  PersistenceError,
  sanitizePersistenceError,
} from '@/lib/persistence/errors'
import {
  createWabmarketMySqlClient,
  type WabmarketMySqlClient,
} from './client'
import { MySqlMarketplaceReadRepository } from './repositories/marketplace-read.repository'

export interface MarketplaceReadCompositionDependencies {
  readonly getConfig: () => DatabaseConfig
  readonly createClient: (config: DatabaseConfig) => WabmarketMySqlClient
  readonly createRepository: (
    client: WabmarketMySqlClient
  ) => MarketplaceReadRepository
  readonly createService: (
    repository: MarketplaceReadRepository
  ) => MarketplaceReadServiceContract
}

const DEFAULT_DEPENDENCIES: MarketplaceReadCompositionDependencies =
  Object.freeze({
    getConfig: getDatabaseConfig,
    createClient: createWabmarketMySqlClient,
    createRepository: (client: WabmarketMySqlClient) =>
      new MySqlMarketplaceReadRepository(client.database),
    createService: (repository: MarketplaceReadRepository) =>
      new MarketplaceReadService(repository),
  })

const executeWithMarketplaceReadService = async <T>(
  operation: (service: MarketplaceReadServiceContract) => Promise<T>,
  dependencies: MarketplaceReadCompositionDependencies
): Promise<T> => {
  let client: WabmarketMySqlClient | null = null
  let result: T | undefined
  let failure: unknown = null

  try {
    const config = dependencies.getConfig()
    client = dependencies.createClient(config)
    const repository = dependencies.createRepository(client)
    const service = dependencies.createService(repository)
    result = await operation(service)
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

export const listPublishedMarketplaceFromMySql = (
  input: ListPublishedMarketplaceInput = {},
  dependencies: MarketplaceReadCompositionDependencies = DEFAULT_DEPENDENCIES
) =>
  executeWithMarketplaceReadService(
    (service) => service.listPublished(input),
    dependencies
  )

export const resolvePublishedMarketplaceHostnameFromMySql = (
  hostname: string,
  dependencies: MarketplaceReadCompositionDependencies = DEFAULT_DEPENDENCIES
) =>
  executeWithMarketplaceReadService(
    (service) => service.resolvePublishedHostname(hostname),
    dependencies
  )

import 'server-only'

import type { AccountRepository } from '@/lib/accounts/account.repository'
import { getDatabaseConfig, type DatabaseConfig } from '@/lib/config/database'
import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import {
  createPersistenceAccountContext,
  createPersistenceIdentityContext,
} from '@/lib/persistence/context'
import {
  PersistenceError,
  sanitizePersistenceError,
} from '@/lib/persistence/errors'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import {
  createWabmarketMySqlClient,
  type WabmarketMySqlClient,
} from './client'
import { MySqlAccountRepository } from './repositories/account.repository'
import { MySqlPersistenceUnitOfWork } from './unit-of-work'

export interface SeedOwnedDomainOperatorInput {
  readonly firebaseUid: string
  readonly hostname: string
  readonly ownershipConfirmed: true
}

export interface SeedOwnedDomainOperatorResult {
  readonly hostname: string
  readonly created: boolean
  readonly ownershipConfirmed: boolean
}

export interface OwnedDomainOperatorDependencies {
  readonly now: () => Date
  readonly getConfig: () => DatabaseConfig
  readonly createClient: (config: DatabaseConfig) => WabmarketMySqlClient
  readonly createAccountRepository: (
    client: WabmarketMySqlClient
  ) => AccountRepository
  readonly createUnitOfWork: (
    client: WabmarketMySqlClient
  ) => PersistenceUnitOfWork
}

const DEFAULT_DEPENDENCIES: OwnedDomainOperatorDependencies = Object.freeze({
  now: () => new Date(),
  getConfig: getDatabaseConfig,
  createClient: createWabmarketMySqlClient,
  createAccountRepository: (client: WabmarketMySqlClient) =>
    new MySqlAccountRepository(client.database),
  createUnitOfWork: (client: WabmarketMySqlClient) =>
    new MySqlPersistenceUnitOfWork(client.database),
})

const result = (
  hostname: string,
  created: boolean,
  ownershipConfirmed: boolean
): SeedOwnedDomainOperatorResult =>
  Object.freeze({ hostname, created, ownershipConfirmed })

export const seedOwnedDomain = async (
  input: SeedOwnedDomainOperatorInput,
  dependencies: OwnedDomainOperatorDependencies = DEFAULT_DEPENDENCIES
): Promise<SeedOwnedDomainOperatorResult> => {
  const hostname = normalizeHostname(input.hostname)
  if (
    input.ownershipConfirmed !== true ||
    !input.firebaseUid.trim() ||
    input.firebaseUid.length > 128 ||
    !hostname ||
    hostname !== input.hostname
  )
    throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

  let client: WabmarketMySqlClient | null = null
  let failure: unknown = null
  let operationResult: SeedOwnedDomainOperatorResult | null = null

  try {
    client = dependencies.createClient(dependencies.getConfig())
    const identity = createPersistenceIdentityContext({
      uid: input.firebaseUid,
      email: null,
      role: 'administrator',
    })
    const account = await dependencies
      .createAccountRepository(client)
      .resolveOrProvision(identity)
    const context = createPersistenceAccountContext(identity, account)
    const unitOfWork = dependencies.createUnitOfWork(client)

    const existing = await unitOfWork.run((repositories) =>
      repositories.ownedDomains.findByHostname(context, hostname)
    )
    if (existing) {
      operationResult = result(
        hostname,
        false,
        existing.ownership.confirmed
      )
    } else {
      try {
        const created = await unitOfWork.run((repositories) =>
          repositories.ownedDomains.create(context, {
            normalizedHostname: hostname,
            status: 'active',
            ownership: {
              confirmed: true,
              confirmedAt: dependencies.now().toISOString(),
              evidenceReference: null,
            },
          })
        )
        operationResult = result(hostname, true, created.ownership.confirmed)
      } catch (error) {
        const conflict = sanitizePersistenceError(error)
        if (conflict.code !== 'PERSISTENCE_CONFLICT') throw conflict
        const concurrentlyCreated = await unitOfWork.run((repositories) =>
          repositories.ownedDomains.findByHostname(context, hostname)
        )
        if (!concurrentlyCreated) throw conflict
        operationResult = result(
          hostname,
          false,
          concurrentlyCreated.ownership.confirmed
        )
      }
    }
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

  if (failure) throw sanitizePersistenceError(failure)
  if (!operationResult) throw new PersistenceError('PERSISTENCE_UNAVAILABLE')
  return operationResult
}

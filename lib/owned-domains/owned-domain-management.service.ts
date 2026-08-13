import 'server-only'

import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type {
  PersistenceRepositories,
  PersistenceUnitOfWork,
} from '@/lib/persistence/unit-of-work'
import {
  deletionBlockError,
  OwnedDomainManagementError,
} from './owned-domain-management.errors'
import type {
  CreateOwnedDomainCommand,
  CreateOwnedDomainResult,
  DeleteOwnedDomainCommand,
  DeleteOwnedDomainResult,
  OwnedDomainDeletionEligibility,
} from './owned-domain-management.types'

export class OwnedDomainManagementService {
  constructor(
    private readonly unitOfWork: PersistenceUnitOfWork,
    private readonly now: () => Date = () => new Date()
  ) {}

  async create(
    context: PersistenceAccountContext,
    command: CreateOwnedDomainCommand
  ): Promise<CreateOwnedDomainResult> {
    if (command.ownershipConfirmed !== true)
      throw new OwnedDomainManagementError(
        'DOMAIN_OWNERSHIP_CONFIRMATION_REQUIRED'
      )
    const hostname = normalizeHostname(command.hostname)
    if (!hostname)
      throw new OwnedDomainManagementError('DOMAIN_HOSTNAME_INVALID')

    try {
      return await this.unitOfWork.run(async (repositories) => {
        if (await repositories.ownedDomains.findByHostname(context, hostname))
          throw new OwnedDomainManagementError('DOMAIN_ALREADY_EXISTS')
        await repositories.ownedDomains.create(context, {
          normalizedHostname: hostname,
          status: 'active',
          ownership: {
            confirmed: true,
            confirmedAt: this.now().toISOString(),
            evidenceReference: null,
          },
        })
        return Object.freeze({
          hostname,
          created: true as const,
          ownershipConfirmed: true as const,
        })
      })
    } catch (error) {
      if (error instanceof OwnedDomainManagementError) throw error
      if (error instanceof PersistenceError && error.code === 'PERSISTENCE_CONFLICT')
        throw new OwnedDomainManagementError('DOMAIN_ALREADY_EXISTS')
      throw new OwnedDomainManagementError('DOMAIN_MANAGEMENT_UNAVAILABLE')
    }
  }

  async delete(
    context: PersistenceAccountContext,
    command: DeleteOwnedDomainCommand
  ): Promise<DeleteOwnedDomainResult> {
    const hostname = normalizeHostname(command.hostname)
    if (!hostname || hostname !== command.hostname)
      throw new OwnedDomainManagementError('DOMAIN_HOSTNAME_INVALID')
    try {
      return await this.unitOfWork.run(async (repositories) => {
        const domain = await repositories.ownedDomains.findByHostname(
          context,
          hostname
        )
        if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
        const outcome = await repositories.ownedDomains.deleteIfUnreferenced(
          context,
          domain.id
        )
        if (!outcome.deleted) throw deletionBlockError(outcome.reason)
        return Object.freeze({ hostname, deleted: true as const })
      })
    } catch (error) {
      if (error instanceof OwnedDomainManagementError) throw error
      if (error instanceof PersistenceError) {
        if (error.code === 'PERSISTENCE_CONFLICT')
          throw new OwnedDomainManagementError('DOMAIN_DELETE_NOT_ALLOWED')
        throw error
      }
      throw new OwnedDomainManagementError('DOMAIN_MANAGEMENT_UNAVAILABLE')
    }
  }

  deletionEligibility(
    repositories: PersistenceRepositories,
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<OwnedDomainDeletionEligibility> {
    return this.resolveDeletionEligibility(repositories, context, ownedDomainId)
  }

  private async resolveDeletionEligibility(
    repositories: PersistenceRepositories,
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<OwnedDomainDeletionEligibility> {
    const publication =
      await repositories.marketplacePublications.findByOwnedDomain(
        context,
        ownedDomainId
      )
    if (publication?.state === 'PUBLISHED')
      return Object.freeze({ allowed: false, reason: 'DOMAIN_IS_PUBLISHED' })
    if (publication)
      return Object.freeze({
        allowed: false,
        reason: 'DOMAIN_DELETE_NOT_ALLOWED',
      })
    if (await repositories.preparations.getCurrent(context, ownedDomainId))
      return Object.freeze({
        allowed: false,
        reason: 'DOMAIN_HAS_PREPARATION',
      })
    if (
      (await repositories.assetMetadata.listForOwnedDomain(
        context,
        ownedDomainId
      )).length > 0
    )
      return Object.freeze({ allowed: false, reason: 'DOMAIN_HAS_ASSETS' })
    return Object.freeze({ allowed: true, reason: null })
  }
}

export type {
  CreateOwnedDomainCommand,
  CreateOwnedDomainResult,
  DeleteOwnedDomainCommand,
  DeleteOwnedDomainResult,
  OwnedDomainDeletionEligibility,
} from './owned-domain-management.types'

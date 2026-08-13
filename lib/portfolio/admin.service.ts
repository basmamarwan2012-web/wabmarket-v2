import 'server-only'

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type {
  PersistenceRepositories,
  PersistenceUnitOfWork,
} from '@/lib/persistence/unit-of-work'
import { OwnedDomainManagementService } from '@/lib/owned-domains/owned-domain-management.service'
import type { StoredOwnedDomain } from '@/lib/owned-domains/owned-domain.repository'
import type {
  AdminPortfolioDomainSummary,
  CreateAdminPortfolioDomainInput,
} from './admin.types'

export class AdminPortfolioService {
  private readonly ownedDomains: OwnedDomainManagementService

  constructor(private readonly unitOfWork: PersistenceUnitOfWork) {
    this.ownedDomains = new OwnedDomainManagementService(unitOfWork)
  }

  list(context: PersistenceAccountContext) {
    return this.unitOfWork.run(async (repositories) => {
      const domains = await repositories.ownedDomains.list(context)
      const summaries = await Promise.all(
        domains.map((domain) => this.summary(repositories, context, domain))
      )
      return Object.freeze(summaries)
    })
  }

  create(
    context: PersistenceAccountContext,
    input: CreateAdminPortfolioDomainInput
  ) {
    return this.ownedDomains.create(context, input)
  }

  delete(context: PersistenceAccountContext, hostname: string) {
    return this.ownedDomains.delete(context, { hostname })
  }

  private async summary(
    repositories: PersistenceRepositories,
    context: PersistenceAccountContext,
    domain: StoredOwnedDomain
  ): Promise<AdminPortfolioDomainSummary> {
    const [preparation, publication, deletion] = await Promise.all([
      repositories.preparations.getCurrent(context, domain.id),
      repositories.marketplacePublications.findByOwnedDomain(
        context,
        domain.id
      ),
      this.ownedDomains.deletionEligibility(repositories, context, domain.id),
    ])

    if (preparation && preparation.ownedDomainId !== domain.id)
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')
    if (publication && publication.ownedDomainId !== domain.id)
      throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

    const preparationReadiness =
      preparation?.preparation.readiness.readiness ?? 'NOT_PREPARED'
    const publicationState = publication?.state ?? 'NOT_PUBLISHED'
    const portfolioState =
      publicationState === 'PUBLISHED'
        ? 'PUBLISHED'
        : publicationState === 'UNPUBLISHED'
          ? 'UNPUBLISHED'
          : publicationState === 'DRAFT'
            ? 'PREPARING'
          : preparationReadiness === 'NOT_PREPARED'
            ? 'OWNED'
            : preparationReadiness === 'NOT_READY'
              ? 'PREPARING'
              : 'READY'
    const nextAction = publication
      ? 'MANAGE_LISTING'
      : preparation
        ? 'CONTINUE_PREPARATION'
        : 'PREPARE_FOR_SALE'

    return Object.freeze({
      ownedDomainId: domain.id,
      hostname: domain.normalizedHostname,
      ownershipConfirmed: domain.ownership.confirmed,
      preparationVersion: preparation?.version ?? null,
      preparationReadiness,
      publicationState,
      publicationVersion: publication?.version ?? null,
      portfolioState,
      nextAction,
      deletion,
    })
  }
}

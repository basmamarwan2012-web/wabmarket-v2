import 'server-only'

import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import { createMarketplaceListing } from './listing'
import type { MarketplacePublicationRecord } from './publication.repository'
import type {
  MarketplacePublicationApplicationResult,
  PublishMarketplaceListingCommand,
  UnpublishMarketplaceListingCommand,
} from './publication.service.types'

const toApplicationResult = (
  publication: MarketplacePublicationRecord
): MarketplacePublicationApplicationResult =>
  Object.freeze({
    ownedDomainId: publication.ownedDomainId,
    hostname: publication.hostname,
    listingId: publication.listingId,
    publicationState: publication.state,
    publicationVersion: publication.version,
  })

export class MarketplacePublicationApplicationService {
  constructor(private readonly unitOfWork: PersistenceUnitOfWork) {}

  publish(
    context: PersistenceAccountContext,
    command: PublishMarketplaceListingCommand
  ): Promise<MarketplacePublicationApplicationResult> {
    return this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findById(
        context,
        command.ownedDomainId
      )
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      if (!domain.ownership.confirmed)
        throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

      const storedPreparation = await repositories.preparations.getCurrent(
        context,
        command.ownedDomainId
      )
      if (!storedPreparation)
        throw new PersistenceError('PERSISTENCE_NOT_FOUND')

      const { preparation, generation, landingPage } = storedPreparation
      if (
        storedPreparation.ownedDomainId !== domain.id ||
        domain.normalizedHostname !== preparation.hostname ||
        generation.hostname !== preparation.hostname ||
        landingPage.hostname !== preparation.hostname ||
        preparation.ownershipConfirmed !== true
      )
        throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

      const listing = createMarketplaceListing({
        preparation,
        generation,
        landingPage,
        landingPageReference:
          preparation.preparation.landingPage.reference,
      })
      if (!listing || listing.publication.state !== 'ELIGIBLE')
        throw new PersistenceError('PERSISTENCE_INVALID_INPUT')

      const published = await repositories.marketplacePublications.publish(
        context,
        {
          ownedDomainId: domain.id,
          listing,
          landingPage,
          expectedVersion: command.expectedPublicationVersion,
        }
      )
      return toApplicationResult(published)
    })
  }

  unpublish(
    context: PersistenceAccountContext,
    command: UnpublishMarketplaceListingCommand
  ): Promise<MarketplacePublicationApplicationResult> {
    return this.unitOfWork.run(async (repositories) => {
      const unpublished =
        await repositories.marketplacePublications.unpublish(
          context,
          command.listingId,
          command.expectedPublicationVersion
        )
      return toApplicationResult(unpublished)
    })
  }
}

export type {
  MarketplacePublicationApplicationResult,
  PublishMarketplaceListingCommand,
  UnpublishMarketplaceListingCommand,
} from './publication.service.types'

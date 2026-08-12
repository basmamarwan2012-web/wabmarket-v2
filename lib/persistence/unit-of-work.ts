import type { AccountRepository } from '@/lib/accounts/account.repository'
import type { AssetMetadataRepository } from '@/lib/assets/asset-metadata.repository'
import type { DomainPreparationRepository } from '@/lib/domain-preparation/preparation.repository'
import type { MarketplacePublicationRepository } from '@/lib/marketplace/publication.repository'
import type { MarketplaceReadRepository } from '@/lib/marketplace/read.repository'
import type { OwnedDomainRepository } from '@/lib/owned-domains/owned-domain.repository'

export interface PersistenceRepositories {
  readonly accounts: AccountRepository
  readonly ownedDomains: OwnedDomainRepository
  readonly preparations: DomainPreparationRepository
  readonly assetMetadata: AssetMetadataRepository
  readonly marketplacePublications: MarketplacePublicationRepository
  readonly marketplaceRead: MarketplaceReadRepository
}

export interface PersistenceUnitOfWork {
  run<T>(operation: (repositories: PersistenceRepositories) => Promise<T>): Promise<T>
}

import 'server-only'

import type {
  PersistenceRepositories,
  PersistenceUnitOfWork,
} from '@/lib/persistence/unit-of-work'
import type { WabmarketMySqlDatabase } from './client'
import { MySqlAccountRepository } from './repositories/account.repository'
import { MySqlAssetMetadataRepository } from './repositories/asset-metadata.repository'
import { MySqlMarketplacePublicationRepository } from './repositories/marketplace-publication.repository'
import { MySqlMarketplaceReadRepository } from './repositories/marketplace-read.repository'
import { MySqlOwnedDomainRepository } from './repositories/owned-domain.repository'
import { MySqlOwnedDomainRegistrarAssociationRepository } from './repositories/registrar-association.repository'
import { MySqlDomainPreparationRepository } from './repositories/preparation.repository'

const createRepositories = (
  database: WabmarketMySqlDatabase
): PersistenceRepositories =>
  Object.freeze({
    accounts: new MySqlAccountRepository(database),
    ownedDomains: new MySqlOwnedDomainRepository(database),
    registrarAssociations:
      new MySqlOwnedDomainRegistrarAssociationRepository(database),
    preparations: new MySqlDomainPreparationRepository(database),
    assetMetadata: new MySqlAssetMetadataRepository(database),
    marketplacePublications: new MySqlMarketplacePublicationRepository(database),
    marketplaceRead: new MySqlMarketplaceReadRepository(database),
  })

export class MySqlPersistenceUnitOfWork implements PersistenceUnitOfWork {
  constructor(private readonly database: WabmarketMySqlDatabase) {}

  run<T>(operation: (repositories: PersistenceRepositories) => Promise<T>) {
    return this.database.transaction((transaction) =>
      operation(createRepositories(transaction))
    )
  }
}

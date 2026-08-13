import type { AssetMetadataRecord } from '@/lib/assets/asset-metadata.repository'
import type { StoredDomainPreparation } from '@/lib/domain-preparation/preparation.repository'
import type { MarketplacePublicationRecord } from '@/lib/marketplace/publication.repository'
import type { StoredOwnedDomain } from '@/lib/owned-domains/owned-domain.repository'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import type { StoredOwnedDomainRegistrarAssociation } from '@/lib/registrar-sync/association.repository'

export interface PortfolioReadSnapshot {
  readonly domains: readonly StoredOwnedDomain[]
  readonly registrarAssociations: readonly StoredOwnedDomainRegistrarAssociation[]
  readonly assets: readonly AssetMetadataRecord[]
  readonly preparations: readonly StoredDomainPreparation[]
  readonly publications: readonly PortfolioReadPublication[]
}

export interface PortfolioReadPublication extends MarketplacePublicationRecord {
  readonly publicReference: string | null
  readonly askingPrice: number
  readonly currency: string
}

export interface PortfolioReadRepository {
  list(context: PersistenceAccountContext): Promise<PortfolioReadSnapshot>
  findByHostname(
    context: PersistenceAccountContext,
    normalizedHostname: string
  ): Promise<PortfolioReadSnapshot | null>
}

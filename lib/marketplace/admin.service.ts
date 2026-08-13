import 'server-only'

import type { AssetMetadataRecord } from '@/lib/assets/asset-metadata.repository'
import { generatePreparationAssetsAndContent } from '@/lib/domain-preparation/generation'
import type { PreparationAssetInput } from '@/lib/domain-preparation/generation.types'
import { createLandingPageRenderModel } from '@/lib/domain-preparation/landing-page'
import { createDomainPreparation } from '@/lib/domain-preparation/preparation'
import { DomainPreparationApplicationService } from '@/lib/domain-preparation/preparation.service'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type { PersistenceRepositories, PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import { MarketplacePublicationApplicationService } from './publication.service'
import type {
  AdminMarketplaceDomainDetail,
  AdminMarketplaceDomainSummary,
  PublishAdminMarketplaceInput,
  SaveAdminMarketplacePreparationInput,
  UnpublishAdminMarketplaceInput,
} from './admin.types'

const internalLandingReference = (hostname: string) =>
  `/marketplace/domains/${hostname}`

const availableAssetInput = (
  asset: AssetMetadataRecord | undefined,
  expectedKind: AssetMetadataRecord['kind']
): PreparationAssetInput | null =>
  asset?.kind === expectedKind &&
  asset.status === 'AVAILABLE' &&
  asset.publicReference
    ? Object.freeze({ source: 'MANUAL', reference: asset.publicReference })
    : null

const selectedAssetInput = (
  assetId: string | null | undefined,
  assets: ReadonlyMap<string, AssetMetadataRecord>,
  expectedKind: AssetMetadataRecord['kind']
) => {
  if (!assetId) return null
  const asset = assets.get(assetId)
  const input = availableAssetInput(asset, expectedKind)
  if (!asset || !input) throw new PersistenceError('PERSISTENCE_INVALID_INPUT')
  return input
}

export class AdminMarketplaceService {
  private readonly preparations: DomainPreparationApplicationService
  private readonly publications: MarketplacePublicationApplicationService

  constructor(private readonly unitOfWork: PersistenceUnitOfWork) {
    this.preparations = new DomainPreparationApplicationService(unitOfWork)
    this.publications = new MarketplacePublicationApplicationService(unitOfWork)
  }

  list(context: PersistenceAccountContext) {
    return this.unitOfWork.run(async (repositories) => {
      const domains = await repositories.ownedDomains.list(context)
      const summaries = await Promise.all(
        domains.map((domain) => this.summary(repositories, context, domain.id))
      )
      return Object.freeze(summaries)
    })
  }

  get(context: PersistenceAccountContext, hostname: string) {
    return this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findByHostname(context, hostname)
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      const preparation = await repositories.preparations.getCurrent(context, domain.id)
      const publication = await repositories.marketplacePublications.findByOwnedDomain(context, domain.id)
      const assets = await repositories.assetMetadata.listForOwnedDomain(context, domain.id)
      return Object.freeze({
        ownedDomainId: domain.id,
        hostname: domain.normalizedHostname,
        ownershipConfirmed: domain.ownership.confirmed,
        preparationVersion: preparation?.version ?? null,
        preparationReadiness: preparation?.preparation.readiness.readiness ?? 'NOT_PREPARED',
        missingRequirements: preparation?.preparation.readiness.missingRequirements ?? Object.freeze([]),
        publicationState: publication?.state ?? 'NOT_PUBLISHED',
        publicationVersion: publication?.version ?? null,
        askingPrice: preparation?.preparation.preparation.sales.askingPrice ?? null,
        currency: preparation?.preparation.preparation.sales.currency ?? null,
        description: preparation?.preparation.preparation.description.contentOrReference ?? null,
        manualDescription:
          preparation?.generation.description.source === 'MANUAL'
            ? preparation.generation.description.value
            : null,
        externalSalesUrl: preparation?.preparation.preparation.sales.externalSalesUrl ?? null,
        ctaConfigured: preparation?.preparation.preparation.sales.ctaConfigured ?? false,
        selectedAssets: preparation?.assets ?? Object.freeze({ logoAssetId: null, faviconAssetId: null, openGraphAssetId: null }),
        availableAssets: Object.freeze(
          assets.map((asset) =>
            Object.freeze({
              id: asset.id,
              kind: asset.kind,
              status: asset.status,
              publicReference: asset.publicReference,
            })
          )
        ),
        listingId: publication?.listingId ?? null,
      } satisfies AdminMarketplaceDomainDetail)
    })
  }

  async save(
    context: PersistenceAccountContext,
    hostname: string,
    input: SaveAdminMarketplacePreparationInput
  ) {
    const command = await this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findByHostname(context, hostname)
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      const assets = await repositories.assetMetadata.listForOwnedDomain(context, domain.id)
      const byId = new Map(assets.map((asset) => [asset.id, asset]))
      const logo = selectedAssetInput(input.logoAssetId, byId, 'LOGO')
      const favicon = selectedAssetInput(input.faviconAssetId, byId, 'FAVICON')
      const openGraph = selectedAssetInput(
        input.openGraphAssetId,
        byId,
        'OPEN_GRAPH_IMAGE'
      )

      const generation = generatePreparationAssetsAndContent({
        hostname: domain.normalizedHostname,
        ownershipConfirmed: domain.ownership.confirmed,
        askingPrice: input.askingPrice,
        currency: input.currency,
        externalSalesUrl: input.externalSalesUrl,
        manualDescription: input.manualDescription,
        logo,
        favicon,
        openGraphImage: openGraph,
      })
      if (!generation) throw new PersistenceError('PERSISTENCE_INVALID_INPUT')
      const landingPage = createLandingPageRenderModel(generation)
      const preparation = createDomainPreparation({
        hostname: domain.normalizedHostname,
        ownershipConfirmed: domain.ownership.confirmed,
        preparation: {
          logo: { present: generation.assets.logo.status === 'AVAILABLE', reference: generation.assets.logo.reference },
          favicon: { present: generation.assets.favicon.status === 'AVAILABLE', reference: generation.assets.favicon.reference },
          description: { present: true, contentOrReference: generation.description.value },
          landingPage: { present: true, reference: internalLandingReference(domain.normalizedHostname) },
          sales: { askingPrice: input.askingPrice, currency: input.currency, externalSalesUrl: input.externalSalesUrl, ctaConfigured: input.ctaConfigured },
        },
      })
      if (!preparation) throw new PersistenceError('PERSISTENCE_INVALID_INPUT')
      return Object.freeze({
        ownedDomainId: domain.id,
        preparation,
        generation,
        landingPage,
        assets: {
          logoAssetId: input.logoAssetId ?? null,
          faviconAssetId: input.faviconAssetId ?? null,
          openGraphAssetId: input.openGraphAssetId ?? null,
        },
        expectedVersion: input.expectedVersion,
      })
    })
    return this.preparations.savePreparation(context, command)
  }

  async publish(context: PersistenceAccountContext, hostname: string, input: PublishAdminMarketplaceInput) {
    const ownedDomainId = await this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findByHostname(context, hostname)
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      const preparation = await repositories.preparations.getCurrent(context, domain.id)
      if (
        !preparation ||
        preparation.preparation.preparation.landingPage.reference !==
          internalLandingReference(domain.normalizedHostname)
      )
        throw new PersistenceError('PERSISTENCE_INVALID_INPUT')
      return domain.id
    })
    return this.publications.publish(context, {
        ownedDomainId,
        expectedPublicationVersion: input.expectedPublicationVersion,
      })
  }

  unpublish(context: PersistenceAccountContext, input: UnpublishAdminMarketplaceInput) {
    return this.publications.unpublish(context, input)
  }

  private async summary(
    repositories: PersistenceRepositories,
    context: PersistenceAccountContext,
    ownedDomainId: string
  ): Promise<AdminMarketplaceDomainSummary> {
    const domain = await repositories.ownedDomains.findById(context, ownedDomainId)
    if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
    const preparation = await repositories.preparations.getCurrent(context, ownedDomainId)
    const publication = await repositories.marketplacePublications.findByOwnedDomain(context, ownedDomainId)
    return Object.freeze({
      ownedDomainId,
      hostname: domain.normalizedHostname,
      ownershipConfirmed: domain.ownership.confirmed,
      preparationVersion: preparation?.version ?? null,
      preparationReadiness: preparation?.preparation.readiness.readiness ?? 'NOT_PREPARED',
      missingRequirements: preparation?.preparation.readiness.missingRequirements ?? Object.freeze([]),
      publicationState: publication?.state ?? 'NOT_PUBLISHED',
      publicationVersion: publication?.version ?? null,
    })
  }
}

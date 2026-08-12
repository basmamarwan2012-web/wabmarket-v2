import 'server-only'

import type {
  AssetMetadataRecord,
  DomainAssetKind,
} from '@/lib/assets/asset-metadata.repository'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type {
  PersistenceRepositories,
  PersistenceUnitOfWork,
} from '@/lib/persistence/unit-of-work'
import type { PreparationAssetAssociations } from './preparation.repository'
import type {
  SaveDomainPreparationCommand,
  SaveDomainPreparationResult,
} from './preparation.service.types'

const ASSET_ASSOCIATIONS = Object.freeze([
  Object.freeze({ field: 'logoAssetId', kind: 'LOGO' }),
  Object.freeze({ field: 'faviconAssetId', kind: 'FAVICON' }),
  Object.freeze({ field: 'openGraphAssetId', kind: 'OPEN_GRAPH_IMAGE' }),
] as const satisfies readonly Readonly<{
  field: keyof PreparationAssetAssociations
  kind: DomainAssetKind
}>[])

const invalidInput = () =>
  new PersistenceError('PERSISTENCE_INVALID_INPUT')

const validateAssetAssociation = (
  asset: AssetMetadataRecord | null,
  ownedDomainId: string,
  expectedKind: DomainAssetKind
) => {
  if (
    asset === null ||
    asset.ownedDomainId !== ownedDomainId ||
    asset.kind !== expectedKind
  )
    throw invalidInput()
}

export class DomainPreparationApplicationService {
  constructor(private readonly unitOfWork: PersistenceUnitOfWork) {}

  savePreparation(
    context: PersistenceAccountContext,
    command: SaveDomainPreparationCommand
  ): Promise<SaveDomainPreparationResult> {
    return this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findById(
        context,
        command.ownedDomainId
      )
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')

      this.validateCanonicalFacts(domain.normalizedHostname, command)
      await this.validateAssets(
        repositories,
        context,
        command.ownedDomainId,
        command.assets
      )

      const saved = await repositories.preparations.saveCurrent(context, {
        ownedDomainId: command.ownedDomainId,
        preparation: command.preparation,
        generation: command.generation,
        landingPage: command.landingPage,
        assets: command.assets,
        expectedVersion: command.expectedVersion,
      })

      return Object.freeze({
        ownedDomainId: saved.ownedDomainId,
        hostname: saved.preparation.hostname,
        preparationVersion: saved.version,
        readiness: saved.preparation.readiness.readiness,
      })
    })
  }

  private validateCanonicalFacts(
    ownedDomainHostname: string,
    command: SaveDomainPreparationCommand
  ) {
    const hostname = command.preparation.hostname
    if (
      ownedDomainHostname !== hostname ||
      command.generation.hostname !== hostname ||
      command.landingPage.hostname !== hostname ||
      command.landingPage.domainDisplayName !== hostname
    )
      throw invalidInput()
  }

  private async validateAssets(
    repositories: PersistenceRepositories,
    context: PersistenceAccountContext,
    ownedDomainId: string,
    associations: PreparationAssetAssociations
  ) {
    for (const association of ASSET_ASSOCIATIONS) {
      const assetId = associations[association.field]
      if (assetId === null) continue
      const asset = await repositories.assetMetadata.findById(
        context,
        assetId
      )
      validateAssetAssociation(asset, ownedDomainId, association.kind)
    }
  }
}

export type {
  SaveDomainPreparationCommand,
  SaveDomainPreparationResult,
} from './preparation.service.types'

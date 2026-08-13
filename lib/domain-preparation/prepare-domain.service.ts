import 'server-only'

import type {
  AssetMetadataRecord,
  DomainAssetKind,
} from '@/lib/assets/asset-metadata.repository'
import { AssetError } from '@/lib/assets/asset.errors'
import { AssetUploadApplicationService } from '@/lib/assets/asset-upload.service'
import { createBrandIdentity } from '@/lib/branding/brand-identity'
import type { BrandAssetGenerator } from '@/lib/branding/brand-asset-generator.types'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import { generatePreparationAssetsAndContent } from './generation'
import { createLandingPageRenderModel } from './landing-page'
import { createDomainPreparation } from './preparation'
import { DomainPreparationApplicationService } from './preparation.service'
import {
  assetInputFromRecord,
  generationFailureCode,
  normalizePrepareDomainCommand,
  PREPARE_DOMAIN_ASSET_FIELDS,
  PREPARE_DOMAIN_ASSET_ORDER,
} from './prepare-domain.helpers'
import { PrepareDomainError } from './prepare-domain.errors'
import type {
  PrepareDomainCommand,
  PrepareDomainResult,
} from './prepare-domain.types'
import type { PreparationAssetAssociations } from './preparation.repository'

interface LoadedPreparationState {
  readonly ownedDomainId: string
  readonly hostname: string
  readonly ownershipConfirmed: boolean
  readonly version: number | null
  readonly selected: PreparationAssetAssociations
  readonly assets: readonly AssetMetadataRecord[]
}

type SelectionAssetRecord = Pick<
  AssetMetadataRecord,
  'id' | 'ownedDomainId' | 'kind' | 'status' | 'publicReference'
>

const EMPTY_SELECTIONS: PreparationAssetAssociations = Object.freeze({
  logoAssetId: null,
  faviconAssetId: null,
  openGraphAssetId: null,
})

export class PrepareDomainApplicationService {
  private readonly preparations: DomainPreparationApplicationService

  constructor(
    private readonly unitOfWork: PersistenceUnitOfWork,
    private readonly uploader: AssetUploadApplicationService,
    private readonly generator: BrandAssetGenerator
  ) {
    this.preparations = new DomainPreparationApplicationService(unitOfWork)
  }

  async prepare(
    context: PersistenceAccountContext,
    command: PrepareDomainCommand
  ): Promise<PrepareDomainResult> {
    const normalized = normalizePrepareDomainCommand(command)
    const state = await this.loadState(context, normalized.hostname)
    if (!state.ownershipConfirmed)
      throw new PrepareDomainError('PREPARE_DOMAIN_OWNERSHIP_REQUIRED')
    if (state.version !== normalized.expectedVersion)
      throw new PrepareDomainError('PREPARE_DOMAIN_VERSION_CONFLICT')

    const selected = { ...state.selected }
    const byId = new Map<string, SelectionAssetRecord>(
      state.assets.map((asset) => [asset.id, asset])
    )
    this.validateSelections(selected, byId, state.ownedDomainId)

    const identity = createBrandIdentity({
      hostname: state.hostname,
      displayName: state.hostname,
    })
    if (!identity)
      throw new PrepareDomainError('PREPARE_DOMAIN_HOSTNAME_INVALID')

    const generated: Array<
      Readonly<{ kind: DomainAssetKind; id: string }>
    > = []
    try {
      for (const kind of PREPARE_DOMAIN_ASSET_ORDER) {
        const field = PREPARE_DOMAIN_ASSET_FIELDS[kind]
        if (selected[field] !== null) continue
        let visual
        try {
          visual = this.generator.generate(identity, kind)
        } catch {
          throw new PrepareDomainError(generationFailureCode(kind))
        }
        let asset
        try {
          asset = await this.uploader.upload(context, {
            hostname: state.hostname,
            kind,
            file: {
              declaredMimeType: visual.mimeType,
              contents: visual.contents,
            },
          })
        } catch (error) {
          if (error instanceof AssetError) {
            if (error.code === 'ASSET_COMPENSATION_FAILED')
              throw new PrepareDomainError(
                'PREPARE_DOMAIN_ASSET_CLEANUP_FAILED'
              )
            if (error.code === 'ASSET_STORAGE_UNAVAILABLE')
              throw new PrepareDomainError(
                'PREPARE_DOMAIN_ASSET_STORAGE_NOT_CONFIGURED'
              )
          }
          if (error instanceof PersistenceError)
            throw new PrepareDomainError(
              'PREPARE_DOMAIN_DATABASE_UNAVAILABLE'
            )
          throw new PrepareDomainError(generationFailureCode(kind))
        }
        generated.push(Object.freeze({ kind, id: asset.id }))
        selected[field] = asset.id
        byId.set(asset.id, asset)
      }

      const logo = assetInputFromRecord(byId.get(selected.logoAssetId ?? ''), 'LOGO')
      const favicon = assetInputFromRecord(
        byId.get(selected.faviconAssetId ?? ''),
        'FAVICON'
      )
      const openGraphImage = assetInputFromRecord(
        byId.get(selected.openGraphAssetId ?? ''),
        'OPEN_GRAPH_IMAGE'
      )
      if (!logo || !favicon || !openGraphImage)
        throw new PrepareDomainError('PREPARE_DOMAIN_SELECTED_ASSET_INVALID')

      const generation = generatePreparationAssetsAndContent({
        hostname: state.hostname,
        ownershipConfirmed: true,
        askingPrice: normalized.askingPrice,
        currency: normalized.currency,
        externalSalesUrl: normalized.externalSalesUrl,
        manualDescription: normalized.manualDescription,
        logo,
        favicon,
        openGraphImage,
      })
      if (!generation)
        throw new PrepareDomainError('PREPARE_DOMAIN_FAILED')
      const landingPage = createLandingPageRenderModel(generation)
      const ctaConfigured =
        landingPage.cta.label !== null &&
        landingPage.cta.externalSalesUrl === normalized.externalSalesUrl &&
        landingPage.readiness.state !== 'NOT_RENDERABLE'
      if (!ctaConfigured)
        throw new PrepareDomainError('PREPARE_DOMAIN_SALES_URL_INVALID')

      const preparation = createDomainPreparation({
        hostname: state.hostname,
        ownershipConfirmed: true,
        preparation: {
          logo: { present: true, reference: generation.assets.logo.reference },
          favicon: {
            present: true,
            reference: generation.assets.favicon.reference,
          },
          description: {
            present: true,
            contentOrReference: generation.description.value,
          },
          landingPage: {
            present: true,
            reference: `/marketplace/domains/${state.hostname}`,
          },
          sales: {
            askingPrice: normalized.askingPrice,
            currency: normalized.currency,
            externalSalesUrl: normalized.externalSalesUrl,
            ctaConfigured,
          },
        },
      })
      if (!preparation)
        throw new PrepareDomainError('PREPARE_DOMAIN_FAILED')

      const saved = await this.preparations.savePreparation(context, {
        ownedDomainId: state.ownedDomainId,
        preparation,
        generation,
        landingPage,
        assets: Object.freeze({ ...selected }),
        expectedVersion: normalized.expectedVersion,
      })

      return Object.freeze({
        hostname: saved.hostname,
        preparationVersion: saved.preparationVersion,
        readiness: saved.readiness,
        missingRequirements: preparation.readiness.missingRequirements,
        landingPageReadiness: landingPage.readiness.state,
        generatedAssetKinds: Object.freeze(generated.map(({ kind }) => kind)),
        selectedAssets: Object.freeze({ ...selected }),
      })
    } catch (error) {
      await this.compensate(context, state.hostname, generated)
      throw this.mapError(error)
    }
  }

  private loadState(
    context: PersistenceAccountContext,
    hostname: string
  ): Promise<LoadedPreparationState> {
    return this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findByHostname(
        context,
        hostname
      )
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      const [preparation, assets] = await Promise.all([
        repositories.preparations.getCurrent(context, domain.id),
        repositories.assetMetadata.listForOwnedDomain(context, domain.id),
      ])
      return Object.freeze({
        ownedDomainId: domain.id,
        hostname: domain.normalizedHostname,
        ownershipConfirmed: domain.ownership.confirmed,
        version: preparation?.version ?? null,
        selected: preparation?.assets ?? EMPTY_SELECTIONS,
        assets,
      })
    })
  }

  private validateSelections(
    selected: PreparationAssetAssociations,
    assets: ReadonlyMap<string, SelectionAssetRecord>,
    ownedDomainId: string
  ) {
    for (const kind of PREPARE_DOMAIN_ASSET_ORDER) {
      const assetId = selected[PREPARE_DOMAIN_ASSET_FIELDS[kind]]
      if (assetId === null) continue
      const asset = assets.get(assetId)
      if (
        !asset ||
        asset.ownedDomainId !== ownedDomainId ||
        asset.kind !== kind ||
        asset.status !== 'AVAILABLE' ||
        !asset.publicReference
      )
        throw new PrepareDomainError(
          'PREPARE_DOMAIN_SELECTED_ASSET_INVALID'
        )
    }
  }

  private async compensate(
    context: PersistenceAccountContext,
    hostname: string,
    generated: readonly Readonly<{ id: string }>[]
  ) {
    for (const asset of [...generated].reverse()) {
      try {
        await this.uploader.delete(context, { hostname, assetId: asset.id })
      } catch {
        throw new PrepareDomainError(
          'PREPARE_DOMAIN_ASSET_CLEANUP_FAILED'
        )
      }
    }
  }

  private mapError(error: unknown) {
    if (error instanceof PrepareDomainError) return error
    if (error instanceof AssetError)
      return error.code === 'ASSET_COMPENSATION_FAILED'
        ? new PrepareDomainError('PREPARE_DOMAIN_ASSET_CLEANUP_FAILED')
        : error.code === 'ASSET_STORAGE_UNAVAILABLE'
          ? new PrepareDomainError(
              'PREPARE_DOMAIN_ASSET_STORAGE_NOT_CONFIGURED'
            )
          : new PrepareDomainError('PREPARE_DOMAIN_FAILED')
    if (error instanceof PersistenceError) {
      if (error.code === 'PERSISTENCE_VERSION_CONFLICT')
        return new PrepareDomainError('PREPARE_DOMAIN_VERSION_CONFLICT')
      if (error.code === 'PERSISTENCE_INVALID_INPUT')
        return new PrepareDomainError(
          'PREPARE_DOMAIN_SELECTED_ASSET_INVALID'
        )
      return new PrepareDomainError('PREPARE_DOMAIN_DATABASE_UNAVAILABLE')
    }
    return new PrepareDomainError('PREPARE_DOMAIN_FAILED')
  }
}

export type { PrepareDomainCommand, PrepareDomainResult } from './prepare-domain.types'

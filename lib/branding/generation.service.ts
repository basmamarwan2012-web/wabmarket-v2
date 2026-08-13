import 'server-only'

import { DOMAIN_ASSET_KINDS, type DomainAssetKind } from '@/lib/assets/asset-metadata.repository'
import { AssetError } from '@/lib/assets/asset.errors'
import { AssetUploadApplicationService } from '@/lib/assets/asset-upload.service'
import type { PersistenceAccountContext } from '@/lib/persistence/context'
import { PersistenceError } from '@/lib/persistence/errors'
import type { PersistenceUnitOfWork } from '@/lib/persistence/unit-of-work'
import { createBrandIdentity } from './brand-identity'
import type { BrandAssetGenerator } from './brand-asset-generator.types'
import type { BrandingGenerationResult, GenerateBrandingAssetsCommand } from './generation.service.types'

const ASSOCIATIONS: Readonly<Record<DomainAssetKind, 'logoAssetId' | 'faviconAssetId' | 'openGraphAssetId'>> = Object.freeze({
  LOGO: 'logoAssetId', FAVICON: 'faviconAssetId', OPEN_GRAPH_IMAGE: 'openGraphAssetId',
})

export class BrandingGenerationService {
  constructor(
    private readonly unitOfWork: PersistenceUnitOfWork,
    private readonly uploader: AssetUploadApplicationService,
    private readonly generator: BrandAssetGenerator
  ) {}

  async generate(context: PersistenceAccountContext, command: GenerateBrandingAssetsCommand): Promise<BrandingGenerationResult> {
    if (command.action === 'GENERATE_ONE' && (!command.kind || !DOMAIN_ASSET_KINDS.includes(command.kind))) throw new AssetError('ASSET_INVALID_INPUT')
    if (command.action === 'GENERATE_MISSING' && command.kind !== undefined) throw new AssetError('ASSET_INVALID_INPUT')
    const state = await this.unitOfWork.run(async (repositories) => {
      const domain = await repositories.ownedDomains.findByHostname(context, command.hostname)
      if (!domain) throw new PersistenceError('PERSISTENCE_NOT_FOUND')
      const preparation = await repositories.preparations.getCurrent(context, domain.id)
      return Object.freeze({ domain, selected: preparation?.assets ?? Object.freeze({ logoAssetId: null, faviconAssetId: null, openGraphAssetId: null }) })
    })
    const identity = createBrandIdentity({ hostname: state.domain.normalizedHostname, displayName: state.domain.normalizedHostname })
    if (!identity) throw new AssetError('ASSET_INVALID_INPUT')
    const candidates = command.action === 'GENERATE_ONE' ? [command.kind as DomainAssetKind] : [...DOMAIN_ASSET_KINDS]
    const generated = [], skipped: DomainAssetKind[] = []
    for (const kind of candidates) {
      if (command.action === 'GENERATE_MISSING' && state.selected[ASSOCIATIONS[kind]] !== null) { skipped.push(kind); continue }
      const visual = this.generator.generate(identity, kind)
      generated.push(await this.uploader.upload(context, { hostname: state.domain.normalizedHostname, kind, file: { declaredMimeType: visual.mimeType, contents: visual.contents } }))
    }
    return Object.freeze({ hostname: state.domain.normalizedHostname, action: command.action, generated: Object.freeze(generated), skippedSelectedKinds: Object.freeze(skipped) })
  }
}

export type { BrandingGenerationResult, GenerateBrandingAssetsCommand } from './generation.service.types'

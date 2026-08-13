import type {
  AssetMetadataRecord,
  DomainAssetKind,
} from '@/lib/assets/asset-metadata.repository'
import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type { PreparationAssetInput } from './generation.types'
import {
  normalizeExternalSalesUrl,
  normalizePreparationCurrency,
} from './preparation.helpers'
import { PrepareDomainError } from './prepare-domain.errors'
import type {
  NormalizedPrepareDomainCommand,
  PrepareDomainCommand,
} from './prepare-domain.types'
import type { PreparationAssetAssociations } from './preparation.repository'

export const PREPARE_DOMAIN_ASSET_ORDER = Object.freeze([
  'LOGO',
  'FAVICON',
  'OPEN_GRAPH_IMAGE',
] as const satisfies readonly DomainAssetKind[])

export const PREPARE_DOMAIN_ASSET_FIELDS: Readonly<
  Record<DomainAssetKind, keyof PreparationAssetAssociations>
> = Object.freeze({
  LOGO: 'logoAssetId',
  FAVICON: 'faviconAssetId',
  OPEN_GRAPH_IMAGE: 'openGraphAssetId',
})

const normalizeDescription = (value: unknown) => {
  if (value === null || value === undefined || value === '') return null
  if (typeof value !== 'string')
    throw new PrepareDomainError('PREPARE_DOMAIN_DESCRIPTION_INVALID')
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  if (normalized.length === 0 || normalized.length > 20_000)
    throw new PrepareDomainError('PREPARE_DOMAIN_DESCRIPTION_INVALID')
  return normalized
}

export const normalizePrepareDomainCommand = (
  command: PrepareDomainCommand
): NormalizedPrepareDomainCommand => {
  const hostname = normalizeHostname(command.hostname)
  if (!hostname || hostname !== command.hostname)
    throw new PrepareDomainError('PREPARE_DOMAIN_HOSTNAME_INVALID')
  if (!Number.isFinite(command.askingPrice) || command.askingPrice <= 0)
    throw new PrepareDomainError('PREPARE_DOMAIN_ASKING_PRICE_INVALID')
  const currency = normalizePreparationCurrency(command.currency)
  if (!currency)
    throw new PrepareDomainError('PREPARE_DOMAIN_CURRENCY_INVALID')
  const salesUrl = normalizeExternalSalesUrl(command.externalSalesUrl)
  if (salesUrl.status !== 'VALID' || salesUrl.value === null)
    throw new PrepareDomainError('PREPARE_DOMAIN_SALES_URL_INVALID')
  if (
    command.expectedVersion !== null &&
    (!Number.isInteger(command.expectedVersion) || command.expectedVersion <= 0)
  )
    throw new PrepareDomainError('PREPARE_DOMAIN_VERSION_CONFLICT')

  return Object.freeze({
    hostname,
    askingPrice: command.askingPrice,
    currency,
    externalSalesUrl: salesUrl.value,
    manualDescription: normalizeDescription(command.manualDescription),
    expectedVersion: command.expectedVersion,
  })
}

export const assetInputFromRecord = (
  asset:
    | Pick<AssetMetadataRecord, 'kind' | 'status' | 'publicReference'>
    | undefined,
  kind: DomainAssetKind
): PreparationAssetInput | null => {
  if (
    !asset ||
    asset.kind !== kind ||
    asset.status !== 'AVAILABLE' ||
    !asset.publicReference
  )
    return null
  return Object.freeze({ source: 'MANUAL', reference: asset.publicReference })
}

export const generationFailureCode = (
  kind: DomainAssetKind
): ConstructorParameters<typeof PrepareDomainError>[0] => {
  switch (kind) {
    case 'LOGO':
      return 'PREPARE_DOMAIN_LOGO_GENERATION_FAILED'
    case 'FAVICON':
      return 'PREPARE_DOMAIN_FAVICON_GENERATION_FAILED'
    case 'OPEN_GRAPH_IMAGE':
      return 'PREPARE_DOMAIN_OPEN_GRAPH_GENERATION_FAILED'
  }
}

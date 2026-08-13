import { normalizeBusinessName, normalizeHostname } from '../domain-analysis/analyzer.helpers'
import {
  normalizeExternalSalesUrl,
  normalizePreparationCurrency,
} from './preparation.helpers'
import type {
  PreparationAssetInput,
  PreparationAssetSlot,
  PreparationGenerationInput,
} from './generation.types'

const MAXIMUM_CONTEXT_LENGTH = 512
const MAXIMUM_ASSET_REFERENCE_LENGTH = 2_048

export interface NormalizedPreparationGenerationInput {
  readonly hostname: string
  readonly ownershipConfirmed: true
  readonly businessName: string | null
  readonly category: string | null
  readonly primaryKeyword: string | null
  readonly city: string | null
  readonly manualDescription: string | null
  readonly askingPrice: number
  readonly currency: string
  readonly externalSalesUrl: string
  readonly logo: PreparationAssetSlot
  readonly favicon: PreparationAssetSlot
  readonly openGraphImage: PreparationAssetSlot
}

const normalizeOptionalContext = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return undefined
  const normalized = normalizeBusinessName(value)
  return normalized !== null && normalized.length <= MAXIMUM_CONTEXT_LENGTH
    ? normalized
    : undefined
}

const normalizeManualDescription = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return undefined
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized.length > 0 && normalized.length <= 20_000
    ? normalized
    : undefined
}

const normalizeAssetSlot = (
  value: PreparationAssetInput | null | undefined
): PreparationAssetSlot | null => {
  if (value === null || value === undefined)
    return Object.freeze({
      source: 'NONE',
      reference: null,
      status: 'PENDING',
    })

  if (
    !value ||
    typeof value !== 'object' ||
    (value.source !== 'MANUAL' && value.source !== 'PROVIDER') ||
    typeof value.reference !== 'string'
  )
    return null

  const reference = value.reference.normalize('NFKC').trim()
  if (
    reference.length === 0 ||
    reference.length > MAXIMUM_ASSET_REFERENCE_LENGTH
  )
    return null

  return Object.freeze({
    source: value.source,
    reference,
    status: 'AVAILABLE',
  })
}

export const normalizePreparationGenerationInput = (
  input: PreparationGenerationInput
): NormalizedPreparationGenerationInput | null => {
  if (
    !input ||
    typeof input !== 'object' ||
    input.ownershipConfirmed !== true ||
    !Number.isFinite(input.askingPrice) ||
    input.askingPrice <= 0
  )
    return null

  const hostname = normalizeHostname(input.hostname)
  const businessName = normalizeOptionalContext(input.businessName)
  const category = normalizeOptionalContext(input.category)
  const primaryKeyword = normalizeOptionalContext(input.primaryKeyword)
  const city = normalizeOptionalContext(input.city)
  const manualDescription = normalizeManualDescription(input.manualDescription)
  const currency = normalizePreparationCurrency(input.currency)
  const externalSalesUrl = normalizeExternalSalesUrl(input.externalSalesUrl)
  const logo = normalizeAssetSlot(input.logo)
  const favicon = normalizeAssetSlot(input.favicon)
  const openGraphImage = normalizeAssetSlot(input.openGraphImage)

  if (
    hostname === null ||
    businessName === undefined ||
    category === undefined ||
    primaryKeyword === undefined ||
    city === undefined ||
    manualDescription === undefined ||
    currency === null ||
    currency === undefined ||
    externalSalesUrl.status !== 'VALID' ||
    externalSalesUrl.value === null ||
    externalSalesUrl.value !== input.externalSalesUrl ||
    logo === null ||
    favicon === null ||
    openGraphImage === null
  )
    return null

  return Object.freeze({
    hostname,
    ownershipConfirmed: true,
    businessName,
    category,
    primaryKeyword,
    city,
    manualDescription,
    askingPrice: input.askingPrice,
    currency,
    externalSalesUrl: externalSalesUrl.value,
    logo,
    favicon,
    openGraphImage,
  })
}

export const createTemplateText = (value: string) =>
  Object.freeze({ value, source: 'TEMPLATE' as const })

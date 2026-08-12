import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import type {
  PreparationAssetSlot,
  PreparationGeneratedText,
} from './generation.types'
import type {
  LandingPageRenderAsset,
  LandingPageRenderReason,
} from './landing-page.types'
import {
  normalizeExternalSalesUrl,
  normalizePreparationCurrency,
} from './preparation.helpers'

const MAXIMUM_RENDER_TEXT_LENGTH = 20_000
const MAXIMUM_ASSET_REFERENCE_LENGTH = 2_048

const validTextSources = Object.freeze([
  'TEMPLATE',
  'MANUAL',
  'PROVIDER',
] as const)

export const validateNormalizedRenderHostname = (value: unknown) => {
  const normalized = normalizeHostname(value)
  return normalized !== null && normalized === value ? normalized : null
}

export const validateGeneratedRenderText = (
  value: PreparationGeneratedText | unknown
) => {
  if (
    !value ||
    typeof value !== 'object' ||
    !('value' in value) ||
    !('source' in value) ||
    typeof value.value !== 'string' ||
    !validTextSources.includes(
      value.source as (typeof validTextSources)[number]
    ) ||
    value.value.length === 0 ||
    value.value.length > MAXIMUM_RENDER_TEXT_LENGTH ||
    value.value.trim() !== value.value
  )
    return null

  return value.value
}

export const validateRenderCurrency = (value: unknown) => {
  const normalized = normalizePreparationCurrency(value)
  return normalized !== null && normalized !== undefined && normalized === value
    ? normalized
    : null
}

export const validateExactExternalSalesUrl = (value: unknown) => {
  const normalized = normalizeExternalSalesUrl(value)
  return normalized.status === 'VALID' && normalized.value === value
    ? normalized.value
    : null
}

export const mapLandingPageRenderAsset = (
  slot: PreparationAssetSlot | unknown,
  placeholderReason: LandingPageRenderReason
): Readonly<{
  asset: LandingPageRenderAsset
  reason: LandingPageRenderReason | null
}> => {
  if (
    slot &&
    typeof slot === 'object' &&
    'status' in slot &&
    'source' in slot &&
    'reference' in slot &&
    slot.status === 'AVAILABLE' &&
    slot.source !== 'NONE' &&
    typeof slot.reference === 'string' &&
    slot.reference.length > 0 &&
    slot.reference.length <= MAXIMUM_ASSET_REFERENCE_LENGTH &&
    slot.reference.trim() === slot.reference
  )
    return Object.freeze({
      asset: Object.freeze({
        state: 'AVAILABLE',
        reference: slot.reference,
      }),
      reason: null,
    })

  return Object.freeze({
    asset: Object.freeze({ state: 'PLACEHOLDER', reference: null }),
    reason: placeholderReason,
  })
}

export const freezeLandingPageReasons = (
  reasons: readonly LandingPageRenderReason[]
) => Object.freeze([...reasons])


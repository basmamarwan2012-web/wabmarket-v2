import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import type {
  PreparationAssetSlot,
  PreparationGeneratedText,
} from './generation.types'
import type {
  LandingPageRenderModel,
  LandingPageRenderAsset,
  LandingPageRenderReason,
} from './landing-page.types'
import {
  normalizeExternalSalesUrl,
  normalizePreparationCurrency,
} from './preparation.helpers'
import { LANDING_PAGE_V1_SECTION_ORDER } from './landing-page.sections'

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

const optionalContext = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized.length > 0 && normalized.length <= 512 ? normalized : null
}

export const createLandingPagePublicContext = (
  input: unknown
): NonNullable<LandingPageRenderModel['publicContext']> => {
  const source = input && typeof input === 'object' ? input as Readonly<Record<string, unknown>> : {}
  return Object.freeze({
    category: optionalContext(source.category),
    primaryKeyword: optionalContext(source.primaryKeyword),
    city: optionalContext(source.city),
  })
}

export const createLandingPageProductFacts = (
  hostname: string | null,
  context: NonNullable<LandingPageRenderModel['publicContext']>
): NonNullable<LandingPageRenderModel['productFacts']> => {
  if (!hostname)
    return Object.freeze({
      extension: null,
      secondLevelLabelLength: null,
      hasHyphen: null,
      hasDigits: null,
      saleStatus: 'AVAILABLE_FOR_ACQUISITION',
      valuePoints: Object.freeze([]),
      useCase: 'A domain name offered as a standalone digital product.',
    })
  const labels = hostname.split('.')
  const extension = labels.at(-1) ?? null
  const label = labels.at(-2) ?? labels[0]
  const hasHyphen = label.includes('-')
  const hasDigits = /\d/.test(label)
  const valuePoints = [
    extension === 'com' ? 'Uses the .com extension.' : `Uses the .${extension} extension.`,
    hasHyphen ? 'The domain label contains a hyphen.' : 'The domain label contains no hyphen.',
    hasDigits ? 'The domain label contains digits.' : 'The domain label contains no digits.',
    `The second-level label contains ${label.length} characters.`,
    context.primaryKeyword ? `Prepared with the explicit keyword “${context.primaryKeyword}”.` : null,
    context.category ? `Prepared for the explicit category “${context.category}”.` : null,
    context.city ? `Prepared with explicit location context for ${context.city}.` : null,
  ].filter((value): value is string => value !== null)
  const subjects = [context.category ?? context.primaryKeyword, context.city]
    .filter((value): value is string => value !== null)
  return Object.freeze({
    extension,
    secondLevelLabelLength: label.length,
    hasHyphen,
    hasDigits,
    saleStatus: 'AVAILABLE_FOR_ACQUISITION',
    valuePoints: Object.freeze(valuePoints),
    useCase: subjects.length > 0
      ? `A domain product prepared for ${subjects.join(' in ')} positioning.`
      : 'A domain name offered as a standalone digital product for a future brand or project.',
  })
}

/** Backward-compatible read adapter for stored v1 snapshots that predate
 * optional public context/product facts. */
export const resolveLandingPagePresentationFacts = (
  model: LandingPageRenderModel
) => {
  const publicContext = createLandingPagePublicContext(model.publicContext)
  const computed = createLandingPageProductFacts(model.hostname, publicContext)
  const supplied = model.productFacts
  const validSupplied =
    supplied &&
    Array.isArray(supplied.valuePoints) &&
    typeof supplied.useCase === 'string' &&
    supplied.saleStatus === 'AVAILABLE_FOR_ACQUISITION'
  return Object.freeze({
    publicContext,
    productFacts: validSupplied ? supplied : computed,
    sectionOrder: LANDING_PAGE_V1_SECTION_ORDER,
  })
}

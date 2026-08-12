import { CANDIDATE_SELECTION_TIERS } from '../candidate-domains/quality.types'
import type { CandidateSelectionTier } from '../candidate-domains/quality.types'
import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import { isDomainAvailabilityStatus } from '../domain-availability/helpers'
import type { DomainAvailabilityStatus } from '../domain-availability/types'
import { ACQUISITION_REASON_ORDER } from './policy'
import {
  DOMAIN_ACQUISITION_TYPES,
  type AcquisitionRecommendationInput,
  type AcquisitionRecommendationReason,
  type DomainAcquisitionType,
} from './recommendation.types'

export interface NormalizedAcquisitionRecommendationInput {
  readonly hostname: string
  readonly selectionTier: CandidateSelectionTier
  readonly availabilityStatus: DomainAvailabilityStatus
  readonly acquisitionType: DomainAcquisitionType | null
  readonly observedPrice: number | null
  readonly currency: string | null
  readonly maximumAllowedPrice: number
  readonly maximumAllowedCurrency: string
  readonly provider: string
  readonly sourceUrl: string | null
}

export type SafeSourceUrlResult = Readonly<
  | { status: 'MISSING'; sourceUrl: null }
  | { status: 'INVALID'; sourceUrl: null }
  | { status: 'VALID'; sourceUrl: string }
>

const normalizeRequiredText = (value: unknown) => {
  if (typeof value !== 'string') return null
  const normalized = value.normalize('NFKC').trim()
  return normalized.length > 0 ? normalized : null
}

export const normalizeCurrencyCode = (value: unknown) => {
  const normalized = normalizeRequiredText(value)?.toUpperCase() ?? null
  return normalized !== null && /^[A-Z]{3}$/.test(normalized)
    ? normalized
    : null
}

const isCandidateSelectionTier = (
  value: unknown
): value is CandidateSelectionTier =>
  typeof value === 'string' &&
  CANDIDATE_SELECTION_TIERS.includes(value as CandidateSelectionTier)

const isDomainAcquisitionType = (
  value: unknown
): value is DomainAcquisitionType =>
  typeof value === 'string' &&
  DOMAIN_ACQUISITION_TYPES.includes(value as DomainAcquisitionType)

export const normalizeAcquisitionRecommendationInput = (
  input: AcquisitionRecommendationInput
): NormalizedAcquisitionRecommendationInput | null => {
  if (!input || typeof input !== 'object') return null

  const hostname = normalizeHostname(input.hostname)
  const provider = normalizeRequiredText(input.provider)
  const maximumAllowedCurrency = normalizeCurrencyCode(
    input.maximumAllowedCurrency
  )
  const currency =
    input.currency === null ? null : normalizeCurrencyCode(input.currency)

  if (
    hostname === null ||
    provider === null ||
    maximumAllowedCurrency === null ||
    !isCandidateSelectionTier(input.selectionTier) ||
    !isDomainAvailabilityStatus(input.availabilityStatus) ||
    (input.acquisitionType !== null &&
      !isDomainAcquisitionType(input.acquisitionType)) ||
    !Number.isFinite(input.maximumAllowedPrice) ||
    input.maximumAllowedPrice < 0 ||
    (input.observedPrice !== null &&
      (!Number.isFinite(input.observedPrice) || input.observedPrice < 0)) ||
    (input.currency !== null && currency === null) ||
    (input.sourceUrl !== null && typeof input.sourceUrl !== 'string')
  )
    return null

  return Object.freeze({
    hostname,
    selectionTier: input.selectionTier,
    availabilityStatus: input.availabilityStatus,
    acquisitionType: input.acquisitionType,
    observedPrice: input.observedPrice,
    currency,
    maximumAllowedPrice: input.maximumAllowedPrice,
    maximumAllowedCurrency,
    provider,
    sourceUrl: input.sourceUrl,
  })
}

export const resolveSafeSourceUrl = (
  sourceUrl: string | null
): SafeSourceUrlResult => {
  if (sourceUrl === null || sourceUrl.trim().length === 0)
    return Object.freeze({ status: 'MISSING', sourceUrl: null })

  const suppliedUrl = sourceUrl.trim()
  try {
    const parsed = new URL(suppliedUrl)
    if (
      parsed.protocol !== 'https:' ||
      parsed.username.length > 0 ||
      parsed.password.length > 0 ||
      parsed.port !== '' ||
      normalizeHostname(parsed.hostname) === null
    )
      return Object.freeze({ status: 'INVALID', sourceUrl: null })

    return Object.freeze({ status: 'VALID', sourceUrl: suppliedUrl })
  } catch {
    return Object.freeze({ status: 'INVALID', sourceUrl: null })
  }
}

export const orderRecommendationReasons = (
  reasons: Iterable<AcquisitionRecommendationReason>
) =>
  Object.freeze(
    [...new Set(reasons)].sort(
      (left, right) =>
        ACQUISITION_REASON_ORDER[left] - ACQUISITION_REASON_ORDER[right]
    )
  )


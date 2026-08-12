import { normalizeHostname } from '../domain-analysis/analyzer.helpers'
import type {
  DomainPreparationFacts,
  DomainPreparationInput,
  PreparationAssetFact,
  PreparationDescriptionFact,
} from './preparation.types'

const MAXIMUM_REFERENCE_LENGTH = 2_048
const MAXIMUM_DESCRIPTION_VALUE_LENGTH = 20_000
const MAXIMUM_OPPORTUNITY_ID_LENGTH = 256

export type ExternalSalesUrlStatus = 'MISSING' | 'INVALID' | 'VALID'

export interface NormalizedDomainPreparationInput {
  readonly hostname: string
  readonly ownershipConfirmed: boolean
  readonly sourceOpportunityId: string | null
  readonly preparation: DomainPreparationFacts
  readonly externalSalesUrlStatus: ExternalSalesUrlStatus
}

const normalizeOptionalText = (value: unknown, maximumLength: number) => {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return undefined
  const normalized = value.normalize('NFKC').trim()
  if (normalized.length === 0 || normalized.length > maximumLength)
    return undefined
  return normalized
}

export const normalizePreparationCurrency = (value: unknown) => {
  if (value === null || value === undefined) return null
  if (typeof value !== 'string') return undefined
  const currency = value.normalize('NFKC').trim().toUpperCase()
  return /^[A-Z]{3}$/.test(currency) ? currency : undefined
}

export const normalizeExternalSalesUrl = (
  value: unknown
): Readonly<{
  status: ExternalSalesUrlStatus
  value: string | null
}> => {
  if (value === null || value === undefined || value === '')
    return Object.freeze({ status: 'MISSING', value: null })
  if (typeof value !== 'string')
    return Object.freeze({ status: 'INVALID', value: null })

  const suppliedUrl = value.trim()
  if (suppliedUrl.length === 0)
    return Object.freeze({ status: 'MISSING', value: null })

  try {
    const parsed = new URL(suppliedUrl)
    if (
      parsed.protocol !== 'https:' ||
      parsed.username.length > 0 ||
      parsed.password.length > 0 ||
      parsed.port !== '' ||
      normalizeHostname(parsed.hostname) === null
    )
      return Object.freeze({ status: 'INVALID', value: null })

    return Object.freeze({ status: 'VALID', value: suppliedUrl })
  } catch {
    return Object.freeze({ status: 'INVALID', value: null })
  }
}

const normalizeAssetFact = (
  value: PreparationAssetFact
): PreparationAssetFact | null => {
  if (!value || typeof value !== 'object' || typeof value.present !== 'boolean')
    return null
  const reference = normalizeOptionalText(
    value.reference,
    MAXIMUM_REFERENCE_LENGTH
  )
  if (reference === undefined) return null
  return Object.freeze({ present: value.present, reference })
}

const normalizeDescriptionFact = (
  value: PreparationDescriptionFact
): PreparationDescriptionFact | null => {
  if (!value || typeof value !== 'object' || typeof value.present !== 'boolean')
    return null
  const contentOrReference = normalizeOptionalText(
    value.contentOrReference,
    MAXIMUM_DESCRIPTION_VALUE_LENGTH
  )
  if (contentOrReference === undefined) return null
  return Object.freeze({ present: value.present, contentOrReference })
}

export const normalizeDomainPreparationInput = (
  input: DomainPreparationInput
): NormalizedDomainPreparationInput | null => {
  if (
    !input ||
    typeof input !== 'object' ||
    typeof input.ownershipConfirmed !== 'boolean' ||
    !input.preparation ||
    typeof input.preparation !== 'object'
  )
    return null

  const hostname = normalizeHostname(input.hostname)
  const sourceOpportunityId = normalizeOptionalText(
    input.sourceOpportunityId,
    MAXIMUM_OPPORTUNITY_ID_LENGTH
  )
  const logo = normalizeAssetFact(input.preparation.logo)
  const favicon = normalizeAssetFact(input.preparation.favicon)
  const description = normalizeDescriptionFact(input.preparation.description)
  const landingPage = normalizeAssetFact(input.preparation.landingPage)
  const sales = input.preparation.sales

  if (
    hostname === null ||
    sourceOpportunityId === undefined ||
    logo === null ||
    favicon === null ||
    description === null ||
    landingPage === null ||
    !sales ||
    typeof sales !== 'object' ||
    typeof sales.ctaConfigured !== 'boolean' ||
    (sales.askingPrice !== null &&
      (!Number.isFinite(sales.askingPrice) || sales.askingPrice <= 0))
  )
    return null

  const currency = normalizePreparationCurrency(sales.currency)
  if (currency === undefined) return null

  const externalSalesUrl = normalizeExternalSalesUrl(sales.externalSalesUrl)
  const preparation: DomainPreparationFacts = Object.freeze({
    logo,
    favicon,
    description,
    landingPage,
    sales: Object.freeze({
      askingPrice: sales.askingPrice,
      currency,
      externalSalesUrl: externalSalesUrl.value,
      ctaConfigured: sales.ctaConfigured,
    }),
  })

  return Object.freeze({
    hostname,
    ownershipConfirmed: input.ownershipConfirmed,
    sourceOpportunityId,
    preparation,
    externalSalesUrlStatus: externalSalesUrl.status,
  })
}


import type { PreparationGenerationResult } from './generation.types'

export const LANDING_PAGE_RENDER_READINESS_STATES = Object.freeze([
  'NOT_RENDERABLE',
  'RENDERABLE_WITH_PLACEHOLDERS',
  'FULLY_RENDERABLE',
] as const)

export type LandingPageRenderReadiness =
  (typeof LANDING_PAGE_RENDER_READINESS_STATES)[number]

export const LANDING_PAGE_RENDER_REASONS = Object.freeze([
  'HOSTNAME_INVALID',
  'PAGE_TITLE_INVALID',
  'META_DESCRIPTION_INVALID',
  'OPEN_GRAPH_TITLE_INVALID',
  'OPEN_GRAPH_DESCRIPTION_INVALID',
  'HERO_HEADLINE_INVALID',
  'HERO_DESCRIPTION_INVALID',
  'ASKING_PRICE_INVALID',
  'CURRENCY_INVALID',
  'CTA_LABEL_INVALID',
  'SALES_URL_INVALID',
  'LOGO_PLACEHOLDER',
  'FAVICON_PLACEHOLDER',
  'OPEN_GRAPH_IMAGE_PLACEHOLDER',
] as const)

export type LandingPageRenderReason =
  (typeof LANDING_PAGE_RENDER_REASONS)[number]

export const LANDING_PAGE_SECTIONS = Object.freeze([
  'HERO',
  'VALUE_PROPOSITION',
  'DOMAIN_DETAILS',
  'PRICE',
  'CTA',
  'FOOTER',
] as const)

export type LandingPageSection = (typeof LANDING_PAGE_SECTIONS)[number]
export type LandingPageAssetRenderState = 'AVAILABLE' | 'PLACEHOLDER'

export interface LandingPageRenderAsset {
  readonly state: LandingPageAssetRenderState
  readonly reference: string | null
}

export interface LandingPageRenderModel {
  readonly hostname: string | null
  readonly pageTitle: string | null
  readonly metaDescription: string | null
  readonly openGraph: Readonly<{
    title: string | null
    description: string | null
    image: LandingPageRenderAsset
  }>
  readonly favicon: LandingPageRenderAsset
  readonly logo: LandingPageRenderAsset
  readonly hero: Readonly<{
    headline: string | null
    description: string | null
  }>
  readonly domainDisplayName: string | null
  readonly price: Readonly<{
    askingPrice: number | null
    currency: string | null
  }>
  readonly cta: Readonly<{
    label: string | null
    externalSalesUrl: string | null
  }>
  readonly sectionOrder: readonly LandingPageSection[]
  readonly readiness: Readonly<{
    state: LandingPageRenderReadiness
    reasons: readonly LandingPageRenderReason[]
  }>
}

export type LandingPageRenderInput = PreparationGenerationResult


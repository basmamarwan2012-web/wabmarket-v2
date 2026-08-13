import {
  createTemplateText,
  normalizePreparationGenerationInput,
} from './generation.helpers'
import {
  buildLandingPageHeadline,
  buildPreparationDescription,
  buildSeoDescription,
  buildSeoTitle,
  PREPARATION_CTA_LABEL,
} from './templates'
import type {
  PreparationGenerationInput,
  PreparationGenerationResult,
  PreparationGenerator,
} from './generation.types'

export const generatePreparationAssetsAndContent = (
  input: PreparationGenerationInput
): PreparationGenerationResult | null => {
  const normalized = normalizePreparationGenerationInput(input)
  if (!normalized) return null

  const description = normalized.manualDescription
    ? Object.freeze({ value: normalized.manualDescription, source: 'MANUAL' as const })
    : createTemplateText(buildPreparationDescription(normalized))
  const headline = createTemplateText(buildLandingPageHeadline(normalized))
  const seoTitle = createTemplateText(buildSeoTitle(normalized))
  const seoDescription = createTemplateText(buildSeoDescription(normalized))

  return Object.freeze({
    hostname: normalized.hostname,
    description,
    landingPage: Object.freeze({
      headline,
      description,
      askingPrice: normalized.askingPrice,
      currency: normalized.currency,
      cta: Object.freeze({
        label: createTemplateText(PREPARATION_CTA_LABEL),
        externalSalesUrl: normalized.externalSalesUrl,
      }),
    }),
    seo: Object.freeze({
      title: seoTitle,
      description: seoDescription,
    }),
    openGraph: Object.freeze({
      title: seoTitle,
      description: seoDescription,
      image: normalized.openGraphImage,
    }),
    assets: Object.freeze({
      logo: normalized.logo,
      favicon: normalized.favicon,
    }),
  })
}

export class DeterministicPreparationGenerator implements PreparationGenerator {
  generate(input: PreparationGenerationInput) {
    return generatePreparationAssetsAndContent(input)
  }
}

export type {
  PreparationAssetInput,
  PreparationAssetInputSource,
  PreparationAssetSlot,
  PreparationAssetStatus,
  PreparationGeneratedText,
  PreparationGenerationInput,
  PreparationGenerationResult,
  PreparationGenerationSource,
  PreparationGenerator,
  PreparationLandingPageConfiguration,
  PreparationOpenGraphMetadata,
  PreparationSeoMetadata,
} from './generation.types'

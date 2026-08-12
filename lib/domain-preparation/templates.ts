import type { NormalizedPreparationGenerationInput } from './generation.helpers'

const capitalizeWords = (value: string) =>
  value.replace(/\b[a-z]/g, (character) => character.toUpperCase())

const resolveSubject = (input: NormalizedPreparationGenerationInput) =>
  input.category ?? input.primaryKeyword

export const buildPreparationDescription = (
  input: NormalizedPreparationGenerationInput
) => {
  const subject = resolveSubject(input)
  const context = [subject, input.city].filter(
    (value): value is string => value !== null
  )

  if (context.length === 0)
    return `${input.hostname} is a memorable premium domain available for acquisition.`

  const contextText = capitalizeWords(context.join(' in '))
  return `${input.hostname} is a memorable premium domain suited to ${contextText}.`
}

export const buildLandingPageHeadline = (
  input: NormalizedPreparationGenerationInput
) => `${input.hostname} is available`

export const buildSeoTitle = (input: NormalizedPreparationGenerationInput) =>
  `${input.hostname} | Premium Domain for Sale`

export const buildSeoDescription = (
  input: NormalizedPreparationGenerationInput
) => buildPreparationDescription(input)

export const PREPARATION_CTA_LABEL = 'View Purchase Options'


import { z } from 'zod'

const requiredText = (label: string, min = 1) =>
  z
    .string()
    .trim()
    .min(min, `${label} is required.`)
    .max(100, `${label} must be 100 characters or fewer.`)

const optionalText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() || null)

export const discoveryCreateSchema = z
  .object({
    keyword: requiredText('Keyword', 2),
    city: requiredText('City'),
    state: optionalText,
    country: requiredText('Country'),
    language: optionalText,
    maxResults: z.coerce
      .number()
      .int('Max results must be a whole number.')
      .min(1)
      .max(100),
  })
  .strict()

export const discoveryTransitionSchema = z
  .object({
    status: z.enum(['processing', 'completed', 'failed']),
  })
  .strict()

export const discoveryListQuerySchema = z
  .object({
    order: z.literal('desc').default('desc'),
    pageSize: z.coerce
      .number()
      .int()
      .refine((value) => [10, 20, 50].includes(value))
      .default(20),
    cursor: z.string().min(1).optional(),
  })
  .strict()

export type DiscoveryCreateInput = z.infer<typeof discoveryCreateSchema>
export type DiscoveryCreateFormInput = z.input<typeof discoveryCreateSchema>
export type DiscoveryTransitionInput = z.infer<typeof discoveryTransitionSchema>

import { z } from 'zod'

import { DOMAIN_STATUSES } from '@/types/domain'
import {
  isValidDomainName,
  MAX_SEARCH_PREFIX_LENGTH,
  normalizeDomainName,
} from './normalization'

const optionalText = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value) => value?.trim() || null)

const optionalUrl = z
  .union([
    z.string().url('Enter a valid URL.'),
    z.literal(''),
    z.null(),
    z.undefined(),
  ])
  .transform((value) => value || null)

const optionalDate = z
  .union([z.string(), z.null(), z.undefined()])
  .transform((value, context) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid date.',
      })
      return z.NEVER
    }
    return date.toISOString()
  })

const money = z.coerce.number().finite().min(0, 'Value cannot be negative.')

export const domainCreateSchema = z
  .object({
    domainName: z
      .string()
      .transform(normalizeDomainName)
      .refine(isValidDomainName, {
        message: 'Enter a valid domain name, such as example.com.',
      }),
    registrar: optionalText,
    keyword: optionalText,
    city: optionalText,
    state: optionalText,
    country: optionalText,
    purchasePrice: money,
    estimatedPrice: money,
    askingPrice: money,
    flipScore: z.coerce.number().finite().min(0).max(100),
    status: z.enum(DOMAIN_STATUSES),
    purchaseDate: optionalDate,
    expirationDate: optionalDate,
    renewalDate: optionalDate,
    autoRenew: z.boolean().default(false),
    nameservers: z
      .array(z.string().trim().min(1, 'Nameservers cannot be empty.'))
      .max(20)
      .transform((items) => Array.from(new Set(items))),
    afternicCheckoutLink: optionalUrl,
    landingPageUrl: optionalUrl,
    description: optionalText,
  })
  .strict()

export const domainPatchSchema = domainCreateSchema
  .partial()
  .strict()
  .refine(
    (value) => Object.keys(value).length > 0,
    'At least one field must be provided.'
  )

export const domainListQuerySchema = z
  .object({
    search: z
      .string()
      .trim()
      .toLowerCase()
      .max(MAX_SEARCH_PREFIX_LENGTH)
      .optional(),
    status: z.enum(DOMAIN_STATUSES).optional(),
    registrar: z.string().trim().min(1).optional(),
    deleted: z.enum(['active', 'deleted']).default('active'),
    sort: z
      .enum([
        'createdAt',
        'expirationDate',
        'flipScore',
        'purchasePrice',
        'askingPrice',
      ])
      .default('createdAt'),
    order: z.enum(['asc', 'desc']).default('desc'),
    pageSize: z.coerce
      .number()
      .int()
      .refine((value) => [10, 20, 50, 100].includes(value))
      .default(20),
    cursor: z.string().min(1).optional(),
  })
  .strict()
  .superRefine((value, context) => {
    const activeFilters = [value.search, value.status, value.registrar].filter(
      Boolean
    )
    if (activeFilters.length > 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Search, status, and registrar filters cannot be combined.',
      })
    }
    if (activeFilters.length > 0 && value.sort !== 'createdAt') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sort'],
        message: 'Filtered results support created-date sorting only.',
      })
    }
  })

export type DomainCreateInput = z.infer<typeof domainCreateSchema>
export type DomainCreateFormInput = z.input<typeof domainCreateSchema>
export type DomainPatchInput = z.infer<typeof domainPatchSchema>

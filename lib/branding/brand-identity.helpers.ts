import { createHash } from 'node:crypto'

import { normalizeBusinessName, normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type { BrandIdentityInput } from './brand-identity.types'

export interface NormalizedBrandIdentityInput {
  readonly hostname: string
  readonly displayName: string
  readonly category: string | null
  readonly primaryKeyword: string | null
  readonly city: string | null
}

const optional = (value: unknown) => value === null || value === undefined ? null : normalizeBusinessName(value)

export const normalizeBrandIdentityInput = (input: BrandIdentityInput): NormalizedBrandIdentityInput | null => {
  const hostname = normalizeHostname(input.hostname)
  const displayName = normalizeBusinessName(input.displayName)
  const category = optional(input.category)
  const primaryKeyword = optional(input.primaryKeyword)
  const city = optional(input.city)
  if (!hostname || !displayName || (input.category != null && !category) || (input.primaryKeyword != null && !primaryKeyword) || (input.city != null && !city)) return null
  return Object.freeze({ hostname, displayName, category, primaryKeyword, city })
}

export const createBrandSeed = (input: NormalizedBrandIdentityInput) =>
  createHash('sha256').update(JSON.stringify(['brand-identity:v1', input.hostname, input.displayName, input.category, input.primaryKeyword, input.city])).digest('hex')

export const createMonogram = (displayName: string) => {
  const tokens = displayName.split(' ').filter(Boolean)
  return (tokens.length > 1 ? `${tokens[0][0]}${tokens[1][0]}` : tokens[0].slice(0, 2)).toUpperCase()
}

export const createFactualTagline = (input: NormalizedBrandIdentityInput) => {
  const subject = input.category ?? input.primaryKeyword
  if (subject && input.city) return `${subject} · ${input.city}`
  return subject ?? input.city
}

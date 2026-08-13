import { createBrandSeed, createFactualTagline, createMonogram, normalizeBrandIdentityInput } from './brand-identity.helpers'
import type { BrandIdentity, BrandIdentityInput } from './brand-identity.types'
import { resolveBrandStylePolicy } from './style-policy'

export const createBrandIdentity = (input: BrandIdentityInput): BrandIdentity | null => {
  const normalized = normalizeBrandIdentityInput(input)
  if (!normalized) return null
  const seed = createBrandSeed(normalized)
  const style = resolveBrandStylePolicy(seed)
  return Object.freeze({
    version: 'brand-identity:v1', seed, hostname: normalized.hostname,
    brandName: normalized.displayName, monogram: createMonogram(normalized.displayName),
    tagline: createFactualTagline(normalized),
    explicitContext: Object.freeze({ category: normalized.category, primaryKeyword: normalized.primaryKeyword, city: normalized.city }),
    ...style,
  })
}

export type { BrandIdentity, BrandIdentityInput } from './brand-identity.types'

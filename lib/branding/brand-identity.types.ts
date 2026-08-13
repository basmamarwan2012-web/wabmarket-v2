export const BRAND_STYLE_PROFILES = Object.freeze([
  'MODERN', 'PREMIUM', 'PROFESSIONAL', 'BOLD', 'MINIMAL',
] as const)
export type BrandStyleProfile = (typeof BRAND_STYLE_PROFILES)[number]

export interface BrandIdentityInput {
  readonly hostname: string
  readonly displayName: string
  readonly category?: string | null
  readonly primaryKeyword?: string | null
  readonly city?: string | null
}

export interface BrandPaletteProfile {
  readonly id: string
  readonly background: string
  readonly foreground: string
  readonly accent: string
  readonly muted: string
}

export interface BrandTypographyProfile {
  readonly id: 'GEOMETRIC' | 'HUMANIST' | 'CLASSIC' | 'CONDENSED' | 'NEUTRAL'
  readonly letterSpacing: 'TIGHT' | 'NORMAL' | 'WIDE'
  readonly weight: 'MEDIUM' | 'SEMIBOLD' | 'BOLD'
}

export interface BrandIdentity {
  readonly version: 'brand-identity:v1'
  readonly seed: string
  readonly hostname: string
  readonly brandName: string
  readonly monogram: string
  readonly tagline: string | null
  readonly explicitContext: Readonly<{
    category: string | null
    primaryKeyword: string | null
    city: string | null
  }>
  readonly styleProfile: BrandStyleProfile
  readonly paletteProfile: BrandPaletteProfile
  readonly typographyProfile: BrandTypographyProfile
}

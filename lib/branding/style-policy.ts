import type { BrandPaletteProfile, BrandStyleProfile, BrandTypographyProfile } from './brand-identity.types'

const PALETTES = Object.freeze([
  Object.freeze({ id: 'MIDNIGHT_GOLD', background: '#0B1020', foreground: '#F8FAFC', accent: '#D6A84B', muted: '#7C879F' }),
  Object.freeze({ id: 'NAVY_SKY', background: '#10233F', foreground: '#F7FBFF', accent: '#54B8FF', muted: '#8DA2BE' }),
  Object.freeze({ id: 'FOREST_MINT', background: '#102A25', foreground: '#F4FFF9', accent: '#5CE0B1', muted: '#8DAFA4' }),
  Object.freeze({ id: 'PLUM_ROSE', background: '#2A142D', foreground: '#FFF8FF', accent: '#EE7EA6', muted: '#B69BB8' }),
  Object.freeze({ id: 'CHARCOAL_COPPER', background: '#1E2024', foreground: '#FAFAF8', accent: '#D98752', muted: '#999C9F' }),
] as const satisfies readonly BrandPaletteProfile[])

const TYPOGRAPHY = Object.freeze([
  Object.freeze({ id: 'GEOMETRIC', letterSpacing: 'NORMAL', weight: 'BOLD' }),
  Object.freeze({ id: 'HUMANIST', letterSpacing: 'NORMAL', weight: 'SEMIBOLD' }),
  Object.freeze({ id: 'CLASSIC', letterSpacing: 'WIDE', weight: 'SEMIBOLD' }),
  Object.freeze({ id: 'CONDENSED', letterSpacing: 'TIGHT', weight: 'BOLD' }),
  Object.freeze({ id: 'NEUTRAL', letterSpacing: 'NORMAL', weight: 'MEDIUM' }),
] as const satisfies readonly BrandTypographyProfile[])

const STYLES = Object.freeze(['MODERN', 'PREMIUM', 'PROFESSIONAL', 'BOLD', 'MINIMAL'] as const satisfies readonly BrandStyleProfile[])
const value = (seed: string, offset: number) => Number.parseInt(seed.slice(offset, offset + 8), 16)

export const resolveBrandStylePolicy = (seed: string) => Object.freeze({
  styleProfile: STYLES[value(seed, 0) % STYLES.length],
  paletteProfile: PALETTES[value(seed, 8) % PALETTES.length],
  typographyProfile: TYPOGRAPHY[value(seed, 16) % TYPOGRAPHY.length],
})

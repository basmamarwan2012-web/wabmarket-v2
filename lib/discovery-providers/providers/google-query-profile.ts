import type { DiscoverySearchMode } from '@/types/discovery-provider'

export const GOOGLE_RESULT_QUALITY_THRESHOLD = 65 as const

export interface GoogleQueryProfile {
  readonly mode: 'business_upgrade' | 'local_seo'
  readonly exactTerms: string | null
  readonly excludeTerms: string
  readonly orTerms: string
  readonly safe: 'active'
  readonly filter: '1'
  readonly acceptedProtocols: readonly ['http:', 'https:']
  readonly minimumQualityScore: typeof GOOGLE_RESULT_QUALITY_THRESHOLD
}

const common = Object.freeze({
  exactTerms: null,
  excludeTerms: 'jobs careers hiring salary',
  safe: 'active' as const,
  filter: '1' as const,
  acceptedProtocols: Object.freeze(['http:', 'https:'] as const),
  minimumQualityScore: GOOGLE_RESULT_QUALITY_THRESHOLD,
})

const profiles: Readonly<Record<GoogleQueryProfile['mode'], GoogleQueryProfile>> =
  Object.freeze({
    business_upgrade: Object.freeze({
      ...common,
      mode: 'business_upgrade',
      orTerms: 'contact services company',
    }),
    local_seo: Object.freeze({
      ...common,
      mode: 'local_seo',
      orTerms: 'contact services locations quote',
    }),
  })

export function getGoogleQueryProfile(
  mode: DiscoverySearchMode
): GoogleQueryProfile | null {
  if (mode !== 'business_upgrade' && mode !== 'local_seo') return null
  return profiles[mode]
}

import type { DiscoveryProviderCriteria } from '@/types/discovery-provider'

const GOOGLE_LANGUAGE_RESTRICTIONS = Object.freeze({
  en: 'lang_en',
  fr: 'lang_fr',
  es: 'lang_es',
  ar: 'lang_ar',
} as const)

const normalizeWhitespace = (value: string) =>
  value.trim().replace(/\s+/g, ' ')

export function buildGoogleBusinessQuery(
  criteria: Readonly<DiscoveryProviderCriteria>
): string {
  return [criteria.keyword, criteria.city, criteria.state, criteria.country]
    .filter((value): value is string => Boolean(value?.trim()))
    .map(normalizeWhitespace)
    .join(' ')
}

export function mapGoogleLanguageRestriction(
  language: string | null | undefined
): string | null {
  const normalized = language?.trim().toLowerCase()
  if (!normalized) return null
  return (
    GOOGLE_LANGUAGE_RESTRICTIONS[
      normalized as keyof typeof GOOGLE_LANGUAGE_RESTRICTIONS
    ] ?? null
  )
}

export function normalizeGoogleMaxResults(
  maxResults: number | null | undefined
): number | null {
  if (maxResults === null || maxResults === undefined) return 10
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 10)
    return null
  return maxResults
}

export function normalizeGoogleResultUrl(value: string): {
  website: string
  currentDomain: string
} | null {
  const website = value.trim()
  try {
    const parsed = new URL(website)
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null
    const hostname = parsed.hostname.toLowerCase().replace(/^www\./, '')
    if (!hostname) return null
    return { website, currentDomain: hostname }
  } catch {
    return null
  }
}

import type { DiscoveryProviderCriteria } from '@/types/discovery-provider'
import type { GoogleCustomSearchItem } from './google-discovery.types'
import { normalizeGoogleResultUrl } from './google-discovery.helpers'
import type { GoogleQueryProfile } from './google-query-profile'

export const GOOGLE_BLOCKED_HOSTS = Object.freeze([
  'facebook.com',
  'instagram.com',
  'linkedin.com',
  'twitter.com',
  'x.com',
  'tiktok.com',
  'youtube.com',
  'vimeo.com',
  'wikipedia.org',
  'indeed.com',
  'glassdoor.com',
  'ziprecruiter.com',
  'monster.com',
  'yelp.com',
  'yellowpages.com',
  'foursquare.com',
  'tripadvisor.com',
  'trustpilot.com',
  'scribd.com',
  'issuu.com',
  'slideshare.net',
  'google.com',
  'webcache.googleusercontent.com',
] as const)

const rejectedExtensions = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', '7z',
  'csv', 'txt', 'xml', 'jpg', 'jpeg', 'png', 'gif', 'webp', 'svg',
])
const businessTerms = new Set(['contact', 'services', 'service', 'about', 'quote', 'locations', 'location', 'company'])
const jobsTerms = new Set(['jobs', 'job', 'careers', 'career', 'hiring', 'salary'])
const articleTerms = new Set(['blog', 'news', 'article', 'articles'])

export type GoogleQualitySignal =
  | 'valid_website'
  | 'homepage'
  | 'shallow_path'
  | 'keyword_in_title'
  | 'keyword_in_snippet'
  | 'location_in_title'
  | 'location_in_snippet'
  | 'business_language'
  | 'standalone_hostname'
  | 'jobs_language'
  | 'article_language'
  | 'directory_language'
  | 'deep_path'
  | 'missing_source_text'

export type GooglePrimaryRejectionReason =
  | 'invalid_url'
  | 'unsupported_protocol'
  | 'local_or_private_host'
  | 'blocked_host'
  | 'downloadable_resource'
  | 'below_threshold'
  | 'duplicate_host'

export interface AcceptedGoogleResult {
  readonly item: GoogleCustomSearchItem
  readonly originalIndex: number
  readonly website: string
  readonly currentDomain: string
  readonly qualityScore: number
  readonly positiveSignals: readonly GoogleQualitySignal[]
  readonly negativeSignals: readonly GoogleQualitySignal[]
}

export interface GoogleQualityDiagnostics {
  readonly googleResultsReceived: number
  readonly acceptedResults: number
  readonly hardRejectedResults: number
  readonly belowThresholdResults: number
  readonly duplicateHostResults: number
  readonly blockedHostResults: number
  readonly invalidUrlResults: number
  readonly nonWebsiteResults: number
  readonly acceptedDomains: readonly string[]
  readonly rejectionReasonCounts: Readonly<Record<GooglePrimaryRejectionReason, number>>
}

export interface GoogleQualityGateResult {
  readonly accepted: readonly AcceptedGoogleResult[]
  readonly diagnostics: GoogleQualityDiagnostics
}

const normalizeText = (value: string | null) =>
  (value ?? '').toLowerCase().replace(/\s+/g, ' ').trim()
const tokens = (value: string) => value.match(/[\p{L}\p{N}]+/gu) ?? []
const includesPhrase = (text: string, phrase: string | null | undefined) => {
  const phraseTokens = tokens(normalizeText(phrase ?? ''))
  if (phraseTokens.length === 0) return false
  const textTokens = tokens(text)
  return textTokens.some((_, index) =>
    phraseTokens.every((token, offset) => textTokens[index + offset] === token)
  )
}
const hasAnyToken = (values: readonly string[], candidates: ReadonlySet<string>) =>
  values.some((value) => candidates.has(value))
const matchesHost = (hostname: string, blocked: string) =>
  hostname === blocked || hostname.endsWith(`.${blocked}`)
const isBlockedHost = (hostname: string) =>
  GOOGLE_BLOCKED_HOSTS.some((blocked) => matchesHost(hostname, blocked))
const isIpv4 = (hostname: string) => /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname)
const isPrivateIpv4 = (hostname: string) => {
  if (!isIpv4(hostname)) return false
  const parts = hostname.split('.').map(Number)
  if (parts.some((part) => part < 0 || part > 255)) return true
  return parts[0] === 10 || parts[0] === 127 ||
    (parts[0] === 169 && parts[1] === 254) ||
    (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
    (parts[0] === 192 && parts[1] === 168)
}
const isPrivateIpv6 = (hostname: string) => {
  const value = hostname.replace(/^\[|\]$/g, '').toLowerCase()
  return value === '::1' || /^fe[89ab]/.test(value) || /^f[cd]/.test(value)
}
const isLocalOrPrivateHost = (hostname: string) =>
  hostname === 'localhost' || hostname.endsWith('.localhost') ||
  hostname.endsWith('.local') || hostname.endsWith('.test') ||
  isPrivateIpv4(hostname) || hostname.includes(':') && isPrivateIpv6(hostname)
const hasRejectedExtension = (pathname: string) => {
  const filename = pathname.split('/').pop() ?? ''
  const extension = filename.includes('.') ? filename.split('.').pop()?.toLowerCase() : null
  return extension ? rejectedExtensions.has(extension) : false
}
const isPlausibleHostname = (hostname: string) =>
  !isIpv4(hostname) && !hostname.includes(':') && hostname.includes('.') &&
  hostname.split('.').every((label) => /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label))

const isDirectoryLanguage = (
  text: string,
  hostnameTokens: readonly string[],
  pathTokens: readonly string[]
) => {
  const phrases = ['business directory', 'company listings', 'customer reviews', 'read reviews', 'top 10']
  return phrases.some((phrase) => includesPhrase(text, phrase)) ||
    [...hostnameTokens, ...pathTokens].some((token) =>
      token === 'directory' || token === 'listings'
    )
}

function hardRejection(
  item: GoogleCustomSearchItem,
  profile: GoogleQueryProfile
): {
  reason: GooglePrimaryRejectionReason
  category: 'invalid' | 'blocked' | 'non_website'
} | null {
  let parsedInput: URL
  try {
    parsedInput = new URL(item.link)
  } catch {
    return { reason: 'invalid_url', category: 'invalid' }
  }
  if (!profile.acceptedProtocols.includes(parsedInput.protocol as 'http:' | 'https:'))
    return { reason: 'unsupported_protocol', category: 'non_website' }
  const normalized = normalizeGoogleResultUrl(item.link)
  if (!normalized) return { reason: 'invalid_url', category: 'invalid' }
  const parsed = new URL(normalized.website)
  if (isLocalOrPrivateHost(normalized.currentDomain))
    return { reason: 'local_or_private_host', category: 'non_website' }
  if (isBlockedHost(normalized.currentDomain))
    return { reason: 'blocked_host', category: 'blocked' }
  if (hasRejectedExtension(parsed.pathname))
    return { reason: 'downloadable_resource', category: 'non_website' }
  return null
}

function scoreResult(
  item: GoogleCustomSearchItem,
  criteria: Readonly<DiscoveryProviderCriteria>,
  originalIndex: number
): AcceptedGoogleResult {
  const normalized = normalizeGoogleResultUrl(item.link)!
  const parsed = new URL(normalized.website)
  const pathSegments = parsed.pathname.split('/').filter(Boolean)
  const title = normalizeText(item.title)
  const snippet = normalizeText(item.snippet)
  const combined = `${title} ${snippet}`.trim()
  const combinedTokens = tokens(combined)
  const pathTokens = tokens(pathSegments.join(' '))
  const hostnameTokens = tokens(normalized.currentDomain.replace(/\./g, ' '))
  const positive: GoogleQualitySignal[] = ['valid_website']
  const negative: GoogleQualitySignal[] = []
  let score = 30

  if (pathSegments.length === 0) { score += 18; positive.push('homepage') }
  else if (pathSegments.length <= 2) { score += 10; positive.push('shallow_path') }
  else if (pathSegments.length >= 4) { score -= 15; negative.push('deep_path') }
  if (includesPhrase(title, criteria.keyword)) { score += 15; positive.push('keyword_in_title') }
  if (includesPhrase(snippet, criteria.keyword)) { score += 10; positive.push('keyword_in_snippet') }
  const locations = [criteria.city, criteria.state].filter((value): value is string => Boolean(value?.trim()))
  if (locations.some((location) => includesPhrase(title, location))) { score += 10; positive.push('location_in_title') }
  else if (locations.some((location) => includesPhrase(snippet, location))) { score += 10; positive.push('location_in_snippet') }
  if (hasAnyToken([...combinedTokens, ...pathTokens], businessTerms)) { score += 12; positive.push('business_language') }
  if (isPlausibleHostname(normalized.currentDomain)) { score += 5; positive.push('standalone_hostname') }
  if (hasAnyToken(combinedTokens, jobsTerms)) { score -= 35; negative.push('jobs_language') }
  if (hasAnyToken([...combinedTokens, ...pathTokens], articleTerms)) { score -= 20; negative.push('article_language') }
  if (isDirectoryLanguage(combined, hostnameTokens, pathTokens)) { score -= 25; negative.push('directory_language') }
  if (!title && !snippet) { score -= 15; negative.push('missing_source_text') }

  return Object.freeze({
    item,
    originalIndex,
    website: normalized.website,
    currentDomain: normalized.currentDomain,
    qualityScore: Math.max(0, Math.min(100, score)),
    positiveSignals: Object.freeze(positive),
    negativeSignals: Object.freeze(negative),
  })
}

export function applyGoogleResultQualityGate(
  items: readonly GoogleCustomSearchItem[],
  criteria: Readonly<DiscoveryProviderCriteria>,
  profile: GoogleQueryProfile
): GoogleQualityGateResult {
  const counts: Record<GooglePrimaryRejectionReason, number> = {
    invalid_url: 0,
    unsupported_protocol: 0,
    local_or_private_host: 0,
    blocked_host: 0,
    downloadable_resource: 0,
    below_threshold: 0,
    duplicate_host: 0,
  }
  let hardRejectedResults = 0
  let blockedHostResults = 0
  let invalidUrlResults = 0
  let nonWebsiteResults = 0
  const eligible: AcceptedGoogleResult[] = []

  items.forEach((item, index) => {
    const rejection = hardRejection(item, profile)
    if (rejection) {
      counts[rejection.reason] += 1
      hardRejectedResults += 1
      if (rejection.category === 'blocked') blockedHostResults += 1
      if (rejection.category === 'invalid') invalidUrlResults += 1
      if (rejection.category === 'non_website') nonWebsiteResults += 1
      return
    }
    const scored = scoreResult(item, criteria, index)
    if (scored.qualityScore < profile.minimumQualityScore) {
      counts.below_threshold += 1
      return
    }
    eligible.push(scored)
  })

  const winners = new Map<string, AcceptedGoogleResult>()
  eligible.forEach((candidate) => {
    const current = winners.get(candidate.currentDomain)
    if (!current) { winners.set(candidate.currentDomain, candidate); return }
    counts.duplicate_host += 1
    if (candidate.qualityScore > current.qualityScore)
      winners.set(candidate.currentDomain, candidate)
  })
  const accepted = Object.freeze(
    [...winners.values()].sort((a, b) => a.originalIndex - b.originalIndex)
  )
  const diagnostics: GoogleQualityDiagnostics = Object.freeze({
    googleResultsReceived: items.length,
    acceptedResults: accepted.length,
    hardRejectedResults,
    belowThresholdResults: counts.below_threshold,
    duplicateHostResults: counts.duplicate_host,
    blockedHostResults,
    invalidUrlResults,
    nonWebsiteResults,
    acceptedDomains: Object.freeze(accepted.map((result) => result.currentDomain)),
    rejectionReasonCounts: Object.freeze({ ...counts }),
  })
  return Object.freeze({ accepted, diagnostics })
}

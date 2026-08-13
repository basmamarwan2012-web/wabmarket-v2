import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'

/** Pure route-boundary normalization; arbitrary parameters never create records. */
export const normalizeMarketplaceRouteHostname = (value: unknown) => {
  if (typeof value !== 'string') return null

  let decoded: string
  try {
    decoded = decodeURIComponent(value)
  } catch {
    return null
  }

  const normalized = normalizeHostname(decoded)
  return normalized !== null && normalized === decoded.toLowerCase()
    ? normalized
    : null
}

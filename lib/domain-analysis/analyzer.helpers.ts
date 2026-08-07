import type { HostnameParsingFacts } from './analyzer.types'

const MAXIMUM_BUSINESS_NAME_LENGTH = 512

export const normalizeBusinessName = (value: unknown) => {
  if (typeof value !== 'string') return null

  const normalized = value
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\p{P}\p{S}]+/gu, ' ')
    .trim()
    .replace(/\s+/g, ' ')

  return normalized.length > 0 &&
    normalized.length <= MAXIMUM_BUSINESS_NAME_LENGTH
    ? normalized
    : null
}

const isValidHostname = (hostname: string) => {
  if (hostname.length > 253 || !hostname.includes('.')) return false

  return hostname
    .split('.')
    .every(
      (label) =>
        label.length > 0 &&
        label.length <= 63 &&
        /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(label)
    )
}

export const normalizeHostname = (value: unknown) => {
  if (typeof value !== 'string') return null

  const hostname = value
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/\.$/, '')
    .replace(/^www\./, '')

  return isValidHostname(hostname) ? hostname : null
}

/**
 * Parses labels factually. The candidate fields do not resolve public suffixes
 * and cannot authoritatively split names such as example.co.uk.
 */
export const parseHostname = (hostname: string): HostnameParsingFacts => {
  const hostnameLabels = Object.freeze(hostname.split('.'))
  const rightmostLabel = hostnameLabels.at(-1) ?? ''
  const immediateLeftLabel = hostnameLabels.at(-2) ?? null
  const subdomainLabelsCandidate = Object.freeze(hostnameLabels.slice(0, -2))

  return Object.freeze({
    hostname,
    hostnameLabels,
    rightmostLabel,
    immediateLeftLabel,
    subdomainLabelsCandidate,
    hasSubdomain: hostnameLabels.length > 2,
    publicSuffixResolution: 'unavailable',
    authoritativeEtldPlusOne: null,
  })
}

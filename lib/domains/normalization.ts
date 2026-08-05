export const MAX_SEARCH_PREFIX_LENGTH = 64

export function normalizeDomainName(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//i, '')
    .split(/[/?#]/, 1)[0]
    .replace(/\.$/, '')
}

export function isValidDomainName(value: string) {
  if (value.length < 3 || value.length > 253 || value.includes(':')) {
    return false
  }

  const labels = value.split('.')
  if (labels.length < 2) return false

  const labelPattern = /^(?!-)[a-z0-9-]{1,63}(?<!-)$/
  const tld = labels.at(-1) ?? ''

  return (
    labels.every((label) => labelPattern.test(label)) &&
    (/^[a-z]{2,63}$/.test(tld) || /^xn--[a-z0-9-]{2,59}$/.test(tld))
  )
}

export function createSearchPrefixes(normalizedDomainName: string) {
  const length = Math.min(normalizedDomainName.length, MAX_SEARCH_PREFIX_LENGTH)
  return Array.from(
    new Set(
      Array.from({ length }, (_, index) =>
        normalizedDomainName.slice(0, index + 1)
      )
    )
  )
}

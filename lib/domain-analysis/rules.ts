import type { BusinessLegalSuffix } from './analyzer.types'

const LEGAL_SUFFIX_BY_TOKEN: Readonly<Record<string, BusinessLegalSuffix>> =
  Object.freeze({
    llc: 'llc',
    inc: 'inc',
    corp: 'corp',
    corporation: 'corporation',
    ltd: 'ltd',
    limited: 'limited',
    company: 'company',
    co: 'co',
  })

export interface LegalSuffixFacts {
  readonly containsLegalSuffix: boolean
  readonly legalSuffixes: readonly BusinessLegalSuffix[]
  readonly tokensWithoutLegalSuffixes: readonly string[]
}

export const detectBusinessLegalSuffixes = (
  businessTokens: readonly string[]
): LegalSuffixFacts => {
  const legalSuffixes: BusinessLegalSuffix[] = []
  let suffixStart = businessTokens.length

  while (suffixStart > 1) {
    const token = businessTokens[suffixStart - 1]
    const suffix = LEGAL_SUFFIX_BY_TOKEN[token]
    if (!suffix) break
    legalSuffixes.unshift(suffix)
    suffixStart -= 1
  }

  return Object.freeze({
    containsLegalSuffix: legalSuffixes.length > 0,
    legalSuffixes: Object.freeze(legalSuffixes),
    tokensWithoutLegalSuffixes: Object.freeze(
      businessTokens.slice(0, suffixStart)
    ),
  })
}

export interface DomainWeaknessFacts {
  readonly isDotCom: boolean
  readonly isNonDotCom: boolean
  readonly hasHyphen: boolean
  readonly hasNumericCharacters: boolean
  readonly hasBasicDomainWeakness: boolean
}

export const detectDomainWeaknessFacts = (
  hostname: string
): DomainWeaknessFacts => {
  const isDotCom = hostname.endsWith('.com')
  const isNonDotCom = !isDotCom
  const hasHyphen = hostname.includes('-')
  const hasNumericCharacters = /\d/.test(hostname)

  return Object.freeze({
    isDotCom,
    isNonDotCom,
    hasHyphen,
    hasNumericCharacters,
    hasBasicDomainWeakness: isNonDotCom || hasHyphen,
  })
}

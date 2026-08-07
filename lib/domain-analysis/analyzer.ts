import type {
  BusinessNameFacts,
  DomainAnalyzerInput,
  DomainAnalyzerResult,
  DomainFacts,
  DomainOpportunityAnalysis,
} from './analyzer.types'
import {
  normalizeBusinessName,
  normalizeHostname,
  parseHostname,
} from './analyzer.helpers'
import { detectBusinessLegalSuffixes, detectDomainWeaknessFacts } from './rules'
import {
  tokenizeHostnameLabels,
  tokenizeNormalizedBusinessName,
} from './tokenizer'

const failure = (
  reason: Extract<DomainAnalyzerResult, { success: false }>['reason']
): DomainAnalyzerResult => Object.freeze({ success: false, reason })

export const analyzeDomainOpportunity = (
  input: DomainAnalyzerInput
): DomainAnalyzerResult => {
  if (!input || typeof input !== 'object') return failure('invalid_input')

  const normalizedBusinessName = normalizeBusinessName(input.businessName)
  if (!normalizedBusinessName) return failure('invalid_business_name')

  const hostname = normalizeHostname(input.domain)
  if (!hostname) return failure('invalid_hostname')

  const businessTokens = tokenizeNormalizedBusinessName(normalizedBusinessName)
  const legalSuffixFacts = detectBusinessLegalSuffixes(businessTokens)
  const business = Object.freeze({
    originalBusinessName: input.businessName,
    normalizedBusinessName,
    businessTokens,
    businessTokensWithoutLegalSuffixes:
      legalSuffixFacts.tokensWithoutLegalSuffixes,
    containsLegalSuffix: legalSuffixFacts.containsLegalSuffix,
    legalSuffixes: legalSuffixFacts.legalSuffixes,
  }) satisfies BusinessNameFacts

  const hostnameFacts = parseHostname(hostname)
  const weaknessFacts = detectDomainWeaknessFacts(hostname)
  const domain = Object.freeze({
    originalDomain: input.domain,
    ...hostnameFacts,
    domainTokens: tokenizeHostnameLabels(hostnameFacts.hostnameLabels),
    hostnameLength: hostname.length,
    ...weaknessFacts,
  }) satisfies DomainFacts

  const analysis = Object.freeze({
    business,
    domain,
  }) satisfies DomainOpportunityAnalysis

  return Object.freeze({ success: true, analysis })
}

export type {
  BusinessLegalSuffix,
  BusinessNameFacts,
  DomainAnalyzerFailureReason,
  DomainAnalyzerInput,
  DomainAnalyzerResult,
  DomainFacts,
  DomainOpportunityAnalysis,
  HostnameParsingFacts,
} from './analyzer.types'

import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type {
  RegistrarOwnedDomainFact,
  RegistrarOwnedDomainSyncReport,
} from './types'

export const REGISTRAR_OWNED_DOMAIN_SYNC_POLICY = Object.freeze({
  pageSize: 100,
  maxPages: 5,
  maxRequests: 5,
  maxFetchedDomains: 500,
  minimumPageStartIntervalMs: 1_000,
})

export const createRegistrarSyncEvidence = (
  providerIdentifier: string
): string | null =>
  /^[a-z][a-z0-9_]{0,63}$/.test(providerIdentifier)
    ? `registrar:${providerIdentifier}:v1`
    : null

export const normalizeRegistrarDomainFact = (
  fact: RegistrarOwnedDomainFact,
  providerIdentifier: string
): string | null => {
  if (fact.providerIdentifier !== providerIdentifier) return null
  return normalizeHostname(fact.normalizedHostname)
}

export const freezeRegistrarSyncReport = (
  report: RegistrarOwnedDomainSyncReport
): RegistrarOwnedDomainSyncReport =>
  Object.freeze({
    ...report,
    domains: Object.freeze([...report.domains]),
  })

export const waitForRegistrarPage = (durationMs: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, durationMs))

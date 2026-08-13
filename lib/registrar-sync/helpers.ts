import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import type {
  RegistrarOwnedDomainFact,
  RegistrarOwnedDomainSyncReport,
} from './types'
import { REGISTRAR_DOMAIN_STATUSES } from './types'

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

export const normalizeRegistrarAssociationFact = (
  fact: RegistrarOwnedDomainFact,
  providerIdentifier: string
): RegistrarOwnedDomainFact | null => {
  const hostname = normalizeRegistrarDomainFact(fact, providerIdentifier)
  const expiration = fact.expiresAt === null ? null : new Date(fact.expiresAt)
  const expiresAt =
    expiration === null || Number.isNaN(expiration.getTime())
      ? null
      : expiration.toISOString()
  if (
    !hostname ||
    (fact.expiresAt !== null &&
      (expiresAt === null || expiresAt !== fact.expiresAt)) ||
    (fact.providerDomainIdentifier !== null &&
      (!fact.providerDomainIdentifier || fact.providerDomainIdentifier.length > 255)) ||
    (fact.autoRenew !== null && typeof fact.autoRenew !== 'boolean') ||
    !REGISTRAR_DOMAIN_STATUSES.includes(fact.status)
  )
    return null
  return Object.freeze({ ...fact, normalizedHostname: hostname, expiresAt })
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

import 'server-only'

import { normalizeHostname } from '@/lib/domain-analysis/analyzer.helpers'
import { RegistrarSyncError } from '../errors'
import { REGISTRAR_OWNED_DOMAIN_SYNC_POLICY } from '../helpers'
import type {
  RegistrarDomainStatus,
  RegistrarOwnedDomainFact,
} from '../types'
import type { DynadotOwnedDomainRecord } from './dynadot-owned-domain.types'

export const DYNADOT_OWNED_DOMAIN_PROVIDER_IDENTIFIER = 'dynadot' as const
export const DYNADOT_OWNED_DOMAIN_BASE_URL = 'https://api.dynadot.com'
export const DYNADOT_OWNED_DOMAIN_PATH = '/restful/v2/domains'

export const DYNADOT_OWNED_DOMAIN_POLICY = Object.freeze({
  pageSize: REGISTRAR_OWNED_DOMAIN_SYNC_POLICY.pageSize,
  timeoutMs: 10_000,
  retries: 0,
})

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

export const buildDynadotOwnedDomainPath = (page: number) => {
  if (!Number.isSafeInteger(page) || page < 1)
    throw new RegistrarSyncError('REGISTRAR_SYNC_FAILED')
  const query = new URLSearchParams()
  query.set('page', String(page))
  query.set('page_size', String(DYNADOT_OWNED_DOMAIN_POLICY.pageSize))
  query.set('sort', 'name_asc')
  query.set('status', 'active')
  return `${DYNADOT_OWNED_DOMAIN_PATH}?${query.toString()}`
}

export const mapDynadotRegistrarStatus = (
  value: unknown
): RegistrarDomainStatus => {
  switch (value) {
    case 'active':
      return 'ACTIVE'
    case 'inactive':
      return 'INACTIVE'
    case 'expired':
      return 'EXPIRED'
    case 'transferaway':
      return 'TRANSFER_AWAY'
    default:
      return 'UNKNOWN'
  }
}

const normalizeExpiration = (value: unknown): string | null => {
  const milliseconds =
    typeof value === 'number'
      ? value
      : typeof value === 'string' && value.trim()
        ? Number(value)
        : Number.NaN
  if (!Number.isFinite(milliseconds) || milliseconds <= 0) return null
  const date = new Date(milliseconds)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
}

const mapRecord = (value: unknown): RegistrarOwnedDomainFact => {
  if (!isRecord(value))
    throw new RegistrarSyncError('REGISTRAR_RESPONSE_INVALID')
  const record = value as DynadotOwnedDomainRecord
  const hostname =
    typeof record.domain_name === 'string'
      ? normalizeHostname(record.domain_name)
      : null

  return Object.freeze({
    normalizedHostname:
      hostname ?? (typeof record.domain_name === 'string' ? record.domain_name : ''),
    providerIdentifier: DYNADOT_OWNED_DOMAIN_PROVIDER_IDENTIFIER,
    providerDomainIdentifier: null,
    expiresAt: normalizeExpiration(record.expiration_date),
    autoRenew: null,
    status: mapDynadotRegistrarStatus(record.status),
  })
}

export const parseDynadotOwnedDomainPayload = (
  payload: unknown
): readonly RegistrarOwnedDomainFact[] => {
  if (!isRecord(payload) || payload.code !== 200 || !isRecord(payload.data))
    throw new RegistrarSyncError('REGISTRAR_RESPONSE_INVALID')
  const records = payload.data.domain_info_list
  if (
    !Array.isArray(records) ||
    records.length > DYNADOT_OWNED_DOMAIN_POLICY.pageSize
  )
    throw new RegistrarSyncError('REGISTRAR_RESPONSE_INVALID')
  return Object.freeze(records.map(mapRecord))
}

export const isDynadotOutOfRangePayload = (payload: unknown): boolean =>
  isRecord(payload) &&
  isRecord(payload.error) &&
  payload.error.description === 'The page is out of range'

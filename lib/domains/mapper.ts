import { Timestamp } from 'firebase-admin/firestore'

import type { Domain } from '@/types/domain'
import type { DomainPersistence } from '@/types/domain-persistence'
import type { DomainCreateInput, DomainPatchInput } from './validation'
import { createSearchPrefixes, normalizeDomainName } from './normalization'

type RecordData = Record<string, unknown>

function pick(data: RecordData, canonical: string, legacy: string) {
  return data[canonical] ?? data[legacy]
}

function nullableString(value: unknown) {
  return typeof value === 'string' && value.length > 0 ? value : null
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function dateToIso(value: unknown, fallback: string | null = null) {
  if (value instanceof Timestamp) return value.toDate().toISOString()
  if (value instanceof Date && !Number.isNaN(value.getTime()))
    return value.toISOString()
  if (typeof value === 'string' || typeof value === 'number') {
    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString()
  }
  if (
    typeof value === 'object' &&
    value !== null &&
    'toDate' in value &&
    typeof value.toDate === 'function'
  ) {
    return (value.toDate() as Date).toISOString()
  }
  return fallback
}

export function mapDomainFromFirestore(id: string, data: RecordData): Domain {
  const domainName = String(pick(data, 'domain_name', 'domainName') ?? '')
  const createdAt = dateToIso(
    pick(data, 'created_at', 'createdAt'),
    new Date(0).toISOString()
  )!

  return {
    id,
    domainName,
    normalizedDomainName: String(
      pick(data, 'normalized_domain_name', 'normalizedDomainName') ??
        normalizeDomainName(domainName)
    ),
    registrar: nullableString(data.registrar),
    keyword: nullableString(data.keyword),
    city: nullableString(data.city),
    state: nullableString(data.state),
    country: nullableString(data.country),
    purchasePrice: numberValue(pick(data, 'purchase_price', 'purchasePrice')),
    estimatedPrice: numberValue(
      pick(data, 'estimated_price', 'estimatedPrice')
    ),
    askingPrice: numberValue(pick(data, 'asking_price', 'askingPrice')),
    flipScore: numberValue(pick(data, 'flipscore', 'flipScore')),
    status: (data.status as Domain['status']) ?? 'active',
    purchaseDate: dateToIso(pick(data, 'purchase_date', 'purchaseDate')),
    expirationDate: dateToIso(pick(data, 'expiration_date', 'expirationDate')),
    renewalDate: dateToIso(pick(data, 'renewal_date', 'renewalDate')),
    autoRenew: Boolean(pick(data, 'auto_renew', 'autoRenew')),
    nameservers: Array.isArray(data.nameservers)
      ? data.nameservers.filter(
          (item): item is string => typeof item === 'string'
        )
      : [],
    afternicCheckoutLink: nullableString(
      pick(data, 'afternic_checkout_link', 'afternicCheckoutLink')
    ),
    landingPageUrl: nullableString(
      pick(data, 'landing_page_url', 'landingPageUrl')
    ),
    description: nullableString(data.description),
    isDeleted: Boolean(pick(data, 'is_deleted', 'isDeleted')),
    deletedAt: dateToIso(pick(data, 'deleted_at', 'deletedAt')),
    deletedBy: nullableString(pick(data, 'deleted_by', 'deletedBy')),
    createdAt,
    updatedAt: dateToIso(pick(data, 'updated_at', 'updatedAt'), createdAt)!,
    createdBy:
      nullableString(pick(data, 'created_by', 'createdBy')) ?? 'legacy',
    updatedBy:
      nullableString(pick(data, 'updated_by', 'updatedBy')) ?? 'legacy',
  }
}

export function mapDomainCreateToFirestore(
  id: string,
  input: DomainCreateInput,
  actorUid: string,
  timestamp: Timestamp
): DomainPersistence {
  const normalized = normalizeDomainName(input.domainName)
  return {
    id,
    domain_name: normalized,
    normalized_domain_name: normalized,
    registrar: input.registrar,
    keyword: input.keyword,
    city: input.city,
    state: input.state,
    country: input.country,
    purchase_price: input.purchasePrice,
    estimated_price: input.estimatedPrice,
    asking_price: input.askingPrice,
    flipscore: input.flipScore,
    status: input.status,
    purchase_date: input.purchaseDate
      ? Timestamp.fromDate(new Date(input.purchaseDate))
      : null,
    expiration_date: input.expirationDate
      ? Timestamp.fromDate(new Date(input.expirationDate))
      : null,
    renewal_date: input.renewalDate
      ? Timestamp.fromDate(new Date(input.renewalDate))
      : null,
    auto_renew: input.autoRenew,
    nameservers: input.nameservers,
    afternic_checkout_link: input.afternicCheckoutLink,
    landing_page_url: input.landingPageUrl,
    description: input.description,
    is_deleted: false,
    deleted_at: null,
    deleted_by: null,
    created_at: timestamp,
    updated_at: timestamp,
    created_by: actorUid,
    updated_by: actorUid,
    search_prefixes: createSearchPrefixes(normalized),
  }
}

const patchFieldMap: Record<keyof DomainPatchInput, string> = {
  domainName: 'domain_name',
  registrar: 'registrar',
  keyword: 'keyword',
  city: 'city',
  state: 'state',
  country: 'country',
  purchasePrice: 'purchase_price',
  estimatedPrice: 'estimated_price',
  askingPrice: 'asking_price',
  flipScore: 'flipscore',
  status: 'status',
  purchaseDate: 'purchase_date',
  expirationDate: 'expiration_date',
  renewalDate: 'renewal_date',
  autoRenew: 'auto_renew',
  nameservers: 'nameservers',
  afternicCheckoutLink: 'afternic_checkout_link',
  landingPageUrl: 'landing_page_url',
  description: 'description',
}

export function mapDomainPatchToFirestore(input: DomainPatchInput) {
  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(input) as [
    keyof DomainPatchInput,
    unknown,
  ][]) {
    const field = patchFieldMap[key]
    if (key === 'domainName' && typeof value === 'string') {
      const normalized = normalizeDomainName(value)
      result.domain_name = normalized
      result.normalized_domain_name = normalized
      result.search_prefixes = createSearchPrefixes(normalized)
    } else if (
      ['purchaseDate', 'expirationDate', 'renewalDate'].includes(key)
    ) {
      result[field] = value ? Timestamp.fromDate(new Date(String(value))) : null
    } else {
      result[field] = value
    }
  }
  return result
}

export function apiFieldToPersistenceField(field: string) {
  return patchFieldMap[field as keyof DomainPatchInput] ?? field
}

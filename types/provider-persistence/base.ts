export const PROVIDER_PERSISTENCE_SOURCE_VERSION = 1 as const

/** Storage-neutral ISO-8601 timestamp. Future mappers own database conversion. */
export type PersistenceTimestamp = string
declare const nonNegativeIntegerBrand: unique symbol
declare const nonNegativeFiniteBrand: unique symbol
export type NonNegativeInteger = number & { readonly [nonNegativeIntegerBrand]: true }
export type NonNegativeFiniteNumber = number & { readonly [nonNegativeFiniteBrand]: true }

export interface PersistenceDocumentMetadata {
  readonly id: string
  readonly schema_version: number
  readonly source_version: number
  readonly created_at: PersistenceTimestamp
  readonly updated_at: PersistenceTimestamp
}

export type SafePersistenceValue =
  | string
  | number
  | boolean
  | null
  | readonly SafePersistenceValue[]
  | { readonly [key: string]: SafePersistenceValue }

export interface PersistenceMoney {
  readonly amount: NonNegativeFiniteNumber | null
  readonly currency: string | null
  readonly currency_state: 'single' | 'unknown' | 'mixed'
}

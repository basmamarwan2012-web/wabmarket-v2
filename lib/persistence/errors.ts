export const PERSISTENCE_ERROR_CODES = Object.freeze([
  'PERSISTENCE_CONFIGURATION_INVALID',
  'PERSISTENCE_UNAVAILABLE',
  'PERSISTENCE_CONFLICT',
  'PERSISTENCE_NOT_FOUND',
  'PERSISTENCE_VERSION_CONFLICT',
  'PERSISTENCE_INVALID_INPUT',
] as const)

export type PersistenceErrorCode = (typeof PERSISTENCE_ERROR_CODES)[number]

const SAFE_MESSAGES: Readonly<Record<PersistenceErrorCode, string>> =
  Object.freeze({
    PERSISTENCE_CONFIGURATION_INVALID:
      'Database configuration is unavailable.',
    PERSISTENCE_UNAVAILABLE: 'Business data storage is unavailable.',
    PERSISTENCE_CONFLICT:
      'The requested business record conflicts with existing data.',
    PERSISTENCE_NOT_FOUND: 'The requested business record was not found.',
    PERSISTENCE_VERSION_CONFLICT:
      'The record changed before this operation completed.',
    PERSISTENCE_INVALID_INPUT: 'The persistence request is invalid.',
  })

export class PersistenceError extends Error {
  readonly code: PersistenceErrorCode

  constructor(code: PersistenceErrorCode) {
    super(SAFE_MESSAGES[code])
    this.name = 'PersistenceError'
    this.code = code
  }
}

export const sanitizePersistenceError = (error: unknown): PersistenceError => {
  if (error instanceof PersistenceError) return error

  const duplicate =
    typeof error === 'object' &&
    error !== null &&
    (('errno' in error && error.errno === 1062) ||
      ('code' in error && error.code === 'ER_DUP_ENTRY'))

  return new PersistenceError(
    duplicate ? 'PERSISTENCE_CONFLICT' : 'PERSISTENCE_UNAVAILABLE'
  )
}

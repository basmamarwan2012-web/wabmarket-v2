import 'server-only'

import {
  DATABASE_CONFIGURATION_ERROR_CODES,
  DatabaseConfigurationError,
  type DatabaseConfigurationErrorCode,
} from '@/lib/config/database'

export const DATABASE_OPERATOR_ERROR_CODES = Object.freeze([
  'DATABASE_CONFIGURATION_ERROR',
  'DATABASE_CONNECTION_FAILED',
  'DATABASE_MIGRATION_FAILED',
  'DATABASE_SMOKE_TEST_FAILED',
] as const)

export type DatabaseOperatorErrorCode =
  (typeof DATABASE_OPERATOR_ERROR_CODES)[number]
export type SafeDatabaseOperatorErrorCode =
  | DatabaseOperatorErrorCode
  | DatabaseConfigurationErrorCode

const SAFE_MESSAGES: Readonly<Record<DatabaseOperatorErrorCode, string>> =
  Object.freeze({
    DATABASE_CONFIGURATION_ERROR: 'Database configuration is invalid.',
    DATABASE_CONNECTION_FAILED: 'The database connection check failed.',
    DATABASE_MIGRATION_FAILED: 'The database migration operation failed.',
    DATABASE_SMOKE_TEST_FAILED: 'The database smoke test failed.',
  })

export class DatabaseOperatorError extends Error {
  readonly code: DatabaseOperatorErrorCode

  constructor(code: DatabaseOperatorErrorCode) {
    super(SAFE_MESSAGES[code])
    this.name = 'DatabaseOperatorError'
    this.code = code
  }
}

export const toSafeDatabaseOperatorError = (
  error: unknown,
  fallback: DatabaseOperatorErrorCode
): DatabaseOperatorError | DatabaseConfigurationError => {
  if (error instanceof DatabaseConfigurationError) return error
  if (error instanceof DatabaseOperatorError) return error

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    DATABASE_CONFIGURATION_ERROR_CODES.some((code) => code === error.code)
  )
    return new DatabaseConfigurationError(
      error.code as DatabaseConfigurationErrorCode
    )

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 'PERSISTENCE_CONFIGURATION_INVALID'
  )
    return new DatabaseOperatorError('DATABASE_CONFIGURATION_ERROR')

  return new DatabaseOperatorError(fallback)
}

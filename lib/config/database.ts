import 'server-only'

export const DATABASE_CONFIGURATION_ERROR_CODES = Object.freeze([
  'DATABASE_HOST_INVALID',
  'DATABASE_PORT_INVALID',
  'DATABASE_NAME_INVALID',
  'DATABASE_USER_INVALID',
  'DATABASE_PASSWORD_MISSING',
  'DATABASE_SSL_INVALID',
  'DATABASE_CONNECTION_LIMIT_INVALID',
] as const)

export type DatabaseConfigurationErrorCode =
  (typeof DATABASE_CONFIGURATION_ERROR_CODES)[number]

const SAFE_CONFIGURATION_MESSAGES: Readonly<
  Record<DatabaseConfigurationErrorCode, string>
> = Object.freeze({
  DATABASE_HOST_INVALID: 'The database host configuration is invalid.',
  DATABASE_PORT_INVALID: 'The database port configuration is invalid.',
  DATABASE_NAME_INVALID: 'The database name configuration is invalid.',
  DATABASE_USER_INVALID: 'The database user configuration is invalid.',
  DATABASE_PASSWORD_MISSING: 'The database password configuration is missing.',
  DATABASE_SSL_INVALID: 'The database SSL configuration is invalid.',
  DATABASE_CONNECTION_LIMIT_INVALID:
    'The database connection-limit configuration is invalid.',
})

export class DatabaseConfigurationError extends Error {
  readonly code: DatabaseConfigurationErrorCode

  constructor(code: DatabaseConfigurationErrorCode) {
    super(SAFE_CONFIGURATION_MESSAGES[code])
    this.name = 'DatabaseConfigurationError'
    this.code = code
  }
}

export interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly user: string
  readonly password: string
  readonly ssl: 'disabled' | 'required'
  readonly connectionLimit: number
}

const required = (
  value: string | undefined,
  code: DatabaseConfigurationErrorCode
) => {
  const normalized = value?.trim()
  if (!normalized) throw new DatabaseConfigurationError(code)
  return normalized
}

/** Reads server environment only when a composition root explicitly requests it. */
export const getDatabaseConfig = (
  environment: NodeJS.ProcessEnv = process.env
): DatabaseConfig => {
  const port = Number(environment.DATABASE_PORT ?? '3306')
  const connectionLimit = Number(environment.DATABASE_CONNECTION_LIMIT ?? '5')
  const sslValue = environment.DATABASE_SSL?.trim() || 'disabled'

  if (!Number.isInteger(port) || port < 1 || port > 65_535)
    throw new DatabaseConfigurationError('DATABASE_PORT_INVALID')
  if (
    !Number.isInteger(connectionLimit) ||
    connectionLimit < 1 ||
    connectionLimit > 50
  )
    throw new DatabaseConfigurationError(
      'DATABASE_CONNECTION_LIMIT_INVALID'
    )
  if (sslValue !== 'disabled' && sslValue !== 'required')
    throw new DatabaseConfigurationError('DATABASE_SSL_INVALID')

  return Object.freeze({
    host: required(environment.DATABASE_HOST, 'DATABASE_HOST_INVALID'),
    port,
    database: required(environment.DATABASE_NAME, 'DATABASE_NAME_INVALID'),
    user: required(environment.DATABASE_USER, 'DATABASE_USER_INVALID'),
    password: required(
      environment.DATABASE_PASSWORD,
      'DATABASE_PASSWORD_MISSING'
    ),
    ssl: sslValue,
    connectionLimit,
  })
}

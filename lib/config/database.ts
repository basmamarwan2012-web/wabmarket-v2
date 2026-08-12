import 'server-only'

import { PersistenceError } from '@/lib/persistence/errors'

export interface DatabaseConfig {
  readonly host: string
  readonly port: number
  readonly database: string
  readonly user: string
  readonly password: string
  readonly ssl: 'disabled' | 'required'
  readonly connectionLimit: number
}

const required = (value: string | undefined) => {
  const normalized = value?.trim()
  if (!normalized)
    throw new PersistenceError('PERSISTENCE_CONFIGURATION_INVALID')
  return normalized
}

/** Reads server environment only when a composition root explicitly requests it. */
export const getDatabaseConfig = (
  environment: NodeJS.ProcessEnv = process.env
): DatabaseConfig => {
  const port = Number(environment.DATABASE_PORT ?? '3306')
  const connectionLimit = Number(environment.DATABASE_CONNECTION_LIMIT ?? '5')
  const sslValue = environment.DATABASE_SSL?.trim() || 'disabled'

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535 ||
    !Number.isInteger(connectionLimit) ||
    connectionLimit < 1 ||
    connectionLimit > 50 ||
    (sslValue !== 'disabled' && sslValue !== 'required')
  )
    throw new PersistenceError('PERSISTENCE_CONFIGURATION_INVALID')

  return Object.freeze({
    host: required(environment.DATABASE_HOST),
    port,
    database: required(environment.DATABASE_NAME),
    user: required(environment.DATABASE_USER),
    password: required(environment.DATABASE_PASSWORD),
    ssl: sslValue,
    connectionLimit,
  })
}

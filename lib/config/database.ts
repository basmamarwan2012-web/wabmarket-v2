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
  const port = Number(environment.MYSQL_PORT ?? '3306')
  const connectionLimit = Number(environment.MYSQL_CONNECTION_LIMIT ?? '5')
  const ssl = environment.MYSQL_SSL === 'required' ? 'required' : 'disabled'

  if (
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65_535 ||
    !Number.isInteger(connectionLimit) ||
    connectionLimit < 1 ||
    connectionLimit > 50
  )
    throw new PersistenceError('PERSISTENCE_CONFIGURATION_INVALID')

  return Object.freeze({
    host: required(environment.MYSQL_HOST),
    port,
    database: required(environment.MYSQL_DATABASE),
    user: required(environment.MYSQL_USER),
    password: required(environment.MYSQL_PASSWORD),
    ssl,
    connectionLimit,
  })
}

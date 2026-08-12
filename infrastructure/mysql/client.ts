import 'server-only'

import { drizzle, type MySql2Database } from 'drizzle-orm/mysql2'
import { createPool, type Pool } from 'mysql2/promise'

import type { DatabaseConfig } from '@/lib/config/database'
import * as schema from './schema'

export const DATABASE_CONNECTION_TIMEOUT_MS = 10_000

export type WabmarketMySqlDatabase = MySql2Database<typeof schema>

export interface WabmarketMySqlClient {
  readonly pool: Pool
  readonly database: WabmarketMySqlDatabase
  close(): Promise<void>
}

/** Explicit factory: importing this module never creates a pool or connection. */
export const createWabmarketMySqlClient = (
  config: DatabaseConfig
): WabmarketMySqlClient => {
  const pool = createPool({
    host: config.host,
    port: config.port,
    database: config.database,
    user: config.user,
    password: config.password,
    waitForConnections: true,
    connectTimeout: DATABASE_CONNECTION_TIMEOUT_MS,
    connectionLimit: config.connectionLimit,
    ssl: config.ssl === 'required' ? {} : undefined,
    decimalNumbers: true,
    timezone: 'Z',
  })
  const database = drizzle({ client: pool, schema, mode: 'default' })

  return Object.freeze({
    pool,
    database,
    close: () => pool.end(),
  })
}

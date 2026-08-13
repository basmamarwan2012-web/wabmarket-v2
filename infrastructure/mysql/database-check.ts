import 'server-only'

import { getDatabaseConfig } from '@/lib/config/database'
import { createWabmarketMySqlClient } from './client'
import {
  DatabaseOperatorError,
  toSafeDatabaseOperatorError,
} from './operator-errors'

export interface DatabaseCheckResult {
  readonly connected: true
  readonly query: 'SELECT_1'
}

/** Performs one non-mutating connectivity query and always closes its pool. */
export const runDatabaseCheck = async (): Promise<DatabaseCheckResult> => {
  let client: ReturnType<typeof createWabmarketMySqlClient> | null = null
  let failure: ReturnType<typeof toSafeDatabaseOperatorError> | null = null

  try {
    client = createWabmarketMySqlClient(getDatabaseConfig())
    await client.pool.query('SELECT 1')
  } catch (error) {
    failure = toSafeDatabaseOperatorError(
      error,
      'DATABASE_CONNECTION_FAILED'
    )
  } finally {
    if (client) {
      try {
        await client.close()
      } catch {
        failure ??= new DatabaseOperatorError('DATABASE_CONNECTION_FAILED')
      }
    }
  }

  if (failure) throw failure
  return Object.freeze({ connected: true, query: 'SELECT_1' })
}

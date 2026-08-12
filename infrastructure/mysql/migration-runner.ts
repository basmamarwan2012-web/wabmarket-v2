import 'server-only'

import path from 'node:path'

import { readMigrationFiles, type MigrationMeta } from 'drizzle-orm/migrator'
import { migrate } from 'drizzle-orm/mysql2/migrator'
import type { RowDataPacket } from 'mysql2/promise'

import { getDatabaseConfig } from '@/lib/config/database'
import { createWabmarketMySqlClient } from './client'
import {
  DatabaseOperatorError,
  toSafeDatabaseOperatorError,
} from './operator-errors'

const MIGRATIONS_FOLDER = path.resolve(
  process.cwd(),
  'infrastructure/mysql/migrations'
)
const MIGRATIONS_TABLE = '__drizzle_migrations'

export type DatabaseMigrationStatus = 'PENDING' | 'APPLIED' | 'DRIFTED'

export interface DatabaseMigrationStatusResult {
  readonly status: DatabaseMigrationStatus
  readonly localMigrationCount: number
  readonly appliedMigrationCount: number
}

export interface DatabaseMigrationExecutionResult
  extends DatabaseMigrationStatusResult {
  readonly executed: boolean
}

export interface AppliedMigrationRecord {
  readonly hash: string
  readonly createdAt: number
}

interface MigrationTableRow extends RowDataPacket {
  readonly tableCount: number | string
}

interface MigrationHistoryRow extends RowDataPacket {
  readonly hash: string
  readonly createdAt: number | string
}

const freezeStatus = (
  status: DatabaseMigrationStatus,
  localMigrationCount: number,
  appliedMigrationCount: number
): DatabaseMigrationStatusResult =>
  Object.freeze({ status, localMigrationCount, appliedMigrationCount })

/** Resolves status exclusively from Drizzle's ordered history and local journal. */
export const resolveDatabaseMigrationStatus = (
  localMigrations: readonly Pick<MigrationMeta, 'folderMillis' | 'hash'>[],
  appliedMigrations: readonly AppliedMigrationRecord[],
  historyTableExists: boolean
): DatabaseMigrationStatusResult => {
  if (!historyTableExists || appliedMigrations.length === 0)
    return freezeStatus('PENDING', localMigrations.length, 0)

  if (appliedMigrations.length > localMigrations.length)
    return freezeStatus(
      'DRIFTED',
      localMigrations.length,
      appliedMigrations.length
    )

  const prefixMatches = appliedMigrations.every((applied, index) => {
    const local = localMigrations[index]
    return (
      local !== undefined &&
      applied.createdAt === local.folderMillis &&
      applied.hash === local.hash
    )
  })

  if (!prefixMatches)
    return freezeStatus(
      'DRIFTED',
      localMigrations.length,
      appliedMigrations.length
    )

  return freezeStatus(
    appliedMigrations.length === localMigrations.length ? 'APPLIED' : 'PENDING',
    localMigrations.length,
    appliedMigrations.length
  )
}

const loadStatus = async (
  client: ReturnType<typeof createWabmarketMySqlClient>
) => {
  const localMigrations = readMigrationFiles({
    migrationsFolder: MIGRATIONS_FOLDER,
  })
  const [tableRows] = await client.pool.query<MigrationTableRow[]>(
    'SELECT COUNT(*) AS tableCount FROM information_schema.tables WHERE table_schema = DATABASE() AND table_name = ?',
    [MIGRATIONS_TABLE]
  )
  const historyTableExists = Number(tableRows[0]?.tableCount ?? 0) === 1

  if (!historyTableExists)
    return resolveDatabaseMigrationStatus(localMigrations, [], false)

  const [historyRows] = await client.pool.query<MigrationHistoryRow[]>(
    'SELECT hash, created_at AS createdAt FROM __drizzle_migrations ORDER BY created_at ASC, id ASC'
  )
  const applied = historyRows.map((row) =>
    Object.freeze({ hash: row.hash, createdAt: Number(row.createdAt) })
  )
  return resolveDatabaseMigrationStatus(localMigrations, applied, true)
}

const withMigrationClient = async <T>(
  operation: (
    client: ReturnType<typeof createWabmarketMySqlClient>
  ) => Promise<T>
): Promise<T> => {
  let client: ReturnType<typeof createWabmarketMySqlClient> | null = null
  let value: T | undefined
  let failure: DatabaseOperatorError | null = null

  try {
    client = createWabmarketMySqlClient(getDatabaseConfig())
    value = await operation(client)
  } catch (error) {
    failure = toSafeDatabaseOperatorError(error, 'DATABASE_MIGRATION_FAILED')
  } finally {
    if (client) {
      try {
        await client.close()
      } catch {
        failure ??= new DatabaseOperatorError('DATABASE_MIGRATION_FAILED')
      }
    }
  }

  if (failure) throw failure
  return value as T
}

/** Read-only: it never creates migration history or business tables. */
export const getDatabaseMigrationStatus = () =>
  withMigrationClient((client) => loadStatus(client))

/** Applies pending Drizzle migrations only after the CLI's explicit confirmation. */
export const executeDatabaseMigrations = () =>
  withMigrationClient<DatabaseMigrationExecutionResult>(async (client) => {
    const before = await loadStatus(client)
    if (before.status === 'DRIFTED')
      throw new DatabaseOperatorError('DATABASE_MIGRATION_FAILED')
    if (before.status === 'APPLIED')
      return Object.freeze({ ...before, executed: false })

    await migrate(client.database, {
      migrationsFolder: MIGRATIONS_FOLDER,
      migrationsTable: MIGRATIONS_TABLE,
    })

    const after = await loadStatus(client)
    if (after.status !== 'APPLIED')
      throw new DatabaseOperatorError('DATABASE_MIGRATION_FAILED')
    return Object.freeze({ ...after, executed: true })
  })

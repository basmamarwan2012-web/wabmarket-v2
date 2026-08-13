export {}

const STATUS_CONFIRMATION = '--confirm-live-database-migration-status'
const EXECUTION_CONFIRMATION = '--confirm-database-migration'
const SAFE_OPERATION_MESSAGES = Object.freeze({
  DATABASE_CONFIGURATION_ERROR: 'Database configuration is invalid.',
  DATABASE_HOST_INVALID: 'The database host configuration is invalid.',
  DATABASE_PORT_INVALID: 'The database port configuration is invalid.',
  DATABASE_NAME_INVALID: 'The database name configuration is invalid.',
  DATABASE_USER_INVALID: 'The database user configuration is invalid.',
  DATABASE_PASSWORD_MISSING: 'The database password configuration is missing.',
  DATABASE_SSL_INVALID: 'The database SSL configuration is invalid.',
  DATABASE_CONNECTION_LIMIT_INVALID:
    'The database connection-limit configuration is invalid.',
  DATABASE_MIGRATION_FAILED: 'The database migration operation failed.',
})

const printError = (code: string, message: string) => {
  console.error(JSON.stringify({ error: { code, message } }, null, 2))
  process.exitCode = 1
}

const main = async () => {
  const argumentsProvided = process.argv.slice(2)
  const statusRequested =
    argumentsProvided.length === 1 &&
    argumentsProvided[0] === STATUS_CONFIRMATION
  const executionRequested =
    argumentsProvided.length === 1 &&
    argumentsProvided[0] === EXECUTION_CONFIRMATION

  if (!statusRequested && !executionRequested) {
    printError(
      argumentsProvided.length === 0
        ? 'DATABASE_CONFIRMATION_REQUIRED'
        : 'DATABASE_ARGUMENT_INVALID',
      argumentsProvided.length === 0
        ? `Use exactly ${STATUS_CONFIRMATION} or ${EXECUTION_CONFIRMATION}.`
        : 'The migration arguments are invalid or mutually incompatible.'
    )
    return
  }

  try {
    const { loadEnvFile } = await import('node:process')
    loadEnvFile('.env.local')
    const { executeDatabaseMigrations, getDatabaseMigrationStatus } =
      await import('../infrastructure/mysql/migration-runner')
    const result = statusRequested
      ? await getDatabaseMigrationStatus()
      : await executeDatabaseMigrations()
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : 'DATABASE_MIGRATION_FAILED'
    const code =
      errorCode in SAFE_OPERATION_MESSAGES
        ? (errorCode as keyof typeof SAFE_OPERATION_MESSAGES)
        : 'DATABASE_MIGRATION_FAILED'
    printError(code, SAFE_OPERATION_MESSAGES[code])
  }
}

void main()

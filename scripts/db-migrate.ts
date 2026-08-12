export {}

const STATUS_CONFIRMATION = '--confirm-live-database-migration-status'
const EXECUTION_CONFIRMATION = '--confirm-database-migration'
const argumentsProvided = process.argv.slice(2)
const SAFE_OPERATION_MESSAGES = Object.freeze({
  DATABASE_CONFIGURATION_ERROR: 'Database configuration is invalid.',
  DATABASE_MIGRATION_FAILED: 'The database migration operation failed.',
})

const printError = (code: string, message: string) => {
  console.error(JSON.stringify({ error: { code, message } }, null, 2))
  process.exitCode = 1
}

const statusRequested =
  argumentsProvided.length === 1 && argumentsProvided[0] === STATUS_CONFIRMATION
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
} else {
  try {
    const { executeDatabaseMigrations, getDatabaseMigrationStatus } =
      await import('../infrastructure/mysql/migration-runner')
    const result = statusRequested
      ? await getDatabaseMigrationStatus()
      : await executeDatabaseMigrations()
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'DATABASE_CONFIGURATION_ERROR'
        ? 'DATABASE_CONFIGURATION_ERROR'
        : 'DATABASE_MIGRATION_FAILED'
    printError(code, SAFE_OPERATION_MESSAGES[code])
  }
}

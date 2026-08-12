export {}

const CONFIRMATION = '--confirm-live-database-smoke-test'
const argumentsProvided = process.argv.slice(2)
const SAFE_OPERATION_MESSAGES = Object.freeze({
  DATABASE_CONFIGURATION_ERROR: 'Database configuration is invalid.',
  DATABASE_SMOKE_TEST_FAILED: 'The database smoke test failed.',
})

const printError = (code: string, message: string) => {
  console.error(JSON.stringify({ error: { code, message } }, null, 2))
  process.exitCode = 1
}

if (argumentsProvided.length !== 1 || argumentsProvided[0] !== CONFIRMATION) {
  printError(
    argumentsProvided.length === 0
      ? 'DATABASE_CONFIRMATION_REQUIRED'
      : 'DATABASE_ARGUMENT_INVALID',
    argumentsProvided.length === 0
      ? `Database access requires ${CONFIRMATION}.`
      : 'The database smoke-test arguments are invalid.'
  )
} else {
  try {
    const { runDatabaseSmokeTest } = await import(
      '../infrastructure/mysql/smoke-test'
    )
    const result = await runDatabaseSmokeTest()
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    const code =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'DATABASE_CONFIGURATION_ERROR'
        ? 'DATABASE_CONFIGURATION_ERROR'
        : 'DATABASE_SMOKE_TEST_FAILED'
    printError(code, SAFE_OPERATION_MESSAGES[code])
  }
}

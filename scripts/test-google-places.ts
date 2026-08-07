import { loadEnvFile } from 'node:process'
import { parseArgs } from 'node:util'
import type { GooglePlacesTestReport } from '../lib/discovery-testing/google-places-test.types'

const options = {
  'confirm-live-google-places-request': { type: 'boolean' as const },
  keyword: { type: 'string' as const },
  city: { type: 'string' as const },
  state: { type: 'string' as const },
  country: { type: 'string' as const },
  language: { type: 'string' as const },
  maxResults: { type: 'string' as const },
}

const safeProviderErrors = Object.freeze({
  PROVIDER_CONFIGURATION_MISSING: 'Google Places configuration is missing.',
  PROVIDER_UNSUPPORTED_REQUEST: 'Google Places does not support this request.',
  PROVIDER_CANCELLED: 'Google Places request was cancelled.',
  PROVIDER_TIMEOUT: 'Google Places request timed out.',
  PROVIDER_RATE_LIMITED: 'Google Places is temporarily rate limited.',
  PROVIDER_QUOTA_EXCEEDED: 'Google Places quota is exhausted.',
  PROVIDER_HTTP_ERROR: 'Google Places request failed.',
  PROVIDER_INVALID_RESPONSE: 'Google Places returned an invalid response.',
  PROVIDER_NETWORK_ERROR: 'Google Places network request failed.',
})

type SafeProviderErrorCode = keyof typeof safeProviderErrors

const invalidArgumentsError = Object.freeze({
  code: 'GOOGLE_PLACES_TEST_INVALID_ARGUMENTS',
  message: 'Google Places test arguments are invalid.',
})

const confirmationRequiredError = Object.freeze({
  code: 'GOOGLE_PLACES_CONFIRMATION_REQUIRED',
  message: 'Live Google Places request is not confirmed.',
})

const unexpectedTestError = Object.freeze({
  code: 'GOOGLE_PLACES_TEST_FAILED',
  message: 'Google Places test failed.',
})

const printError = (error: Readonly<{ code: string; message: string }>) =>
  console.error(JSON.stringify({ error }))

const toSafeExecutionError = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('code' in error))
    return unexpectedTestError

  const code = error.code
  if (typeof code !== 'string' || !Object.hasOwn(safeProviderErrors, code))
    return unexpectedTestError

  const safeCode = code as SafeProviderErrorCode
  return Object.freeze({
    code: safeCode,
    message: safeProviderErrors[safeCode],
  })
}

const normalizeArgument = (value: string | undefined) => {
  if (value === undefined) return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized.length > 0 && normalized.length <= 160 ? normalized : null
}

const normalizeLanguage = (value: string | undefined) => {
  if (value === undefined) return null
  const normalized = normalizeArgument(value)
  if (!normalized) return null
  try {
    const canonical = Intl.getCanonicalLocales(normalized)
    return canonical.length === 1 ? canonical[0] : null
  } catch {
    return null
  }
}

const parseCommand = () =>
  parseArgs({
    options,
    strict: true,
    allowPositionals: false,
    tokens: true,
  })

async function main() {
  let parsed: ReturnType<typeof parseCommand>
  try {
    parsed = parseCommand()
  } catch {
    printError(invalidArgumentsError)
    process.exitCode = 1
    return
  }

  const optionNames = (parsed.tokens ?? [])
    .filter((token) => token.kind === 'option')
    .map((token) => token.name)
  if (new Set(optionNames).size !== optionNames.length) {
    printError(invalidArgumentsError)
    process.exitCode = 1
    return
  }

  const keyword = normalizeArgument(parsed.values.keyword)
  const city = normalizeArgument(parsed.values.city)
  const country = normalizeArgument(parsed.values.country)
  const stateWasProvided = parsed.values.state !== undefined
  const state = normalizeArgument(parsed.values.state)
  const languageWasProvided = parsed.values.language !== undefined
  const language = normalizeLanguage(parsed.values.language)
  const maxResults = Number(parsed.values.maxResults ?? '20')

  if (
    !keyword ||
    !city ||
    !country ||
    (stateWasProvided && !state) ||
    (languageWasProvided && !language) ||
    !Number.isInteger(maxResults) ||
    maxResults < 1 ||
    maxResults > 20
  ) {
    printError(invalidArgumentsError)
    process.exitCode = 1
    return
  }

  if (!parsed.values['confirm-live-google-places-request']) {
    printError(confirmationRequiredError)
    process.exitCode = 2
    return
  }

  try {
    loadEnvFile('.env.local')
  } catch {
    printError({
      code: 'PROVIDER_CONFIGURATION_MISSING',
      message: safeProviderErrors.PROVIDER_CONFIGURATION_MISSING,
    })
    process.exitCode = 1
    return
  }

  try {
    const { executeGooglePlacesTest } =
      await import('../lib/discovery-testing/google-places-test.service')
    const report = (await executeGooglePlacesTest({
      mode: 'business_upgrade',
      criteria: { keyword, city, state, country, language, maxResults },
    })) satisfies GooglePlacesTestReport
    console.log(JSON.stringify(report, null, 2))
  } catch (error: unknown) {
    printError(toSafeExecutionError(error))
    process.exitCode = 1
  }
}

void main().catch(() => {
  printError(unexpectedTestError)
  process.exitCode = 1
})

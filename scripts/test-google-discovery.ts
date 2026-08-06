import { loadEnvFile } from 'node:process'
import { channel } from 'node:diagnostics_channel'
import { parseArgs } from 'node:util'

const options = {
  'confirm-live-google-request': { type: 'boolean' as const },
  mode: { type: 'string' as const },
  keyword: { type: 'string' as const },
  city: { type: 'string' as const },
  state: { type: 'string' as const },
  country: { type: 'string' as const },
  language: { type: 'string' as const },
  maxResults: { type: 'string' as const },
}

const GOOGLE_HTTP_DIAGNOSTIC_CHANNEL_NAME =
  'wabmarket.discovery.google.http-error.manual'
const googleHttpDiagnosticCategories = new Set([
  'api_not_enabled',
  'api_key_invalid',
  'api_key_restricted',
  'custom_search_access_denied',
  'search_engine_invalid',
  'quota_exceeded',
  'rate_limited',
  'invalid_request',
  'service_deprecated',
  'unknown_http_error',
])

interface GoogleHttpDiagnostic {
  readonly provider: 'google'
  readonly httpStatus: number
  readonly googleCode: number | null
  readonly googleStatus: string | null
  readonly reason: string | null
  readonly category: string
}

const preservedProviderErrorCodes = new Set([
  'PROVIDER_CONFIGURATION_MISSING',
  'PROVIDER_HTTP_ERROR',
  'PROVIDER_TIMEOUT',
  'PROVIDER_CANCELLED',
  'PROVIDER_INVALID_RESPONSE',
  'PROVIDER_QUOTA_EXCEEDED',
  'PROVIDER_RATE_LIMITED',
  'PROVIDER_NETWORK_ERROR',
  'PROVIDER_UNSUPPORTED_REQUEST',
  'PROVIDER_NOT_IMPLEMENTED',
  'PROVIDER_INVALID_CONFIGURATION',
  'PROVIDER_NORMALIZATION_FAILED',
  'PROVIDER_INVALID_NORMALIZED_RESULT',
  'PROVIDER_EXECUTION_FAILED',
])

const unexpectedExecutionError = Object.freeze({
  code: 'PROVIDER_EXECUTION_FAILED',
  message: 'Google provider test failed.',
})

const toSafeCliError = (error: unknown) => {
  if (!(error instanceof Error) || !('code' in error))
    return unexpectedExecutionError
  const code = error.code
  if (typeof code !== 'string' || !preservedProviderErrorCodes.has(code))
    return unexpectedExecutionError
  return Object.freeze({ code, message: error.message })
}

const safeDiagnosticToken = (value: unknown) =>
  typeof value === 'string' && /^[A-Za-z0-9_.-]{1,100}$/.test(value)
    ? value
    : null

const toSafeGoogleHttpDiagnostic = (
  value: unknown
): GoogleHttpDiagnostic | null => {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  if (
    candidate.provider !== 'google' ||
    !Number.isInteger(candidate.httpStatus) ||
    Number(candidate.httpStatus) < 100 ||
    Number(candidate.httpStatus) > 599 ||
    (candidate.googleCode !== null &&
      !Number.isInteger(candidate.googleCode)) ||
    typeof candidate.category !== 'string' ||
    !googleHttpDiagnosticCategories.has(candidate.category)
  )
    return null

  return Object.freeze({
    provider: 'google',
    httpStatus: Number(candidate.httpStatus),
    googleCode:
      candidate.googleCode === null ? null : Number(candidate.googleCode),
    googleStatus: safeDiagnosticToken(candidate.googleStatus),
    reason: safeDiagnosticToken(candidate.reason),
    category: candidate.category,
  })
}

const printSafeError = (
  error: unknown,
  diagnostic: GoogleHttpDiagnostic | null = null
) => {
  console.error(
    JSON.stringify({
      error: toSafeCliError(error),
      ...(diagnostic ? { diagnostic } : {}),
    })
  )
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
    console.error('Invalid command arguments.')
    process.exitCode = 1
    return
  }

  const seen = new Set<string>()
  for (const token of parsed.tokens ?? []) {
    if (token.kind !== 'option') continue
    if (seen.has(token.name)) {
      console.error(`Duplicate option is not allowed: --${token.name}`)
      process.exitCode = 1
      return
    }
    seen.add(token.name)
  }

  if (!parsed.values['confirm-live-google-request']) {
    console.error(
      'Live Google request not confirmed. Add --confirm-live-google-request to consume one request.'
    )
    process.exitCode = 2
    return
  }

  const mode = parsed.values.mode
  const keyword = parsed.values.keyword?.trim()
  const city = parsed.values.city?.trim()
  const state = parsed.values.state?.trim() || null
  const country = parsed.values.country?.trim()
  const language = parsed.values.language?.trim() || null
  const maxResults = Number(parsed.values.maxResults ?? '10')
  if (mode !== 'business_upgrade' && mode !== 'local_seo') {
    console.error('Mode must be business_upgrade or local_seo.')
    process.exitCode = 1
    return
  }
  if (!keyword || !city || !country) {
    console.error('keyword, city, and country are required.')
    process.exitCode = 1
    return
  }
  if (!Number.isInteger(maxResults) || maxResults < 1 || maxResults > 10) {
    console.error('maxResults must be an integer from 1 through 10.')
    process.exitCode = 1
    return
  }

  try {
    loadEnvFile('.env.local')
  } catch {
    console.error('Confirmed environment file could not be loaded.')
    process.exitCode = 1
    return
  }

  const criteria = {
    keyword,
    city,
    state,
    country,
    language,
    maxResults,
  }

  const diagnosticChannel = channel(GOOGLE_HTTP_DIAGNOSTIC_CHANNEL_NAME)
  let diagnostic: GoogleHttpDiagnostic | null = null
  const receiveDiagnostic = (value: unknown) => {
    diagnostic = toSafeGoogleHttpDiagnostic(value)
  }
  let diagnosticSubscribed = false

  try {
    diagnosticChannel.subscribe(receiveDiagnostic)
    diagnosticSubscribed = true
    const { executeGoogleProviderTest } = await import(
      '../lib/discovery-testing/index'
    )
    const test = await executeGoogleProviderTest({ mode, criteria })
    const accepted = test.providerResult.items.map((item) => ({
      currentDomain: item.currentDomain,
      website: item.website,
      sourceTitle: item.sourceTitle,
      qualityScore: item.metadata.qualityScore,
      positiveSignals: item.metadata.positiveSignals,
      negativeSignals: item.metadata.negativeSignals,
    }))
    console.log(
      JSON.stringify(
        {
          criteria,
          provider: test.providerResult.provider,
          durationMs: test.providerResult.durationMs,
          diagnostics: test.diagnostics,
          accepted,
        },
        null,
        2
      )
    )
  } catch (error) {
    printSafeError(error, diagnostic)
    process.exitCode = 1
  } finally {
    if (diagnosticSubscribed)
      diagnosticChannel.unsubscribe(receiveDiagnostic)
  }
}

void main().catch((error: unknown) => {
  printSafeError(error)
  process.exitCode = 1
})

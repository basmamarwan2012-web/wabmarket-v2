import { channel } from 'node:diagnostics_channel'
import { parseArgs } from 'node:util'
import type { OpenDiscoveryTimeoutDiagnostic } from '../lib/discovery-testing/open-discovery-test.types'

const options = {
  'confirm-live-overpass-request': { type: 'boolean' as const },
  keyword: { type: 'string' as const },
  city: { type: 'string' as const },
  state: { type: 'string' as const },
  country: { type: 'string' as const },
}

const OVERPASS_TIMEOUT_DIAGNOSTIC_CHANNEL_NAME =
  'wabmarket.discovery.open-discovery.timeout.manual'
const timeoutDiagnosticCategories = new Set([
  'client_timeout',
  'server_timeout_504',
  'server_runtime_timeout',
])

const safeProviderErrors = Object.freeze({
  PROVIDER_UNSUPPORTED_REQUEST: 'Open Discovery does not support this request.',
  PROVIDER_CANCELLED: 'Open Discovery request was cancelled.',
  PROVIDER_TIMEOUT: 'Open Discovery request timed out.',
  PROVIDER_RATE_LIMITED: 'Open Discovery is temporarily rate limited.',
  PROVIDER_HTTP_ERROR: 'Open Discovery request failed.',
  PROVIDER_INVALID_RESPONSE: 'Open Discovery returned an invalid response.',
  PROVIDER_NETWORK_ERROR: 'Open Discovery network request failed.',
})

type SafeProviderErrorCode = keyof typeof safeProviderErrors

const invalidArgumentsError = Object.freeze({
  code: 'OPEN_DISCOVERY_INVALID_ARGUMENTS',
  message: 'Open Discovery test arguments are invalid.',
})

const confirmationRequiredError = Object.freeze({
  code: 'OPEN_DISCOVERY_CONFIRMATION_REQUIRED',
  message: 'Live Overpass request is not confirmed.',
})

const unexpectedTestError = Object.freeze({
  code: 'OPEN_DISCOVERY_TEST_FAILED',
  message: 'Open Discovery test failed.',
})

const printError = (
  error: Readonly<{ code: string; message: string }>,
  diagnostic: OpenDiscoveryTimeoutDiagnostic | null = null
) =>
  console.error(
    JSON.stringify({ error, ...(diagnostic ? { diagnostic } : {}) })
  )

const toSafeTimeoutDiagnostic = (
  value: unknown
): OpenDiscoveryTimeoutDiagnostic | null => {
  if (!value || typeof value !== 'object') return null
  const candidate = value as Record<string, unknown>
  if (
    typeof candidate.category !== 'string' ||
    !timeoutDiagnosticCategories.has(candidate.category)
  )
    return null

  if (candidate.category === 'server_timeout_504') {
    return candidate.httpStatus === 504
      ? Object.freeze({ category: 'server_timeout_504', httpStatus: 504 })
      : null
  }

  if (candidate.httpStatus !== undefined) return null
  return Object.freeze({
    category: candidate.category as 'client_timeout' | 'server_runtime_timeout',
  })
}

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

  if (!keyword || !city || !country || (stateWasProvided && !state)) {
    printError(invalidArgumentsError)
    process.exitCode = 1
    return
  }

  if (!parsed.values['confirm-live-overpass-request']) {
    printError(confirmationRequiredError)
    process.exitCode = 2
    return
  }

  const timeoutChannel = channel(OVERPASS_TIMEOUT_DIAGNOSTIC_CHANNEL_NAME)
  let timeoutDiagnostic: OpenDiscoveryTimeoutDiagnostic | null = null
  const receiveTimeoutDiagnostic = (value: unknown) => {
    timeoutDiagnostic = toSafeTimeoutDiagnostic(value)
  }
  let diagnosticSubscribed = false

  try {
    timeoutChannel.subscribe(receiveTimeoutDiagnostic)
    diagnosticSubscribed = true
    const { executeOpenDiscoveryTest } =
      await import('../lib/discovery-testing/open-discovery-test.service')
    const result = await executeOpenDiscoveryTest({
      mode: 'business_upgrade',
      criteria: { keyword, city, state, country },
    })
    console.log(JSON.stringify(result))
  } catch (error: unknown) {
    const safeError = toSafeExecutionError(error)
    const safeTimeoutDiagnostic =
      safeError.code === 'PROVIDER_TIMEOUT'
        ? (timeoutDiagnostic ?? Object.freeze({ category: 'unknown_timeout' }))
        : null
    printError(safeError, safeTimeoutDiagnostic)
    process.exitCode = 1
  } finally {
    if (diagnosticSubscribed)
      timeoutChannel.unsubscribe(receiveTimeoutDiagnostic)
  }
}

void main().catch(() => {
  printError(unexpectedTestError)
  process.exitCode = 1
})

import { loadEnvFile } from 'node:process'
import { parseArgs } from 'node:util'

import { normalizeHostname } from '../lib/domain-analysis/analyzer.helpers'
import type { OpportunityQualificationTestReport } from '../lib/opportunities/qualification-test.types'

const options = {
  'confirm-live-domain-availability-request': { type: 'boolean' as const },
  businessName: { type: 'string' as const },
  currentDomain: { type: 'string' as const },
  keyword: { type: 'string' as const },
  city: { type: 'string' as const },
  state: { type: 'string' as const },
  country: { type: 'string' as const },
  placeId: { type: 'string' as const },
  primaryType: { type: 'string' as const },
}

const safeAvailabilityErrors = Object.freeze({
  DOMAIN_AVAILABILITY_CONFIGURATION_MISSING:
    'Domain availability configuration is missing.',
  DOMAIN_AVAILABILITY_HTTP_ERROR: 'Domain availability request failed.',
  DOMAIN_AVAILABILITY_RATE_LIMITED:
    'Domain availability is temporarily rate limited.',
  DOMAIN_AVAILABILITY_TIMEOUT: 'Domain availability request timed out.',
  DOMAIN_AVAILABILITY_CANCELLED: 'Domain availability request was cancelled.',
  DOMAIN_AVAILABILITY_INVALID_RESPONSE:
    'Domain availability returned an invalid response.',
  DOMAIN_AVAILABILITY_NETWORK_ERROR:
    'Domain availability network request failed.',
  DOMAIN_AVAILABILITY_EXECUTION_FAILED:
    'Domain availability execution failed.',
  DOMAIN_AVAILABILITY_INVALID_RESULT:
    'Domain availability returned an invalid result.',
})

type SafeAvailabilityErrorCode = keyof typeof safeAvailabilityErrors

const invalidArgumentsError = Object.freeze({
  code: 'OPPORTUNITY_QUALIFICATION_TEST_INVALID_ARGUMENTS',
  message: 'Opportunity qualification test arguments are invalid.',
})

const confirmationRequiredError = Object.freeze({
  code: 'OPPORTUNITY_QUALIFICATION_CONFIRMATION_REQUIRED',
  message: 'Live domain availability request is not confirmed.',
})

const unexpectedTestError = Object.freeze({
  code: 'OPPORTUNITY_QUALIFICATION_TEST_FAILED',
  message: 'Opportunity qualification test failed.',
})

const printError = (error: Readonly<{ code: string; message: string }>) =>
  console.error(JSON.stringify({ error }))

const toSafeExecutionError = (error: unknown) => {
  if (!error || typeof error !== 'object' || !('code' in error))
    return unexpectedTestError

  const code = error.code
  if (
    typeof code !== 'string' ||
    !Object.hasOwn(safeAvailabilityErrors, code)
  )
    return unexpectedTestError

  const safeCode = code as SafeAvailabilityErrorCode
  return Object.freeze({
    code: safeCode,
    message: safeAvailabilityErrors[safeCode],
  })
}

const normalizeArgument = (
  value: string | undefined,
  maximumLength: number
) => {
  if (value === undefined) return null
  const normalized = value.normalize('NFKC').trim().replace(/\s+/g, ' ')
  return normalized.length > 0 && normalized.length <= maximumLength
    ? normalized
    : null
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

  const businessName = normalizeArgument(parsed.values.businessName, 512)
  const currentDomain = normalizeHostname(parsed.values.currentDomain)
  const keyword = normalizeArgument(parsed.values.keyword, 256)
  const city = normalizeArgument(parsed.values.city, 256)
  const country = normalizeArgument(parsed.values.country, 256)
  const stateWasProvided = parsed.values.state !== undefined
  const state = normalizeArgument(parsed.values.state, 256)
  const placeIdWasProvided = parsed.values.placeId !== undefined
  const placeId = normalizeArgument(parsed.values.placeId, 1_024)
  const primaryTypeWasProvided = parsed.values.primaryType !== undefined
  const primaryType = normalizeArgument(parsed.values.primaryType, 128)

  if (
    !businessName ||
    !currentDomain ||
    !keyword ||
    !city ||
    !country ||
    (stateWasProvided && !state) ||
    (placeIdWasProvided && !placeId) ||
    (primaryTypeWasProvided && !primaryType)
  ) {
    printError(invalidArgumentsError)
    process.exitCode = 1
    return
  }

  if (!parsed.values['confirm-live-domain-availability-request']) {
    printError(confirmationRequiredError)
    process.exitCode = 2
    return
  }

  try {
    loadEnvFile('.env.local')
  } catch {
    printError({
      code: 'DOMAIN_AVAILABILITY_CONFIGURATION_MISSING',
      message:
        safeAvailabilityErrors.DOMAIN_AVAILABILITY_CONFIGURATION_MISSING,
    })
    process.exitCode = 1
    return
  }

  try {
    const { executeOpportunityQualificationTest } =
      await import('../lib/opportunities/qualification-test.service')
    const report = (await executeOpportunityQualificationTest({
      businessName,
      currentDomain,
      keyword,
      city,
      state,
      country,
      placeId,
      primaryType,
    })) satisfies OpportunityQualificationTestReport
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

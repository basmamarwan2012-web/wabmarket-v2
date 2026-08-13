export {}

import { normalizeHostname } from '../lib/domain-analysis/analyzer.helpers'

const CONFIRMATION = '--confirm-live-owned-domain-create'
const VALUE_OPTIONS = Object.freeze([
  '--firebaseUid',
  '--hostname',
  '--ownershipConfirmed',
] as const)

type ValueOption = (typeof VALUE_OPTIONS)[number]

interface ParsedArguments {
  readonly firebaseUid: string
  readonly hostname: string
  readonly ownershipConfirmed: true
}

class OperatorArgumentError extends Error {
  constructor(
    readonly code:
      | 'OWNED_DOMAIN_CONFIRMATION_REQUIRED'
      | 'OWNED_DOMAIN_ARGUMENT_INVALID',
    message: string
  ) {
    super(message)
  }
}

const printError = (code: string, message: string) => {
  console.error(JSON.stringify({ error: { code, message } }, null, 2))
  process.exitCode = 1
}

const parseArguments = (args: readonly string[]): ParsedArguments => {
  let confirmed = false
  const values = new Map<ValueOption, string>()

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index]
    if (argument === CONFIRMATION) {
      if (confirmed) throw new OperatorArgumentError(
        'OWNED_DOMAIN_ARGUMENT_INVALID',
        'The owned-domain operator arguments are invalid.'
      )
      confirmed = true
      continue
    }
    if (!VALUE_OPTIONS.includes(argument as ValueOption))
      throw new OperatorArgumentError(
        'OWNED_DOMAIN_ARGUMENT_INVALID',
        'The owned-domain operator arguments are invalid.'
      )
    const option = argument as ValueOption
    const value = args[index + 1]
    if (!value || value.startsWith('--') || values.has(option))
      throw new OperatorArgumentError(
        'OWNED_DOMAIN_ARGUMENT_INVALID',
        'The owned-domain operator arguments are invalid.'
      )
    values.set(option, value)
    index += 1
  }

  if (!confirmed)
    throw new OperatorArgumentError(
      'OWNED_DOMAIN_CONFIRMATION_REQUIRED',
      `Owned-domain creation requires ${CONFIRMATION}.`
    )
  if (values.size !== VALUE_OPTIONS.length)
    throw new OperatorArgumentError(
      'OWNED_DOMAIN_ARGUMENT_INVALID',
      'The owned-domain operator arguments are invalid.'
    )

  const rawFirebaseUid = values.get('--firebaseUid')!
  const rawHostname = values.get('--hostname')!
  const hostname = normalizeHostname(rawHostname)
  const firebaseUid = rawFirebaseUid.trim()
  if (
    !firebaseUid ||
    firebaseUid !== rawFirebaseUid ||
    firebaseUid.length > 128 ||
    values.get('--ownershipConfirmed') !== 'true' ||
    !hostname
  )
    throw new OperatorArgumentError(
      'OWNED_DOMAIN_ARGUMENT_INVALID',
      'The owned-domain operator arguments are invalid.'
    )

  return Object.freeze({ firebaseUid, hostname, ownershipConfirmed: true })
}

const SAFE_MESSAGES = Object.freeze({
  PERSISTENCE_CONFIGURATION_INVALID: 'Database configuration is unavailable.',
  PERSISTENCE_UNAVAILABLE: 'Business data storage is unavailable.',
  PERSISTENCE_CONFLICT: 'The owned domain conflicts with existing data.',
  PERSISTENCE_INVALID_INPUT: 'The owned-domain request is invalid.',
})

const main = async () => {
  let parsed: ParsedArguments
  try {
    parsed = parseArguments(process.argv.slice(2))
  } catch (error) {
    if (error instanceof OperatorArgumentError) {
      printError(error.code, error.message)
      return
    }
    printError(
      'OWNED_DOMAIN_ARGUMENT_INVALID',
      'The owned-domain operator arguments are invalid.'
    )
    return
  }

  try {
    const { loadEnvFile } = await import('node:process')
    loadEnvFile('.env.local')
    const { seedOwnedDomain } = await import(
      '../infrastructure/mysql/owned-domain-operator'
    )
    const output = await seedOwnedDomain(parsed)
    console.log(JSON.stringify(output, null, 2))
  } catch (error) {
    const errorCode =
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      typeof error.code === 'string'
        ? error.code
        : 'PERSISTENCE_UNAVAILABLE'
    const code = errorCode in SAFE_MESSAGES
      ? (errorCode as keyof typeof SAFE_MESSAGES)
      : 'PERSISTENCE_UNAVAILABLE'
    printError(code, SAFE_MESSAGES[code])
  }
}

void main()

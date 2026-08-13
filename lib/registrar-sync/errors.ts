export const REGISTRAR_SYNC_ERROR_CODES = Object.freeze([
  'REGISTRAR_CONFIGURATION_MISSING',
  'REGISTRAR_AUTH_FAILED',
  'REGISTRAR_REQUEST_FAILED',
  'REGISTRAR_RESPONSE_INVALID',
  'REGISTRAR_SYNC_TRUNCATED',
  'REGISTRAR_SYNC_FAILED',
] as const)

export type RegistrarSyncErrorCode =
  (typeof REGISTRAR_SYNC_ERROR_CODES)[number]

const SAFE_MESSAGES: Readonly<Record<RegistrarSyncErrorCode, string>> =
  Object.freeze({
    REGISTRAR_CONFIGURATION_MISSING:
      'Registrar synchronization is not configured.',
    REGISTRAR_AUTH_FAILED: 'Registrar authentication failed.',
    REGISTRAR_REQUEST_FAILED: 'Registrar inventory request failed.',
    REGISTRAR_RESPONSE_INVALID: 'Registrar returned an invalid response.',
    REGISTRAR_SYNC_TRUNCATED:
      'Registrar synchronization reached its safety limit.',
    REGISTRAR_SYNC_FAILED: 'Registrar synchronization failed.',
  })

export class RegistrarSyncError extends Error {
  readonly code: RegistrarSyncErrorCode

  constructor(code: RegistrarSyncErrorCode, options?: ErrorOptions) {
    super(SAFE_MESSAGES[code], options)
    this.name = 'RegistrarSyncError'
    this.code = code
  }
}

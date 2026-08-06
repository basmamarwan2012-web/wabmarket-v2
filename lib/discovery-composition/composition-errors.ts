import 'server-only'

import type { DiscoveryCompositionErrorCode, SafeDiscoveryCompositionError } from '@/types/discovery-composition'

export class DiscoveryCompositionError extends Error {
  constructor(
    public readonly code: DiscoveryCompositionErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'DiscoveryCompositionError'
  }
}

export function toSafeCompositionError(error: DiscoveryCompositionError): SafeDiscoveryCompositionError {
  return Object.freeze({ code: error.code, message: error.message })
}

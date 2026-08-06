import 'server-only'

import type { OrchestrationResultCode, SafeOrchestrationResult } from '@/types/discovery-orchestrator'

export class DiscoveryOrchestrationError extends Error {
  constructor(public readonly code: OrchestrationResultCode, message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'DiscoveryOrchestrationError'
  }
}

export function safeOrchestrationFailure(
  code: Extract<SafeOrchestrationResult, { success: false }>['code'],
  message: string
): Extract<SafeOrchestrationResult, { success: false }> {
  return Object.freeze({ success: false, code, message })
}

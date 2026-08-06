import 'server-only'

export type PolicyErrorCode =
  | 'POLICY_INVALID_CONFIGURATION'
  | 'POLICY_UNKNOWN_PROVIDER'
  | 'POLICY_INVARIANT_VIOLATION'

/** Internal validation/programmer error; normal ineligibility uses safe reasons. */
export class ProviderPolicyError extends Error {
  constructor(
    public readonly code: PolicyErrorCode,
    message: string,
    public readonly cause?: unknown
  ) {
    super(message)
    this.name = 'ProviderPolicyError'
  }
}

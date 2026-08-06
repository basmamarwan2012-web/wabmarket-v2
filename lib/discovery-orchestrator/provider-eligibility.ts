import 'server-only'

import type {
  EligibilityReason,
  EligibilityReasonCode,
  ProviderEligibilityInput,
  ProviderEligibilityResult,
} from '@/types/discovery-orchestrator'

const blocking = (code: EligibilityReasonCode): EligibilityReason =>
  Object.freeze({ code, severity: 'blocking', message: code })

/** Pure aggregation of already-produced decisions; performs no I/O or reservation. */
export function evaluateProviderEligibility(
  input: Readonly<ProviderEligibilityInput>
): ProviderEligibilityResult {
  const reasons: EligibilityReason[] = []
  if (!input.configurationValid)
    reasons.push(blocking('POLICY_INVALID_CONFIGURATION'))
  if (!input.providerKnown) reasons.push(blocking('POLICY_UNKNOWN_PROVIDER'))
  if (!input.enabled) reasons.push(blocking('POLICY_PROVIDER_DISABLED'))
  if (!input.categorySupported)
    reasons.push(blocking('POLICY_CATEGORY_UNSUPPORTED'))
  if (!input.capabilitySupported)
    reasons.push(blocking('POLICY_CAPABILITY_UNSUPPORTED'))
  if (!input.searchModeSupported)
    reasons.push(blocking('POLICY_SEARCH_MODE_UNSUPPORTED'))
  if (!input.requestCompatible)
    reasons.push(blocking('POLICY_REQUEST_INCOMPATIBLE'))
  if (!input.executionPolicyAllowed)
    reasons.push(
      blocking(input.executionPolicyReason ?? 'POLICY_FREE_ONLY_REQUIRED')
    )
  if (input.emergencyStopBlocked)
    reasons.push(blocking('POLICY_EMERGENCY_STOP'))
  if (!input.healthDecision.allowed)
    reasons.push(blocking('POLICY_PROVIDER_UNHEALTHY'))
  if (input.quotaDecision.status !== 'allowed')
    reasons.push(blocking('POLICY_QUOTA_EXHAUSTED'))
  if (input.budgetDecision.status !== 'allowed')
    reasons.push(blocking('POLICY_BUDGET_BLOCKED'))
  return Object.freeze({
    providerIdentifier: input.providerIdentifier,
    eligible: reasons.length === 0,
    reasons: Object.freeze(reasons),
  })
}

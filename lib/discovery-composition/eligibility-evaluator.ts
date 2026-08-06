import 'server-only'

import type { ProviderEligibilityInput, ProviderEligibilityResult } from '@/types/discovery-orchestrator'
import { evaluateProviderEligibility } from '@/lib/discovery-orchestrator/provider-eligibility'

export interface EligibilityEvaluator {
  evaluate(input: Readonly<ProviderEligibilityInput>): ProviderEligibilityResult
}

export class PureEligibilityEvaluator implements EligibilityEvaluator {
  evaluate(input: Readonly<ProviderEligibilityInput>): ProviderEligibilityResult {
    return evaluateProviderEligibility(input)
  }
}

import 'server-only'

import { z } from 'zod'

import { createInternalGoogleProviderTestExecutor } from '@/lib/discovery-composition/composition'
import { DiscoveryProviderError } from '@/lib/discovery-providers'
import type { GoogleQualityDiagnostics } from '@/lib/discovery-providers/providers/google-result-quality'
import type {
  GoogleProviderTestRequest,
  GoogleProviderTestResult,
} from './provider-test.types'

const rejectionReasons = z.object({
  invalid_url: z.number().int().nonnegative(),
  unsupported_protocol: z.number().int().nonnegative(),
  local_or_private_host: z.number().int().nonnegative(),
  blocked_host: z.number().int().nonnegative(),
  downloadable_resource: z.number().int().nonnegative(),
  below_threshold: z.number().int().nonnegative(),
  duplicate_host: z.number().int().nonnegative(),
})
const diagnosticsSchema = z.object({
  googleResultsReceived: z.number().int().nonnegative(),
  acceptedResults: z.number().int().nonnegative(),
  hardRejectedResults: z.number().int().nonnegative(),
  belowThresholdResults: z.number().int().nonnegative(),
  duplicateHostResults: z.number().int().nonnegative(),
  blockedHostResults: z.number().int().nonnegative(),
  invalidUrlResults: z.number().int().nonnegative(),
  nonWebsiteResults: z.number().int().nonnegative(),
  acceptedDomains: z.array(z.string()),
  rejectionReasonCounts: rejectionReasons,
})

export async function executeGoogleProviderTest(
  request: GoogleProviderTestRequest
): Promise<GoogleProviderTestResult> {
  const executor = createInternalGoogleProviderTestExecutor()
  const execution = await executor.execute(request)
  const parsed = diagnosticsSchema.safeParse(execution.diagnostics)
  if (!parsed.success)
    throw new DiscoveryProviderError(
      'PROVIDER_INVALID_RESPONSE',
      'Google quality diagnostics are invalid.',
      { cause: parsed.error }
    )
  const diagnostics = parsed.data as GoogleQualityDiagnostics
  const total =
    diagnostics.acceptedResults +
    diagnostics.hardRejectedResults +
    diagnostics.belowThresholdResults +
    diagnostics.duplicateHostResults
  if (total !== diagnostics.googleResultsReceived)
    throw new DiscoveryProviderError(
      'PROVIDER_INVALID_RESPONSE',
      'Google quality diagnostic counts are inconsistent.'
    )
  return Object.freeze({
    providerResult: execution.result,
    diagnostics,
  })
}

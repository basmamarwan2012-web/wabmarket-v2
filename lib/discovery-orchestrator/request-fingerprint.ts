import 'server-only'

import type { CanonicalFingerprintCriteria } from '@/types/discovery-orchestrator'

/** Implementations must deterministically fingerprint already-normalized criteria. */
export interface RequestFingerprint {
  create(criteria: Readonly<CanonicalFingerprintCriteria>): Promise<string>
}

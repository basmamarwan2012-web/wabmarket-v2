import 'server-only'

import type { FingerprintInput } from '@/types/provider-cache'

/** Implementations must deterministically fingerprint already-normalized criteria. */
export interface RequestFingerprint {
  create(input: Readonly<FingerprintInput>): Promise<string>
}

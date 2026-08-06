import 'server-only'

import type { CacheRecord, OrchestrationCacheValue } from '@/types/discovery-orchestrator'

export interface CacheManager {
  lookup<T extends OrchestrationCacheValue>(fingerprint: string): Promise<CacheRecord<T> | null>
  store<T extends OrchestrationCacheValue>(record: CacheRecord<T>): Promise<void>
  invalidate(fingerprint: string): Promise<void>
  invalidateByProvider(providerIdentifier: string): Promise<void>
  invalidateByFingerprint(fingerprint: string): Promise<void>
}

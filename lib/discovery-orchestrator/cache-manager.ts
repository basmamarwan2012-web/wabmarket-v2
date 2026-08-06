import 'server-only'

import type { ProviderCacheRecord, ProviderCacheValue } from '@/types/provider-cache'

export interface CacheManager {
  lookup<T extends ProviderCacheValue>(fingerprint: string, namespace: string): Promise<ProviderCacheRecord<T> | null>
  store<T extends ProviderCacheValue>(record: ProviderCacheRecord<T>): Promise<void>
  invalidate(fingerprint: string): Promise<void>
  invalidateByProvider(providerIdentifier: string): Promise<void>
  invalidateByFingerprint(fingerprint: string): Promise<void>
}

export type ProviderHealthState = 'healthy' | 'degraded' | 'offline' | 'quota_exhausted' | 'disabled' | 'unknown'
export interface ProviderHealthSnapshot { readonly state: ProviderHealthState; readonly lastSuccessAt: string | null; readonly lastFailureAt: string | null; readonly retryAfter: string | null; readonly consecutiveFailures: number; readonly availabilityScore: number | null }
export interface ProviderHealthDecision extends ProviderHealthSnapshot { readonly allowed: boolean; readonly reason: string | null }
export interface ProviderHealthDefaults { readonly unknownStateAllowed: boolean; readonly minimumAvailabilityScore: number | null }

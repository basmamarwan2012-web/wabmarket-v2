export const GOOGLE_PLACES_USAGE_POLICY = Object.freeze({
  defaultMaxResults: 20,
  maxResultsPerSearch: 20,
  maxPagesPerExecution: 1,
  clientTimeoutMs: 10_000,
  retries: 0,
  parallelPageRequests: 0,
})

export const resolveGooglePlacesMaxResults = (
  value: number | null | undefined
) => {
  const resolved = value ?? GOOGLE_PLACES_USAGE_POLICY.defaultMaxResults
  return Number.isInteger(resolved) &&
    resolved >= 1 &&
    resolved <= GOOGLE_PLACES_USAGE_POLICY.maxResultsPerSearch
    ? resolved
    : null
}

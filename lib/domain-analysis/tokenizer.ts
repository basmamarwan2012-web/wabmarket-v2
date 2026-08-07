export const tokenizeNormalizedBusinessName = (normalizedName: string) =>
  Object.freeze(normalizedName ? normalizedName.split(' ') : [])

const tokenizeHostnameLabel = (label: string) =>
  label.split('-').flatMap((segment) => segment.match(/[a-z]+|\d+/g) ?? [])

/**
 * Excludes only the factual rightmost label. Concatenated words are retained;
 * no semantic word segmentation is attempted.
 */
export const tokenizeHostnameLabels = (hostnameLabels: readonly string[]) =>
  Object.freeze(hostnameLabels.slice(0, -1).flatMap(tokenizeHostnameLabel))

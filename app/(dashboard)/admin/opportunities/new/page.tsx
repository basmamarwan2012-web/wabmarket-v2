import { permanentRedirect } from 'next/navigation'

type SearchParams = Record<string, string | string[] | undefined>

function querySuffix(values: SearchParams) {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(values)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item))
    else if (value !== undefined) params.set(key, value)
  }
  const query = params.toString()
  return query ? `?${query}` : ''
}

export default async function LegacyNewDiscoveryRedirect({
  searchParams,
}: {
  searchParams: Promise<SearchParams>
}) {
  permanentRedirect(`/admin/discovery/new${querySuffix(await searchParams)}`)
}

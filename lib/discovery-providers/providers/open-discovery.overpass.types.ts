export type OpenDiscoveryOverpassElementType = 'node' | 'way' | 'relation'

export interface OpenDiscoveryOverpassCoordinate {
  readonly lat: number
  readonly lon: number
}

export interface OpenDiscoveryOverpassElement {
  readonly type: OpenDiscoveryOverpassElementType
  readonly id: number
  readonly lat?: number
  readonly lon?: number
  readonly center?: OpenDiscoveryOverpassCoordinate
  readonly tags?: Readonly<Record<string, string>>
}

export interface OpenDiscoveryOverpassResponse {
  readonly version: number
  readonly generator: string
  readonly elements: readonly OpenDiscoveryOverpassElement[]
}

export interface OpenDiscoveryOverpassTransportOptions {
  readonly signal?: AbortSignal
}

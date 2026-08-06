export interface GoogleCustomSearchItem {
  readonly link: string
  readonly title: string | null
  readonly cacheId: string | null
  readonly snippet: string | null
  readonly displayLink: string | null
  readonly formattedUrl: string | null
}

export interface GoogleCustomSearchResponse {
  readonly items: readonly GoogleCustomSearchItem[]
}

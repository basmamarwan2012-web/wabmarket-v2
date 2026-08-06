import 'server-only'

export interface GoogleCustomSearchRequestParameters {
  readonly query: string
  readonly maxResults: number
  readonly languageRestriction: string | null
  readonly exactTerms: string | null
  readonly excludeTerms: string
  readonly orTerms: string
  readonly safe: 'active'
  readonly filter: '1'
}

export interface GoogleCustomSearchCredentials {
  createRequestUrl(parameters: GoogleCustomSearchRequestParameters): URL
}

export type GoogleCustomSearchConfigurationResult =
  | { readonly success: true; readonly credentials: GoogleCustomSearchCredentials }
  | {
      readonly success: false
      readonly reason:
        | 'missing_api_key'
        | 'missing_search_engine_id'
        | 'invalid_empty_configuration'
    }

export type GoogleCustomSearchConfigurationLoader =
  () => GoogleCustomSearchConfigurationResult

export const loadGoogleCustomSearchConfiguration: GoogleCustomSearchConfigurationLoader =
  () => {
    const rawApiKey = process.env.GOOGLE_API_KEY
    const rawSearchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID
    if (rawApiKey === undefined)
      return Object.freeze({ success: false, reason: 'missing_api_key' })
    if (rawSearchEngineId === undefined)
      return Object.freeze({
        success: false,
        reason: 'missing_search_engine_id',
      })

    const apiKey = rawApiKey.trim()
    const searchEngineId = rawSearchEngineId.trim()
    if (!apiKey || !searchEngineId)
      return Object.freeze({
        success: false,
        reason: 'invalid_empty_configuration',
      })

    return Object.freeze({
      success: true,
      credentials: Object.freeze({
        createRequestUrl(
          parameters: GoogleCustomSearchRequestParameters
        ): URL {
          const url = new URL('https://www.googleapis.com/customsearch/v1')
          url.searchParams.set('key', apiKey)
          url.searchParams.set('cx', searchEngineId)
          url.searchParams.set('q', parameters.query)
          url.searchParams.set('num', String(parameters.maxResults))
          if (parameters.languageRestriction)
            url.searchParams.set('lr', parameters.languageRestriction)
          if (parameters.exactTerms)
            url.searchParams.set('exactTerms', parameters.exactTerms)
          url.searchParams.set('excludeTerms', parameters.excludeTerms)
          url.searchParams.set('orTerms', parameters.orTerms)
          url.searchParams.set('safe', parameters.safe)
          url.searchParams.set('filter', parameters.filter)
          return url
        },
      }),
    })
  }

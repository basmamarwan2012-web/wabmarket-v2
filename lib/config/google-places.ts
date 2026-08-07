import 'server-only'

export interface GooglePlacesCredentials {
  createRequestHeaders(fieldMask: string): Readonly<Record<string, string>>
}

export type GooglePlacesConfigurationResult =
  | {
      readonly success: true
      readonly credentials: GooglePlacesCredentials
    }
  | {
      readonly success: false
      readonly reason: 'missing_api_key' | 'invalid_empty_configuration'
    }

export type GooglePlacesConfigurationLoader =
  () => GooglePlacesConfigurationResult

export const loadGooglePlacesConfiguration: GooglePlacesConfigurationLoader =
  () => {
    const rawApiKey = process.env.GOOGLE_PLACES_API_KEY
    if (rawApiKey === undefined)
      return Object.freeze({ success: false, reason: 'missing_api_key' })

    const apiKey = rawApiKey.trim()
    if (!apiKey)
      return Object.freeze({
        success: false,
        reason: 'invalid_empty_configuration',
      })

    return Object.freeze({
      success: true,
      credentials: Object.freeze({
        createRequestHeaders(fieldMask: string) {
          return Object.freeze({
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': apiKey,
            'X-Goog-FieldMask': fieldMask,
          })
        },
      }),
    })
  }

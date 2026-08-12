import 'server-only'

export interface DynadotCredentials {
  createRequestHeaders(): Readonly<Record<string, string>>
}

export type DynadotConfigurationResult =
  | {
      readonly success: true
      readonly credentials: DynadotCredentials
    }
  | {
      readonly success: false
      readonly reason: 'missing_api_key' | 'invalid_empty_configuration'
    }

export type DynadotConfigurationLoader = () => DynadotConfigurationResult

export const loadDynadotConfiguration: DynadotConfigurationLoader = () => {
  const rawApiKey = process.env.DYNADOT_API_KEY
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
      createRequestHeaders() {
        return Object.freeze({
          Accept: 'application/json',
          Authorization: `Bearer ${apiKey}`,
        })
      },
    }),
  })
}

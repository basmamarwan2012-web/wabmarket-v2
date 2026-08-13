import 'server-only'

import { createHmac } from 'node:crypto'

export interface DynadotCredentials {
  createRequestHeaders(): Readonly<Record<string, string>>
}

export interface DynadotSignedInventoryCredentials {
  createSignedRequestHeaders(
    fullPathAndQuery: string,
    requestId: string,
    requestBody: string
  ): Readonly<Record<string, string>>
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

export type DynadotSignedInventoryConfigurationResult =
  | {
      readonly success: true
      readonly credentials: DynadotSignedInventoryCredentials
    }
  | {
      readonly success: false
      readonly reason:
        | 'missing_api_key'
        | 'missing_api_secret'
        | 'invalid_empty_configuration'
    }

export type DynadotSignedInventoryConfigurationLoader =
  () => DynadotSignedInventoryConfigurationResult

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

export const loadDynadotSignedInventoryConfiguration: DynadotSignedInventoryConfigurationLoader =
  () => {
    const rawApiKey = process.env.DYNADOT_API_KEY
    const rawApiSecret = process.env.DYNADOT_API_SECRET
    if (rawApiKey === undefined)
      return Object.freeze({ success: false, reason: 'missing_api_key' })
    if (rawApiSecret === undefined)
      return Object.freeze({ success: false, reason: 'missing_api_secret' })

    const apiKey = rawApiKey.trim()
    const apiSecret = rawApiSecret.trim()
    if (!apiKey || !apiSecret)
      return Object.freeze({
        success: false,
        reason: 'invalid_empty_configuration',
      })

    return Object.freeze({
      success: true,
      credentials: Object.freeze({
        createSignedRequestHeaders(
          fullPathAndQuery: string,
          requestId: string,
          requestBody: string
        ) {
          const stringToSign = `${apiKey}\n${fullPathAndQuery}\n${requestId}\n${requestBody}`
          const signature = createHmac('sha256', apiSecret)
            .update(stringToSign, 'utf8')
            .digest('base64')
          return Object.freeze({
            Accept: 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'X-Request-ID': requestId,
            'X-Signature': signature,
          })
        },
      }),
    })
  }

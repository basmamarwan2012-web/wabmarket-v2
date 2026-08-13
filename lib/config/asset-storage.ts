import 'server-only'

import path from 'node:path'

export class AssetStorageConfigurationError extends Error {
  readonly code = 'ASSET_STORAGE_ROOT_INVALID' as const

  constructor() {
    super('Asset storage configuration is invalid.')
    this.name = 'AssetStorageConfigurationError'
  }
}

export interface AssetStorageConfig {
  readonly root: string
}

export const getAssetStorageConfig = (
  environment: NodeJS.ProcessEnv = process.env
): AssetStorageConfig => {
  const configured = environment.ASSET_STORAGE_ROOT?.trim()
  if (!configured || !path.isAbsolute(configured))
    throw new AssetStorageConfigurationError()
  return Object.freeze({ root: path.resolve(configured) })
}

export const ASSET_ERROR_CODES = Object.freeze([
  'ASSET_INVALID_INPUT',
  'ASSET_UNSUPPORTED_KIND',
  'ASSET_UNSUPPORTED_FORMAT',
  'ASSET_MIME_MISMATCH',
  'ASSET_TOO_LARGE',
  'ASSET_NOT_FOUND',
  'ASSET_IN_USE',
  'ASSET_STORAGE_UNAVAILABLE',
  'ASSET_COMPENSATION_FAILED',
] as const)

export type AssetErrorCode = (typeof ASSET_ERROR_CODES)[number]

const MESSAGES: Readonly<Record<AssetErrorCode, string>> = Object.freeze({
  ASSET_INVALID_INPUT: 'The asset request is invalid.',
  ASSET_UNSUPPORTED_KIND: 'The asset kind is not supported.',
  ASSET_UNSUPPORTED_FORMAT: 'The uploaded file format is not supported.',
  ASSET_MIME_MISMATCH: 'The uploaded file type does not match its contents.',
  ASSET_TOO_LARGE: 'The uploaded file exceeds the allowed size.',
  ASSET_NOT_FOUND: 'The requested asset was not found.',
  ASSET_IN_USE: 'The asset is currently in use and cannot be deleted.',
  ASSET_STORAGE_UNAVAILABLE: 'Asset storage is unavailable.',
  ASSET_COMPENSATION_FAILED: 'Asset cleanup could not be completed safely.',
})

export class AssetError extends Error {
  constructor(readonly code: AssetErrorCode) {
    super(MESSAGES[code])
    this.name = 'AssetError'
  }
}

export const sanitizeAssetError = (error: unknown) =>
  error instanceof AssetError
    ? error
    : new AssetError('ASSET_STORAGE_UNAVAILABLE')

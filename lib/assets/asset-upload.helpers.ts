import { createHash } from 'node:crypto'

import type { DomainAssetKind } from './asset-metadata.repository'
import { AssetError } from './asset.errors'
import type { UploadedAssetPayload } from './asset-upload.types'

export const ASSET_SIZE_LIMITS: Readonly<Record<DomainAssetKind, number>> =
  Object.freeze({
    LOGO: 2 * 1024 * 1024,
    FAVICON: 512 * 1024,
    OPEN_GRAPH_IMAGE: 5 * 1024 * 1024,
  })

export type ValidatedAssetFormat = 'PNG' | 'JPEG' | 'WEBP' | 'ICO'

export interface ValidatedAssetUpload {
  readonly contents: Uint8Array
  readonly mimeType: string
  readonly extension: 'png' | 'jpg' | 'webp' | 'ico'
  readonly checksum: string
  readonly byteSize: number
}

const signature = (bytes: Uint8Array, expected: readonly number[]) =>
  expected.every((value, index) => bytes[index] === value)

const ascii = (bytes: Uint8Array, start: number, end: number) =>
  String.fromCharCode(...bytes.slice(start, end))

const uint32LittleEndian = (bytes: Uint8Array, offset: number) =>
  (bytes[offset] |
    (bytes[offset + 1] << 8) |
    (bytes[offset + 2] << 16) |
    (bytes[offset + 3] << 24)) >>> 0

const validIcoStructure = (bytes: Uint8Array) => {
  if (bytes.length < 22 || !signature(bytes, [0, 0, 1, 0])) return false
  const count = bytes[4] | (bytes[5] << 8)
  const directoryEnd = 6 + count * 16
  if (count === 0 || directoryEnd > bytes.length) return false
  let contentEnd = directoryEnd
  for (let index = 0; index < count; index += 1) {
    const entry = 6 + index * 16
    const size = uint32LittleEndian(bytes, entry + 8)
    const offset = uint32LittleEndian(bytes, entry + 12)
    if (size === 0 || offset < directoryEnd || offset + size > bytes.length)
      return false
    contentEnd = Math.max(contentEnd, offset + size)
  }
  return contentEnd === bytes.length
}

const detectFormat = (bytes: Uint8Array): ValidatedAssetFormat | null => {
  if (
    bytes.length >= 45 &&
    signature(bytes, [137, 80, 78, 71, 13, 10, 26, 10]) &&
    ascii(bytes, 12, 16) === 'IHDR' &&
    signature(bytes.slice(-12), [0, 0, 0, 0, 73, 69, 78, 68, 174, 66, 96, 130])
  )
    return 'PNG'
  if (bytes.length >= 4 && signature(bytes, [255, 216, 255]) && bytes.at(-2) === 255 && bytes.at(-1) === 217) return 'JPEG'
  if (
    bytes.length >= 20 &&
    ascii(bytes, 0, 4) === 'RIFF' &&
    uint32LittleEndian(bytes, 4) === bytes.length - 8 &&
    ascii(bytes, 8, 12) === 'WEBP' &&
    ['VP8 ', 'VP8L', 'VP8X'].includes(ascii(bytes, 12, 16))
  )
    return 'WEBP'
  if (validIcoStructure(bytes)) return 'ICO'
  return null
}

const FORMATS: Readonly<
  Record<
    ValidatedAssetFormat,
    Readonly<{ mimeType: string; acceptedMimeTypes: readonly string[]; extension: ValidatedAssetUpload['extension'] }>
  >
> = Object.freeze({
  PNG: Object.freeze({ mimeType: 'image/png', acceptedMimeTypes: Object.freeze(['image/png']), extension: 'png' }),
  JPEG: Object.freeze({ mimeType: 'image/jpeg', acceptedMimeTypes: Object.freeze(['image/jpeg']), extension: 'jpg' }),
  WEBP: Object.freeze({ mimeType: 'image/webp', acceptedMimeTypes: Object.freeze(['image/webp']), extension: 'webp' }),
  ICO: Object.freeze({ mimeType: 'image/x-icon', acceptedMimeTypes: Object.freeze(['image/x-icon', 'image/vnd.microsoft.icon']), extension: 'ico' }),
})

const ALLOWED: Readonly<Record<DomainAssetKind, readonly ValidatedAssetFormat[]>> =
  Object.freeze({
    LOGO: Object.freeze<ValidatedAssetFormat[]>(['PNG', 'JPEG', 'WEBP']),
    FAVICON: Object.freeze<ValidatedAssetFormat[]>(['PNG', 'ICO']),
    OPEN_GRAPH_IMAGE: Object.freeze<ValidatedAssetFormat[]>(['PNG', 'JPEG', 'WEBP']),
  })

export const validateAssetUpload = (
  kind: DomainAssetKind,
  payload: UploadedAssetPayload
): ValidatedAssetUpload => {
  if (!(kind in ASSET_SIZE_LIMITS))
    throw new AssetError('ASSET_UNSUPPORTED_KIND')
  if (!(payload.contents instanceof Uint8Array) || payload.contents.byteLength === 0)
    throw new AssetError('ASSET_INVALID_INPUT')
  if (payload.contents.byteLength > ASSET_SIZE_LIMITS[kind])
    throw new AssetError('ASSET_TOO_LARGE')
  const format = detectFormat(payload.contents)
  if (!format || !ALLOWED[kind].includes(format))
    throw new AssetError('ASSET_UNSUPPORTED_FORMAT')
  const formatPolicy = FORMATS[format]
  if (!formatPolicy.acceptedMimeTypes.includes(payload.declaredMimeType.trim().toLowerCase()))
    throw new AssetError('ASSET_MIME_MISMATCH')
  return Object.freeze({
    contents: payload.contents.slice(),
    mimeType: formatPolicy.mimeType,
    extension: formatPolicy.extension,
    checksum: createHash('sha256').update(payload.contents).digest('hex'),
    byteSize: payload.contents.byteLength,
  })
}

export const createScopeHash = (value: string) =>
  createHash('sha256').update(value).digest('hex').slice(0, 16)

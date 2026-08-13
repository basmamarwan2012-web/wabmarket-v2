export interface PrivateAssetContent {
  readonly contents: Uint8Array
  readonly mimeType: string
  readonly byteSize: number
}

export interface ResolvePrivateAssetCommand {
  readonly hostname: string
  readonly assetId: string
}


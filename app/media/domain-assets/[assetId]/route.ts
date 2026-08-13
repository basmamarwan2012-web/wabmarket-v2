import { resolvePublishedAssetFromMySql } from '@/infrastructure/mysql/public-assets.composition'

export const runtime = 'nodejs'

interface RouteContext { readonly params: Promise<{ assetId: string }> }

export async function GET(_request: Request, context: RouteContext) {
  const asset = await resolvePublishedAssetFromMySql((await context.params).assetId)
  if (!asset) return new Response(null, { status: 404 })
  return new Response(Buffer.from(asset.contents), {
    headers: {
      'Content-Type': asset.mimeType,
      'Content-Length': String(asset.byteSize),
      // Publication can be revoked without changing the content-addressed file.
      // Revalidate every request so an unpublished asset immediately becomes private.
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

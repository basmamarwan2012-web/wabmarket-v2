'use client'

import { useRef, type ChangeEvent } from 'react'

import type { AdminMarketplaceDomainDetail } from '@/lib/marketplace/admin.types'

interface AdminAssetManagerProps {
  readonly hostname: string
  readonly kind: 'LOGO' | 'FAVICON' | 'OPEN_GRAPH_IMAGE'
  readonly label: string
  readonly assets: AdminMarketplaceDomainDetail['availableAssets']
  readonly selected: string | null
  readonly disabled: boolean
  onUpload(file: File): Promise<void>
  onDelete(assetId: string): Promise<void>
  onGenerate(): Promise<void>
}

export function AdminAssetManager(props: AdminAssetManagerProps) {
  const input = useRef<HTMLInputElement>(null)
  const selectedAsset = props.assets.find((asset) => asset.id === props.selected)
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) await props.onUpload(file)
    if (input.current) input.current.value = ''
  }
  return (
    <section className="space-y-2 rounded-lg border p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">{props.label}</p>
        <span className="text-xs text-gray-500">{selectedAsset ? 'Selected' : 'Missing / pending'}</span>
      </div>
      <input ref={input} type="file" disabled={props.disabled} accept={props.kind === 'FAVICON' ? 'image/png,image/x-icon,image/vnd.microsoft.icon,.ico' : 'image/png,image/jpeg,image/webp'} onChange={(event) => void upload(event)} className="block w-full text-xs" />
      <button type="button" disabled={props.disabled} onClick={() => void props.onGenerate()} className="rounded border px-2 py-1 text-xs disabled:opacity-50">{props.assets.some((asset) => asset.kind === props.kind) ? 'Regenerate' : 'Generate'}</button>
      <div className="space-y-1">
        {props.assets.filter((asset) => asset.kind === props.kind).map((asset) => (
          <div key={asset.id} className="flex items-center justify-between gap-2 text-xs">
            <span className="truncate">{asset.id}{asset.id === props.selected ? ' (current)' : ''}</span>
            <button type="button" disabled={props.disabled || asset.id === props.selected} onClick={() => void props.onDelete(asset.id)} className="rounded border px-2 py-1 disabled:opacity-50">Delete</button>
          </div>
        ))}
      </div>
    </section>
  )
}

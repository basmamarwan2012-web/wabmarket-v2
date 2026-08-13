'use client'

import { useState, type FormEvent, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'

import { hasPermission } from '@/lib/auth/permissions'
import type { UserRole } from '@/lib/auth/roles'
import type { AdminMarketplaceDomainDetail } from '@/lib/marketplace/admin.types'
import { marketplaceAdminService } from '@/services/marketplace-admin.service'
import { AdminAssetManager } from './admin-asset-manager'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700'

export function AdminPreparationForm({ detail, role }: Readonly<{ detail: AdminMarketplaceDomainDetail; role: UserRole }>) {
  const router = useRouter()
  const editable = hasPermission(role, 'domains.manage')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const execute = async (operation: () => Promise<unknown>, success: string) => {
    setBusy(true); setMessage(null)
    try { await operation(); setMessage(success); router.refresh() }
    catch (error) { setMessage(error instanceof Error ? error.message : 'The operation failed.') }
    finally { setBusy(false) }
  }
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    void execute(() => marketplaceAdminService.save(detail.hostname, {
      askingPrice: Number(data.get('askingPrice')),
      currency: String(data.get('currency') ?? ''),
      manualDescription: String(data.get('manualDescription') ?? '').trim() || null,
      externalSalesUrl: String(data.get('externalSalesUrl') ?? ''),
      ctaConfigured: data.get('ctaConfigured') === 'on',
      logoAssetId: String(data.get('logoAssetId') ?? '') || null,
      faviconAssetId: String(data.get('faviconAssetId') ?? '') || null,
      openGraphAssetId: String(data.get('openGraphAssetId') ?? '') || null,
      expectedVersion: detail.preparationVersion,
    }), 'Preparation saved.')
  }
  const assets = (kind: 'LOGO' | 'FAVICON' | 'OPEN_GRAPH_IMAGE') => detail.availableAssets.filter((asset) => asset.kind === kind && asset.status === 'AVAILABLE' && asset.publicReference)
  const uploadAsset = (kind: 'LOGO' | 'FAVICON' | 'OPEN_GRAPH_IMAGE', file: File) => execute(() => marketplaceAdminService.uploadAsset(detail.hostname, kind, file), `${kind.replaceAll('_', ' ')} uploaded.`)
  const deleteAsset = (assetId: string) => execute(() => marketplaceAdminService.deleteAsset(detail.hostname, assetId), 'Asset deleted.')

  return <div className="space-y-6">
    <form onSubmit={submit} className="space-y-5 rounded-xl border bg-white p-6 dark:bg-gray-900">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Asking price"><input name="askingPrice" type="number" min="0.01" step="0.01" required defaultValue={detail.askingPrice ?? ''} disabled={!editable || busy} className={inputClass} /></Field>
        <Field label="Currency"><input name="currency" required minLength={3} maxLength={3} defaultValue={detail.currency ?? 'USD'} disabled={!editable || busy} className={inputClass} /></Field>
        <Field label="External sales URL"><input name="externalSalesUrl" type="url" required defaultValue={detail.externalSalesUrl ?? ''} disabled={!editable || busy} className={inputClass} /></Field>
        <label className="flex items-end gap-2 pb-2 text-sm font-medium"><input name="ctaConfigured" type="checkbox" defaultChecked={detail.ctaConfigured} disabled={!editable || busy} /> CTA configured</label>
      </div>
      <Field label="Description override (optional)"><textarea name="manualDescription" rows={5} defaultValue={detail.manualDescription ?? ''} placeholder={detail.description ?? 'Leave blank to use deterministic template copy.'} disabled={!editable || busy} className={inputClass} /></Field>
      <div className="grid gap-4 md:grid-cols-3">
        <AssetSelect name="logoAssetId" label="Logo" assets={assets('LOGO')} selected={detail.selectedAssets.logoAssetId} disabled={!editable || busy} />
        <AssetSelect name="faviconAssetId" label="Favicon" assets={assets('FAVICON')} selected={detail.selectedAssets.faviconAssetId} disabled={!editable || busy} />
        <AssetSelect name="openGraphAssetId" label="Open Graph image" assets={assets('OPEN_GRAPH_IMAGE')} selected={detail.selectedAssets.openGraphAssetId} disabled={!editable || busy} />
      </div>
      {editable && <button disabled={busy} className="rounded-md bg-black px-4 py-2 text-sm text-white disabled:opacity-50 dark:bg-white dark:text-black">Save preparation</button>}
    </form>
    {editable && <div className="grid gap-4 md:grid-cols-3">
      <AdminAssetManager hostname={detail.hostname} kind="LOGO" label="Logo uploads" assets={detail.availableAssets} selected={detail.selectedAssets.logoAssetId} disabled={busy} onUpload={(file) => uploadAsset('LOGO', file)} onDelete={deleteAsset} />
      <AdminAssetManager hostname={detail.hostname} kind="FAVICON" label="Favicon uploads" assets={detail.availableAssets} selected={detail.selectedAssets.faviconAssetId} disabled={busy} onUpload={(file) => uploadAsset('FAVICON', file)} onDelete={deleteAsset} />
      <AdminAssetManager hostname={detail.hostname} kind="OPEN_GRAPH_IMAGE" label="Open Graph uploads" assets={detail.availableAssets} selected={detail.selectedAssets.openGraphAssetId} disabled={busy} onUpload={(file) => uploadAsset('OPEN_GRAPH_IMAGE', file)} onDelete={deleteAsset} />
    </div>}
    {editable && <div className="flex flex-wrap gap-3">{detail.publicationState !== 'PUBLISHED' ? <button type="button" disabled={busy || !detail.ownershipConfirmed || detail.preparationVersion === null} onClick={() => void execute(() => marketplaceAdminService.publish(detail.hostname, { expectedPublicationVersion: detail.publicationVersion }), 'Listing published.')} className="rounded-md bg-emerald-700 px-4 py-2 text-sm text-white disabled:opacity-50">Publish</button> : <button type="button" disabled={busy || !detail.listingId || detail.publicationVersion === null} onClick={() => { const listingId = detail.listingId; const publicationVersion = detail.publicationVersion; if (listingId && publicationVersion !== null) void execute(() => marketplaceAdminService.unpublish(detail.hostname, { listingId, expectedPublicationVersion: publicationVersion }), 'Listing unpublished.') }} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">Unpublish</button>}</div>}
    {message && <p role="status" className="rounded-md border p-3 text-sm">{message}</p>}
  </div>
}

function Field({ label, children }: Readonly<{ label: string; children: ReactNode }>) { return <label className="space-y-2"><span className="block text-sm font-medium">{label}</span>{children}</label> }
function AssetSelect({ name, label, assets, selected, disabled }: Readonly<{ name: string; label: string; assets: AdminMarketplaceDomainDetail['availableAssets']; selected: string | null; disabled: boolean }>) { return <Field label={label}><select name={name} defaultValue={selected ?? ''} disabled={disabled} className={`${inputClass} dark:bg-gray-900`}><option value="">Missing / pending</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.id}</option>)}</select></Field> }

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent, type ReactNode } from 'react'

import { hasPermission } from '@/lib/auth/permissions'
import type { UserRole } from '@/lib/auth/roles'
import type { AdminMarketplaceDomainDetail } from '@/lib/marketplace/admin.types'
import { marketplaceAdminService } from '@/services/marketplace-admin.service'
import { AdminAssetManager } from './admin-asset-manager'

const inputClass =
  'w-full rounded-md border border-gray-300 bg-transparent px-3 py-2 text-sm dark:border-gray-700'

type ProgressState = 'MISSING' | 'GENERATING' | 'READY' | 'ERROR'

export function AdminPreparationForm({
  detail,
  role,
}: Readonly<{ detail: AdminMarketplaceDomainDetail; role: UserRole }>) {
  const router = useRouter()
  const editable = hasPermission(role, 'domains.manage')
  const [busy, setBusy] = useState(false)
  const [preparing, setPreparing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const execute = async (
    operation: () => Promise<unknown>,
    success: string,
    isPrepare = false
  ) => {
    setBusy(true)
    setPreparing(isPrepare)
    setFailed(false)
    setMessage(null)
    try {
      await operation()
      setMessage(success)
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'The operation failed.')
    } finally {
      setBusy(false)
      setPreparing(false)
    }
  }

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const action = ((event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null)?.value
    const facts = {
      askingPrice: Number(data.get('askingPrice')),
      currency: String(data.get('currency') ?? ''),
      manualDescription:
        String(data.get('manualDescription') ?? '').trim() || null,
      externalSalesUrl: String(data.get('externalSalesUrl') ?? ''),
      expectedVersion: detail.preparationVersion,
    }
    if (action === 'manual-save') {
      void execute(
        () =>
          marketplaceAdminService.save(detail.hostname, {
            ...facts,
            logoAssetId: String(data.get('logoAssetId') ?? '') || null,
            faviconAssetId: String(data.get('faviconAssetId') ?? '') || null,
            openGraphAssetId:
              String(data.get('openGraphAssetId') ?? '') || null,
          }),
        'Preparation saved.'
      )
      return
    }
    void execute(
      () => marketplaceAdminService.prepare(detail.hostname, facts),
      'Domain prepared. Review the preview, then publish when ready.',
      true
    )
  }

  const assets = (kind: 'LOGO' | 'FAVICON' | 'OPEN_GRAPH_IMAGE') =>
    detail.availableAssets.filter(
      (asset) =>
        asset.kind === kind &&
        asset.status === 'AVAILABLE' &&
        asset.publicReference
    )
  const uploadAsset = (
    kind: 'LOGO' | 'FAVICON' | 'OPEN_GRAPH_IMAGE',
    file: File
  ) =>
    execute(
      () => marketplaceAdminService.uploadAsset(detail.hostname, kind, file),
      `${kind.replaceAll('_', ' ')} uploaded.`
    )
  const deleteAsset = (assetId: string) =>
    execute(
      () => marketplaceAdminService.deleteAsset(detail.hostname, assetId),
      'Asset deleted.'
    )
  const generateAsset = (
    kind: 'LOGO' | 'FAVICON' | 'OPEN_GRAPH_IMAGE'
  ) =>
    execute(
      () =>
        marketplaceAdminService.generateAssets(detail.hostname, {
          action: 'GENERATE_ONE',
          kind,
        }),
      `${kind.replaceAll('_', ' ')} generated.`
    )

  const ready = detail.preparationReadiness !== 'NOT_PREPARED' && detail.preparationReadiness !== 'NOT_READY'
  const status = (isReady: boolean): ProgressState =>
    preparing ? 'GENERATING' : failed ? 'ERROR' : isReady ? 'READY' : 'MISSING'
  const salesReady =
    detail.askingPrice !== null &&
    detail.currency !== null &&
    detail.externalSalesUrl !== null

  return (
    <div className="space-y-6">
      <form onSubmit={submit} className="space-y-6">
        <section className="space-y-5 rounded-xl border bg-white p-6 dark:bg-gray-900">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Step 1</p>
            <h2 className="mt-1 text-lg font-semibold">Sales details</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Asking price">
              <input name="askingPrice" type="number" min="0.01" step="0.01" required defaultValue={detail.askingPrice ?? ''} disabled={!editable || busy} className={inputClass} />
            </Field>
            <Field label="Currency">
              <input name="currency" required minLength={3} maxLength={3} defaultValue={detail.currency ?? 'USD'} disabled={!editable || busy} className={inputClass} />
            </Field>
            <Field label="External sales URL">
              <input name="externalSalesUrl" type="url" required defaultValue={detail.externalSalesUrl ?? ''} disabled={!editable || busy} className={inputClass} />
            </Field>
          </div>
          <Field label="Description override (optional)">
            <textarea name="manualDescription" rows={4} defaultValue={detail.manualDescription ?? ''} placeholder={detail.description ?? 'Leave blank to use deterministic template copy.'} disabled={!editable || busy} className={inputClass} />
          </Field>
          {editable && (
            <button name="action" value="prepare" disabled={busy || !detail.ownershipConfirmed} className="rounded-md bg-black px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50 dark:bg-white dark:text-black">
              {preparing ? 'Preparing domain…' : 'Prepare domain'}
            </button>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 dark:bg-gray-900">
          <h2 className="font-semibold">Preparation status</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Status label="Sales info" state={status(salesReady)} />
            <Status label="Logo" state={status(detail.selectedAssets.logoAssetId !== null)} />
            <Status label="Favicon" state={status(detail.selectedAssets.faviconAssetId !== null)} />
            <Status label="Open Graph" state={status(detail.selectedAssets.openGraphAssetId !== null)} />
            <Status label="Landing page" state={status(detail.preparationVersion !== null)} />
            <Status label="Ready for marketplace" state={status(ready)} />
          </div>
        </section>

        <section className="flex flex-wrap items-center gap-3 rounded-xl border p-5">
          <div className="mr-auto">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Steps 3–4</p>
            <p className="mt-1 text-sm text-gray-600">Preview the prepared page before explicitly publishing it.</p>
          </div>
          {detail.preparationVersion !== null ? (
            <Link href={`/admin/marketplace/domains/${detail.hostname}/preview`} className="rounded-md border px-4 py-2 text-sm font-medium">Preview</Link>
          ) : (
            <span aria-disabled="true" className="rounded-md border px-4 py-2 text-sm opacity-50">Preview</span>
          )}
          {editable && detail.publicationState !== 'PUBLISHED' ? (
            <button type="button" disabled={busy || !detail.ownershipConfirmed || !ready || detail.preparationVersion === null} onClick={() => void execute(() => marketplaceAdminService.publish(detail.hostname, { expectedPublicationVersion: detail.publicationVersion }), 'Listing published.')} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Publish</button>
          ) : editable ? (
            <button type="button" disabled={busy || !detail.listingId || detail.publicationVersion === null} onClick={() => { const listingId = detail.listingId; const publicationVersion = detail.publicationVersion; if (listingId && publicationVersion !== null) void execute(() => marketplaceAdminService.unpublish(detail.hostname, { listingId, expectedPublicationVersion: publicationVersion }), 'Listing unpublished.') }} className="rounded-md border px-4 py-2 text-sm disabled:opacity-50">Unpublish</button>
          ) : null}
        </section>

        {editable && (
          <details className="rounded-xl border bg-white p-5 dark:bg-gray-900">
            <summary className="cursor-pointer font-semibold">Advanced asset controls</summary>
            <p className="mt-2 text-sm text-gray-500">Upload, regenerate, select, or delete asset alternatives manually.</p>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <AssetSelect name="logoAssetId" label="Selected logo" assets={assets('LOGO')} selected={detail.selectedAssets.logoAssetId} disabled={busy} />
              <AssetSelect name="faviconAssetId" label="Selected favicon" assets={assets('FAVICON')} selected={detail.selectedAssets.faviconAssetId} disabled={busy} />
              <AssetSelect name="openGraphAssetId" label="Selected Open Graph" assets={assets('OPEN_GRAPH_IMAGE')} selected={detail.selectedAssets.openGraphAssetId} disabled={busy} />
            </div>
            <button name="action" value="manual-save" disabled={busy} className="mt-4 rounded-md border px-4 py-2 text-sm font-medium disabled:opacity-50">Save manual selections</button>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <AdminAssetManager hostname={detail.hostname} kind="LOGO" label="Logo assets" assets={detail.availableAssets} selected={detail.selectedAssets.logoAssetId} disabled={busy} onUpload={(file) => uploadAsset('LOGO', file)} onDelete={deleteAsset} onGenerate={() => generateAsset('LOGO')} />
              <AdminAssetManager hostname={detail.hostname} kind="FAVICON" label="Favicon assets" assets={detail.availableAssets} selected={detail.selectedAssets.faviconAssetId} disabled={busy} onUpload={(file) => uploadAsset('FAVICON', file)} onDelete={deleteAsset} onGenerate={() => generateAsset('FAVICON')} />
              <AdminAssetManager hostname={detail.hostname} kind="OPEN_GRAPH_IMAGE" label="Open Graph assets" assets={detail.availableAssets} selected={detail.selectedAssets.openGraphAssetId} disabled={busy} onUpload={(file) => uploadAsset('OPEN_GRAPH_IMAGE', file)} onDelete={deleteAsset} onGenerate={() => generateAsset('OPEN_GRAPH_IMAGE')} />
            </div>
          </details>
        )}
      </form>
      {message && <p role={failed ? 'alert' : 'status'} className="rounded-md border p-3 text-sm">{message}</p>}
    </div>
  )
}

function Field({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return <label className="space-y-2"><span className="block text-sm font-medium">{label}</span>{children}</label>
}

function Status({ label, state }: Readonly<{ label: string; state: ProgressState }>) {
  const tone = state === 'READY' ? 'text-emerald-700' : state === 'ERROR' ? 'text-red-700' : state === 'GENERATING' ? 'text-amber-700' : 'text-gray-500'
  return <div className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"><span>{label}</span><span className={`text-xs font-semibold ${tone}`}>{state}</span></div>
}

function AssetSelect({ name, label, assets, selected, disabled }: Readonly<{ name: string; label: string; assets: AdminMarketplaceDomainDetail['availableAssets']; selected: string | null; disabled: boolean }>) {
  return <Field label={label}><select name={name} defaultValue={selected ?? ''} disabled={disabled} className={`${inputClass} dark:bg-gray-900`}><option value="">Missing / pending</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.id}</option>)}</select></Field>
}

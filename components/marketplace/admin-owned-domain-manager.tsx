'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import type { AdminMarketplaceDomainSummary } from '@/lib/marketplace/admin.types'
import { marketplaceAdminService } from '@/services/marketplace-admin.service'
import { TransitionLink } from '@/components/ui/transition-link'

export function AdminOwnedDomainManager({
  domains,
  editable,
}: Readonly<{
  domains: readonly AdminMarketplaceDomainSummary[]
  editable: boolean
}>) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (form.get('ownershipConfirmed') !== 'on') {
      setFailed(true)
      setMessage('Confirm that you own this domain before adding it.')
      return
    }
    setBusy(true); setMessage(null); setFailed(false)
    try {
      await marketplaceAdminService.createOwnedDomain({
        hostname: String(form.get('hostname') ?? ''),
        ownershipConfirmed: true,
      })
      setAdding(false)
      setMessage('Owned domain added.')
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Unable to add domain.')
    } finally { setBusy(false) }
  }

  const remove = async (hostname: string) => {
    setBusy(true); setMessage(null); setFailed(false)
    try {
      await marketplaceAdminService.deleteOwnedDomain(hostname)
      setConfirmDelete(null)
      setMessage('Owned domain deleted.')
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Unable to delete domain.')
    } finally { setBusy(false) }
  }

  return (
    <div className="space-y-5">
      {editable && (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setAdding((value) => !value)} className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black">+ Add Owned Domain</button>
        </div>
      )}
      {adding && (
        <form onSubmit={(event) => void create(event)} className="space-y-4 rounded-xl border bg-white p-5 dark:bg-gray-900">
          <label className="block space-y-2"><span className="text-sm font-medium">Domain hostname</span><input name="hostname" required placeholder="example.com" disabled={busy} className="w-full rounded-md border bg-transparent px-3 py-2 text-sm" /></label>
          <label className="flex items-start gap-2 text-sm"><input name="ownershipConfirmed" type="checkbox" required disabled={busy} className="mt-1" /><span>I explicitly confirm that I own this domain.</span></label>
          <div className="flex gap-3"><button disabled={busy} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Add domain</button><button type="button" disabled={busy} onClick={() => setAdding(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button></div>
        </form>
      )}
      {domains.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center"><h2 className="font-semibold">No SQL-owned domains yet</h2><p className="mt-2 text-sm text-gray-500">Add a domain only after explicitly confirming ownership.</p></div>
      ) : (
        <div className="overflow-hidden rounded-xl border bg-white dark:bg-gray-900">
          {domains.map((domain) => (
            <div key={domain.ownedDomainId} className="flex flex-wrap items-center justify-between gap-4 border-b p-5 last:border-0">
              <div><p className="font-semibold">{domain.hostname}</p><p className="mt-1 text-xs text-gray-500">{domain.ownershipConfirmed ? domain.preparationReadiness : 'Ownership not confirmed'} · {domain.publicationState}</p></div>
              <div className="flex flex-wrap gap-2">
                <TransitionLink href={`/admin/marketplace/domains/${domain.hostname}`} className="rounded-md border px-4 py-2 text-sm">Manage</TransitionLink>
                {editable && domain.deletion.allowed && <button type="button" disabled={busy} onClick={() => setConfirmDelete(domain.hostname)} className="rounded-md border border-red-300 px-4 py-2 text-sm text-red-700 disabled:opacity-50">Delete</button>}
              </div>
            </div>
          ))}
        </div>
      )}
      {confirmDelete && (
        <div role="dialog" aria-modal="true" aria-labelledby="delete-domain-title" className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-950">
          <h2 id="delete-domain-title" className="font-semibold">Delete {confirmDelete}?</h2>
          <p className="mt-2 text-sm">This is allowed only while the domain has no preparation, assets, or retained publication record.</p>
          <div className="mt-4 flex gap-3"><button type="button" disabled={busy} onClick={() => void remove(confirmDelete)} className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirm delete</button><button type="button" disabled={busy} onClick={() => setConfirmDelete(null)} className="rounded-md border px-4 py-2 text-sm">Cancel</button></div>
        </div>
      )}
      {message && <p role={failed ? 'alert' : 'status'} className="rounded-md border p-3 text-sm">{message}</p>}
    </div>
  )
}

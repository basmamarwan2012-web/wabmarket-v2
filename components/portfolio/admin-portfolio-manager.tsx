'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

import { TransitionLink } from '@/components/ui/transition-link'
import type {
  AdminPortfolioDomainSummary,
  AdminPortfolioRegistrarSyncReport,
} from '@/lib/portfolio/admin.types'
import { portfolioAdminService } from '@/services/portfolio-admin.service'
import { DomainActionsMenu } from './domain-actions-menu'

const supplied = (value: string | null) => value ?? 'Not supplied'

export function AdminPortfolioManager({
  domains,
  editable,
}: Readonly<{
  domains: readonly AdminPortfolioDomainSummary[]
  editable: boolean
}>) {
  const router = useRouter()
  const [adding, setAdding] = useState(false)
  const [busy, setBusy] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [syncReport, setSyncReport] =
    useState<AdminPortfolioRegistrarSyncReport | null>(null)

  const create = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    if (form.get('ownershipConfirmed') !== 'on') {
      setFailed(true)
      setMessage('Confirm that you own this domain before adding it.')
      return
    }
    setBusy(true)
    setMessage(null)
    setFailed(false)
    try {
      await portfolioAdminService.createOwnedDomain({
        hostname: String(form.get('hostname') ?? ''),
        ownershipConfirmed: true,
      })
      setAdding(false)
      setMessage('Owned domain added to Portfolio.')
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(error instanceof Error ? error.message : 'Unable to add domain.')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (hostname: string) => {
    setBusy(true)
    setMessage(null)
    setFailed(false)
    try {
      await portfolioAdminService.deleteOwnedDomain(hostname)
      setConfirmDelete(null)
      setMessage('Owned domain deleted from Portfolio.')
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(
        error instanceof Error ? error.message : 'Unable to delete domain.'
      )
    } finally {
      setBusy(false)
    }
  }

  const syncDynadot = async () => {
    setSyncing(true)
    setMessage(null)
    setFailed(false)
    try {
      const report = await portfolioAdminService.syncDynadotOwnedDomains()
      setSyncReport(report)
      setMessage('Dynadot domains synchronized with Portfolio.')
      router.refresh()
    } catch (error) {
      setFailed(true)
      setMessage(
        error instanceof Error
          ? error.message
          : 'Unable to synchronize domains.'
      )
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-5">
      {editable && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setAdding((value) => !value)}
            className="rounded-md bg-black px-4 py-2 text-sm font-semibold text-white dark:bg-white dark:text-black"
          >
            + Add Owned Domain
          </button>
          <button
            type="button"
            disabled={syncing || busy}
            onClick={() => void syncDynadot()}
            className="rounded-md border px-4 py-2 text-sm font-semibold disabled:opacity-50"
          >
            {syncing ? 'Syncing Dynadot...' : 'Sync Domains - Dynadot'}
          </button>
        </div>
      )}

      {syncReport && (
        <section
          aria-label="Dynadot synchronization report"
          className="rounded-xl border bg-white p-4 text-sm dark:bg-gray-900"
        >
          <p className="font-semibold">Last Dynadot Portfolio sync</p>
          <dl className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
            <div><dt className="text-gray-500">Fetched</dt><dd>{syncReport.fetchedCount}</dd></div>
            <div><dt className="text-gray-500">Created</dt><dd>{syncReport.createdCount}</dd></div>
            <div><dt className="text-gray-500">Existing</dt><dd>{syncReport.existingCount}</dd></div>
            <div><dt className="text-gray-500">Invalid</dt><dd>{syncReport.skippedInvalidCount}</dd></div>
            <div><dt className="text-gray-500">Duplicates</dt><dd>{syncReport.duplicateCount}</dd></div>
          </dl>
          {syncReport.truncated && (
            <p role="alert" className="mt-3 text-amber-700">
              The safety ceiling was reached. This is a partial synchronization report.
            </p>
          )}
        </section>
      )}

      {adding && (
        <form
          onSubmit={(event) => void create(event)}
          className="space-y-4 rounded-xl border bg-white p-5 dark:bg-gray-900"
        >
          <label className="block space-y-2">
            <span className="text-sm font-medium">Domain hostname</span>
            <input
              name="hostname"
              required
              placeholder="example.com"
              disabled={busy}
              className="w-full rounded-md border bg-transparent px-3 py-2 text-sm"
            />
          </label>
          <label className="flex items-start gap-2 text-sm">
            <input
              name="ownershipConfirmed"
              type="checkbox"
              required
              disabled={busy}
              className="mt-1"
            />
            <span>I explicitly confirm that I own or manage this domain.</span>
          </label>
          <div className="flex gap-3">
            <button disabled={busy} className="rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Add domain</button>
            <button type="button" disabled={busy} onClick={() => setAdding(false)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
          </div>
        </form>
      )}

      {domains.length === 0 ? (
        <div className="rounded-xl border border-dashed p-10 text-center">
          <h2 className="font-semibold">No Portfolio domains yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Add an owned domain or synchronize a registrar account.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border bg-white dark:bg-gray-900">
          <div className="min-w-[980px]">
            <div className="grid grid-cols-[minmax(250px,2fr)_1fr_1fr_1fr_1fr_1fr_1fr_auto] gap-3 border-b bg-gray-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:bg-gray-950">
              <span>Domain</span><span>Registrar</span><span>Status</span><span>Expiration</span><span>Sync</span><span>Preparation</span><span>Marketplace / Price</span><span>Actions</span>
            </div>
            {domains.map((domain) => {
              const registrar = domain.registrarAssociations[0]
              const hasMultipleRegistrars = domain.registrarAssociations.length > 1
              return (
                <div key={domain.ownedDomainId} className="grid grid-cols-[minmax(250px,2fr)_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 border-b px-4 py-2.5 text-sm transition hover:bg-gray-50 last:border-0 dark:hover:bg-gray-800/50">
                  <div className="flex min-w-0 items-center gap-3">
                    {domain.displayLogo ? <img src={domain.displayLogo.contentReference} alt="" className="h-9 w-9 shrink-0 rounded-lg border object-contain" /> : <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gray-100 font-semibold dark:bg-gray-800">{domain.hostname[0]?.toUpperCase()}</div>}
                    <TransitionLink href={`/admin/domains/${domain.hostname}`} className="truncate font-semibold hover:underline">{domain.hostname}</TransitionLink>
                  </div>
                  <span className="truncate">{hasMultipleRegistrars ? `${domain.registrarAssociations.length} registrars` : registrar?.providerIdentifier ?? 'Manual domain'}</span>
                  <StatusPill value={hasMultipleRegistrars ? 'See profile' : registrar?.registrarStatus ?? 'Unknown'} />
                  <span className="truncate text-xs">{hasMultipleRegistrars ? 'See profile' : supplied(registrar?.expiresAt ?? null)}</span>
                  <StatusPill value={hasMultipleRegistrars ? 'See profile' : registrar?.syncState ?? 'Not supplied'} />
                  <StatusPill value={domain.preparationReadiness} />
                  <div><StatusPill value={domain.publicationState} />{domain.askingPrice !== null && <p className="mt-1 text-xs text-gray-500">{domain.askingPrice} {domain.currency}</p>}</div>
                  <DomainActionsMenu hostname={domain.hostname} actions={editable ? domain.actions : domain.actions.filter((action) => action !== 'DELETE_DOMAIN' && action !== 'ADD_LOGO' && action !== 'GENERATE_LOGO')} publicReference={domain.publicationPublicReference} disabled={busy} onDelete={domain.actions.includes('DELETE_DOMAIN') ? () => setConfirmDelete(domain.hostname) : undefined} />
                </div>
              )
            })}
          </div>
        </div>
      )}

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-domain-title"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-950"
        >
          <h2 id="delete-domain-title" className="font-semibold">
            Delete {confirmDelete} from Portfolio?
          </h2>
          <p className="mt-2 text-sm">
            This is allowed only while the domain has no preparation, assets, or retained publication record.
          </p>
          <div className="mt-4 flex gap-3">
            <button type="button" disabled={busy} onClick={() => void remove(confirmDelete)} className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Confirm delete</button>
            <button type="button" disabled={busy} onClick={() => setConfirmDelete(null)} className="rounded-md border px-4 py-2 text-sm">Cancel</button>
          </div>
        </div>
      )}

      {message && (
        <p role={failed ? 'alert' : 'status'} className="rounded-md border p-3 text-sm">
          {message}
        </p>
      )}
    </div>
  )
}

function StatusPill({ value }: Readonly<{ value: string }>) {
  return <span className="inline-flex max-w-full truncate rounded-full bg-gray-100 px-2 py-1 text-[11px] font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{value.replaceAll('_', ' ')}</span>
}

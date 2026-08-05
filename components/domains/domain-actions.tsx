'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

import { domainService } from '@/services/domain.service'
import { Spinner } from '@/components/ui/spinner'
import { useLoading } from '@/hooks/use-loading'
import { useToast } from '@/hooks/use-toast'
import { useProgress } from '@/hooks/use-progress'

export function DomainActions({
  domainId,
  deleted,
  canDelete,
  canRestore,
  onOptimisticRemove,
  onSuccess,
  onFailure,
}: {
  domainId: string
  deleted: boolean
  canDelete: boolean
  canRestore: boolean
  onOptimisticRemove?: (domainId: string) => void
  onSuccess?: (domainId: string, deleted: boolean) => void
  onFailure?: (domainId: string, message: string) => void
}) {
  const router = useRouter()
  const { beginLoading } = useLoading()
  const { toast } = useToast()
  const { beginNavigation } = useProgress()
  const [confirming, setConfirming] = useState(false)
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const [error, setError] = useState<string | null>(null)
  const allowed = deleted ? canRestore : canDelete
  if (!allowed) return null

  const closeDialog = () => {
    if (busy) return
    setConfirming(false)
    window.setTimeout(() => triggerRef.current?.focus(), 0)
  }

  const execute = async () => {
    if (busyRef.current) return
    busyRef.current = true
    setBusy(true)
    setError(null)
    onOptimisticRemove?.(domainId)
    const operation = beginLoading({
      message: deleted ? 'Restoring domain...' : 'Moving domain to Trash...',
    })
    try {
      if (deleted) await domainService.restore(domainId)
      else await domainService.moveToTrash(domainId)
      setConfirming(false)
      toast({
        variant: 'success',
        message: deleted ? 'Restored.' : 'Moved to Trash.',
        dedupeKey: `${deleted ? 'restore' : 'trash'}-${domainId}`,
      })
      onSuccess?.(domainId, deleted)
      if (!onSuccess) {
        beginNavigation('Loading domains...')
        router.push(
          deleted ? '/admin/domains?deleted=deleted' : '/admin/domains'
        )
      }
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'The action failed.'
      setError(message)
      onFailure?.(domainId, message)
      toast({
        variant: 'error',
        message: deleted ? 'Restore failed.' : 'Move to Trash failed.',
      })
    } finally {
      operation.finish()
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={busy}
        onClick={() => setConfirming(true)}
        className="rounded-md border border-red-300 px-3 py-2 text-sm text-red-700 disabled:opacity-50 dark:border-red-800 dark:text-red-300"
      >
        {deleted ? 'Restore' : 'Move to trash'}
      </button>
      {confirming && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="domain-action-title"
            onKeyDown={(event) => {
              if (event.key === 'Escape') closeDialog()
            }}
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-gray-900"
          >
            <h2 id="domain-action-title" className="text-lg font-semibold">
              {deleted ? 'Restore this domain?' : 'Move this domain to trash?'}
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              {deleted
                ? 'The domain will return to the active domains list.'
                : 'The domain name remains reserved and can be restored later.'}
            </p>
            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={closeDialog}
                className="rounded-md border px-4 py-2 text-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={execute}
                autoFocus
                className="inline-flex items-center gap-2 rounded-md bg-red-700 px-4 py-2 text-sm text-white disabled:opacity-50"
              >
                {busy && <Spinner />}
                {busy ? 'Working…' : deleted ? 'Restore' : 'Move to trash'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

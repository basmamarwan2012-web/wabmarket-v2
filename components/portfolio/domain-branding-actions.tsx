'use client'

import { useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'

import { portfolioAdminService } from '@/services/portfolio-admin.service'

export function DomainBrandingActions({
  hostname,
  editable,
}: Readonly<{ hostname: string; editable: boolean }>) {
  const router = useRouter()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const run = async (operation: () => Promise<unknown>, success: string) => {
    setBusy(true)
    setMessage(null)
    try {
      await operation()
      setMessage(success)
      router.refresh()
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Branding action failed.')
    } finally {
      setBusy(false)
    }
  }

  const upload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file)
      void run(
        () => portfolioAdminService.uploadLogo(hostname, file),
        'Logo uploaded as an available asset.'
      )
    if (input.current) input.current.value = ''
  }

  if (!editable) return null
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        ref={input}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        disabled={busy}
        onChange={upload}
        className="max-w-60 text-xs"
      />
      <button
        type="button"
        disabled={busy}
        onClick={() =>
          void run(
            () => portfolioAdminService.generateLogo(hostname),
            'Logo generated as an available asset.'
          )
        }
        className="rounded-md border px-3 py-2 text-sm disabled:opacity-50"
      >
        Generate Logo
      </button>
      {message && <p role="status" className="w-full text-xs text-gray-600">{message}</p>}
    </div>
  )
}

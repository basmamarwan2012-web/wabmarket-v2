'use client'

import { useEffect, useState } from 'react'

export function LoadingOverlay({
  active,
  message,
}: {
  active: boolean
  message: string
}) {
  const [mounted, setMounted] = useState(active)

  useEffect(() => {
    if (active) {
      setMounted(true)
      return
    }
    const timer = window.setTimeout(() => setMounted(false), 200)
    return () => window.clearTimeout(timer)
  }, [active])

  if (!mounted) return null
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={message}
      data-active={active}
      className="ux-loading-overlay fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/45 p-6 backdrop-blur-[2px]"
    >
      <div className="w-full max-w-xs text-center text-white">
        <p className="text-2xl font-semibold tracking-tight">Wabmarket</p>
        <div className="mt-4 h-0.5 overflow-hidden rounded-full bg-white/25">
          <span className="ux-loading-line block h-full w-2/5 rounded-full bg-white" />
        </div>
        <p className="mt-4 text-sm text-white/90">{message}</p>
      </div>
    </div>
  )
}

'use client'

import type { ToastVariant } from '../ux-provider'

interface ToastItem {
  id: string
  message: string
  variant: ToastVariant
}

const colors: Record<ToastVariant, string> = {
  success:
    'border-green-300 bg-green-50 text-green-900 dark:border-green-900 dark:bg-green-950 dark:text-green-100',
  error:
    'border-red-300 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100',
  warning:
    'border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100',
  info: 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-100',
}

export function ToastViewport({
  toasts,
  onDismiss,
  onPause,
  onResume,
}: {
  toasts: ToastItem[]
  onDismiss: (id: string) => void
  onPause: (id: string) => void
  onResume: (id: string) => void
}) {
  return (
    <div
      className="pointer-events-none fixed bottom-5 right-5 z-[130] flex w-[min(24rem,calc(100vw-2.5rem))] flex-col gap-3"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role={toast.variant === 'error' ? 'alert' : 'status'}
          tabIndex={0}
          onMouseEnter={() => onPause(toast.id)}
          onMouseLeave={() => onResume(toast.id)}
          onFocus={() => onPause(toast.id)}
          onBlur={() => onResume(toast.id)}
          className={`ux-toast pointer-events-auto flex items-start justify-between gap-4 rounded-lg border p-4 text-sm shadow-lg ${colors[toast.variant]}`}
        >
          <p>{toast.message}</p>
          <button
            type="button"
            onClick={() => onDismiss(toast.id)}
            className="rounded px-1 font-medium opacity-70 hover:opacity-100 focus:outline-none focus:ring-2"
            aria-label="Dismiss notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}

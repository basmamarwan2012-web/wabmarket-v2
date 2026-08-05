'use client'

import {
  createContext,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

import { LoadingOverlay } from './loading-overlay'
import { ProgressBar } from './progress-bar'
import { ToastViewport } from './toast/toast-viewport'

export type ToastVariant = 'success' | 'error' | 'warning' | 'info'
export type LoadingKind = 'navigation' | 'foreground' | 'background'

export interface LoadingOptions {
  message?: string
  kind?: LoadingKind
  overlay?: boolean
  overlayDelay?: number
  timeout?: number
}

export interface OperationHandle {
  finish: () => void
}

export interface ToastInput {
  message: string
  variant?: ToastVariant
  dedupeKey?: string
  duration?: number
}

interface ToastRecord extends Required<Omit<ToastInput, 'dedupeKey'>> {
  id: string
  dedupeKey: string
}

interface OperationRecord {
  id: string
  message: string
  kind: LoadingKind
  overlay: boolean
  overlayReady: boolean
  startedAt: number
}

export interface UXContextValue {
  beginLoading: (options?: LoadingOptions) => OperationHandle
  beginProgress: (message?: string) => OperationHandle
  beginNavigation: (message?: string) => void
  toast: (input: ToastInput) => void
  dismissToast: (id: string) => void
  pauseToast: (id: string) => void
  resumeToast: (id: string) => void
}

export const UXContext = createContext<UXContextValue | null>(null)

const MAX_TOASTS = 4
const NAVIGATION_TIMEOUT = 12_000

function operationPriority(operation: OperationRecord) {
  if (operation.kind === 'foreground') return 3
  if (operation.kind === 'navigation') return 2
  return 1
}

function NavigationObserver({ onChange }: { onChange: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const locationKey = `${pathname}?${searchParams.toString()}`

  useEffect(() => onChange(), [locationKey, onChange])
  return null
}

export function UXProvider({ children }: { children: ReactNode }) {
  const operationsRef = useRef(new Map<string, OperationRecord>())
  const operationTimersRef = useRef(new Map<string, number>())
  const navigationRef = useRef<OperationHandle | null>(null)
  const toastTimersRef = useRef(new Map<string, number>())
  const toastDeadlinesRef = useRef(new Map<string, number>())
  const toastRemainingRef = useRef(new Map<string, number>())
  const [operations, setOperations] = useState<OperationRecord[]>([])
  const [toasts, setToasts] = useState<ToastRecord[]>([])

  const publishOperations = useCallback(() => {
    setOperations(Array.from(operationsRef.current.values()))
  }, [])

  const finishOperation = useCallback(
    (id: string) => {
      const timer = operationTimersRef.current.get(id)
      if (timer !== undefined) window.clearTimeout(timer)
      operationTimersRef.current.delete(id)
      if (operationsRef.current.delete(id)) publishOperations()
    },
    [publishOperations]
  )

  const beginLoading = useCallback(
    (options: LoadingOptions = {}): OperationHandle => {
      const id = crypto.randomUUID()
      const kind = options.kind ?? 'foreground'
      const overlay = options.overlay ?? kind === 'foreground'
      const delay = options.overlayDelay ?? 250
      const operation: OperationRecord = {
        id,
        kind,
        overlay,
        overlayReady: overlay && delay <= 0,
        message: options.message ?? 'Please wait...',
        startedAt: Date.now(),
      }
      operationsRef.current.set(id, operation)
      publishOperations()

      if (overlay && delay > 0) {
        const timer = window.setTimeout(() => {
          const current = operationsRef.current.get(id)
          if (!current) return
          operationsRef.current.set(id, { ...current, overlayReady: true })
          operationTimersRef.current.delete(id)
          publishOperations()
        }, delay)
        operationTimersRef.current.set(id, timer)
      }

      let finished = false
      const finish = () => {
        if (finished) return
        finished = true
        finishOperation(id)
      }

      if (options.timeout) {
        const timer = window.setTimeout(finish, options.timeout)
        operationTimersRef.current.set(id, timer)
      }

      return { finish }
    },
    [finishOperation, publishOperations]
  )

  const beginProgress = useCallback(
    (message = 'Loading...') =>
      beginLoading({ message, kind: 'background', overlay: false }),
    [beginLoading]
  )

  const beginNavigation = useCallback(
    (message = 'Loading...') => {
      navigationRef.current?.finish()
      navigationRef.current = beginLoading({
        message,
        kind: 'navigation',
        overlay: true,
        timeout: NAVIGATION_TIMEOUT,
      })
    },
    [beginLoading]
  )

  const finishNavigation = useCallback(() => {
    navigationRef.current?.finish()
    navigationRef.current = null
  }, [])

  useEffect(() => {
    const handlePopState = () => beginNavigation('Loading...')
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [beginNavigation])

  const dismissToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id)
    if (timer !== undefined) window.clearTimeout(timer)
    toastTimersRef.current.delete(id)
    toastDeadlinesRef.current.delete(id)
    toastRemainingRef.current.delete(id)
    setToasts((current) => current.filter((item) => item.id !== id))
  }, [])

  const scheduleToast = useCallback(
    (id: string, duration: number) => {
      toastDeadlinesRef.current.set(id, Date.now() + duration)
      toastTimersRef.current.set(
        id,
        window.setTimeout(() => dismissToast(id), duration)
      )
    },
    [dismissToast]
  )

  const toast = useCallback(
    (input: ToastInput) => {
      const dedupeKey = input.dedupeKey ?? `${input.variant}:${input.message}`
      const duration = input.duration ?? 4_500
      setToasts((current) => {
        if (current.some((item) => item.dedupeKey === dedupeKey)) return current
        const record: ToastRecord = {
          id: crypto.randomUUID(),
          message: input.message,
          variant: input.variant ?? 'info',
          duration,
          dedupeKey,
        }
        window.setTimeout(() => scheduleToast(record.id, duration), 0)
        return [...current, record].slice(-MAX_TOASTS)
      })
    },
    [scheduleToast]
  )

  const pauseToast = useCallback((id: string) => {
    const timer = toastTimersRef.current.get(id)
    const deadline = toastDeadlinesRef.current.get(id)
    if (timer !== undefined) window.clearTimeout(timer)
    toastTimersRef.current.delete(id)
    if (deadline)
      toastRemainingRef.current.set(id, Math.max(500, deadline - Date.now()))
  }, [])

  const resumeToast = useCallback(
    (id: string) => {
      if (toastTimersRef.current.has(id)) return
      scheduleToast(id, toastRemainingRef.current.get(id) ?? 2_000)
    },
    [scheduleToast]
  )

  useEffect(
    () => () => {
      operationTimersRef.current.forEach((timer) => window.clearTimeout(timer))
      toastTimersRef.current.forEach((timer) => window.clearTimeout(timer))
    },
    []
  )

  const visibleOperation = useMemo(
    () =>
      operations
        .filter((operation) => operation.overlayReady)
        .sort(
          (a, b) =>
            operationPriority(b) - operationPriority(a) ||
            b.startedAt - a.startedAt
        )[0],
    [operations]
  )

  const value = useMemo<UXContextValue>(
    () => ({
      beginLoading,
      beginProgress,
      beginNavigation,
      toast,
      dismissToast,
      pauseToast,
      resumeToast,
    }),
    [
      beginLoading,
      beginNavigation,
      beginProgress,
      dismissToast,
      pauseToast,
      resumeToast,
      toast,
    ]
  )

  return (
    <UXContext.Provider value={value}>
      <Suspense fallback={null}>
        <NavigationObserver onChange={finishNavigation} />
      </Suspense>
      <div
        aria-busy={Boolean(visibleOperation)}
        inert={visibleOperation ? true : undefined}
      >
        {children}
      </div>
      <ProgressBar active={operations.length > 0} />
      <LoadingOverlay
        active={Boolean(visibleOperation)}
        message={visibleOperation?.message ?? 'Please wait...'}
      />
      <ToastViewport
        toasts={toasts}
        onDismiss={dismissToast}
        onPause={pauseToast}
        onResume={resumeToast}
      />
    </UXContext.Provider>
  )
}

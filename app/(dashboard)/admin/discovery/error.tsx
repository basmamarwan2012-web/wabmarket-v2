'use client'

export default function DomainDiscoveryError({ reset }: { reset: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
    >
      <h2 className="font-semibold">Domain searches could not be loaded.</h2>
      <p className="mt-2 text-sm">Please retry the request.</p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-md border px-4 py-2 text-sm"
      >
        Try again
      </button>
    </div>
  )
}

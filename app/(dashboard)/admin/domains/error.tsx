'use client'

export default function DomainsError({
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div role="alert" className="rounded-xl bg-red-50 p-6 text-red-700">
      <p>Domains could not be loaded.</p>
      <button
        className="mt-3 rounded-md border px-3 py-2 text-sm"
        onClick={reset}
      >
        Try again
      </button>
    </div>
  )
}

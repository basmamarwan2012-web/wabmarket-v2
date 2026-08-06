import { Megaphone } from 'lucide-react'

export default function CampaignsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Campaigns</h1>
        <p className="mt-1 text-sm text-gray-500">
          Campaign management is not available yet.
        </p>
      </div>
      <section className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed bg-white p-10 text-center dark:bg-gray-900">
        <Megaphone aria-hidden="true" className="h-8 w-8 text-gray-400" />
        <h2 className="mt-4 font-semibold">Campaigns are not implemented</h2>
        <p className="mt-2 max-w-md text-sm text-gray-500">
          This area is reserved for a future phase. No campaign data or actions
          are available.
        </p>
      </section>
    </div>
  )
}

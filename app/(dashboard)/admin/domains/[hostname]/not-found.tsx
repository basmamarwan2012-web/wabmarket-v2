import { TransitionLink } from '@/components/ui/transition-link'

export default function DomainProfileNotFound() {
  return <div className="rounded-xl border border-dashed p-10 text-center"><h1 className="text-xl font-semibold">Domain not found</h1><p className="mt-2 text-sm text-gray-500">This domain is not in the current SQL Portfolio.</p><TransitionLink href="/admin/domains" className="mt-5 inline-flex rounded-md border px-4 py-2 text-sm">Back to Portfolio</TransitionLink></div>
}

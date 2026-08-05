import { DomainActions } from './domain-actions'
import type { DomainDetailResult } from '@/types/domain-api'
import { TransitionLink } from '@/components/ui/transition-link'

function value(value: string | number | boolean | null) {
  if (value === null || value === '') return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

export function DomainDetail({
  detail,
  canEdit,
  canDelete,
  canRestore,
}: {
  detail: DomainDetailResult
  canEdit: boolean
  canDelete: boolean
  canRestore: boolean
}) {
  const domain = detail.domain
  const sections = [
    ['Domain', domain.domainName],
    ['Status', domain.status],
    ['Registrar', domain.registrar],
    ['Keyword', domain.keyword],
    [
      'Location',
      [domain.city, domain.state, domain.country].filter(Boolean).join(', '),
    ],
    ['Purchase price', `$${domain.purchasePrice.toLocaleString()}`],
    ['Estimated price', `$${domain.estimatedPrice.toLocaleString()}`],
    ['Asking price', `$${domain.askingPrice.toLocaleString()}`],
    ['FlipScore', domain.flipScore],
    ['Purchase date', domain.purchaseDate],
    ['Expiration date', domain.expirationDate],
    ['Renewal date', domain.renewalDate],
    ['Auto-renew', domain.autoRenew],
    ['Nameservers', domain.nameservers.join(', ')],
    ['Created', domain.createdAt],
    ['Created by', detail.createdByActor.label],
    ['Updated', domain.updatedAt],
    ['Updated by', detail.updatedByActor.label],
  ] as const

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <TransitionLink
            href={
              domain.isDeleted
                ? '/admin/domains?deleted=deleted'
                : '/admin/domains'
            }
            className="text-sm text-gray-500 underline"
          >
            Back to domains
          </TransitionLink>
          <h1 className="mt-2 text-3xl font-bold">{domain.domainName}</h1>
          {domain.isDeleted && (
            <span className="mt-2 inline-block rounded-full bg-red-100 px-3 py-1 text-xs text-red-700">
              In trash
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {canEdit && !domain.isDeleted && (
            <TransitionLink
              href={`/admin/domains/${domain.id}/edit`}
              loadingMessage="Loading domain..."
              className="rounded-md border px-4 py-2 text-sm"
            >
              Edit
            </TransitionLink>
          )}
          <DomainActions
            domainId={domain.id}
            deleted={domain.isDeleted}
            canDelete={canDelete}
            canRestore={canRestore}
          />
        </div>
      </div>
      <section className="rounded-xl border bg-white p-6 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Overview and pricing</h2>
        <dl className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sections.map(([label, item]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-gray-500">
                {label}
              </dt>
              <dd className="mt-1 break-words font-medium capitalize">
                {value(item)}
              </dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="rounded-xl border bg-white p-6 dark:bg-gray-900">
        <h2 className="text-lg font-semibold">Description</h2>
        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
          {domain.description ?? 'No description.'}
        </p>
      </section>
      <div className="grid gap-6 lg:grid-cols-2">
        <Audit title="Activity history" records={detail.activities} />
        <Audit title="Timeline" records={detail.timeline} />
      </div>
    </div>
  )
}

function Audit({
  title,
  records,
}: {
  title: string
  records: DomainDetailResult['activities']
}) {
  return (
    <section className="rounded-xl border bg-white p-6 dark:bg-gray-900">
      <h2 className="text-lg font-semibold">{title}</h2>
      {records.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No events recorded.</p>
      ) : (
        <ol className="mt-4 space-y-4">
          {records.map((record) => (
            <li key={record.id} className="border-l-2 pl-4">
              <p className="text-sm font-medium">{record.description}</p>
              <p className="mt-1 text-xs text-gray-500">
                {record.eventType} · {record.actor.label} ·{' '}
                {new Date(record.createdAt).toLocaleString()}
              </p>
              {record.changedFields.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  Changed: {record.changedFields.join(', ')}
                </p>
              )}
            </li>
          ))}
        </ol>
      )}
      <p className="mt-4 text-xs text-gray-500">
        Showing up to 50 most recent events.
      </p>
    </section>
  )
}

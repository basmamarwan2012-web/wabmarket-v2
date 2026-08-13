import { TransitionLink } from '@/components/ui/transition-link'
import type { AdminPortfolioDomainProfile } from '@/lib/portfolio/admin.types'
import { DomainActionsMenu } from './domain-actions-menu'
import { DomainBrandingActions } from './domain-branding-actions'

const value = (input: string | null) => input ?? 'Not supplied'

export function AdminDomainProfile({
  profile,
  editable,
}: Readonly<{ profile: AdminPortfolioDomainProfile; editable: boolean }>) {
  return (
    <div className="space-y-6">
      <nav aria-label="Breadcrumb" className="flex gap-2 text-sm text-gray-500">
        <TransitionLink href="/admin/domains" className="hover:text-gray-900">Portfolio</TransitionLink>
        <span aria-hidden="true">/</span><span>{profile.hostname}</span>
      </nav>
      <header aria-label="Overview" className="flex flex-wrap items-center gap-5 rounded-2xl border bg-white p-6 dark:bg-gray-900">
        {profile.displayLogo ? <img src={profile.displayLogo.contentReference} alt="" className="h-16 w-16 rounded-xl border object-contain" /> : <div className="grid h-16 w-16 place-items-center rounded-xl bg-gray-100 text-xl font-bold dark:bg-gray-800">{profile.hostname[0]?.toUpperCase()}</div>}
        <div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Domain profile</p><h1 className="truncate text-3xl font-bold">{profile.hostname}</h1><p className="mt-1 text-sm text-gray-500">{profile.portfolioState} / {profile.domainStatus}</p></div>
        <DomainActionsMenu hostname={profile.hostname} actions={profile.actions.filter((action) => action !== 'DELETE_DOMAIN' && (editable || (action !== 'ADD_LOGO' && action !== 'GENERATE_LOGO')))} publicReference={profile.publication.publicReference} />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Fact title="Ownership" value={profile.ownershipConfirmed ? 'Confirmed' : 'Unconfirmed'} />
        <Fact title="Registrar" value={profile.registrarAssociations.map((item) => item.providerIdentifier).join(', ') || 'Manual domain'} />
        <Fact title="Preparation" value={profile.preparation.readiness} />
        <Fact title="Marketplace" value={profile.publication.state} />
        <Fact title="Asking price" value={profile.askingPrice === null ? 'Not supplied' : `${profile.askingPrice} ${profile.currency ?? ''}`.trim()} />
      </section>

      <Card title="Registrar">
        {profile.registrarAssociations.length === 0 ? <p className="text-sm text-gray-500">Manual domain. Registrar facts are not supplied.</p> : <div className="grid gap-3 lg:grid-cols-2">{profile.registrarAssociations.map((item) => <dl key={item.providerIdentifier} className="grid grid-cols-2 gap-2 rounded-lg bg-gray-50 p-4 text-sm dark:bg-gray-800"><dt>Provider</dt><dd>{item.providerIdentifier}</dd><dt>Provider domain ID</dt><dd>{value(item.providerDomainIdentifier)}</dd><dt>Status</dt><dd>{item.registrarStatus}</dd><dt>Expiration</dt><dd>{value(item.expiresAt)}</dd><dt>Auto-renew</dt><dd>{item.autoRenew === null ? 'Not supplied' : item.autoRenew ? 'Enabled' : 'Disabled'}</dd><dt>Sync state</dt><dd>{item.syncState}</dd><dt>First seen</dt><dd>{item.firstSeenAt}</dd><dt>Last seen</dt><dd>{item.lastSeenAt}</dd><dt>Last synced</dt><dd>{item.lastSyncedAt}</dd></dl>)}</div>}
      </Card>

      <Card title="Ownership / Source"><dl className="grid gap-2 text-sm sm:grid-cols-2"><FactLine name="Source" value={profile.ownershipSource === 'REGISTRAR_SYNCHRONIZED' ? 'Registrar synchronized' : 'Manual'} /><FactLine name="Confirmed at" value={value(profile.ownershipConfirmedAt)} /></dl></Card>

      <Card title="Branding / Assets" id="branding">
        <div className="grid gap-3 sm:grid-cols-3">{(['LOGO','FAVICON','OPEN_GRAPH_IMAGE'] as const).map((kind) => { const asset = profile.assets.find((item) => item.kind === kind && item.selectedForPreparation) ?? profile.assets.find((item) => item.kind === kind); return <div key={kind} className="rounded-lg border p-3"><p className="text-xs font-semibold">{kind.replaceAll('_',' ')}</p>{asset?.status === 'AVAILABLE' ? <><img src={asset.contentReference} alt="" className="mt-3 h-20 w-full object-contain" /><p className="mt-2 text-xs text-gray-500">{asset.selectedForPreparation ? 'Selected for preparation' : 'Available asset'}</p></> : <div className="mt-3 grid h-20 place-items-center rounded bg-gray-50 text-xs text-gray-500 dark:bg-gray-800">{asset ? 'Pending' : 'Missing'}</div>}</div> })}</div>
        {(profile.actions.includes('ADD_LOGO') || profile.actions.includes('GENERATE_LOGO')) && <div className="mt-4"><DomainBrandingActions hostname={profile.hostname} editable={editable} /></div>}
      </Card>

      <Card title="Preparation"><dl className="grid gap-2 text-sm sm:grid-cols-2"><FactLine name="State" value={profile.preparation.readiness} /><FactLine name="Version" value={profile.preparation.version?.toString() ?? 'Not prepared'} /><FactLine name="Asking price" value={profile.preparation.askingPrice === null ? 'Not supplied' : `${profile.preparation.askingPrice} ${profile.preparation.currency ?? ''}`.trim()} /><FactLine name="Updated" value={value(profile.preparation.updatedAt)} /></dl>{profile.preparation.missingRequirements.length > 0 && <p className="mt-3 text-sm text-amber-700">Missing: {profile.preparation.missingRequirements.join(', ')}</p>}<TransitionLink href={`/admin/marketplace/domains/${profile.hostname}`} className="mt-4 inline-flex rounded-md border px-4 py-2 text-sm font-medium">{profile.nextAction === 'PREPARE_FOR_SALE' ? 'Prepare for Sale' : profile.nextAction === 'CONTINUE_PREPARATION' ? 'Continue Preparation' : 'Manage Listing'}</TransitionLink></Card>

      <Card title="Marketplace / Listing"><dl className="grid gap-2 text-sm sm:grid-cols-2"><FactLine name="State" value={profile.publication.state} /><FactLine name="Eligibility" value={value(profile.publication.eligibility)} /><FactLine name="Version" value={profile.publication.version?.toString() ?? 'Not supplied'} /><FactLine name="Asking price" value={profile.publication.askingPrice === null ? 'Not supplied' : `${profile.publication.askingPrice} ${profile.publication.currency ?? ''}`.trim()} /><FactLine name="Published at" value={value(profile.publication.publishedAt)} /></dl><div className="mt-4 flex gap-2">{profile.actions.includes('PREVIEW_LISTING') && <TransitionLink href={`/admin/marketplace/domains/${profile.hostname}/preview`} className="rounded-md border px-4 py-2 text-sm">Preview</TransitionLink>}{profile.actions.includes('VIEW_PUBLIC_PAGE') && profile.publication.publicReference && <TransitionLink href={profile.publication.publicReference} target="_blank" rel="noopener noreferrer" className="rounded-md border px-4 py-2 text-sm">View Public Page</TransitionLink>}</div></Card>

      <Card title="Lifecycle / Activity">{profile.lifecycle.length === 0 ? <p className="text-sm text-gray-500">No timestamped lifecycle facts are available.</p> : <ol className="space-y-3">{profile.lifecycle.map((item) => <li key={item.id} className="flex justify-between gap-4 border-b pb-3 text-sm last:border-0"><span>{item.label}</span><time dateTime={item.occurredAt} className="text-gray-500">{item.occurredAt}</time></li>)}</ol>}</Card>
      <TransitionLink href="/admin/domains" className="inline-flex rounded-md border px-4 py-2 text-sm">Back to Portfolio</TransitionLink>
    </div>
  )
}

function Card({ title, id, children }: Readonly<{ title: string; id?: string; children: React.ReactNode }>) { return <section id={id} className="rounded-xl border bg-white p-5 dark:bg-gray-900"><h2 className="mb-4 text-lg font-semibold">{title}</h2>{children}</section> }
function Fact({ title, value }: Readonly<{ title: string; value: string }>) { return <div className="rounded-xl border bg-white p-4 dark:bg-gray-900"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{title}</p><p className="mt-2 font-semibold">{value}</p></div> }
function FactLine({ name, value }: Readonly<{ name: string; value: string }>) { return <><dt className="text-gray-500">{name}</dt><dd>{value}</dd></> }

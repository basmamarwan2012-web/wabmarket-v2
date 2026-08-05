import Link from 'next/link'

export function Sidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <h2 className="text-xl font-bold">Wabmarket</h2>

      <nav className="mt-6 flex flex-col gap-3">
        <Link href="/admin/dashboard">Dashboard</Link>
        <Link href="/admin/domains">Domains</Link>
        <Link href="/admin/leads">Leads</Link>
        <Link href="/admin/analytics">Analytics</Link>
        <Link href="/admin/settings">Settings</Link>
      </nav>
    </aside>
  )
}

export function Sidebar() {
  return (
    <aside className="w-64 border-r p-4">
      <h2 className="text-xl font-bold">Wabmarket</h2>

      <nav className="mt-6 flex flex-col gap-3">
        <a href="/">Dashboard</a>
        <a href="/">Domains</a>
        <a href="/">Leads</a>
        <a href="/">Analytics</a>
        <a href="/">Settings</a>
      </nav>
    </aside>
  )
}

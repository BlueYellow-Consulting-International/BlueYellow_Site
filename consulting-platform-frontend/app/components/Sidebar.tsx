type SidebarProps = {
  onLogout: () => void
}

export default function Sidebar({
  onLogout,
}: SidebarProps) {

  return (
    <aside className="w-64 border-r border-zinc-900 p-6">

      <h1 className="text-2xl font-bold mb-10">
        Consulting Platform
      </h1>

      <nav className="flex flex-col gap-4">

        <a
          href="/dashboard"
          className="bg-white text-black px-4 py-3 rounded-xl font-semibold"
        >
          Overview
        </a>

        <a
          href="/clients"
          className="hover:bg-zinc-900 px-4 py-3 rounded-xl transition"
        >
          Clients
        </a>

        <a
          href="#"
          className="hover:bg-zinc-900 px-4 py-3 rounded-xl transition"
        >
          Analytics
        </a>

        <a
          href="#"
          className="hover:bg-zinc-900 px-4 py-3 rounded-xl transition"
        >
          Settings
        </a>

      </nav>

      <button
        onClick={onLogout}
        className="mt-10 w-full border border-zinc-700 px-4 py-3 rounded-xl hover:bg-zinc-900 transition"
      >
        Logout
      </button>

    </aside>
  )
}
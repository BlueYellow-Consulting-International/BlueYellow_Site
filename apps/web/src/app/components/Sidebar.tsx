'use client';

type SidebarProps = {
  onLogout: () => void;
};

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-zinc-900 p-6">
      <h1 className="mb-10 text-2xl font-bold">Consulting Platform</h1>

      <nav className="flex flex-col gap-4">
        <a href="/dashboard" className="rounded-xl bg-white px-4 py-3 font-semibold text-black">
          Overview
        </a>

        <a href="/clients" className="rounded-xl px-4 py-3 transition hover:bg-zinc-900">
          Clients
        </a>
      </nav>

      <button
        onClick={onLogout}
        className="mt-10 w-full rounded-xl border border-zinc-700 px-4 py-3 transition hover:bg-zinc-900"
      >
        Logout
      </button>
    </aside>
  );
}

'use client';

import { useEffect, useState } from 'react';

import toast from 'react-hot-toast';

import Card from '../components/Card';
import {
  listClients,
  portalApi,
  deleteClient,
  type ClientRecord,
  type PortalUser,
} from '../../lib/portal';

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [user, setUser] = useState<PortalUser | null>(null);

  useEffect(() => {
    const loadClients = async () => {
      try {
        const session = await portalApi.me();

        if (session.success && session.user) {
          setUser(session.user);
          setClients(await listClients());
        } else {
          window.location.href = '/login';
        }
      } catch {
        toast.error('Failed to load clients');
      } finally {
        setLoading(false);
      }
    };

    loadClients();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteClient(id);

      setClients((current) => current.filter((client) => client.id !== id));
      toast.success('Client deleted');
    } catch {
      toast.error('Failed to delete client');
    }
  };

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(search.toLowerCase()) ||
      client.service.toLowerCase().includes(search.toLowerCase()),
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <div className="animate-pulse">
          <div className="mb-10 flex items-center justify-between">
            <div>
              <div className="mb-4 h-10 w-52 rounded-xl bg-zinc-900" />
              <div className="h-5 w-72 rounded-xl bg-zinc-900" />
            </div>
            <div className="h-12 w-36 rounded-xl bg-zinc-900" />
          </div>

          <div className="mb-8 h-14 w-full rounded-2xl bg-zinc-900" />

          <div className="grid gap-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
                <div className="mb-4 h-8 w-52 rounded-xl bg-zinc-900" />
                <div className="h-5 w-40 rounded-xl bg-zinc-900" />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Clients</h1>
          <p className="mt-2 text-zinc-400">Manage your consulting clients</p>
        </div>

        {user?.role === 'admin' && (
          <a
            href="/add-client"
            className="rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:opacity-80"
          >
            Add Client
          </a>
        )}
      </div>

      {clients.length === 0 && user?.role !== 'admin' ? (
        <Card className="p-14 text-center">
          <h2 className="mb-4 text-3xl font-bold">No clients yet</h2>
          <p className="text-zinc-400">
            Ask a platform administrator to add clients, or sign in with an admin account.
          </p>
        </Card>
      ) : (
        <>
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-8 w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4 outline-none"
          />

          {filteredClients.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950 p-14 text-center">
              <h2 className="mb-4 text-3xl font-bold">No clients found</h2>
              <p className="mb-8 text-zinc-400">Create your first consulting client</p>

              {user?.role === 'admin' && (
                <a
                  href="/add-client"
                  className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black transition hover:opacity-80"
                >
                  Add First Client
                </a>
              )}
            </div>
          ) : (
            <div className="grid gap-6">
              {filteredClients.map((client) => (
                <div
                  key={client.id}
                  className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 p-6"
                >
                  <div>
                    <h2 className="text-2xl font-semibold">{client.name}</h2>

                    <p className="mt-2 text-zinc-400">{client.service}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-green-400">Active</span>

                    {user?.role === 'admin' && (
                      <>
                        <a
                          href={`/clients/${client.id}/edit`}
                          className="text-blue-400 transition hover:text-blue-300"
                        >
                          Edit
                        </a>

                        <button
                          onClick={() => handleDelete(client.id)}
                          className="text-red-400 transition hover:text-red-300"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}

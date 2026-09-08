'use client';

// Dedicated edit route: /clients/[id]/edit (loaded via the clients list,
// since the API exposes listClients rather than a GET-by-id endpoint).

import { useEffect, useState } from 'react';

import { useRouter, useParams } from 'next/navigation';

import toast from 'react-hot-toast';

import { listClients, portalApi, updateClient } from '../../../../lib/portal';

export default function EditClientPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const loadClient = async () => {
      const session = await portalApi.me();

      if (!session.success || !id) {
        router.push('/login');
        return;
      }

      try {
        const found = (await listClients()).find((client) => client.id === id);

        if (found) {
          setName(found.name);
          setService(found.service);
        } else {
          toast.error('Client not found');
          router.push('/clients');
        }
      } catch {
        toast.error('Failed to load client');
        router.push('/clients');
      } finally {
        setPageLoading(false);
      }
    };

    loadClient();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!id) {
      toast.error('Session expired — sign in again');
      return;
    }

    setLoading(true);

    try {
      await updateClient(id, { name, service });
      toast.success('Client updated');
      router.push('/clients');
    } catch {
      toast.error('Failed to update client');
    } finally {
      setLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black text-white">
        <h1 className="text-3xl font-bold">Loading client...</h1>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-2 text-4xl font-bold">Edit Client</h1>

        <p className="mb-8 text-zinc-400">Update client information</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="text"
            placeholder="Client Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none"
          />

          <input
            type="text"
            placeholder="Service Type"
            value={service}
            onChange={(e) => setService(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-white py-3 text-center font-semibold text-black transition hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Client'}
          </button>
        </form>
      </div>
    </main>
  );
}

'use client';

// URL-parity note: the legacy portal served its API-backed EDIT flow here.
// This page now has two modes — create (no ?id) and edit (?id=<clientId>) —
// both backed by POST / PATCH on the /clients API.

import { Suspense, useEffect, useState } from 'react';

import { useRouter, useSearchParams } from 'next/navigation';

import toast from 'react-hot-toast';

import { getSession, createClient, updateClient, listClients } from '../../lib/portal';

function AddClientForm() {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [pageLoading, setPageLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();

  const id = searchParams.get('id');

  useEffect(() => {
    const session = getSession();

    if (!session) {
      router.push('/login');
      return;
    }

    if (!id) {
      setPageLoading(false);
      return;
    }

    const loadClient = async () => {
      try {
        const found = (await listClients(session.token)).find((client) => client.id === id);

        if (found) {
          setName(found.name);
          setService(found.service);
        }
      } catch {
        toast.error('Failed to load client');
      } finally {
        setPageLoading(false);
      }
    };

    loadClient();
  }, [id, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const session = getSession();

    if (!session) {
      toast.error('Session expired — sign in again');
      return;
    }

    setLoading(true);

    try {
      if (id) {
        await updateClient(session.token, id, { name, service });
        toast.success('Client updated');
      } else {
        await createClient(session.token, { name, service });
        toast.success('Client created');
      }

      router.push('/clients');
    } catch {
      toast.error(id ? 'Failed to update client' : 'Failed to create client');
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
        <h1 className="mb-2 text-4xl font-bold">{id ? 'Edit Client' : 'Add Client'}</h1>

        <p className="mb-8 text-zinc-400">{id ? 'Update client information' : 'New consulting client'}</p>

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
            {loading ? (id ? 'Updating...' : 'Creating...') : id ? 'Update Client' : 'Create Client'}
          </button>
        </form>
      </div>
    </main>
  );
}

export default function AddClientPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-black text-white">
          <h1 className="text-3xl font-bold">Loading client...</h1>
        </main>
      }
    >
      <AddClientForm />
    </Suspense>
  );
}

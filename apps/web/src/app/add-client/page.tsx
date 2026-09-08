'use client';

// Create-only form: /add-client (editing lives at /clients/[id]/edit).

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { createClient, portalApi } from '../../lib/portal';

export default function AddClientPage() {
  const [name, setName] = useState('');
  const [service, setService] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const session = await portalApi.me();

      if (!session.success) {
        router.push('/login');
      }
    };

    checkSession();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      await createClient({ name, service });
      toast.success('Client created');
      router.push('/clients');
    } catch {
      toast.error('Failed to create client');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black p-6 text-white">
      <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-2 text-4xl font-bold">Add Client</h1>

        <p className="mb-8 text-zinc-400">New consulting client</p>

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
            {loading ? 'Creating...' : 'Create Client'}
          </button>
        </form>
      </div>
    </main>
  );
}

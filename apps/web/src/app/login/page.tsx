'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { portalApi, saveSession } from '../../lib/portal';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    try {
      const data = await portalApi.login(email, password);

      if (data.success && data.token && data.user) {
        saveSession({ token: data.token, user: data.user });

        toast.success('Login successful');
        router.push('/dashboard');
      } else {
        toast.error(data.message ?? 'Login failed');
      }
    } catch {
      toast.error('Backend connection error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-black px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-950 p-8">
        <h1 className="mb-6 text-center text-4xl font-bold">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rounded-xl border border-zinc-800 bg-black px-4 py-3 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-white py-3 font-semibold text-black transition hover:opacity-80 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          <a href="/register" className="text-center text-zinc-400 transition hover:text-white">
            Need an account? Register
          </a>
        </form>
      </div>
    </main>
  );
}

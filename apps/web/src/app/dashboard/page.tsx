'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import toast from 'react-hot-toast';

import { LineChart, Line, Tooltip, ResponsiveContainer, XAxis, YAxis } from 'recharts';

import Card from '../components/Card';
import Sidebar from '../components/Sidebar';
import { analytics as analyticsApi, clearSession, type AnalyticsResponse } from '../../lib/portal';

// Demo placeholder until real revenue tracking exists behind the API.
const revenueData = [
  { month: 'Jan', revenue: 1200 },
  { month: 'Feb', revenue: 2100 },
  { month: 'Mar', revenue: 1800 },
  { month: 'Apr', revenue: 2800 },
  { month: 'May', revenue: 3900 },
  { month: 'Jun', revenue: 4250 },
];

export default function DashboardPage() {
  const router = useRouter();

  const [analytics, setAnalytics] = useState<AnalyticsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (!token) {
      router.push('/login');
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setAnalytics(await analyticsApi(token));
      } catch {
        toast.error('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-10 text-white">
        <div className="animate-pulse">
          <div className="mb-10 h-12 w-72 rounded-2xl bg-zinc-900" />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <div className="mb-4 h-6 w-32 rounded-xl bg-zinc-900" />
                <div className="h-10 w-40 rounded-xl bg-zinc-900" />
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen bg-black text-white">
      <Sidebar
        onLogout={() => {
          clearSession();
          toast.success('Logged out');
          router.push('/login');
        }}
      />

      <section className="flex-1 p-10">
        <header className="mb-10 flex items-center justify-between">
          <div>
            <h2 className="text-4xl font-bold">Dashboard</h2>
            <p className="mt-2 text-zinc-400">Platform overview</p>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Card className="transition duration-300 hover:border-white hover:-translate-y-1">
            <h3 className="mb-2 text-xl font-semibold">Clients</h3>

            <p className="text-4xl font-bold">{analytics?.totalClients || 0}</p>

            <p className="mt-2 text-zinc-400">Active clients</p>
          </Card>

          <Card className="transition duration-300 hover:border-white hover:-translate-y-1">
            <h3 className="mb-2 text-xl font-semibold">Revenue</h3>

            <p className="text-4xl font-bold">${analytics?.monthlyRevenue || 0}</p>

            <p className="mt-2 text-zinc-400">Monthly revenue (placeholder formula)</p>
          </Card>

          <Card className="transition duration-300 hover:border-white hover:-translate-y-1">
            <h3 className="mb-2 text-xl font-semibold">Projects</h3>

            <p className="text-4xl font-bold">{analytics?.activeProjects || 0}</p>

            <p className="mt-2 text-zinc-400">Active projects (placeholder formula)</p>
          </Card>
        </div>

        <Card className="mt-10">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-semibold">Revenue Analytics</h3>
              <p className="mt-2 text-zinc-400">Monthly revenue (demo data)</p>
            </div>
          </div>

          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <XAxis dataKey="month" stroke="#71717a" />
                <YAxis stroke="#71717a" />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="#ffffff" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </section>
    </main>
  );
}

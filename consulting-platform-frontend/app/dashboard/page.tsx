"use client"

import {
  useEffect,
  useState,
} from "react"

import { useRouter } from "next/navigation"

import toast from "react-hot-toast"

import Card from "@/app/components/Card"
import Sidebar from "@/app/components/Sidebar"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"

export default function DashboardPage() {

  const router = useRouter()

  const [analytics, setAnalytics] =
    useState<any>(null)

  const [loading, setLoading] =
    useState(true)

  const revenueData = [
    {
      month: "Jan",
      revenue: 1200,
    },
    {
      month: "Feb",
      revenue: 2100,
    },
    {
      month: "Mar",
      revenue: 1800,
    },
    {
      month: "Apr",
      revenue: 2800,
    },
    {
      month: "May",
      revenue: 3900,
    },
    {
      month: "Jun",
      revenue: 4250,
    },
  ]

  useEffect(() => {

    const token =
      localStorage.getItem("token")

    if (!token) {
      router.push("/login")
      return
    }

    const fetchAnalytics = async () => {

      try {

        const response = await fetch(
          `${API_BASE_URL}/clients/analytics`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )

        const data =
          await response.json()

        setAnalytics(data)

      } catch (error) {

        console.log(error)

        toast.error(
          "Failed to load analytics",
        )

      } finally {

        setLoading(false)

      }
    }

    fetchAnalytics()

  }, [])

  if (loading) {
    return (

      <main className="min-h-screen bg-black text-white p-10">

        <div className="animate-pulse">

          <div className="h-12 w-72 bg-zinc-900 rounded-2xl mb-10" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {[1, 2, 3].map((item) => (

              <Card key={item}>

                <div className="h-6 w-32 bg-zinc-900 rounded-xl mb-4" />

                <div className="h-10 w-40 bg-zinc-900 rounded-xl" />

              </Card>

            ))}

          </div>

        </div>

      </main>

    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex">

      <Sidebar
        onLogout={() => {

          localStorage.removeItem(
            "token",
          )

          localStorage.removeItem(
            "user",
          )

          toast.success(
            "Logged out",
          )

          router.push("/login")

        }}
      />

      <section className="flex-1 p-10">

        <header className="flex justify-between items-center mb-10">

          <div>

            <h2 className="text-4xl font-bold">
              Dashboard
            </h2>

            <p className="text-zinc-400 mt-2">
              Welcome back, Sergey 👋
            </p>

          </div>

        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <Card className="hover:border-white hover:-translate-y-1 transition duration-300">

            <h3 className="text-xl font-semibold mb-2">
              Clients
            </h3>

            <p className="text-4xl font-bold">
              {analytics?.totalClients || 0}
            </p>

            <p className="text-zinc-400 mt-2">
              Active clients
            </p>

          </Card>

          <Card className="hover:border-white hover:-translate-y-1 transition duration-300">

            <h3 className="text-xl font-semibold mb-2">
              Revenue
            </h3>

            <p className="text-4xl font-bold">
              $
              {analytics?.monthlyRevenue || 0}
            </p>

            <p className="text-zinc-400 mt-2">
              Monthly revenue
            </p>

          </Card>

          <Card className="hover:border-white hover:-translate-y-1 transition duration-300">

            <h3 className="text-xl font-semibold mb-2">
              Projects
            </h3>

            <p className="text-4xl font-bold">
              {analytics?.activeProjects || 0}
            </p>

            <p className="text-zinc-400 mt-2">
              Active projects
            </p>

          </Card>

        </div>

        <Card className="mt-10">

          <h3 className="text-2xl font-semibold mb-6">
            Recent Activity
          </h3>

          <div className="flex flex-col gap-4">

            <div className="flex justify-between border-b border-zinc-900 pb-4">

              <p>
                New client added
              </p>

              <span className="text-zinc-500">
                Just now
              </span>

            </div>

            <div className="flex justify-between border-b border-zinc-900 pb-4">

              <p>
                Dashboard analytics updated
              </p>

              <span className="text-zinc-500">
                Live
              </span>

            </div>

            <div className="flex justify-between">

              <p>
                JWT authentication active
              </p>

              <span className="text-zinc-500">
                Secure
              </span>

            </div>

          </div>

        </Card>

        <Card className="mt-10">

          <div className="flex justify-between items-center mb-8">

            <div>

              <h3 className="text-2xl font-semibold">
                Revenue Analytics
              </h3>

              <p className="text-zinc-400 mt-2">
                Monthly revenue growth
              </p>

            </div>

          </div>

          <div className="h-[350px]">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <LineChart data={revenueData}>

                <XAxis
                  dataKey="month"
                  stroke="#71717a"
                />

                <YAxis
                  stroke="#71717a"
                />

                <Tooltip />

                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#ffffff"
                  strokeWidth={3}
                />

              </LineChart>

            </ResponsiveContainer>

          </div>

        </Card>

      </section>

    </main>
  )
}
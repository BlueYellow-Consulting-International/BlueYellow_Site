"use client"

import React, {
  Suspense,
  useEffect,
  useState,
} from "react"

import {
  useRouter,
  useSearchParams,
} from "next/navigation"

import toast from "react-hot-toast"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"

function EditClientPageContent() {

  const [clientName, setClientName] = useState("")
  const [serviceType, setServiceType] = useState("")
  const [pageLoading, setPageLoading] =
    useState(true)

  const [loading, setLoading] =
    useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()

  const id = searchParams.get("id")

  useEffect(() => {

    const fetchClients = async () => {

      try {

        const token =
          localStorage.getItem("token")

        const response = await fetch(
          `${API_BASE_URL}/clients`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )

        const data =
          await response.json()

        const client = data.find(
          (client: any) =>
            client.id === id,
        )

        if (client) {

          setClientName(client.name)

          setServiceType(
            client.service,
          )

        }

      } catch (error) {

        console.log(error)

        toast.error(
          "Failed to load client",
        )

      } finally {

        setPageLoading(false)

      }
    }

    fetchClients()

  }, [id])

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault()

    setLoading(true)

    try {

      const token =
        localStorage.getItem("token")

      await fetch(
        `${API_BASE_URL}/clients/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",

            Authorization:
              `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: clientName,
            service: serviceType,
          }),
        }
      )

      toast.success(
        "Client updated",
      )

      router.push("/clients")

    } catch (error) {

      console.log(error)

      toast.error(
        "Failed to update client",
      )

    } finally {

      setLoading(false)

    }
  }

  if (pageLoading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">

        <h1 className="text-3xl font-bold">
          Loading client...
        </h1>

      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

      <div className="w-full max-w-xl border border-zinc-800 bg-zinc-950 rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-2">
          Edit Client
        </h1>

        <p className="text-zinc-400 mb-8">
          Update client information
        </p>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5"
        >

          <input
            type="text"
            placeholder="Client Name"
            value={clientName}
            onChange={(e) =>
              setClientName(
                e.target.value,
              )
            }
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <input
            type="text"
            placeholder="Service Type"
            value={serviceType}
            onChange={(e) =>
              setServiceType(
                e.target.value,
              )
            }
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black rounded-xl py-3 font-semibold text-center hover:opacity-80 transition disabled:opacity-50"
          >
            {loading
              ? "Updating..."
              : "Update Client"}
          </button>

        </form>

      </div>

    </main>
  )
}

export default function EditClientPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center">
          <h1 className="text-3xl font-bold">
            Loading client...
          </h1>
        </main>
      }
    >
      <EditClientPageContent />
    </Suspense>
  )
}
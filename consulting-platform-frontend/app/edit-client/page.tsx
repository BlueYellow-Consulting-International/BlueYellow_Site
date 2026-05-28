"use client"

import React, {
  Suspense,
  useEffect,
  useState,
} from "react"
import { useRouter, useSearchParams } from "next/navigation"

function EditClientPageContent() {

  const [clientName, setClientName] = useState("")
  const [serviceType, setServiceType] = useState("")

  const router = useRouter()
  const searchParams = useSearchParams()

  const clientIndex = searchParams.get("index")

  useEffect(() => {

    const storedClients =
      JSON.parse(localStorage.getItem("clients") || "[]")

    const client = storedClients[Number(clientIndex)]

    if (client) {
      setClientName(client.name)
      setServiceType(client.service)
    }

  }, [clientIndex])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const storedClients =
      JSON.parse(localStorage.getItem("clients") || "[]")

    storedClients[Number(clientIndex)] = {
      ...storedClients[Number(clientIndex)],
      name: clientName,
      service: serviceType,
    }

    localStorage.setItem(
      "clients",
      JSON.stringify(storedClients)
    )

    router.push("/clients")
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
            onChange={(e) => setClientName(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <input
            type="text"
            placeholder="Service Type"
            value={serviceType}
            onChange={(e) => setServiceType(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <button
            type="submit"
            className="bg-white text-black rounded-xl py-3 font-semibold text-center hover:opacity-80 transition"
          >
            Save Changes
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
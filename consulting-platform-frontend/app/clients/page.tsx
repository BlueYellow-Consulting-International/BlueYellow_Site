"use client"

import { useEffect, useState } from "react"

import toast from "react-hot-toast"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"

export default function ClientsPage() {

  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [user, setUser] = useState<any>(null)

  useEffect(() => {

    const storedUser =
      localStorage.getItem("user")

    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }

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

        setClients(data)

      } catch (error) {

        console.log(error)

        toast.error(
          "Failed to load clients",
        )

      } finally {

        setLoading(false)

      }
    }

    fetchClients()

  }, [])

  const handleDelete = async (
    id: string,
  ) => {

    try {

      const token =
        localStorage.getItem("token")

      await fetch(
        `${API_BASE_URL}/clients/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      const updatedClients =
        clients.filter(
          (client) =>
            client.id !== id,
        )

      setClients(updatedClients)

      toast.success(
        "Client deleted",
      )

    } catch (error) {

      console.log(error)

      toast.error(
        "Failed to delete client",
      )

    }
  }

  const filteredClients =
    clients.filter(
      (client) =>
        client.name
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ) ||

        client.service
          .toLowerCase()
          .includes(
            search.toLowerCase(),
          ),
    )

  if (loading) {
    return (

      <main className="min-h-screen bg-black text-white p-10">

        <div className="animate-pulse">

          <div className="flex justify-between items-center mb-10">

            <div>

              <div className="h-10 w-52 bg-zinc-900 rounded-xl mb-4" />

              <div className="h-5 w-72 bg-zinc-900 rounded-xl" />

            </div>

            <div className="h-12 w-36 bg-zinc-900 rounded-xl" />

          </div>

          <div className="h-14 w-full bg-zinc-900 rounded-2xl mb-8" />

          <div className="grid gap-6">

            {[1, 2, 3].map((item) => (

              <div
                key={item}
                className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6"
              >

                <div className="h-8 w-52 bg-zinc-900 rounded-xl mb-4" />

                <div className="h-5 w-40 bg-zinc-900 rounded-xl" />

              </div>

            ))}

          </div>

        </div>

      </main>

    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            Clients
          </h1>

          <p className="text-zinc-400 mt-2">
            Manage your consulting clients
          </p>

        </div>

        {user?.role === "admin" && (

          <a
            href="/add-client"
            className="bg-white text-black px-5 py-3 rounded-xl font-semibold hover:opacity-80 transition"
          >
            Add Client
          </a>

        )}

      </div>

      <input
        type="text"
        placeholder="Search clients..."
        value={search}
        onChange={(e) =>
          setSearch(e.target.value)
        }
        className="w-full mb-8 bg-zinc-950 border border-zinc-800 rounded-2xl px-5 py-4 outline-none"
      />

      {filteredClients.length === 0 ? (

        <div className="border border-dashed border-zinc-800 rounded-2xl p-14 text-center bg-zinc-950">

          <h2 className="text-3xl font-bold mb-4">
            No clients found
          </h2>

          <p className="text-zinc-400 mb-8">
            Create your first consulting client
          </p>

          {user?.role === "admin" && (

            <a
              href="/add-client"
              className="inline-block bg-white text-black px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition"
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
              className="border border-zinc-800 bg-zinc-950 rounded-2xl p-6 flex justify-between items-center"
            >

              <div>

                <h2 className="text-2xl font-semibold">
                  {client.name}
                </h2>

                <p className="text-zinc-400 mt-2">
                  {client.service}
                </p>

              </div>

              <div className="flex items-center gap-4">

                <span className="text-green-400">
                  Active
                </span>

                {user?.role === "admin" && (

                  <>

                    <button
                      className="text-blue-400 hover:text-blue-300 transition"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(client.id)
                      }
                      className="text-red-400 hover:text-red-300 transition"
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

    </main>
  )
}
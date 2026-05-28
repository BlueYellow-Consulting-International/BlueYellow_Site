"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import toast from "react-hot-toast"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"

export default function LoginPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] =
    useState(false)

  const router = useRouter()

  const handleLogin = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault()

    setLoading(true)

    try {

      const response = await fetch(
        `${API_BASE_URL}/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      )

      const data = await response.json()

      console.log(data)

      if (data.success) {

        localStorage.setItem(
          "token",
          data.token,
        )

        localStorage.setItem(
          "user",
          JSON.stringify(data.user),
        )

        toast.success(
          "Login successful",
        )

        router.push("/dashboard")

      } else {

        toast.error(data.message)

      }

    } catch (error) {

      console.log(error)

      toast.error(
        "Backend connection error",
      )

    } finally {

      setLoading(false)

    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-6 text-center">
          Login
        </h1>

        <form
          onSubmit={handleLogin}
          className="flex flex-col gap-4"
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="bg-white text-black rounded-xl py-3 font-semibold hover:opacity-80 transition disabled:opacity-50"
          >
            {loading
              ? "Signing In..."
              : "Sign In"}
          </button>

        </form>

      </div>

    </main>
  )
}
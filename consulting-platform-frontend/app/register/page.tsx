"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000"

export default function RegisterPage() {

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const router = useRouter()

  const handleRegister = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {

    e.preventDefault()

    try {

      const response = await fetch(
        `${API_BASE_URL}/auth/register`,
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

        alert("Account created")

        router.push("/login")

      } else {

        alert(data.message)

      }

    } catch (error) {

      console.log(error)

      alert("Register failed")

    }
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6">

      <div className="w-full max-w-md border border-zinc-800 bg-zinc-950 rounded-2xl p-8">

        <h1 className="text-4xl font-bold mb-6 text-center">
          Register
        </h1>

        <form
          onSubmit={handleRegister}
          className="flex flex-col gap-4"
        >

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-black border border-zinc-800 rounded-xl px-4 py-3 outline-none"
          />

          <button
            type="submit"
            className="bg-white text-black rounded-xl py-3 font-semibold hover:opacity-80 transition"
          >
            Create Account
          </button>

        </form>

      </div>

    </main>
  )
}
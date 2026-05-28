import "./globals.css"

import { Toaster } from "react-hot-toast"

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <html lang="en">

      <body className="bg-black text-white">

        <header className="border-b border-zinc-900 px-8 py-5 flex justify-between items-center">

          <a
            href="/"
            className="text-2xl font-bold"
          >
            Consulting Platform
          </a>

          <nav className="flex gap-6 text-zinc-400">

            <a
              href="/dashboard"
              className="hover:text-white transition"
            >
              Dashboard
            </a>

            <a
              href="/clients"
              className="hover:text-white transition"
            >
              Clients
            </a>

            <a
              href="/add-client"
              className="hover:text-white transition"
            >
              Add Client
            </a>

          </nav>

        </header>

        {children}

        <Toaster
          position="top-right"
        />

      </body>

    </html>
  )
}
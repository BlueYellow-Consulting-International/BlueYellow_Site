export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">

      <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-900">

        <h2 className="text-xl font-bold">
          Consulting Platform
        </h2>

        <nav className="flex gap-6 text-zinc-400">

          <a
            href="#"
            className="hover:text-white transition"
          >
            Features
          </a>

          <a
            href="#"
            className="hover:text-white transition"
          >
            Pricing
          </a>

          <a
            href="#"
            className="hover:text-white transition"
          >
            Contact
          </a>

        </nav>

      </header>

      <section className="flex flex-col items-center justify-center min-h-screen text-center px-6">

        <h1 className="text-6xl font-bold mb-6">
          Consulting Platform
        </h1>

        <p className="text-zinc-400 text-xl max-w-2xl mb-8">
          Modern SaaS platform for consultants, agencies and experts.
        </p>

        <div className="flex gap-4">

          <a
            href="/login"
            className="bg-white text-black px-6 py-3 rounded-xl font-semibold hover:opacity-80 transition"
          >
            Get Started
          </a>

          <button className="border border-zinc-700 px-6 py-3 rounded-xl hover:bg-zinc-900 transition">
            Learn More
          </button>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-5xl">

          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">

            <h3 className="text-2xl font-semibold mb-3">
              Client Management
            </h3>

            <p className="text-zinc-400">
              Organize clients, meetings and workflows in one place.
            </p>

          </div>

          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">

            <h3 className="text-2xl font-semibold mb-3">
              Analytics
            </h3>

            <p className="text-zinc-400">
              Track performance and business growth with real-time analytics.
            </p>

          </div>

          <div className="border border-zinc-800 rounded-2xl p-6 bg-zinc-950">

            <h3 className="text-2xl font-semibold mb-3">
              Secure Platform
            </h3>

            <p className="text-zinc-400">
              Protected authentication and secure client data management.
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}
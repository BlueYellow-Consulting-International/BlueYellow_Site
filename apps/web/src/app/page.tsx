import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-500">
        Consulting POC
      </p>
      <h1 className="max-w-2xl text-4xl font-bold tracking-tight sm:text-5xl">
        Consulting that starts with listening.
      </h1>
      <p className="mt-6 max-w-xl text-lg text-slate-600">
        This is the technical proof of concept: the contact form writes to our
        own database and is handed to the CRM by our backend worker — the
        website never depends on the CRM being available.
      </p>
      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/contact"
          className="rounded-md bg-slate-900 px-6 py-3 text-base font-semibold text-white transition hover:bg-slate-700"
        >
          Start a conversation
        </Link>
        <Link
          href="/login"
          className="rounded-md border border-slate-300 px-6 py-3 text-base font-semibold text-slate-900 transition hover:bg-slate-100"
        >
          Log in
        </Link>
      </div>
    </main>
  );
}

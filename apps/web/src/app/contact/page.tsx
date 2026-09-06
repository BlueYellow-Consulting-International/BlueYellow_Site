import type { Metadata } from 'next';
import { ContactForm } from './contact-form';

export const metadata: Metadata = {
  title: 'Contact',
};

export default function ContactPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Contact us</h1>
      <p className="mt-3 text-slate-600">
        Tell us briefly what you need help with. Your message is stored in our
        own systems first and then passed to our CRM — never the other way
        around.
      </p>
      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <ContactForm />
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { leadInputSchema } from '@consulting/shared';
import { apiClient } from '../../lib/api';

type FormState = 'idle' | 'submitting' | 'success' | 'error';

const emptyValues = { name: '', email: '', company: '', message: '' };

const inputClasses =
  'mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm ' +
  'focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200';

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages || messages.length === 0) {
    return null;
  }
  return <p className="mt-1 text-xs text-red-600">{messages[0]}</p>;
}

export function ContactForm() {
  const [values, setValues] = useState(emptyValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [formState, setFormState] = useState<FormState>('idle');
  const [leadId, setLeadId] = useState<string | null>(null);

  function update(field: keyof typeof emptyValues, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError(null);
    setFieldErrors({});

    // Same schema as the server — one definition of a valid lead.
    const parsed = leadInputSchema.safeParse(values);
    if (!parsed.success) {
      setFieldErrors(parsed.error.flatten().fieldErrors as Record<string, string[]>);
      return;
    }

    setFormState('submitting');
    try {
      const response = await apiClient.createLead(parsed.data);
      setLeadId(response.id);
      setFormState('success');
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Unexpected error');
      setFormState('error');
    }
  }

  if (formState === 'success') {
    return (
      <div className="text-center">
        <h2 className="text-xl font-semibold">Thank you — request received.</h2>
        <p className="mt-3 text-slate-600">
          Your request is saved (id{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">{leadId}</code>) and
          will appear in our CRM within moments.
        </p>
        <p className="mt-2 text-sm text-slate-500">
          The sync status can be checked on the API:{' '}
          <code className="text-xs">GET /leads/{leadId}</code>
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-slate-700">
          Name
        </label>
        <input
          id="name"
          type="text"
          value={values.name}
          onChange={(event) => update('name', event.target.value)}
          className={inputClasses}
          placeholder="Jane Doe"
        />
        <FieldError messages={fieldErrors.name} />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          className={inputClasses}
          placeholder="jane@example.com"
        />
        <FieldError messages={fieldErrors.email} />
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-medium text-slate-700">
          Company <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <input
          id="company"
          type="text"
          value={values.company}
          onChange={(event) => update('company', event.target.value)}
          className={inputClasses}
          placeholder="Acme Inc."
        />
        <FieldError messages={fieldErrors.company} />
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-slate-700">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          value={values.message}
          onChange={(event) => update('message', event.target.value)}
          className={inputClasses}
          placeholder="We are looking for help with…"
        />
        <FieldError messages={fieldErrors.message} />
      </div>

      {submitError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={formState === 'submitting'}
        className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {formState === 'submitting' ? 'Sending…' : 'Send request'}
      </button>
    </form>
  );
}

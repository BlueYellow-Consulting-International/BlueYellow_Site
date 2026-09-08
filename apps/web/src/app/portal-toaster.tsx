'use client';

import { Toaster } from 'react-hot-toast';

/** Mounted once from the root layout so all portal pages share notifications. */
export function PortalToaster() {
  return <Toaster position="top-right" />;
}

import type { NextConfig } from 'next';
import { dirname, resolve } from 'path';

const nextConfig: NextConfig = {
  // Produces .next/standalone for the Docker runtime stage
  output: 'standalone',
  // Anchor tracing at the pnpm workspace root so the standalone bundle
  // keeps the .pnpm store its node_modules symlinks resolve into.
  outputFileTracingRoot: resolve(dirname(import.meta.filename ?? '/app/apps/web/next.config.ts'), '../..'),
};

export default nextConfig;

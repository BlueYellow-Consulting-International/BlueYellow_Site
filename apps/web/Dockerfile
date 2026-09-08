# Build context is the REPO ROOT (workspace lockfile + packages live there):
#   docker build -f apps/web/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/web/package.json apps/web/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY apps/web/ apps/web/

RUN pnpm --filter @consulting/shared build \
  && pnpm --filter @consulting/web build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Tracing root is the workspace root, so the standalone tree mirrors the repo:
# apps/web/server.js + a node_modules/.pnpm store its symlinks resolve into.
COPY --from=build /app/apps/web/.next/standalone ./
COPY --from=build /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000
CMD ["node", "apps/web/server.js"]

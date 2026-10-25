# Build context is the REPO ROOT (workspace lockfile + packages live there):
#   docker build -f apps/api/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app

# Workspace scaffolding first for layer caching
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.base.json ./
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/

RUN pnpm install --frozen-lockfile

COPY packages/shared/ packages/shared/
COPY apps/api/ apps/api/
COPY apps/api/prisma apps/api/prisma

RUN pnpm --filter @consulting/api exec prisma generate \
  && pnpm --filter @consulting/shared build \
  && pnpm --filter @consulting/api build

FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Full workspace node_modules: keeps the generated .prisma client, which
# pnpm deploy would strip (it is not part of the package dependency graph).
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=build /app/packages/shared ./packages/shared
COPY --from=build /app/apps/api/package.json ./apps/api/package.json
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma

WORKDIR /app/apps/api

# Migration + idempotent admin bootstrap, then serve
CMD ["sh", "-c", "npx prisma migrate deploy && node prisma/seed.mjs && node dist/main.js"]

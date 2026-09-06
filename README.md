# BlueYellow_Site
Blue Yellow Consulting Inc. Website — pnpm monorepo.

## Architecture

**PostgreSQL is our source of truth.** Flectra is an external CRM/ERP integration — the only bridge is the outbox worker.

```
apps/
  api/        NestJS: health, leads, auth (register/login, JWT), clients. No Flectra code.
  worker/     NestJS: outbox poller + Flectra integration (port/adapter/mapper).
  web/        Next.js: public site + contact form. Talks only to the API.
  crm/        Internal CRM frontend (lead management).
packages/
  shared/     zod schemas + types shared by web, api, and worker.
  flectra/    Pure Flectra JSON-RPC client (transport only).
flectra/      Flectra stack (docker, config, BlueYellow addons, docs/specs).
```

## Local Development

```bash
pnpm install
cp .env.example .env                          # compose infra (postgres + flectra)
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example apps/web/.env

docker compose up -d        # infrastructure only
pnpm db:generate && pnpm db:migrate
pnpm dev                    # web :3000 · api :4000 · worker polling
```

Legacy two-folder layout (`consulting-platform-backend` / `consulting-platform-frontend`) is kept until the new stack reaches full parity, then removed.

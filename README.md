# BlueYellow_Site
Blue Yellow Consulting Inc. Website — pnpm monorepo.

## Architecture

**PostgreSQL is our source of truth.** Flectra is an external CRM/ERP integration — the only bridge is the outbox worker.

```
apps/
  api/        NestJS: health, leads, auth (register/login, JWT), clients. No Flectra code.
  worker/     NestJS: outbox poller + Flectra integration (port/adapter/mapper).
  web/        Next.js: public site, contact form, client/consultant portal. Talks only to the API.
  crm/        Internal CRM frontend (lead management).
packages/
  shared/     zod schemas + types shared by web, api, and worker.
  flectra/    Pure Flectra JSON-RPC client (transport only).
flectra/      Flectra stack (docker, config, BlueYellow addons, docs/specs).
```

## Local Development (containers — default)

```bash
cp .env.example .env
docker compose up -d           # db + api + web (Flectra services are profile-gated)
docker compose logs -f api     # api runs: prisma migrate deploy → admin seed → serve
```

| Service | URL | Notes |
|---------|-----|-------|
| web | http://localhost:3000 | portal `/login`, `/dashboard`, `/clients` |
| api | http://localhost:4000 | `/health`, `/auth/*`, `/clients`, `/leads` |
| db | localhost:5433 | published from `DB_HOST_PORT` |

Admin bootstrap: `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env` (applied idempotently at api boot).
Web on `127.0.0.1:3000` because the homepage containers own `192.168.1.96:3000`.

For Nginx Proxy Manager, the api/web containers join `docker_default` as
`consulting-api` / `consulting-web` — forward hosts, no ports needed.

## Optional: Flectra POC stack

```bash
docker compose --profile flectra up -d
```

Separate from the long-running Flectra deployment (`flectra/` has its own compose + config on port 7073).

## Running apps on the host (dev mode)

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example apps/web/.env

docker compose up -d db     # infra only
pnpm db:generate && pnpm db:migrate && pnpm db:seed
pnpm dev                    # web :3000 · api :4000 · worker polling · crm
```

Legacy two-folder layout (`consulting-platform-backend` / `consulting-platform-frontend`) is retained until final retirement.

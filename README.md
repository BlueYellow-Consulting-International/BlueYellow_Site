# BlueYellow_Site

Blue Yellow Consulting Inc. — the website platform behind blueyellow: a public
marketing site, a client/consultant portal, and an internal CRM, built as one
pnpm monorepo.

## How it works

```
Next.js (public site / portal / CRM frontends)
        │
        ▼  (JSON over HTTP; portal goes through the web app's own BFF routes)
NestJS API  ──►  PostgreSQL  ──►  transactional outbox  ──►  background worker  ──►  Flectra CRM
```

The platform runs on its own PostgreSQL. Flectra CRM is an external,
replaceable system: only `apps/worker` talks to it, through a single
integration interface (`apps/worker`, package `@consulting/flectra`), so the
whole product also runs without Flectra (the `NoopFlectraAdapter` proves the
worker path).

Architecture rules:

1. PostgreSQL is the single source of truth for application data.
2. Only the worker communicates with Flectra, only behind its interface.
3. The web apps never touch Flectra or the database directly — always the API.
4. Credentials and URLs come from the environment, never source code.
5. App services run in containers with their own healthchecks.

## Repository layout

```
apps/
  api/      NestJS API: health, leads, auth (register/login/me, JWT), clients. No Flectra code.
  web/      Next.js: public site + contact form + client/consultant portal.
  crm/      Internal CRM frontend (lead pipeline, UK/EN localized).
  worker/   Outbox poller + the Flectra integration (port/adapter/mapper).
packages/
  shared/   Zod schemas + types shared by web, api and worker.
  flectra/  Flectra JSON-RPC client (transport only, no framework code).
flectra/    Flectra stack for development: docker setup, config, BlueYellow
            addons (blueyellow_client, blueyellow_consultant,
            blueyellow_recruitment_project, theme_*), docs and specs.
```

## Session model

Users sign in with email + password (bcrypt). The API issues a signed JWT that
never appears in a request body: the web app's BFF route handlers put it
straight into an **httpOnly cookie** (`SameSite=Lax`), and the browser talks
only to same-origin `/api/*` endpoints. Mutating requests are checked for
origin mismatches (CSRF), and `GET /api/auth/me` resolves the current user
with a DB-fresh role. There is no session state in browser storage. Once the
deployment sits behind HTTPS termination, set `COOKIE_SECURE=true`.

## Requirements

- Docker (compose v2)
- Node.js ≥ 20 and pnpm ≥ 9 only for host-side development

## Quickstart (containers)

```bash
git clone <this-repo>
cd blueyellow_site

cp .env.example .env        # set POSTGRES_PASSWORD, JWT_SECRET, ADMIN_* first
docker compose up -d
```

Compose starts the database, API and web app on their published ports and
waits for health before opening to traffic.

| Service | URL | Notes |
|---------|-----|-------|
| web     | http://localhost:3000 | public site, `/login`, `/dashboard`, `/clients` |
| api     | http://localhost:4000 | `/health`, `/auth/*`, `/clients`, `/leads` |
| db      | localhost:5433 | PostgreSQL 16 (host port via `DB_HOST_PORT`) |

On first boot the API container applies migrations and creates the
administrative account defined by `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`
(idempotent — safe on every start). Register additional accounts at
`/register`; admin capabilities follow the user's `role`.

By default web and api publish on localhost only. To expose them further,
adjust the `ports:` entries in `docker-compose.yml` (or put a reverse proxy in
front — the containers register themselves on their compose network as
`consulting-web` / `consulting-api`).

## Flectra (optional development stack)

`flectra/` contains the CRM integration resources — custom addons, docker
setup and design/workflow docs. A fully self-contained Flectra stack for local
experiments is available behind a compose profile:

```bash
docker compose --profile flectra up -d
```

Whether the worker needs a live Flectra is controlled by
`apps/worker/.env` (`REAL`/`NoopFlectraAdapter` switch) — the contact-form
pipeline works without a CRM running.

## Development on the host

```bash
pnpm install
cp apps/api/.env.example    apps/api/.env
cp apps/worker/.env.example apps/worker/.env
cp apps/web/.env.example    apps/web/.env

docker compose up -d db     # infrastructure only
pnpm db:generate
pnpm db:migrate             # prisma migrate dev
pnpm db:seed                # idempotent admin bootstrap
pnpm dev                    # web :3000 · api :4000 · crm · worker
```

Each app also has its own `typecheck` script; `pnpm typecheck` runs them all.

> The `consulting-platform-backend/` and `consulting-platform-frontend/`
> directories are remnants of the pre-monorepo layout and are scheduled for
> removal.

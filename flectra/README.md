# BlueYellow Flectra Site

This repository runs a local Flectra 3.0 stack with PostgreSQL and custom BlueYellow website/webclient themes.

The project is designed to be publishable without committing local database or filestore state. Runtime state lives in ignored directories, while the Docker configuration, Flectra config, startup bootstrap, and custom addons are tracked.

## What Is Included

- `docker-compose.yaml`: runs PostgreSQL and Flectra on port `7073`.
- `Dockerfile.flectra`: extends `flectrahq/flectra` with the project entrypoint and startup helper. UID/GID mapping is handled at container start from `.env`, not at image build time.
- `docker/flectra-start.sh`: waits for PostgreSQL, installs default modules on a fresh database, and ensures the original theme is active.
- `flectra.conf`: Flectra config with `/mnt/extra-addons` enabled.
- `addons/theme_blueyellow`: primary BlueYellow theme and webclient skin.
- `addons/theme_blueyellow_designer`: alternate designer-palette frontend variant.
- `docs/design/README.md`: design principles and CSS/JS index.

## Quick Start

Copy the example environment file and adjust user IDs if needed:

```bash
cp .env.example .env
id -u
id -g
```

Update `HOST_UID` and `HOST_GID` in `.env` to match the user that will own bind-mounted files on the host. You do **not** need to edit `Dockerfile.flectra` for this; the entrypoint creates the matching container user at startup from `.env`.

On a new machine, also ensure the external Docker network exists:

```bash
docker network create docker_default
```

If `db` or `flectra` container names are already in use on that host, stop the conflicting containers first or rename the services in `docker-compose.yaml`.

Start the stack:

```bash
docker compose up --build
```

Open Flectra at:

```text
http://localhost:7073/
```

You should land on the **login page** for the configured database (`FLECTRA_DB`, default `flectra`). The public database manager is disabled; database create/backup/restore is not exposed without authentication.

## Database security defaults

The startup script writes a runtime config on every boot with:

| Setting | Value | Effect |
|---------|-------|--------|
| `list_db` | `False` | Disables the public `/web/database/*` manager (no unauthenticated create/backup/delete UI) |
| `dbfilter` | `^<FLECTRA_DB>$` | Locks the web app to the configured database |
| `-d <FLECTRA_DB>` | from env | Binds the server process to that database |
| `admin_passwd` | `FLECTRA_ADMIN_PASSWD` | Master password for internal DB RPC only (not normal user login) |

Set a strong master password in `.env` before production:

```text
FLECTRA_ADMIN_PASSWD=your-long-random-secret
```

On a **fresh** Postgres volume, `POSTGRES_DB` matches `FLECTRA_DB` so you do not get a stray empty `db` database alongside `flectra`. Existing volumes keep whatever databases were already created.

## Reverse Proxy / Proxy Mode

When Flectra sits behind a trusted reverse proxy (nginx, Traefik, Caddy, **Nginx Proxy Manager**, etc.), set in `.env`:

```text
FLECTRA_PROXY_MODE=1
FLECTRA_WEB_BASE_URL=https://your-public-domain.example.com
```

Then restart (rebuild required the first time you enable proxy mode):

```bash
docker compose up -d --build --force-recreate flectra
```

- `FLECTRA_PROXY_MODE=1` enables [proxy mode](https://doc.flectrahq.com/developer/reference/cli.html#cmdoption-flectra-bin-proxy-mode) so Flectra trusts `X-Forwarded-*` headers.
- `FLECTRA_WEB_BASE_URL` sets Flectra's `web.base.url` and freezes it. Without this, admin login can overwrite the base URL back to `http://` when proxy mode is missing, which breaks the editor iframe.

Leave both unset (or `FLECTRA_PROXY_MODE=0`) when accessing Flectra directly on port `7073`.

### Nginx Proxy Manager

See [docs/reverse-proxy/nginx-proxy-manager.md](docs/reverse-proxy/nginx-proxy-manager.md) for a full NPM checklist. Minimum requirements:

1. NPM and Flectra on the same Docker network (`docker_default`)
2. Forward to `http://flectra:7073` (not `localhost`)
3. Enable **Websockets Support** on the proxy host
4. Set `FLECTRA_PROXY_MODE=1` and `FLECTRA_WEB_BASE_URL=https://...` in `.env`
5. Forward `X-Forwarded-Host` to Flectra (see NPM doc §4 — fixes editor iframe mixed content)

Generic nginx headers (also used in the NPM Advanced tab):

```nginx
proxy_set_header Host $host;
proxy_set_header X-Real-IP $remote_addr;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Forwarded-Host $host;
add_header Content-Security-Policy "upgrade-insecure-requests" always;
```

## Runtime Data

The following paths are local runtime state and should not be committed:

- `postgres_data/`
- `var/lib/flectra/`

They are ignored by `.gitignore` and `.dockerignore`.

If you want to test a clean launch, stop the stack and remove local runtime data before rebuilding. The startup helper will initialize the configured database and activate the default theme.

```bash
docker compose down
sudo rm -rf postgres_data var
docker compose up --build
```

Always remove **both** `postgres_data` and `var` together. Deleting only `var` leaves attachment metadata in PostgreSQL pointing at files that no longer exist, which causes 500 errors on logos, favicons, and other uploads.

The startup helper no longer drops a mismatched database during normal boot. If you are working in a disposable local environment and intentionally want that old recovery behavior, set:

```text
FLECTRA_ALLOW_AUTO_DB_RESET=1
```

On normal boots, the startup helper avoids repeated database mutations. It only:

- Installs `FLECTRA_INIT_MODULES` on a fresh/uninitialized database.
- Upgrades `theme_blueyellow` when global webclient assets are missing from an older install.
- Installs/upgrades `FLECTRA_UPGRADE_MODULES` when that variable is explicitly set.
- Clears generated asset bundles after a fresh bootstrap, theme upgrade, or explicit module sync.

## Fresh Database Bootstrap

The Flectra service runs:

```text
/usr/local/bin/blueyellow-flectra-start
```

When `FLECTRA_AUTO_INIT=1`, the helper:

- Waits for PostgreSQL to accept authenticated SQL connections.
- Installs `FLECTRA_INIT_MODULES` when the target database/theme is not initialized.
- Sets every website record to `FLECTRA_DEFAULT_THEME` only after a fresh bootstrap, or when `FLECTRA_FORCE_DEFAULT_THEME=1`.
- Applies the BlueYellow homepage landing content after a fresh bootstrap, or when `FLECTRA_ENSURE_HOMEPAGE=1`.
- Installs/upgrades `FLECTRA_UPGRADE_MODULES` when that variable is explicitly set.
- Clears generated asset bundles only after bootstrap/theme/module changes, or when `FLECTRA_CLEAR_ASSETS_ON_BOOT=1`.

The default values are documented in `.env.example`:

```text
FLECTRA_DB=flectra
FLECTRA_AUTO_INIT=1
FLECTRA_INIT_MODULES=crm,sale_management,account_accountant,project,project_todo,calendar,contacts,hr,hr_attendance,hr_contract,hr_expense,hr_recruitment,hr_skills,hr_timesheet,sale_project,sale_timesheet,mass_mailing,survey,website_event,website_hr_recruitment,website_slides,website_sale,website_partner,website_crm_partner_assign,account_payment,payment,blueyellow_client,blueyellow_consultant,blueyellow_recruitment_project,website,theme_blueyellow
FLECTRA_UPGRADE_MODULES=
FLECTRA_DEFAULT_THEME=theme_blueyellow
FLECTRA_ALLOW_AUTO_DB_RESET=0
FLECTRA_FORCE_DEFAULT_THEME=0
FLECTRA_ENSURE_HOMEPAGE=0
FLECTRA_CLEAR_ASSETS_ON_BOOT=0
```

On a fresh database, that installs these apps by default:

| Module | App |
|--------|-----|
| `crm` | CRM |
| `sale_management` | Sales |
| `account_accountant` | Accounting |
| `project` | Project |
| `project_todo` | To-Do |
| `calendar` | Calendar |
| `contacts` | Contacts |
| `hr` | Employees |
| `hr_attendance` | Attendances |
| `hr_contract` | Employee Contracts |
| `hr_expense` | Expenses |
| `hr_recruitment` | Recruitment |
| `hr_skills` | Skills Management |
| `hr_timesheet` | Timesheets |
| `sale_project` | Sales ↔ Project link |
| `sale_timesheet` | Bill from timesheets |
| `mass_mailing` | Email Marketing |
| `survey` | Surveys |
| `website_event` | Events |
| `website_hr_recruitment` | Online Jobs |
| `website_slides` | eLearning |
| `website_sale` | eCommerce |
| `website_partner` | Public partner pages |
| `website_crm_partner_assign` | Partner directory (consultants) |
| `account_payment` | Invoice payment registration |
| `payment` | Payment providers |
| `blueyellow_client` | Client role, organization wizard, company-scoped projects, home menu filtering |
| `blueyellow_consultant` | Consultant role and home menu filtering |
| `blueyellow_recruitment_project` | Job ↔ project link and hire → project automation |
| `website` | Website |
| `theme_blueyellow` | BlueYellow theme |

Flectra installs each module's dependencies automatically. Keep `website` and `theme_blueyellow` at the end of the list.

### Marketplace workflow (hire → pay)

See [docs/workflows/golden-path-hire-to-pay.md](docs/workflows/golden-path-hire-to-pay.md) for the end-to-end click path: job posting, application, shared project, timesheets, client invoice, and consultant payout.

Platform addon design and security notes: [docs/specs/blueyellow-platform-modules.md](docs/specs/blueyellow-platform-modules.md).

### Demo logins (fresh database only)

On a **fresh** bootstrap, Flectra loads demo data styled like a freelance marketplace (everyday clients posting gigs, freelancers with headline-style profiles). Demo XML does **not** load on normal `-u` upgrades of an existing database.

**Shared password for marketplace showcase users:** `demo`

| Area | Fresh install includes |
|------|------------------------|
| **Client orgs** | **14** shops and small teams (e.g. Brightline Apps, Northstar General Store, Harbor & Home Fulfillment, Summit Ledger, Verde Family Clinic, …) |
| **Published gigs** | **16+** postings on `/jobs` — casual titles like “Fix our API before launch (Python, ~20 hrs/week)” |
| **Consultants** | **24** freelancers at `consultant.<name>@blueyellow.demo` with Upwork-style employee headlines |
| **Platform ops** | `ops@blueyellow.demo`, `billing@blueyellow.demo` |

| Login (examples) | Password | Role |
|------------------|----------|------|
| `client.manager@clientco.demo` | `demo` | Hiring manager — Brightline Apps |
| `jess@harborhome.demo` | `demo` | Client — Harbor & Home Fulfillment |
| `consultant.alex@blueyellow.demo` | `demo` | Consultant — use **Find work** home tile |
| `consultant.sam@blueyellow.demo` | `demo` | Consultant |
| `client.manager@clientco.example.com` | `demo` | Legacy client demo |
| `consultant@blueyellow.example.com` | `demo` | Legacy consultant demo |

Also seeded on fresh install:

- **Brightline Apps** — child company owned by the hiring manager (`blueyellow_owner_id` set).
- MVP Python gig on Brightline, linked to a contract project and published for `/jobs`.
- **Find work** app tile for consultants (published gigs across all client orgs; **Submit proposal** on the website).

To test demo data locally, reset runtime state and bootstrap again:

```bash
docker compose down
sudo rm -rf postgres_data var
docker compose up --build
```

**Client users:** assign the **Client** group (`blueyellow_client`) only — not standard **Project Administrator**. The module now removes Project Administrator automatically if it is assigned together with Client, but avoiding the overlap keeps access reviews clear. Clients see projects for their organization only; new projects inherit the active company.

Upgrade an existing database with:

```bash
docker compose exec flectra flectra-bin \
  --config=/etc/flectra/flectra.conf \
  --db_host=db --db_user=db --db_password=flectra \
  -d flectra \
  -i blueyellow_client,blueyellow_consultant,blueyellow_recruitment_project \
  -u blueyellow_client,blueyellow_consultant,blueyellow_recruitment_project,theme_blueyellow \
  --stop-after-init
docker compose restart flectra
```

For deployment automation, set `FLECTRA_UPGRADE_MODULES=blueyellow_client,blueyellow_consultant,blueyellow_recruitment_project,theme_blueyellow` for one boot, then clear it after the upgrade succeeds.

## Running On Another Server

Use this checklist when deploying somewhere new:

1. Copy `.env.example` to `.env`.
2. Set `HOST_UID` and `HOST_GID` to the output of `id -u` and `id -g` for the user running Docker.
3. Create the shared network if it does not exist: `docker network create docker_default`.
4. Start with a rebuild: `docker compose up --build`.

Common failures:

| Symptom | Fix |
|---------|-----|
| `network docker_default not found` | Run `docker network create docker_default` |
| `container name "db" is already in use` | Stop the other stack or rename containers in compose |
| `No passwd entry for UID ...` | Set `HOST_UID`/`HOST_GID` in `.env`, then restart: `docker compose up --build -d` |
| `Permission denied` on `var/` after deleting data | Remove with root or `docker run --rm -v "$PWD:/work" alpine rm -rf /work/var /work/postgres_data` |

Editing `Dockerfile.flectra` is not required. Set `HOST_UID` and `HOST_GID` in `.env` only; the entrypoint creates the container user when the stack starts.

## Theme Addons

### `theme_blueyellow`

The primary theme. It covers:

- Website frontend styling through `web.assets_frontend`.
- Backend/webclient management pages through late `web.assets_web` assets.
- Logged-in webclient navbar cleanup and label tweaks.
- Fresh database default theme behavior.

It depends on `web_flectra` because the apps-dashboard navbar and reorder behavior patch `web_flectra` home-menu components.

Important files:

- `addons/theme_blueyellow/__manifest__.py`
- `addons/theme_blueyellow/static/src/scss/theme.scss`
- `addons/theme_blueyellow/static/src/scss/backend.scss`
- `addons/theme_blueyellow/static/src/scss/webclient_management_late.scss`
- `addons/theme_blueyellow/static/src/scss/webclient_navbar_late.scss`
- `addons/theme_blueyellow/static/src/js/webclient_navbar_theme.js`
- `addons/theme_blueyellow/__manifest__.py` (`web.assets_web` entries)

### `theme_blueyellow_designer`

An alternate frontend variant that depends on `theme_blueyellow`.

It includes the base frontend theme first, then applies a darker designer-palette override:

- `addons/theme_blueyellow_designer/__manifest__.py`
- `addons/theme_blueyellow_designer/static/src/scss/theme.scss`

## Refreshing Assets

Flectra stores generated bundles in `ir_attachment`. After changing theme CSS/JS, clear generated assets and restart:

```bash
docker compose exec -T postgres psql -U db -d flectra -c "delete from ir_attachment where (name like 'web.assets_web%' or name like 'web.assets_frontend%' or name like 'website.assets%') and url like '/web/assets/%';"
docker compose restart flectra
```

For manifest or XML asset changes, upgrade the module first:

```bash
docker compose exec -T flectra flectra-bin \
  --config=/etc/flectra/flectra.conf \
  --db_host=db \
  --db_port=5432 \
  --db_user=db \
  --db_password=flectra \
  -d flectra \
  -u theme_blueyellow \
  --stop-after-init
```

Then clear generated assets and restart.

## Verifying Active Theme

Check which theme is active for each website:

```bash
docker compose exec -T postgres psql -U db -d flectra -c "select w.id, w.name, m.name as theme_module from website w left join ir_module_module m on m.id=w.theme_id order by w.id;"
```

The expected default is:

```text
theme_blueyellow
```

## Documentation

See `docs/design/README.md` for:

- Design principles.
- How to update common design elements.
- CSS file index.
- JavaScript file index.
- Asset refresh workflow.

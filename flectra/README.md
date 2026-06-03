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

The startup helper detects this mismatch on boot and drops the database automatically so the next launch can reinitialize cleanly.

On every boot, the startup helper also:

- Upgrades `theme_blueyellow` when global webclient assets are missing from an older install.
- Clears generated asset bundles so CSS/JS changes apply immediately after bootstrap.

## Fresh Database Bootstrap

The Flectra service runs:

```text
/usr/local/bin/blueyellow-flectra-start
```

That helper does three things when `FLECTRA_AUTO_INIT=1`:

- Waits for PostgreSQL to accept connections.
- Installs `FLECTRA_INIT_MODULES` when the target database/theme is not initialized.
- Sets every website record to `FLECTRA_DEFAULT_THEME`.
- Applies the BlueYellow homepage landing content when the homepage is still empty.

The default values are documented in `.env.example`:

```text
FLECTRA_DB=flectra
FLECTRA_AUTO_INIT=1
FLECTRA_INIT_MODULES=crm,sale_management,account_accountant,project,project_todo,calendar,contacts,hr,hr_attendance,hr_contract,hr_expense,hr_recruitment,hr_skills,mass_mailing,survey,website_event,website_hr_recruitment,website_slides,website_sale,website,theme_blueyellow
FLECTRA_DEFAULT_THEME=theme_blueyellow
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
| `mass_mailing` | Email Marketing |
| `survey` | Surveys |
| `website_event` | Events |
| `website_hr_recruitment` | Online Jobs |
| `website_slides` | eLearning |
| `website_sale` | eCommerce |
| `website` | Website |
| `theme_blueyellow` | BlueYellow theme |

Flectra installs each module's dependencies automatically. Keep `website` and `theme_blueyellow` at the end of the list.

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

#!/usr/bin/env bash
set -euo pipefail

DB_HOST="${HOST:-db}"
DB_PORT="${PORT:-5432}"
DB_USER="${POSTGRES_USER:-db}"
DB_PASSWORD="${POSTGRES_PASSWORD:-flectra}"
DB_NAME="${FLECTRA_DB:-flectra}"
DEFAULT_THEME="${FLECTRA_DEFAULT_THEME:-theme_blueyellow}"
INIT_MODULES="${FLECTRA_INIT_MODULES:-crm,sale_management,account_accountant,project,project_todo,calendar,contacts,hr,hr_attendance,hr_contract,hr_expense,hr_recruitment,hr_skills,mass_mailing,survey,website_event,website_hr_recruitment,website_slides,website_sale,website,theme_blueyellow}"
CONFIG_FILE="${FLECTRA_CONFIG:-/etc/flectra/flectra.conf}"
FLECTRA_PROXY_MODE="${FLECTRA_PROXY_MODE:-0}"

PROXY_ARGS=()
if [ "${FLECTRA_PROXY_MODE}" = "1" ]; then
    PROXY_ARGS=(--proxy-mode)
fi

wait_for_database() {
    python3 - <<PY
import socket
import sys
import time

host = "${DB_HOST}"
port = int("${DB_PORT}")
deadline = time.time() + 60

while time.time() < deadline:
    try:
        with socket.create_connection((host, port), timeout=2):
            sys.exit(0)
    except OSError:
        time.sleep(1)

print(f"Timed out waiting for PostgreSQL at {host}:{port}", file=sys.stderr)
sys.exit(1)
PY
}

install_default_theme() {
    flectra-bin \
        --config="${CONFIG_FILE}" \
        --db_host="${DB_HOST}" \
        --db_port="${DB_PORT}" \
        --db_user="${DB_USER}" \
        --db_password="${DB_PASSWORD}" \
        -d "${DB_NAME}" \
        -i "${INIT_MODULES}" \
        --stop-after-init
}

upgrade_default_theme() {
    flectra-bin \
        --config="${CONFIG_FILE}" \
        --db_host="${DB_HOST}" \
        --db_port="${DB_PORT}" \
        --db_user="${DB_USER}" \
        --db_password="${DB_PASSWORD}" \
        -d "${DB_NAME}" \
        -u "${DEFAULT_THEME}" \
        --stop-after-init
}

clear_generated_assets() {
    python3 - <<PY
import psycopg2

connection = psycopg2.connect(
    host="${DB_HOST}",
    port="${DB_PORT}",
    user="${DB_USER}",
    password="${DB_PASSWORD}",
    dbname="${DB_NAME}",
)

with connection, connection.cursor() as cursor:
    cursor.execute(
        """
        delete from ir_attachment
        where (
            name like 'web.assets_web%%'
            or name like 'web.assets_frontend%%'
            or name like 'website.assets%%'
        )
        and url like '/web/assets/%%'
        """
    )
PY
}

reset_mismatched_filestore() {
    python3 - <<PY
import os
import sys

import psycopg2

db_name = "${DB_NAME}"
filestore_root = f"/var/lib/flectra/filestore/{db_name}"

try:
    connection = psycopg2.connect(
        host="${DB_HOST}",
        port="${DB_PORT}",
        user="${DB_USER}",
        password="${DB_PASSWORD}",
        dbname=db_name,
    )
except psycopg2.OperationalError:
    sys.exit(0)

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT to_regclass('public.ir_attachment')")
        if cursor.fetchone()[0] is None:
            sys.exit(0)

        cursor.execute(
            "SELECT count(*) FROM ir_attachment WHERE store_fname IS NOT NULL"
        )
        attachment_count = cursor.fetchone()[0]
finally:
    connection.close()

if attachment_count < 10:
    sys.exit(0)

file_count = 0
if os.path.isdir(filestore_root):
    for _root, _dirs, files in os.walk(filestore_root):
        file_count += len(files)

if file_count >= max(10, attachment_count // 10):
    sys.exit(0)

print(
    f"Resetting database {db_name}: filestore has {file_count} files "
    f"but database references {attachment_count} stored attachments.",
    file=sys.stderr,
)

admin = psycopg2.connect(
    host="${DB_HOST}",
    port="${DB_PORT}",
    user="${DB_USER}",
    password="${DB_PASSWORD}",
    dbname="postgres",
)
admin.autocommit = True

try:
    with admin.cursor() as cursor:
        cursor.execute(
            """
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = %s AND pid <> pg_backend_pid()
            """,
            (db_name,),
        )
        cursor.execute(f'DROP DATABASE IF EXISTS "{db_name}"')
finally:
    admin.close()
PY
}

reset_broken_database() {
    python3 - <<PY
import sys

import psycopg2

db_name = "${DB_NAME}"

try:
    connection = psycopg2.connect(
        host="${DB_HOST}",
        port="${DB_PORT}",
        user="${DB_USER}",
        password="${DB_PASSWORD}",
        dbname=db_name,
    )
except psycopg2.OperationalError:
    sys.exit(0)

try:
    with connection.cursor() as cursor:
        cursor.execute("SELECT to_regclass('public.ir_module_module')")
        module_table = cursor.fetchone()[0]
except Exception:
    sys.exit(0)
finally:
    connection.close()

if module_table is not None:
    sys.exit(0)

print(f"Resetting partially initialized database: {db_name}", file=sys.stderr)

admin = psycopg2.connect(
    host="${DB_HOST}",
    port="${DB_PORT}",
    user="${DB_USER}",
    password="${DB_PASSWORD}",
    dbname="postgres",
)
admin.autocommit = True

try:
    with admin.cursor() as cursor:
        cursor.execute(
            """
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = %s AND pid <> pg_backend_pid()
            """,
            (db_name,),
        )
        cursor.execute(f'DROP DATABASE IF EXISTS "{db_name}"')
finally:
    admin.close()
PY
}

needs_default_theme_install() {
    python3 - <<PY
import sys

import psycopg2

try:
    connection = psycopg2.connect(
        host="${DB_HOST}",
        port="${DB_PORT}",
        user="${DB_USER}",
        password="${DB_PASSWORD}",
        dbname="${DB_NAME}",
    )
except Exception:
    sys.exit(0)

try:
    with connection, connection.cursor() as cursor:
        cursor.execute(
            "select state from ir_module_module where name = %s",
            ("${DEFAULT_THEME}",),
        )
        row = cursor.fetchone()
except Exception:
    sys.exit(0)
finally:
    connection.close()

sys.exit(1 if row and row[0] == "installed" else 0)
PY
}

needs_default_theme_upgrade() {
    PYTHONPATH=/opt/flectra/server python3 - <<PY
import sys

import flectra
from flectra import SUPERUSER_ID, api
from flectra.tools import config

config.parse_config([
    "--config=${CONFIG_FILE}",
    "--db_host=${DB_HOST}",
    "--db_port=${DB_PORT}",
    "--db_user=${DB_USER}",
    "--db_password=${DB_PASSWORD}",
])

try:
    registry = flectra.registry("${DB_NAME}")
except Exception:
    sys.exit(0)

with registry.cursor() as cr:
    env = api.Environment(cr, SUPERUSER_ID, {})
    paths = env["ir.asset"]._get_asset_paths("web.assets_web", {})
    has_navbar_assets = any(
        "webclient_navbar_late.scss" in entry[0]
        or "webclient_navbar_theme.js" in entry[0]
        for entry in paths
    )

sys.exit(1 if has_navbar_assets else 0)
PY
}

activate_default_theme() {
    PYTHONPATH=/opt/flectra/server python3 - <<PY
import flectra
from flectra import SUPERUSER_ID, api
from flectra.tools import config

db_name = "${DB_NAME}"
theme_name = "${DEFAULT_THEME}"

config.parse_config([
    "--config=${CONFIG_FILE}",
    "--db_host=${DB_HOST}",
    "--db_port=${DB_PORT}",
    "--db_user=${DB_USER}",
    "--db_password=${DB_PASSWORD}",
])

registry = flectra.registry(db_name)
with registry.cursor() as cr:
    env = api.Environment(cr, SUPERUSER_ID, {})
    theme = env["ir.module.module"].search([("name", "=", theme_name)], limit=1)
    websites = env["website"].search([])

    if not theme:
        raise RuntimeError(f"Default theme module is not available: {theme_name}")

    if websites:
        websites.write({"theme_id": theme.id})

    cr.commit()
PY
}

ensure_homepage_content() {
    PYTHONPATH=/opt/flectra/server:/mnt/extra-addons python3 - <<PY
import flectra
from flectra import SUPERUSER_ID, api
from flectra.tools import config

from theme_blueyellow.homepage import ensure_homepage_content

config.parse_config([
    "--config=${CONFIG_FILE}",
    "--db_host=${DB_HOST}",
    "--db_port=${DB_PORT}",
    "--db_user=${DB_USER}",
    "--db_password=${DB_PASSWORD}",
])

registry = flectra.registry("${DB_NAME}")
with registry.cursor() as cr:
    env = api.Environment(cr, SUPERUSER_ID, {})
    if ensure_homepage_content(env):
        cr.commit()
PY
}

configure_public_url() {
    if [ -z "${FLECTRA_WEB_BASE_URL:-}" ]; then
        return 0
    fi

    PYTHONPATH=/opt/flectra/server python3 - <<PY
import flectra
from flectra import SUPERUSER_ID, api
from flectra.tools import config

public_url = "${FLECTRA_WEB_BASE_URL}".rstrip("/")

config.parse_config([
    "--config=${CONFIG_FILE}",
    "--db_host=${DB_HOST}",
    "--db_port=${DB_PORT}",
    "--db_user=${DB_USER}",
    "--db_password=${DB_PASSWORD}",
])

registry = flectra.registry("${DB_NAME}")
with registry.cursor() as cr:
    env = api.Environment(cr, SUPERUSER_ID, {})
    params = env["ir.config_parameter"].sudo()
    current = params.get_param("web.base.url", "")
    if current != public_url:
        params.set_param("web.base.url", public_url)
    cr.commit()
PY
}

if [ "${FLECTRA_AUTO_INIT:-1}" = "1" ]; then
    wait_for_database
    reset_broken_database
    reset_mismatched_filestore
    if needs_default_theme_install; then
        install_default_theme
    elif needs_default_theme_upgrade; then
        upgrade_default_theme
    fi
    activate_default_theme
    ensure_homepage_content
    configure_public_url
    clear_generated_assets
fi

exec flectra-bin \
    --config="${CONFIG_FILE}" \
    --db_host="${DB_HOST}" \
    --db_port="${DB_PORT}" \
    --db_user="${DB_USER}" \
    --db_password="${DB_PASSWORD}" \
    "${PROXY_ARGS[@]}" \
    "$@"

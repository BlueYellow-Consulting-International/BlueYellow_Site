#!/usr/bin/env bash
set -euo pipefail

HOST_UID="${HOST_UID:-1030}"
HOST_GID="${HOST_GID:-100}"
RUN_USER="$(getent passwd "${HOST_UID}" | cut -d: -f1 || true)"

if [ -z "${RUN_USER}" ]; then
    echo "No passwd entry for UID ${HOST_UID}. Rebuild the image with matching HOST_UID/HOST_GID." >&2
    exit 1
fi

mkdir -p /var/lib/flectra
chown -R "${HOST_UID}:${HOST_GID}" /var/lib/flectra

if [ "$(id -u)" -eq 0 ]; then
    exec runuser -u "${RUN_USER}" -- "$@"
fi

exec "$@"

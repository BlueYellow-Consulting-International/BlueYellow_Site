#!/usr/bin/env bash
set -euo pipefail

HOST_UID="${HOST_UID:-1030}"
HOST_GID="${HOST_GID:-100}"
[ -n "${HOST_UID}" ] || HOST_UID=1030
[ -n "${HOST_GID}" ] || HOST_GID=100

ensure_host_user() {
    local run_user="hostuser"

    if ! getent group "${HOST_GID}" >/dev/null; then
        groupadd --gid "${HOST_GID}" "${run_user}" 2>/dev/null || groupadd "${run_user}"
    fi

    local group_name
    group_name="$(getent group "${HOST_GID}" | cut -d: -f1)"

    if ! getent passwd "${HOST_UID}" >/dev/null; then
        useradd \
            --uid "${HOST_UID}" \
            --gid "${group_name}" \
            --groups flectra \
            --create-home \
            --shell /bin/bash \
            "${run_user}"
    else
        run_user="$(getent passwd "${HOST_UID}" | cut -d: -f1)"
        usermod --append --groups flectra "${run_user}" 2>/dev/null || true
    fi

    printf '%s' "${run_user}"
}

if [ "$(id -u)" -ne 0 ]; then
    echo "Entrypoint must start as root to configure the runtime user." >&2
    exit 1
fi

RUN_USER="$(ensure_host_user)"

mkdir -p /var/lib/flectra
chown -R "${HOST_UID}:${HOST_GID}" /var/lib/flectra

exec runuser -u "${RUN_USER}" -- "$@"

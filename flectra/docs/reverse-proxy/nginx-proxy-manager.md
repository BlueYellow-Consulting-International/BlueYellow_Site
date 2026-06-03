# Nginx Proxy Manager

Use this guide when Flectra is published through [Nginx Proxy Manager](https://nginxproxymanager.com/) (NPM).

The website editor is especially sensitive to reverse-proxy settings. It loads in an iframe and relies on WebSockets for the bus/notifications layer. If proxy mode, the public URL, or WebSocket headers are wrong, the editor can hang on the loading spinner.

This stack runs Flectra in **threaded mode** (`workers = 0`), so HTTP and WebSockets both use port **7073**. You do not need a separate `/websocket` upstream to port 8072 unless you later enable Flectra workers.

## 1. Docker networking

NPM and Flectra must share a Docker network.

This project attaches to the external network `docker_default`. In NPM, set the upstream to:

```text
http://flectra:7073
```

Do **not** use `localhost:7073` unless NPM and Flectra share the host network.

If NPM is not on `docker_default`, attach it:

```bash
docker network connect docker_default nginx-proxy-manager-app-1
```

Use your actual NPM container name.

## 2. Flectra `.env` settings

Set both values when using HTTPS through NPM:

```ini
FLECTRA_PROXY_MODE=1
FLECTRA_WEB_BASE_URL=https://your-domain.example.com
```

Rules:

- Use the exact public URL users type in the browser.
- Include `https://`.
- Do not add a trailing slash.

Restart after changing `.env`:

```bash
docker compose up -d
```

`FLECTRA_WEB_BASE_URL` updates Flectra's `web.base.url` on startup. Wrong values here are the most common cause of a blank or spinning website editor behind HTTPS.

## 3. NPM proxy host settings

Create a **Proxy Host** in NPM:

| Field | Value |
|-------|-------|
| Domain Names | your public hostname |
| Scheme | `http` |
| Forward Hostname / IP | `flectra` |
| Forward Port | `7073` |
| Block Common Exploits | on |
| Websockets Support | **on** |

Websockets Support is required for `/websocket` and for editor/session features.

## 4. NPM Advanced tab

Paste this into the proxy host **Advanced** tab:

```nginx
proxy_read_timeout 720s;
proxy_connect_timeout 720s;
proxy_send_timeout 720s;

proxy_set_header X-Forwarded-Host $host;
proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
proxy_set_header X-Forwarded-Proto $scheme;
proxy_set_header X-Real-IP $remote_addr;

add_header Content-Security-Policy "upgrade-insecure-requests" always;

client_max_body_size 500M;
```

The `Content-Security-Policy` header helps when the parent page is HTTPS but Flectra still generates HTTP links for embedded editor assets.

## 5. SSL in NPM

Request or import your certificate in NPM as usual. Flectra itself stays on plain HTTP inside Docker; NPM terminates TLS.

After SSL is working, confirm `.env` uses the `https://` URL in `FLECTRA_WEB_BASE_URL`.

## 6. Verify

1. Open `https://your-domain.example.com/`
2. Log in and open **Website → Edit**
3. In browser devtools → Network, confirm:
   - `/websocket` returns **101 Switching Protocols**
   - asset URLs use `https://`, not `http://`
4. In Flectra, check **Settings → General Settings → Base URL** matches your public URL

Quick database check:

```bash
docker compose exec -T postgres psql -U db -d flectra \
  -c "select key, value from ir_config_parameter where key = 'web.base.url';"
```

## 7. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Editor spinner never finishes | WebSockets blocked | Enable **Websockets Support** in NPM |
| Editor iframe blank | Mixed HTTP/HTTPS content | Set `FLECTRA_WEB_BASE_URL` to `https://...` and `FLECTRA_PROXY_MODE=1` |
| Assets load from wrong host | Wrong base URL | Fix `FLECTRA_WEB_BASE_URL`, restart Flectra |
| 502 / timeout on save | Proxy timeout too low | Use the Advanced timeouts above |
| Works on LAN IP, fails on domain | Old `web.base.url` | Update `FLECTRA_WEB_BASE_URL` and restart |

## 8. If you later enable Flectra workers

If you set `workers > 0` in `flectra.conf`, Flectra also listens on the gevent/WebSocket port (default **8072**). In that case:

1. Expose `8072` in `docker-compose.yaml`
2. Add an NPM **Custom Location** `/websocket` → `http://flectra:8072` with WebSocket headers

The default setup in this repo does **not** enable workers, so port `7073` alone is enough.

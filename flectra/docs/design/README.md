# BlueYellow Design Guide

This guide documents the design system used by the custom Flectra theme addons in this repository. It is intended for future maintainers who need to adjust colors, typography, buttons, navigation, management pages, or runtime webclient behavior without rediscovering the asset pipeline.

## Design Principles

### 1. Charcoal First

The primary visual environment is charcoal, not pure black. Use deep neutral surfaces to reduce eye strain while keeping the product feeling focused and modern.

Preferred direction:

- Page background: deep charcoal.
- Cards and panels: slightly raised charcoal.
- Borders: muted grey-blue.
- Text: soft white/off-white, not full white everywhere.

Avoid:

- Large areas of pure `#000000`.
- Bright default Flectra blue (`#009efb`) for structural UI.
- Pale default gradients that clash with the dark theme.

### 2. Blue And Yellow Are Accents

Ukrainian blue and yellow are important brand colors, but they should be used sparingly.

Good uses:

- Thin accent lines.
- Focus rings.
- Small badges.
- Subtle radial background washes.
- Primary call-to-action border or highlight.

Avoid:

- Full blue navigation bars.
- Heavy yellow backgrounds.
- Blue/yellow gradients on every card.

### 3. Readability Wins

Many Flectra screens mix website frontend, backend webclient, dropdown portals, and generated views. Always check contrast in:

- Normal state.
- Hover/focus state.
- Disabled-looking menu rows.
- Logged-in editor shell.
- App/module management pages.

If text is hard to read, prefer a targeted color rule over broad opacity changes.

### 4. Respect Flectra Asset Layers

The website and management UI use different bundles.

- Public website pages usually use `web.assets_frontend`.
- Backend/management pages use global `web.assets_web` assets declared in the theme manifest.
- Some dropdowns are portaled outside the navbar DOM.
- Some theme assets are installed as website-specific `ir.asset` records.

When a selector appears correct but does nothing, check the active asset bundle and load order before increasing specificity.

### 5. Prefer Centralized Tokens

Update CSS custom properties first. Only add selector-specific rules when a Flectra component requires it.

Primary token locations:

- Frontend website tokens: `theme.scss`
- Backend management tokens: `webclient_management_late.scss`
- Webclient navbar tokens: `webclient_navbar_late.scss`

## How To Update Common Design Elements

### Website Background

Edit:

- `addons/theme_blueyellow/static/src/scss/theme.scss`

Look for:

- `:root`
- `#wrap`

The public website background is controlled by layered radial and linear gradients. Keep this subtle so content remains readable.

### Management Page Background

Edit:

- `addons/theme_blueyellow/static/src/scss/webclient_management_late.scss`

Look for:

- `body .o_web_client`
- `body .o_web_client .o_action_manager`
- `body.home_menu_page`

Use this area for management-page background atmosphere only. Do not style app cards, badges, selected rows, or button states unless that is the specific goal.

### Website Header And Footer

Edit:

- `addons/theme_blueyellow/static/src/scss/theme.scss`

Look for:

- `header`
- `header .navbar`
- `footer`
- `.o_footer`

This controls the public website header/footer, not the logged-in Flectra webclient chrome.

### Webclient Top Bar

Edit:

- `addons/theme_blueyellow/static/src/scss/webclient_navbar_late.scss`
- `addons/theme_blueyellow/static/src/js/webclient_navbar_theme.js`

The CSS file is loaded late through `ir.asset`.

The JS file injects a final style tag because Flectra/web_flectra can render or update the OWL navbar after CSS loads. Keep this JS narrow and focused on `.o_main_navbar`.

### Buttons

Website buttons:

- `addons/theme_blueyellow/static/src/scss/theme.scss`
- Search for `.btn-primary`, `.btn-outline-primary`, `.by-cta-row`.

Management buttons:

- `addons/theme_blueyellow/static/src/scss/webclient_management_late.scss`
- Search for `.btn-primary`, `.btn-secondary`, `.btn-outline-secondary`.

Keep primary CTAs legible in all states. The public website primary button uses light/yellow styling with dark text.

### Dropdowns

Public website dropdowns:

- `addons/theme_blueyellow/static/src/scss/theme.scss`
- Search for `.dropdown-menu`.

Management/webclient dropdowns:

- `addons/theme_blueyellow/static/src/scss/webclient_management_late.scss`
- `addons/theme_blueyellow/static/src/scss/webclient_navbar_late.scss`
- `addons/theme_blueyellow/static/src/js/webclient_navbar_theme.js`

Flectra may render some menus as floating body-level `.o-dropdown--menu` elements. If a dropdown is not affected by parent selectors, target the portaled body-level menu.

### App Labels

Edit:

- `addons/theme_blueyellow/static/src/scss/webclient_management_late.scss`

Look for:

- `body.home_menu_page #apps_menu .o_app .o_app_name`
- `body.home_menu_page .o_apps_container .o_app_name`

These rules improve readability for labels such as `Discuss`, `Accounting`, and other app names on the home/apps page.

### Rename Top-Bar Labels

Edit:

- `addons/theme_blueyellow/static/src/js/webclient_navbar_theme.js`

Look for:

- `renameAppsMenuLabel()`

This changes the duplicate webclient top-bar section label from `Apps` to `Menu` without changing Flectra menu records in the database.

## CSS Index

### `addons/theme_blueyellow/static/src/scss/theme.scss`

Purpose:

- Primary public website theme.
- Website background, header, footer, cards, buttons, forms, tables, dropdowns.
- Custom homepage classes such as `.by-hero`, `.by-card`, `.by-panel`, and `.by-metric`.

Asset bundle:

- `web.assets_frontend`

Common edits:

- Website palette: `:root`
- Public page background: `#wrap`
- Header/nav: `header`, `.navbar`
- CTA buttons: `.btn-primary`, `.by-cta-row`
- Homepage content styles: `.by-*`

### `addons/theme_blueyellow/static/src/scss/backend.scss`

Purpose:

- Early backend/webclient styling.
- General navbar and management UI overrides.

Asset bundle:

- `web.assets_backend`

Notes:

- This file helps with backend styling, but late `web.assets_web` files win for the logged-in shell.
- Prefer `webclient_management_late.scss` and `webclient_navbar_late.scss` for final webclient behavior.

### `addons/theme_blueyellow/static/src/scss/webclient_management_late.scss`

Purpose:

- Main management-page skin.
- App shell, control panels, forms, lists, kanban, cards, tables, inputs, buttons, dropdowns, badges, side/search panels.

Asset bundle:

- `web.assets_web` via `__manifest__.py`

Load sequence:

- `98`

Common edits:

- Management palette tokens: `:root`
- Management background: `body .o_web_client`
- Apps page background: `body.home_menu_page`
- App label readability: `.o_app_name`
- Tables/lists: `.o_list_table`
- Forms/cards: `.o_form_sheet`, `.o_kanban_record`, `.card`
- Buttons: `.btn-primary`, `.btn-secondary`

### `addons/theme_blueyellow/static/src/scss/webclient_navbar_late.scss`

Purpose:

- Final CSS pass for the logged-in Flectra top navbar.
- Removes bright Flectra blue.
- Removes unwanted tile borders/separators.
- Skins Apps dropdown menus.

Asset bundle:

- `web.assets_web` via `__manifest__.py`

Load sequence:

- `99`

Common edits:

- Navbar color tokens: `:root`
- Top bar: `body nav.o_main_navbar`
- Tile states: `.o_menu_brand`, `.o_menu_sections`, `.o_navbar_apps_menu`
- Apps dropdown readability: `.o_navbar_apps_menu .dropdown-menu`, `.o-dropdown--menu`

### `addons/theme_blueyellow_designer/static/src/scss/theme.scss`

Purpose:

- Optional designer-palette frontend variant.
- Overrides the public website theme toward a black/zinc palette.

Asset bundle:

- `web.assets_frontend`

Notes:

- Depends on `theme_blueyellow`.
- Includes base `theme_blueyellow/static/src/scss/theme.scss` first, then designer overrides.

## JavaScript Index

### `addons/theme_blueyellow/static/src/js/webclient_navbar_theme.js`

Purpose:

- Runtime webclient navbar cleanup.
- Injects a final style tag to win after Flectra’s OWL navbar renders.
- Renames the duplicate top-bar section label from `Apps` to `Menu`.

Asset bundle:

- `web.assets_web` via `__manifest__.py`

Load sequence:

- `100`

Key functions:

- `installNavbarTheme()`: injects final navbar and dropdown CSS.
- `renameAppsMenuLabel()`: changes the section/menu label from `Apps` to `Menu`.
- `queueRenameAppsMenuLabel()`: debounces label updates.
- `watchNavbarLabels()`: observes DOM changes so the label stays renamed after navigation.

Maintenance notes:

- Keep this file narrow. It should only patch behavior that CSS cannot reliably solve due to Flectra rendering order.
- Do not use it for general page styling.
- If selectors become too broad, dropdown behavior can be affected. Prefer scoped selectors first.

## Asset Records

The late webclient assets are registered globally in:

- `addons/theme_blueyellow/__manifest__.py`

Current `web.assets_web` entries:

- `theme_blueyellow/static/src/scss/webclient_management_late.scss`
  - Loaded after `web_flectra/static/src/scss/theme/navbar.scss`
- `theme_blueyellow/static/src/scss/webclient_navbar_late.scss`
  - Loaded after `webclient_management_late.scss`
- `theme_blueyellow/static/src/js/webclient_navbar_theme.js`
  - Loaded after `webclient_navbar_late.scss`

These are global manifest assets, not website-scoped `ir.asset` records. That matters because the logged-in webclient at `/web` compiles `web.assets_web` without a website context.

Expected order:

```text
web_flectra navbar.scss
webclient_management_late.scss
webclient_navbar_late.scss
webclient_navbar_theme.js
```

## Refresh Workflow

After editing CSS or JS:

```bash
docker compose exec -T postgres psql -U db -d flectra -c "delete from ir_attachment where (name like 'web.assets_web%' or name like 'web.assets_frontend%' or name like 'website.assets%') and url like '/web/assets/%';"
docker compose restart flectra
```

After editing a manifest, upgrade the module first:

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

## Verifying Load Order

Use this check when a webclient rule does not appear to apply:

```bash
docker compose exec -T flectra sh -lc 'PYTHONPATH=/opt/flectra/server python3 - <<'"'"'PY'"'"'
import flectra
from flectra import SUPERUSER_ID, api
from flectra.tools import config

config.parse_config([
    "--config=/etc/flectra/flectra.conf",
    "--db_host=db",
    "--db_port=5432",
    "--db_user=db",
    "--db_password=flectra",
])

registry = flectra.registry("flectra")
with registry.cursor() as cr:
    env = api.Environment(cr, SUPERUSER_ID, {})
    paths = env["ir.asset"]._get_asset_paths("web.assets_web", {"website_id": 1})
    matches = [
        (i, p[0])
        for i, p in enumerate(paths)
        if "webclient_management" in p[0]
        or "webclient_navbar" in p[0]
        or "web_flectra/static/src/scss/theme/navbar.scss" in p[0]
    ]
    print(matches)
PY'
```

## Practical Troubleshooting

If a website page looks wrong:

- Check `theme.scss`.
- Clear `web.assets_frontend`.
- Confirm the website is using `theme_blueyellow`.

If a management page looks wrong:

- Check `webclient_management_late.scss`.
- Clear `web.assets_web`.
- Confirm `theme_blueyellow` is installed and its `web.assets_web` manifest entries are present.

If the logged-in top bar looks wrong:

- Check `webclient_navbar_late.scss`.
- Check `webclient_navbar_theme.js`.
- Confirm both load after `web_flectra/static/src/scss/theme/navbar.scss`.

If a dropdown is unreadable:

- Check whether it is inside `.o_web_client`.
- If not, it may be a floating body-level `.o-dropdown--menu`.
- Add a targeted selector to `webclient_navbar_late.scss` and mirror it in `webclient_navbar_theme.js` only if runtime order requires it.

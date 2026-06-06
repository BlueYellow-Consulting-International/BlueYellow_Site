/** @flectra-module alias=theme_blueyellow.home_dashboard_navbar **/

import { NavBar } from "@web/webclient/navbar/navbar";
import { patch } from "@web/core/utils/patch";
import { useBus, useService } from "@web/core/utils/hooks";

const { onMounted } = owl;

const STORAGE_PREFIX = "theme_blueyellow.home_app_order.";
const HOME_APP_ORDER_CHANGED = "home_app_order_changed";
const SECTIONS_CLASS = "by_home_dashboard_sections";
const GRID_ATTR = "data-by-home-grid";

const GRID_BUTTON_HTML = `
    <a href="#" class="o_navbar_apps_menu web_theme_menu_icon btn text-white o_home_menu_grid_active"
       title="Apps" ${GRID_ATTR}="1">
        <i class="fa fa-th-large"></i>
    </a>`;

patch(NavBar.prototype, {
    setup() {
        super.setup(...arguments);
        this.userService = useService("user");
        this._homeDashboardSyncQueued = false;

        useBus(this.env.bus, "home_menu_change", (ev) => {
            if (ev?.detail === false) {
                const navbar = document.querySelector("nav.o_main_navbar");
                if (navbar) {
                    this._clearHomeDashboardNavbar(navbar);
                }
            }
            this._queueHomeDashboardSync();
            if (ev?.detail === true) {
                window.requestAnimationFrame(() => {
                    this._queueHomeDashboardSync();
                });
            }
        });
        useBus(this.env.bus, "home_menu_toggled", () => {
            this._queueHomeDashboardSync();
        });
        useBus(this.env.bus, HOME_APP_ORDER_CHANGED, () => {
            this._queueHomeDashboardSync();
        });

        onMounted(() => {
            this._queueHomeDashboardSync();
        });
    },

    onHomeMenuUpdate() {
        super.onHomeMenuUpdate(...arguments);
        const navbar = document.querySelector("nav.o_main_navbar");
        if (navbar && !this.state?.is_home_menu) {
            this._clearHomeDashboardNavbar(navbar);
        }
        this._queueHomeDashboardSync();
    },

    async onClickBackButton(ev) {
        const navbar = document.querySelector("nav.o_main_navbar");
        if (navbar) {
            this._clearHomeDashboardNavbar(navbar);
        }
        await super.onClickBackButton(...arguments);
        this._queueHomeDashboardSync();
    },

    _queueHomeDashboardSync() {
        if (this._homeDashboardSyncQueued) {
            return;
        }
        this._homeDashboardSyncQueued = true;
        window.requestAnimationFrame(() => {
            this._homeDashboardSyncQueued = false;
            this._syncHomeDashboardNavbar();
        });
    },

    _storageKey() {
        return `${STORAGE_PREFIX}${this.userService.userId}`;
    },

    _readSavedOrder() {
        try {
            const saved = JSON.parse(localStorage.getItem(this._storageKey()) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    },

    _orderApps(apps) {
        const saved = this._readSavedOrder();
        if (!saved.length) {
            return [...apps];
        }
        const byXmlid = new Map(apps.map((app) => [app.xmlid, app]));
        const ordered = [];
        for (const xmlid of saved) {
            const app = byXmlid.get(xmlid);
            if (app) {
                ordered.push(app);
                byXmlid.delete(xmlid);
            }
        }
        ordered.push(...byXmlid.values());
        return ordered;
    },

    _resolveLaunchMenu(app) {
        const menuService = this.menuService;
        if (!menuService) {
            return app;
        }
        let menu = menuService.getMenu(app.id);
        if (menu?.actionID) {
            return menu;
        }
        const tree = menuService.getMenuAsTree(app.id);
        const stack = [...(tree.childrenTree || [])];
        while (stack.length) {
            const node = stack.shift();
            if (node.actionID) {
                return node;
            }
            stack.push(...(node.childrenTree || []));
        }
        return menu;
    },

    _buildAppHref(menu) {
        let href = `#menu_id=${menu.id}`;
        if (menu.actionID) {
            href += `&action=${menu.actionID}`;
        }
        return href;
    },

    _getHomeDashboardApps() {
        if (!this.menuService) {
            return [];
        }
        try {
            const apps = this._orderApps(this.menuService.getApps() || []);
            const seen = new Set();
            return apps.filter((app) => {
                const key = app.xmlid || String(app.id);
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });
        } catch {
            return [];
        }
    },

    get currentAppSections() {
        const app = this.currentApp;
        const sections =
            (app && this.menuService.getMenuAsTree(app.id).childrenTree) || [];
        const appName = app?.name?.trim();
        if (!appName) {
            return sections;
        }
        return sections.filter((section) => section.name?.trim() !== appName);
    },

    _isOnHomeMenu() {
        return Boolean(
            this.state?.is_home_menu || document.body.classList.contains("home_menu_page")
        );
    },

    _hideStaleNativeGridButtons(navbar) {
        navbar.querySelectorAll(
            `.o_navbar_apps_menu.web_theme_menu_icon:not([${GRID_ATTR}])`
        ).forEach((node) => {
            node.hidden = true;
        });
    },

    _ensureGridButton(navbar) {
        if (!this._isOnHomeMenu()) {
            return null;
        }
        this._hideStaleNativeGridButtons(navbar);
        const injected = navbar.querySelectorAll(`[${GRID_ATTR}="1"]`);
        for (let i = 1; i < injected.length; i++) {
            injected[i].remove();
        }
        let gridButton = injected[0] || navbar.querySelector(`[${GRID_ATTR}="1"]`);
        if (!gridButton) {
            navbar.insertAdjacentHTML("afterbegin", GRID_BUTTON_HTML);
            gridButton = navbar.querySelector(`[${GRID_ATTR}="1"]`);
            gridButton?.addEventListener("click", (ev) => ev.preventDefault());
        }
        gridButton.hidden = false;
        return gridButton;
    },

    _ensureSectionsContainer(navbar) {
        let sections = navbar.querySelector(`.${SECTIONS_CLASS}`);
        if (!sections) {
            sections = document.createElement("div");
            sections.className = `o_menu_sections ${SECTIONS_CLASS} d-none d-md-flex flex-grow-1 flex-shrink-1 w-0`;
            sections.setAttribute("role", "menu");
            const systray = navbar.querySelector(".o_menu_systray");
            if (systray) {
                navbar.insertBefore(sections, systray);
            } else {
                navbar.appendChild(sections);
            }
        }
        return sections;
    },

    _renderHomeDashboardSections(sections, apps) {
        const fragment = document.createDocumentFragment();
        for (const app of apps) {
            const launchMenu = this._resolveLaunchMenu(app);
            const link = document.createElement("a");
            link.className = "o_nav_entry dropdown-item";
            link.setAttribute("role", "menuitem");
            link.href = this._buildAppHref(launchMenu);
            link.textContent = app.name;
            link.title = app.name;
            link.dataset.menuXmlid = app.xmlid || "";
            link.addEventListener("click", async (ev) => {
                ev.preventDefault();
                if (!launchMenu?.actionID) {
                    return;
                }
                const navbar = document.querySelector("nav.o_main_navbar");
                if (this.state) {
                    this.state.is_home_menu = false;
                }
                document.body.classList.remove("home_menu_page");
                if (navbar) {
                    this._clearHomeDashboardNavbar(navbar);
                }
                await this.menuService.selectMenu(launchMenu);
                this._queueHomeDashboardSync();
            });
            fragment.appendChild(link);
        }
        sections.replaceChildren(fragment);
    },

    _clearHomeDashboardNavbar(navbar) {
        navbar.querySelector(`[${GRID_ATTR}="1"]`)?.remove();
        navbar.querySelector(`.${SECTIONS_CLASS}`)?.remove();
    },

    _syncHomeDashboardNavbar() {
        const navbar = document.querySelector("nav.o_main_navbar");
        if (!navbar) {
            return;
        }

        if (!this._isOnHomeMenu()) {
            this._clearHomeDashboardNavbar(navbar);
            return;
        }

        this._ensureGridButton(navbar);
        const sections = this._ensureSectionsContainer(navbar);
        this._renderHomeDashboardSections(sections, this._getHomeDashboardApps());
    },
});

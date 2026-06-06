/** @flectra-module alias=theme_blueyellow.home_menu_reorder **/

import HomeMenu from "web.home.menu";
import { patch } from "@web/core/utils/patch";
import { useService } from "@web/core/utils/hooks";

const { onMounted } = owl;

const STORAGE_PREFIX = "theme_blueyellow.home_app_order.";
const HOME_APP_ORDER_CHANGED = "home_app_order_changed";

patch(HomeMenu.prototype, {
    setup() {
        super.setup(...arguments);
        this.userService = useService("user");
        this._dragState = { didDrag: false };

        onMounted(() => {
            this._initHomeMenuReorder();
        });
    },

    _storageKey() {
        return `${STORAGE_PREFIX}${this.userService.userId}`;
    },

    _getAppsContainer() {
        return document.querySelector("#apps_menu .o_apps_container");
    },

    _readSavedOrder() {
        try {
            const saved = JSON.parse(localStorage.getItem(this._storageKey()) || "[]");
            return Array.isArray(saved) ? saved : [];
        } catch {
            return [];
        }
    },

    _saveOrderFromContainer(container) {
        const order = [...container.querySelectorAll(".o_app")].map(
            (el) => el.dataset.menuXmlid
        ).filter(Boolean);
        localStorage.setItem(this._storageKey(), JSON.stringify(order));
        this.env.bus.trigger(HOME_APP_ORDER_CHANGED);
    },

    _buildAppHref(app) {
        let href = `#menu_id=${app.id}`;
        if (app.action && typeof app.action === "string") {
            const actionId = app.action.split(",").pop();
            if (actionId && /^\d+$/.test(actionId)) {
                href += `&action=${actionId}`;
            }
        }
        return href;
    },

    _applyAppLinks(container) {
        const appsByXmlid = new Map();
        for (const app of this.props.rootMenus?.children || []) {
            if (app.xmlid) {
                appsByXmlid.set(app.xmlid, app);
            }
        }

        container.querySelectorAll(".o_app").forEach((el) => {
            const app = appsByXmlid.get(el.dataset.menuXmlid);
            if (!app) {
                return;
            }
            el.href = this._buildAppHref(app);
            el.dataset.menuId = String(app.id);
            if (app.name) {
                el.title = app.name;
            }
        });
    },

    _applySavedOrder(container) {
        const saved = this._readSavedOrder();
        if (!saved.length) {
            return;
        }
        const byXmlid = new Map();
        for (const el of container.querySelectorAll(".o_app")) {
            const xmlid = el.dataset.menuXmlid;
            if (xmlid) {
                byXmlid.set(xmlid, el);
            }
        }
        for (const xmlid of saved) {
            const el = byXmlid.get(xmlid);
            if (el) {
                container.appendChild(el);
                byXmlid.delete(xmlid);
            }
        }
        for (const el of byXmlid.values()) {
            container.appendChild(el);
        }
    },

    _moveAppElement(container, sourceEl, targetEl) {
        if (!sourceEl || !targetEl || sourceEl === targetEl) {
            return;
        }
        const apps = [...container.querySelectorAll(".o_app")];
        const sourceIdx = apps.indexOf(sourceEl);
        const targetIdx = apps.indexOf(targetEl);
        if (sourceIdx < 0 || targetIdx < 0) {
            return;
        }
        if (sourceIdx < targetIdx) {
            targetEl.after(sourceEl);
        } else {
            targetEl.before(sourceEl);
        }
    },

    _initHomeMenuReorder() {
        const container = this._getAppsContainer();
        if (!container || container.dataset.byReorderReady === "1") {
            return;
        }
        container.dataset.byReorderReady = "1";
        this._applySavedOrder(container);
        this._applyAppLinks(container);

        let draggingEl = null;

        container.querySelectorAll(".o_app").forEach((el) => {
            el.draggable = true;
            el.classList.add("o_app--reorderable");

            el.addEventListener("dragstart", (ev) => {
                draggingEl = el;
                this._dragState.didDrag = false;
                el.classList.add("o_app--dragging");
                ev.dataTransfer.effectAllowed = "move";
                ev.dataTransfer.setData("text/plain", el.dataset.menuXmlid || "");
            });

            el.addEventListener("dragover", (ev) => {
                ev.preventDefault();
                ev.dataTransfer.dropEffect = "move";
                container.querySelectorAll(".o_app--drag-over").forEach((node) => {
                    node.classList.remove("o_app--drag-over");
                });
                if (draggingEl && el !== draggingEl) {
                    el.classList.add("o_app--drag-over");
                }
            });

            el.addEventListener("dragleave", () => {
                el.classList.remove("o_app--drag-over");
            });

            el.addEventListener("drop", (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                el.classList.remove("o_app--drag-over");
                if (draggingEl && draggingEl !== el) {
                    this._moveAppElement(container, draggingEl, el);
                    this._saveOrderFromContainer(container);
                    this._applyAppLinks(container);
                    this._dragState.didDrag = true;
                }
            });

            el.addEventListener("dragend", () => {
                el.classList.remove("o_app--dragging");
                container.querySelectorAll(".o_app--drag-over").forEach((node) => {
                    node.classList.remove("o_app--drag-over");
                });
                draggingEl = null;
            });

            el.addEventListener("click", (ev) => {
                if (this._dragState.didDrag) {
                    ev.preventDefault();
                    ev.stopPropagation();
                    this._dragState.didDrag = false;
                }
            }, true);
        });
    },

    onMenuClick(currentId) {
        if (this._dragState.didDrag) {
            this._dragState.didDrag = false;
            return;
        }
        return super.onMenuClick(...arguments);
    },
});

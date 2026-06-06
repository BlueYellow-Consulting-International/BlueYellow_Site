(function () {
    "use strict";

    const styleId = "theme-blueyellow-webclient-navbar";
    let renameObserver;
    let renameQueued = false;

    function installNavbarTheme() {
        let style = document.getElementById(styleId);

        if (!style) {
            style = document.createElement("style");
            style.id = styleId;
            document.head.appendChild(style);
        }

        style.textContent = `
            body nav.o_main_navbar,
            body .o_web_client nav.o_main_navbar,
            body header nav.o_main_navbar {
                background: #161820 !important;
                background-color: #161820 !important;
                background-image: none !important;
                border-bottom: 1px solid #3b404d !important;
                box-shadow: none !important;
            }

            body nav.o_main_navbar::after,
            body .o_web_client nav.o_main_navbar::after,
            body header nav.o_main_navbar::after {
                display: none !important;
                content: none !important;
                background: none !important;
            }

            body nav.o_main_navbar > a.o_navbar_apps_menu,
            body nav.o_main_navbar > a.web_theme_menu_icon,
            body nav.o_main_navbar > a.o-menu-slide,
            body nav.o_main_navbar > .o_navbar_apps_menu,
            body nav.o_main_navbar > .web_theme_menu_icon,
            body nav.o_main_navbar > .o-menu-slide,
            body nav.o_main_navbar > .o_menu_brand,
            body nav.o_main_navbar .o_menu_sections > a,
            body nav.o_main_navbar .o_menu_sections > button,
            body nav.o_main_navbar .o_menu_sections > .dropdown,
            body nav.o_main_navbar .o_menu_sections > .o-dropdown,
            body nav.o_main_navbar .o_menu_sections .dropdown-toggle,
            body nav.o_main_navbar .o_menu_sections .o_nav_entry {
                background: #161820 !important;
                background-color: #161820 !important;
                background-image: none !important;
                border-color: transparent !important;
                border-top: 0 !important;
                border-right: 0 !important;
                border-bottom: 0 !important;
                border-left: 0 !important;
                box-shadow: none !important;
                color: #d7dbe3 !important;
                outline: 0 !important;
            }

            body nav.o_main_navbar > a.o_navbar_apps_menu:hover,
            body nav.o_main_navbar > a.o_navbar_apps_menu:focus,
            body nav.o_main_navbar > a.web_theme_menu_icon:hover,
            body nav.o_main_navbar > a.web_theme_menu_icon:focus,
            body nav.o_main_navbar > .o_menu_brand:hover,
            body nav.o_main_navbar > .o_menu_brand:focus,
            body nav.o_main_navbar .o_menu_sections > a:hover,
            body nav.o_main_navbar .o_menu_sections > a:focus,
            body nav.o_main_navbar .o_menu_sections > button:hover,
            body nav.o_main_navbar .o_menu_sections > button:focus,
            body nav.o_main_navbar .o_menu_sections > .dropdown:hover,
            body nav.o_main_navbar .o_menu_sections > .o-dropdown:hover,
            body nav.o_main_navbar .o_menu_sections > .dropdown.show,
            body nav.o_main_navbar .o_menu_sections > .o-dropdown.show,
            body nav.o_main_navbar .o_menu_sections .dropdown-toggle:hover,
            body nav.o_main_navbar .o_menu_sections .dropdown-toggle:focus,
            body nav.o_main_navbar .o_menu_sections .dropdown-toggle.show,
            body nav.o_main_navbar .o_menu_sections .dropdown-toggle[aria-expanded="true"],
            body nav.o_main_navbar .o_menu_sections .o_nav_entry:hover,
            body nav.o_main_navbar .o_menu_sections .o_nav_entry:focus,
            body nav.o_main_navbar .o_menu_sections .o_nav_entry.active,
            body nav.o_main_navbar .o_menu_sections .show .dropdown-toggle {
                background: #2d313b !important;
                background-color: #2d313b !important;
                background-image: none !important;
                border-color: transparent !important;
                border-top: 0 !important;
                border-right: 0 !important;
                border-bottom: 0 !important;
                border-left: 0 !important;
                box-shadow: none !important;
                color: #f7f8fb !important;
                outline: 0 !important;
            }

            body nav.o_main_navbar > a.o_navbar_apps_menu *,
            body nav.o_main_navbar > a.web_theme_menu_icon *,
            body nav.o_main_navbar > .o_menu_brand *,
            body nav.o_main_navbar .o_menu_sections > * * {
                color: inherit !important;
            }

            body .o_web_client .o_navbar_apps_menu .dropdown-menu,
            body .o_web_client .o_navbar_apps_menu .o-dropdown--menu,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .dropdown-menu,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .o-dropdown--menu,
            body > .o-dropdown--menu,
            body > .dropdown-menu,
            body .o-dropdown--menu,
            body .dropdown-menu.o-dropdown--menu {
                background: #242731 !important;
                background-color: #242731 !important;
                background-image: none !important;
                border-color: #3b404d !important;
                color: #d7dbe3 !important;
                opacity: 1 !important;
            }

            body .o_web_client .o_navbar_apps_menu .dropdown-menu .dropdown-item,
            body .o_web_client .o_navbar_apps_menu .o-dropdown--menu .dropdown-item,
            body .o_web_client .o_navbar_apps_menu .dropdown-menu .dropdown-header,
            body .o_web_client .o_navbar_apps_menu .o-dropdown--menu .dropdown-header,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .dropdown-menu .dropdown-item,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .o-dropdown--menu .dropdown-item,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .dropdown-menu .dropdown-header,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .o-dropdown--menu .dropdown-header,
            body > .o-dropdown--menu .dropdown-item,
            body > .o-dropdown--menu .dropdown-header,
            body > .dropdown-menu .dropdown-item,
            body > .dropdown-menu .dropdown-header,
            body .o-dropdown--menu .dropdown-item,
            body .o-dropdown--menu .dropdown-header {
                background: transparent !important;
                color: #d7dbe3 !important;
                opacity: 1 !important;
            }

            body > .o-dropdown--menu .dropdown-item *,
            body > .o-dropdown--menu .dropdown-header *,
            body > .dropdown-menu .dropdown-item *,
            body > .dropdown-menu .dropdown-header *,
            body .o-dropdown--menu .dropdown-item *,
            body .o-dropdown--menu .dropdown-header * {
                color: inherit !important;
                opacity: 1 !important;
            }

            body .o_web_client .o_navbar_apps_menu .dropdown-menu .dropdown-item.disabled,
            body .o_web_client .o_navbar_apps_menu .o-dropdown--menu .dropdown-item.disabled,
            body .o_web_client .o_navbar_apps_menu .dropdown-menu .dropdown-item:disabled,
            body .o_web_client .o_navbar_apps_menu .o-dropdown--menu .dropdown-item:disabled,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .dropdown-menu .dropdown-item.disabled,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .o-dropdown--menu .dropdown-item.disabled,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .dropdown-menu .dropdown-item:disabled,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .o-dropdown--menu .dropdown-item:disabled,
            body > .o-dropdown--menu .dropdown-item.disabled,
            body > .o-dropdown--menu .dropdown-item:disabled,
            body > .o-dropdown--menu .dropdown-item[aria-disabled="true"],
            body > .dropdown-menu .dropdown-item.disabled,
            body > .dropdown-menu .dropdown-item:disabled,
            body > .dropdown-menu .dropdown-item[aria-disabled="true"],
            body .o-dropdown--menu .dropdown-item.disabled,
            body .o-dropdown--menu .dropdown-item:disabled,
            body .o-dropdown--menu .dropdown-item[aria-disabled="true"] {
                color: #aeb5c1 !important;
                opacity: 1 !important;
            }

            body .o_web_client .o_navbar_apps_menu .dropdown-menu .dropdown-item:hover,
            body .o_web_client .o_navbar_apps_menu .dropdown-menu .dropdown-item:focus,
            body .o_web_client .o_navbar_apps_menu .o-dropdown--menu .dropdown-item:hover,
            body .o_web_client .o_navbar_apps_menu .o-dropdown--menu .dropdown-item:focus,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .dropdown-menu .dropdown-item:hover,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .dropdown-menu .dropdown-item:focus,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .o-dropdown--menu .dropdown-item:hover,
            body .o_web_client nav.o_main_navbar .o_navbar_apps_menu .o-dropdown--menu .dropdown-item:focus,
            body > .o-dropdown--menu .dropdown-item:hover,
            body > .o-dropdown--menu .dropdown-item:focus,
            body > .dropdown-menu .dropdown-item:hover,
            body > .dropdown-menu .dropdown-item:focus,
            body .o-dropdown--menu .dropdown-item:hover,
            body .o-dropdown--menu .dropdown-item:focus {
                background: #2d313b !important;
                color: #f7f8fb !important;
            }
        `;
    }

    function renameAppsMenuLabel() {
        const navbars = document.querySelectorAll("nav.o_main_navbar");

        navbars.forEach((navbar) => {
            const sectionMenu = navbar.querySelector(".o_menu_sections");

            if (!sectionMenu) {
                return;
            }

            const entries = sectionMenu.querySelectorAll(".o_nav_entry, .dropdown-toggle");

            entries.forEach((entry) => {
                const spanLabel = Array.from(entry.querySelectorAll("span")).find(
                    (span) => span.textContent.trim() === "Apps"
                );

                if (spanLabel) {
                    spanLabel.textContent = "Menu";
                    entry.setAttribute("title", "Menu");
                    return;
                }

                if (entry.textContent.trim() === "Apps") {
                    entry.textContent = "Menu";
                    entry.setAttribute("title", "Menu");
                }
            });
        });
    }

    function maintainNavbarLabels() {
        renameAppsMenuLabel();
        dedupeNavbarBrandSections();
    }

    function dedupeNavbarBrandSections() {
        document.querySelectorAll("nav.o_main_navbar").forEach((navbar) => {
            const brand = navbar.querySelector(":scope > .o_menu_brand");
            if (!brand) {
                return;
            }

            const brandName = brand.textContent.trim();
            if (!brandName) {
                return;
            }

            const sections = navbar.querySelector(
                ".o_menu_sections:not(.by_home_dashboard_sections)"
            );
            if (!sections) {
                return;
            }

            for (const entry of sections.children) {
                if (
                    !entry.matches(
                        ".o_nav_entry, .dropdown, .o-dropdown, .o_menu_sections_more"
                    )
                ) {
                    continue;
                }

                let label = "";
                if (entry.classList.contains("o_nav_entry")) {
                    label = entry.textContent.trim();
                } else {
                    const toggle =
                        entry.querySelector(".dropdown-toggle") ||
                        entry.querySelector("[data-section]");
                    label = toggle ? toggle.textContent.trim() : entry.textContent.trim();
                }

                entry.hidden = label === brandName;
            }
        });
    }

    function queueRenameAppsMenuLabel() {
        if (renameQueued) {
            return;
        }

        renameQueued = true;
        window.requestAnimationFrame(() => {
            renameQueued = false;
            maintainNavbarLabels();
        });
    }

    function watchNavbarLabels() {
        if (renameObserver || !document.body) {
            return;
        }

        renameObserver = new MutationObserver(queueRenameAppsMenuLabel);
        renameObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }

    installNavbarTheme();
    queueRenameAppsMenuLabel();
    watchNavbarLabels();
    window.addEventListener("DOMContentLoaded", installNavbarTheme);
    window.addEventListener("DOMContentLoaded", queueRenameAppsMenuLabel);
    window.addEventListener("DOMContentLoaded", watchNavbarLabels);
})();

# -*- coding: utf-8 -*-
{
    "name": "BlueYellow Website Theme",
    "summary": "Blue and yellow branding for the website frontend.",
    "version": "3.0.1.4.9",
    "category": "Theme/Website",
    "depends": ["website", "web_flectra"],
    "post_init_hook": "post_init_hook",
    "assets": {
        "web.assets_backend": [
            "theme_blueyellow/static/src/scss/backend.scss",
        ],
        "web.assets_frontend": [
            "theme_blueyellow/static/src/scss/theme.scss",
        ],
        "web.assets_web": [
            (
                "after",
                "web_flectra/static/src/scss/theme/navbar.scss",
                "theme_blueyellow/static/src/scss/webclient_management_late.scss",
            ),
            (
                "after",
                "theme_blueyellow/static/src/scss/webclient_management_late.scss",
                "theme_blueyellow/static/src/scss/webclient_navbar_late.scss",
            ),
            (
                "after",
                "theme_blueyellow/static/src/scss/webclient_navbar_late.scss",
                "theme_blueyellow/static/src/scss/home_menu_reorder.scss",
            ),
            (
                "after",
                "theme_blueyellow/static/src/scss/home_menu_reorder.scss",
                "theme_blueyellow/static/src/scss/home_dashboard_navbar.scss",
            ),
            (
                "after",
                "web_flectra/static/src/js/theme/apps_menu.js",
                "theme_blueyellow/static/src/js/home_dashboard_navbar.js",
            ),
            (
                "after",
                "web_flectra/static/src/js/theme/home_menu.js",
                "theme_blueyellow/static/src/js/home_menu_reorder.js",
            ),
            (
                "after",
                "theme_blueyellow/static/src/js/home_menu_reorder.js",
                "theme_blueyellow/static/src/js/webclient_navbar_theme.js",
            ),
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

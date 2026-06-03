# -*- coding: utf-8 -*-
{
    "name": "BlueYellow Website Theme",
    "summary": "Blue and yellow branding for the website frontend.",
    "version": "3.0.1.2.0",
    "category": "Theme/Website",
    "depends": ["website"],
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
                "theme_blueyellow/static/src/js/webclient_navbar_theme.js",
            ),
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

# -*- coding: utf-8 -*-
{
    "name": "BlueYellow Designer Theme",
    "summary": "Designer-palette variant of the BlueYellow website theme.",
    "version": "3.0.1.1.0",
    "category": "Theme/Website",
    "depends": ["website", "theme_blueyellow"],
    "assets": {
        "web.assets_frontend": [
            "theme_blueyellow/static/src/scss/theme.scss",
            "theme_blueyellow_designer/static/src/scss/theme.scss",
        ],
    },
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

# -*- coding: utf-8 -*-
{
    "name": "BlueYellow Client",
    "summary": "Client role and self-service organization creation.",
    "version": "1.0.3",
    "category": "BlueYellow",
    "depends": [
        "base",
        "hr",
        "hr_recruitment",
        "hr_expense",
        "project",
        "account",
        "hr_timesheet",
        "website",
    ],
    "post_init_hook": "post_init_hook",
    "data": [
        "security/blueyellow_client_security.xml",
        "security/ir.model.access.csv",
        "wizard/client_organization_wizard_views.xml",
        "views/res_company_views.xml",
        "data/menu.xml",
    ],
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

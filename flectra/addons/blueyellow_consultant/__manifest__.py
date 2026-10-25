# -*- coding: utf-8 -*-
{
    "name": "BlueYellow Consultant",
    "summary": "Consultant role and scoped home menu.",
    "version": "1.0.3",
    "category": "BlueYellow",
    "depends": [
        "base",
        "hr",
        "hr_recruitment",
        "project",
        "account",
        "hr_timesheet",
        "hr_expense",
        "website",
        "blueyellow_client",
    ],
    "data": [
        "security/blueyellow_consultant_security.xml",
        "data/menu.xml",
        "views/hr_job_views.xml",
    ],
    "demo": [
        "demo/res_users_demo.xml",
        "demo/res_users_showcase_demo.xml",
        "demo/hr_employee_demo.xml",
    ],
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

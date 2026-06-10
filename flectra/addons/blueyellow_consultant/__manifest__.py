# -*- coding: utf-8 -*-
{
    "name": "BlueYellow Consultant",
    "summary": "Consultant role and scoped home menu.",
    "version": "1.0.1",
    "category": "BlueYellow",
    "depends": [
        "base",
        "hr",
        "project",
        "account",
        "hr_timesheet",
        "hr_expense",
        "website",
        "blueyellow_client",
    ],
    "data": [
        "security/blueyellow_consultant_security.xml",
    ],
    "demo": [
        "demo/res_users_demo.xml",
        "demo/hr_employee_demo.xml",
    ],
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

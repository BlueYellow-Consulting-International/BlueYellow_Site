# -*- coding: utf-8 -*-
{
    "name": "BlueYellow Recruitment Project",
    "summary": "Link recruitment jobs to projects and connect hires to delivery.",
    "version": "1.0.3",
    "category": "BlueYellow",
    "depends": [
        "hr_recruitment",
        "website_hr_recruitment",
        "project",
        "blueyellow_client",
    ],
    "data": [
        "security/hr_job_rules.xml",
        "views/hr_job_views.xml",
        "views/website_find_work_templates.xml",
    ],
    "demo": [
        "demo/hr_job_demo.xml",
        "demo/hr_jobs_marketplace_demo.xml",
    ],
    "installable": True,
    "application": False,
    "license": "LGPL-3",
}

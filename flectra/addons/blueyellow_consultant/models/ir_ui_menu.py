# -*- coding: utf-8 -*-

from flectra import api, models

CONSULTANT_HIDDEN_ROOT_MENUS = [
    "website.menu_website_configuration",
    "hr.menu_hr_root",
    "hr_expense.menu_hr_expense_root",
    "base.menu_management",
]


class IrUiMenu(models.Model):
    _inherit = "ir.ui.menu"

    @api.model
    def _blueyellow_hidden_menu_xmlids(self):
        xmlids = super()._blueyellow_hidden_menu_xmlids()
        if self.env.user.has_group("blueyellow_consultant.group_consultant"):
            xmlids.extend(CONSULTANT_HIDDEN_ROOT_MENUS)
        return list(dict.fromkeys(xmlids))

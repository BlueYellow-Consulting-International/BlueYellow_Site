# -*- coding: utf-8 -*-

from flectra import api, models

CLIENT_HIDDEN_ROOT_MENUS = [
    "website.menu_website_configuration",
    "hr.menu_hr_root",
    "hr_expense.menu_hr_expense_root",
    "base.menu_management",
]


class IrUiMenu(models.Model):
    _inherit = "ir.ui.menu"

    @api.model
    def _blueyellow_hidden_menu_xmlids(self):
        """Return root menu xml ids to hide for the current user."""
        xmlids = []
        if self.env.user.has_group("blueyellow_client.group_client"):
            xmlids.extend(CLIENT_HIDDEN_ROOT_MENUS)
        return xmlids

    @api.model
    def _blueyellow_hidden_menu_ids(self):
        hidden_ids = set()
        Menu = self.env["ir.ui.menu"].sudo().with_context({"ir.ui.menu.full_list": True})
        for xmlid in self._blueyellow_hidden_menu_xmlids():
            menu = self.env.ref(xmlid, raise_if_not_found=False)
            if not menu:
                continue
            hidden_ids.add(menu.id)
            hidden_ids.update(Menu.search([("id", "child_of", menu.id)]).ids)
        return hidden_ids

    def _visible_menu_ids(self, debug=False):
        visible = super()._visible_menu_ids(debug=debug)
        return visible - self._blueyellow_hidden_menu_ids()

    @api.model
    def _load_menus_blacklist(self):
        blacklist = super()._load_menus_blacklist()
        return list(set(blacklist) | self._blueyellow_hidden_menu_ids())

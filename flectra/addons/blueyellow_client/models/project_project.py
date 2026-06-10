# -*- coding: utf-8 -*-

from flectra import api, models
from flectra.osv import expression


class ProjectProject(models.Model):
    _inherit = "project.project"

    @api.model
    def _blueyellow_client_company_domain(self):
        if (
            self.env.user.has_group("blueyellow_client.group_client")
            and not self.env.su
            and not self.env.user.has_group("base.group_system")
        ):
            return [
                ("company_id", "in", self.env.companies.ids),
                ("company_id", "!=", False),
            ]
        return []

    @api.model
    def _search(self, domain, offset=0, limit=None, order=None, access_rights_uid=None):
        extra = self._blueyellow_client_company_domain()
        if extra:
            domain = expression.AND([domain, extra])
        return super()._search(
            domain,
            offset=offset,
            limit=limit,
            order=order,
            access_rights_uid=access_rights_uid,
        )

    @api.model_create_multi
    def create(self, vals_list):
        if self.env.user.has_group("blueyellow_client.group_client"):
            company = self.env.company
            for vals in vals_list:
                vals.setdefault("company_id", company.id)
                if not vals.get("partner_id"):
                    vals["partner_id"] = company.partner_id.id
                vals.setdefault("privacy_visibility", "portal")
        projects = super().create(vals_list)
        if self.env.user.has_group("blueyellow_client.group_client"):
            for project in projects:
                project.message_subscribe(partner_ids=[self.env.user.partner_id.id])
        return projects

    @api.model
    def default_get(self, fields_list):
        defaults = super().default_get(fields_list)
        if self.env.user.has_group("blueyellow_client.group_client"):
            company = self.env.company
            if "company_id" in fields_list and not defaults.get("company_id"):
                defaults["company_id"] = company.id
            if "partner_id" in fields_list and not defaults.get("partner_id"):
                defaults["partner_id"] = company.partner_id.id
        return defaults

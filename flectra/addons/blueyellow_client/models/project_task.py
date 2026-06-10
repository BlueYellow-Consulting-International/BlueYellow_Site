# -*- coding: utf-8 -*-

from flectra import api, models
from flectra.osv import expression


class ProjectTask(models.Model):
    _inherit = "project.task"

    @api.model_create_multi
    def create(self, vals_list):
        if self.env.user.has_group("blueyellow_client.group_client"):
            for vals in vals_list:
                if vals.get("project_id") and not vals.get("company_id"):
                    project = self.env["project.project"].browse(vals["project_id"])
                    if project.company_id:
                        vals["company_id"] = project.company_id.id
        return super().create(vals_list)

    @api.model
    def _search(self, domain, offset=0, limit=None, order=None, access_rights_uid=None):
        if (
            self.env.user.has_group("blueyellow_client.group_client")
            and not self.env.su
            and not self.env.user.has_group("base.group_system")
        ):
            domain = expression.AND([
                domain,
                [
                    ("company_id", "in", self.env.companies.ids),
                    ("company_id", "!=", False),
                ],
            ])
        return super()._search(
            domain,
            offset=offset,
            limit=limit,
            order=order,
            access_rights_uid=access_rights_uid,
        )

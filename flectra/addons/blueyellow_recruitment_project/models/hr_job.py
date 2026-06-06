# -*- coding: utf-8 -*-

from flectra import _, api, fields, models
from flectra.exceptions import ValidationError


class HrJob(models.Model):
    _inherit = "hr.job"

    project_id = fields.Many2one(
        "project.project",
        string="Engagement Project",
        domain="[('company_id', '=', company_id)]",
        check_company=True,
        tracking=True,
        copy=False,
    )

    @api.constrains("project_id", "company_id")
    def _check_project_company(self):
        for job in self:
            if job.project_id and job.project_id.company_id != job.company_id:
                raise ValidationError(
                    _("The engagement project must belong to the same company as the job.")
                )

    def action_create_project(self):
        self.ensure_one()
        if self.project_id:
            return self._action_open_project()
        project = self.env["project.project"].create({
            "name": self.name,
            "company_id": self.company_id.id,
            "partner_id": self.company_id.partner_id.id,
            "privacy_visibility": "portal",
        })
        self.project_id = project.id
        return self._action_open_project()

    def _action_open_project(self):
        self.ensure_one()
        return {
            "type": "ir.actions.act_window",
            "res_model": "project.project",
            "res_id": self.project_id.id,
            "view_mode": "form",
            "target": "current",
        }

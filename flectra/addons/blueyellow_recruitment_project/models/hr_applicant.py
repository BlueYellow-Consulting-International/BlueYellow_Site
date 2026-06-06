# -*- coding: utf-8 -*-

from flectra import _, models
from flectra.fields import Command


class HrApplicant(models.Model):
    _inherit = "hr.applicant"

    def write(self, vals):
        res = super().write(vals)
        if vals.get("stage_id"):
            self.filtered(
                lambda applicant: applicant.stage_id.hired_stage and applicant.job_id.project_id
            )._blueyellow_link_hired_applicant_to_project()
        return res

    def _blueyellow_link_hired_applicant_to_project(self):
        for applicant in self:
            project = applicant.job_id.project_id
            partner = applicant.partner_id
            if not project or not partner:
                continue
            applicant._blueyellow_add_partner_to_project(project, partner)

    def _blueyellow_add_partner_to_project(self, project, partner):
        project = project.sudo()
        if project.privacy_visibility != "portal":
            project.write({"privacy_visibility": "portal"})

        user = partner.user_ids[:1]
        is_internal = user.has_group("base.group_user") if user else False

        if is_internal:
            if partner not in project.message_partner_ids:
                project.message_subscribe(partner_ids=partner.ids)
        elif partner not in project.collaborator_ids.partner_id:
            project._add_collaborators(partner)

        if self._blueyellow_has_onboarding_task(project, partner):
            return

        self.env["project.task"].sudo().create({
            "name": _("Onboarding — %s", partner.name),
            "project_id": project.id,
            "partner_id": partner.id,
            "user_ids": [Command.link(user.id)] if user else [],
        })

    def _blueyellow_has_onboarding_task(self, project, partner):
        return bool(self.env["project.task"].sudo().search_count([
            ("project_id", "=", project.id),
            ("partner_id", "=", partner.id),
            ("name", "ilike", "Onboarding —"),
        ]))

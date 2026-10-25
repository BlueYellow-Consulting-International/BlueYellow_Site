# -*- coding: utf-8 -*-

from flectra import api, models


class HrJob(models.Model):
    _inherit = "hr.job"

    def _blueyellow_consultant_job_pool(self):
        return (
            self.env.context.get("blueyellow_job_pool")
            and self.env.user.has_group("blueyellow_consultant.group_consultant")
            and not self.env.user.has_group("hr_recruitment.group_hr_recruitment_user")
        )

    @api.model
    def _search(self, domain, offset=0, limit=None, order=None, access_rights_uid=None):
        if self._blueyellow_consultant_job_pool():
            pool_domain = [
                ("is_published", "=", True),
                ("active", "=", True),
            ]
            if domain:
                pool_domain = pool_domain + list(domain)
            return super(HrJob, self.sudo())._search(
                pool_domain,
                offset=offset,
                limit=limit,
                order=order,
                access_rights_uid=access_rights_uid,
            )
        return super()._search(
            domain,
            offset=offset,
            limit=limit,
            order=order,
            access_rights_uid=access_rights_uid,
        )

    def read(self, fields=None, load="_classic_read"):
        if self._blueyellow_consultant_job_pool():
            published = self.sudo().filtered("is_published")
            return super(HrJob, published).read(fields=fields, load=load)
        return super().read(fields=fields, load=load)

    def action_blueyellow_open_job_website(self):
        self.ensure_one()
        url = "/jobs"
        if hasattr(self, "website_url") and self.website_url:
            url = self.website_url
        elif hasattr(self, "get_website_url"):
            url = self.get_website_url()
        return {
            "type": "ir.actions.act_url",
            "url": url,
            "target": "new",
        }

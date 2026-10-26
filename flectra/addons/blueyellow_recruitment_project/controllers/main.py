# -*- coding: utf-8 -*-

from werkzeug.exceptions import NotFound

from flectra import http
from flectra.http import request
from flectra.addons.http_routing.models.ir_http import slug
from flectra.addons.website_hr_recruitment.controllers.main import WebsiteHrRecruitment


class WebsiteHrRecruitmentBlueYellow(WebsiteHrRecruitment):
    @http.route("/find-work", type="http", auth="public", website=True)
    def find_work(self, **kwargs):
        result = super().jobs(**kwargs)
        qcontext = getattr(result, "qcontext", None)
        if qcontext is not None:
            return request.render("blueyellow_recruitment_project.find_work", qcontext)
        return result

    def _get_public_job(self, job):
        # The multi-company rule hides jobs of other companies even though
        # they are published on the website, so re-browse as superuser like
        # the /jobs list does. Only published jobs may be exposed this way;
        # unpublished or deleted ones keep returning 404.
        sudo_job = job.sudo()
        if sudo_job.exists() and sudo_job.is_published:
            return sudo_job
        return None

    @http.route('''/jobs/detail/<model("hr.job"):job>''', type="http", auth="public", website=True, sitemap=True)
    def jobs_detail(self, job, **kwargs):
        job = self._get_public_job(job)
        if job is None:
            raise NotFound()
        return request.redirect(f"/jobs/{slug(job)}", code=301)

    @http.route('''/jobs/<model("hr.job"):job>''', type="http", auth="public", website=True, sitemap=True)
    def job(self, job, **kwargs):
        job = self._get_public_job(job)
        if job is None:
            raise NotFound()
        return request.render("website_hr_recruitment.detail", {
            "job": job,
            "main_object": job,
        })

    @http.route('''/jobs/apply/<model("hr.job"):job>''', type="http", auth="public", website=True, sitemap=True)
    def jobs_apply(self, job, **kwargs):
        job = self._get_public_job(job)
        if job is None:
            raise NotFound()
        error = {}
        default = {}
        if "website_hr_recruitment_error" in request.session:
            error = request.session.pop("website_hr_recruitment_error")
            default = request.session.pop("website_hr_recruitment_default")
        return request.render("website_hr_recruitment.apply", {
            "job": job,
            "error": error,
            "default": default,
        })

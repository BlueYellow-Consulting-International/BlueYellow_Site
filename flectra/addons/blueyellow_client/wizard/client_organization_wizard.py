# -*- coding: utf-8 -*-

from flectra import _, api, fields, models
from flectra.exceptions import AccessError, UserError


class ClientOrganizationWizard(models.TransientModel):
    _name = "client.organization.wizard"
    _description = "Create Client Organization"

    name = fields.Char(required=True)
    email = fields.Char()
    phone = fields.Char()
    country_id = fields.Many2one("res.country")
    parent_id = fields.Many2one(
        "res.company",
        string="Platform Company",
        required=True,
        default=lambda self: self._default_parent_id(),
    )

    @api.model
    def _default_parent_id(self):
        return self._get_platform_company().id

    @api.model
    def _get_platform_company(self):
        platform = self.env["res.company"].sudo().search(
            [("parent_id", "=", False)],
            order="id",
            limit=1,
        )
        if not platform:
            raise UserError(_("No platform company is configured."))
        return platform

    @api.constrains("name")
    def _check_name(self):
        for wizard in self:
            name = (wizard.name or "").strip()
            if len(name) < 2:
                raise UserError(_("Organization name must be at least 2 characters."))

    def action_create_organization(self):
        self.ensure_one()
        if not self.env.user.has_group("blueyellow_client.group_client"):
            raise AccessError(_("You are not allowed to create organizations."))

        name = self.name.strip()
        duplicate = self.env["res.company"].sudo().search_count([
            ("name", "=", name),
            ("blueyellow_owner_id", "=", self.env.user.id),
        ])
        if duplicate:
            raise UserError(_("You already created an organization with this name."))

        platform = self.parent_id or self._get_platform_company()

        company = self.env["res.company"].sudo().create({
            "name": name,
            "email": self.email,
            "phone": self.phone,
            "country_id": self.country_id.id,
            "parent_id": platform.id,
            "blueyellow_owner_id": self.env.user.id,
        })

        owned_companies = self.env["res.company"].sudo().search([
            ("blueyellow_owner_id", "=", self.env.user.id),
        ])
        allowed_companies = self.env.user.company_ids | owned_companies
        self.env.user.sudo().write({
            "company_ids": [(6, 0, allowed_companies.ids)],
            "company_id": company.id,
        })

        return {
            "type": "ir.actions.client",
            "tag": "display_notification",
            "params": {
                "title": _("Organization created"),
                "message": _("You can switch organizations from the top bar."),
                "type": "success",
                "sticky": False,
                "next": {"type": "ir.actions.act_window_close"},
            },
        }

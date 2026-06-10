# -*- coding: utf-8 -*-

from flectra import fields, models


class ResCompany(models.Model):
    _inherit = "res.company"

    blueyellow_owner_id = fields.Many2one(
        "res.users",
        string="BlueYellow Owner",
        index=True,
        copy=False,
        help="Client user who created this organization via the BlueYellow wizard.",
    )

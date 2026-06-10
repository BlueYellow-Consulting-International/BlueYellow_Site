# -*- coding: utf-8 -*-

from flectra import api, models


class ResUsers(models.Model):
    _inherit = "res.users"

    @api.model_create_multi
    def create(self, vals_list):
        users = super().create(vals_list)
        if not self.env.context.get("blueyellow_skip_client_group_guard"):
            users._blueyellow_enforce_client_group_policy()
        return users

    def write(self, vals):
        res = super().write(vals)
        if (
            "groups_id" in vals
            and not self.env.context.get("blueyellow_skip_client_group_guard")
        ):
            self._blueyellow_enforce_client_group_policy()
        return res

    def _blueyellow_enforce_client_group_policy(self):
        client_group = self.env.ref(
            "blueyellow_client.group_client", raise_if_not_found=False
        )
        client_project_group = self.env.ref(
            "blueyellow_client.group_client_project", raise_if_not_found=False
        )
        manager_group = self.env.ref(
            "project.group_project_manager", raise_if_not_found=False
        )
        if not client_group or not client_project_group or not manager_group:
            return

        for user in self.sudo():
            if client_group in user.groups_id and manager_group in user.groups_id:
                user.with_context(blueyellow_skip_client_group_guard=True).write({
                    "groups_id": [
                        (3, manager_group.id),
                        (4, client_project_group.id),
                    ],
                })

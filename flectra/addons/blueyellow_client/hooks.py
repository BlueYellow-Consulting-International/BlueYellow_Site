# -*- coding: utf-8 -*-


def post_init_hook(env):
    _migrate_client_users(env)


def _migrate_client_users(env):
    client_group = env.ref("blueyellow_client.group_client", raise_if_not_found=False)
    client_project_group = env.ref("blueyellow_client.group_client_project", raise_if_not_found=False)
    manager_group = env.ref("project.group_project_manager", raise_if_not_found=False)
    if not client_group or not client_project_group:
        return

    client_users = env["res.users"].search([("groups_id", "in", client_group.id)])
    for user in client_users:
        commands = []
        if manager_group and manager_group in user.groups_id:
            commands.extend([(3, manager_group.id), (4, client_project_group.id)])
        elif client_project_group not in user.groups_id:
            commands.append((4, client_project_group.id))

        owned = env["res.company"].sudo().search([("blueyellow_owner_id", "=", user.id)])
        if owned:
            allowed_companies = user.company_ids | owned
            commands_company = {
                "company_ids": [(6, 0, allowed_companies.ids)],
                "company_id": user.company_id.id if user.company_id in owned else owned[0].id,
            }
            if commands:
                user.sudo().write({"groups_id": commands, **commands_company})
            else:
                user.sudo().write(commands_company)
        elif commands:
            user.sudo().write({"groups_id": commands})

# -*- coding: utf-8 -*-

from flectra import SUPERUSER_ID, api


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    from flectra.addons.blueyellow_client.client_access import migrate_client_users

    migrate_client_users(env)

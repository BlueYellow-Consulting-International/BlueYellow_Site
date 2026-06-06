# -*- coding: utf-8 -*-

from flectra import api, SUPERUSER_ID


def migrate(cr, version):
    env = api.Environment(cr, SUPERUSER_ID, {})
    from flectra.addons.blueyellow_client.hooks import _migrate_client_users
    _migrate_client_users(env)

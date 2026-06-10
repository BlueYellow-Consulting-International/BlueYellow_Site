# -*- coding: utf-8 -*-

from .client_access import migrate_client_users


def post_init_hook(env):
    migrate_client_users(env)

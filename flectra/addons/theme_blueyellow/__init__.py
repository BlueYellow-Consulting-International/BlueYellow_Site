# -*- coding: utf-8 -*-

from .homepage import ensure_homepage_content


def post_init_hook(env):
    ensure_homepage_content(env)

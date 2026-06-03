# -*- coding: utf-8 -*-

HOMEPAGE_ARCH = """<t name="Homepage" t-name="website.homepage">
    <t t-call="website.layout">
        <t t-set="pageName" t-value="'homepage'"/>
        <div id="wrap" class="oe_structure">
            <section class="by-hero s_title o_colored_level text-center">
                <div class="container">
                    <p class="by-eyebrow">Consulting operations, simplified</p>
                    <h1>Consulting Platform</h1>
                    <p class="by-hero-copy mt-4 mb-5">Modern client management, analytics, and secure workflows for consultants, agencies, and expert teams.</p>
                    <div class="by-cta-row d-flex flex-column flex-sm-row justify-content-center">
                        <a href="/contactus" class="btn btn-primary">Start a Conversation</a>
                        <a href="#by-features" class="btn btn-outline-secondary">Explore Features</a>
                    </div>
                </div>
            </section>
            <section id="by-features" class="by-section o_colored_level">
                <div class="container">
                    <div class="text-center mb-5">
                        <h2 class="by-section-title">Built for focused client work</h2>
                        <p class="by-section-copy mx-auto mt-3">A clean workspace for organizing relationships, tracking performance, and keeping sensitive consulting data under control.</p>
                    </div>
                    <div class="row g-4">
                        <div class="col-lg-4">
                            <div class="by-card">
                                <div class="by-icon">01</div>
                                <h3>Client Management</h3>
                                <p>Organize client details, meetings, service history, and follow-up workflows in one place.</p>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div class="by-card">
                                <div class="by-icon">02</div>
                                <h3>Clear Analytics</h3>
                                <p>Track revenue, active projects, and client activity with reporting that stays readable.</p>
                            </div>
                        </div>
                        <div class="col-lg-4">
                            <div class="by-card">
                                <div class="by-icon">03</div>
                                <h3>Secure Platform</h3>
                                <p>Protect authentication, client records, and operational data with a practical secure foundation.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            <section class="by-section o_colored_level pt-0">
                <div class="container">
                    <div class="by-panel">
                        <div class="row g-4 align-items-center">
                            <div class="col-lg-6">
                                <h2 class="by-section-title mb-3">Less admin. More advisory time.</h2>
                                <p class="by-section-copy mb-0">Bring your client pipeline, communication, and performance signals into a single workspace that feels calm and professional.</p>
                            </div>
                            <div class="col-lg-6">
                                <div class="row g-3">
                                    <div class="col-sm-4">
                                        <div class="by-metric"><strong>360</strong><span>client context</span></div>
                                    </div>
                                    <div class="col-sm-4">
                                        <div class="by-metric"><strong>24/7</strong><span>access</span></div>
                                    </div>
                                    <div class="col-sm-4">
                                        <div class="by-metric"><strong>1</strong><span>workspace</span></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </t>
</t>"""


def homepage_is_empty(view):
    arch = view.arch or ""
    return "by-hero" not in arch and "oe_empty" in arch


def ensure_homepage_content(env):
    views = env["ir.ui.view"].search([("key", "=", "website.homepage")])
    updated = False

    for view in views:
        if not homepage_is_empty(view):
            continue
        view.arch = HOMEPAGE_ARCH
        updated = True

    return updated

# Golden Path: Hire to Pay

End-to-end reference scenario for the BlueYellow marketplace:

> **Client Co.** posts a job → **Consultant** applies → hired → **shared project** → **10 hours logged** → client approves → **BlueYellow invoices client** → **BlueYellow pays consultant**

This playbook uses **native Flectra apps and roles** only. BlueYellow acts as the broker company on every sales invoice.

---

## Prerequisites

### Companies

| Company | Role |
|---------|------|
| **BlueYellow** | Platform / broker (default company) |
| **Client Co.** | Hiring client (**Project → My Organization → New Organization**, or admin-created) |

Enable **Multi-Companies** for platform admins (`Settings → Users → [Admin] → Other → Multi Companies`).

### Users (create once, reuse in tests)

| User | Type | Native access |
|------|------|---------------|
| **Platform Admin** | Internal | Administrator + Billing Administrator + Recruitment Administrator + Timesheet Manager + Project Administrator |
| **Client Manager** | Internal | **Client** group only (`blueyellow_client.group_client`) — implies Recruitment Officer, **Client Project Manager**, Billing, Timesheet Approver, Multi-Company. Do **not** also assign Administrator or standard Project Administrator. Home menu hides **Website**, **Employees**, **Expenses**, and **Apps**. |
| **Consultant** | Internal + Portal | **Consultant** group only (`blueyellow_consultant.group_consultant`) — implies Employee, Project User, Timesheet User, Billing. Link user to **Employee** + **Contact**; publish partner for public profile. Same home menu hides as Client. |

Link the consultant user to an **Employee** record and a **Contact** (`res.partner`). Publish the partner for the public profile (`Website tab → Publish`).

### Apps required

These modules are included in the default bootstrap (`FLECTRA_INIT_MODULES`):

- Recruitment + Online Jobs (`hr_recruitment`, `website_hr_recruitment`)
- Project + Timesheets (`project`, `hr_timesheet`, `sale_project`, `sale_timesheet`)
- Sales + Accounting (`sale_management`, `account_accountant`, `account_payment`, `payment`)
- Partner directory (`website_partner`, `website_crm_partner_assign`)
- Skills (`hr_skills`)
- BlueYellow platform (`blueyellow_client`, `blueyellow_recruitment_project`)

On an **existing** database, install or upgrade platform modules:

```bash
docker compose exec flectra flectra-bin \
  --config=/etc/flectra/flectra.conf \
  --db_host=db --db_user=db --db_password=flectra \
  -d flectra -u blueyellow_client,blueyellow_consultant,blueyellow_recruitment_project --stop-after-init
docker compose restart flectra
```

Then log client users out and back in.

---

## Act 1 — Client posts a job

**Actor:** Client Manager (company: Client Co.)

1. If needed: **Project → My Organization → New Organization** — create **Client Co.** (sets default company; removes platform from allowed companies).
2. Confirm the company switcher shows **Client Co.** (switcher needs 2+ allowed companies to be useful — fine with one org for v1).
3. Open **Recruitment → Jobs → New**.
4. Fill in:
   - **Job Position** — e.g. *Senior Python Consultant*
   - **Company** — Client Co.
   - **Recruitment team** — default or client team
5. Click **Create Project** on the job form (or select an existing **Engagement Project** for Client Co.).
6. Open the **Recruitment** tab → set **Website** → **Published** (visible on `/jobs`).
7. Save.

**Note:** The **Engagement Project** dropdown lists only projects belonging to the job's company. Projects created under **Project → New** are automatically assigned to the active company when logged in as a Client user.

**Verify:** Visit `https://your-domain/jobs` — the position appears.

---

## Act 2 — Consultant applies

**Actor:** Consultant (public website, no login required)

1. Browse to **Jobs** on the website.
2. Open *Senior Python Consultant*.
3. Submit the **application form** (name, email, CV, cover letter).

**System result:** An **Applicant** record is created under Client Co.'s recruitment pipeline.

**Verify (Client Manager):** **Recruitment → Applications** — new applicant in *New* stage.

---

## Act 3 — Client hires the consultant

**Actor:** Client Manager

1. Open the applicant record.
2. Review CV / skills (optional: compare with **Employees → [Consultant]** skills if already on platform).
3. Move stage → **Initial Qualification** → **First Interview** → **Contract Proposal** → **Contract Signed** (or use your simplified pipeline).
4. Click **Create Employee** if the consultant is not yet an employee on the platform — otherwise link to existing contact/employee.
5. Move to the **Hired** stage.

**Automatic (blueyellow_recruitment_project):** When the applicant reaches a hired stage and the job has an **Engagement Project**, the consultant is added to that project (follower or portal collaborator) and an **Onboarding** task is created.

**Optional — direct match (skip public board):** Create applicant manually from the consultant's contact instead of waiting for a website application.

---

## Act 4 — Shared project (usually done in Act 1)

If you used **Create Project** on the job in Act 1, skip manual project setup. Otherwise:

**Actor:** Client Manager (or Platform Admin)

1. **Project → New**.
2. Fill in name and tasks — **Company** and **Customer** default to the active organization for Client users.
3. Set **Privacy** — **Invited portal users and all internal users (portal)** if not already set by **Create Project** on the job.
4. Save.
5. Link the project on the job (**Engagement Project** field) if not already linked.
6. Add **Collaborators** manually only if hire automation did not run yet.

**Verify (Consultant):** Log in → **My Account** (`/my`) or backend → project appears with shared access.

---

## Act 5 — Mutual agreement (Sales Order)

**Actor:** Platform Admin (BlueYellow as seller)

1. Switch company to **BlueYellow**.
2. **Sales → New Quotation**.
3. **Customer** — Client Co. (billing contact).
4. Add a service line — e.g. *Consulting — hourly*:
   - Product type: **Service**
   - Invoicing policy: **Based on Timesheets** (requires `sale_timesheet`)
   - Price — agreed hourly rate
5. **Optional:** Link to project — on the SO line, set **Project** to the shared project (or use **Project → Create Sales Order** wizard from the project).
6. Confirm quotation → **Sales Order**.

This SO is the **mutual agreement** between Client Co. and BlueYellow for the engagement.

---

## Act 6 — Consultant logs 10 hours

**Actor:** Consultant

**Via backend:**

1. **Timesheets → My Timesheets** (or from the project task → **Log time**).
2. Select the shared **Project** and **Task**.
3. Enter **10:00** hours (or 10 separate 1h entries).
4. Save.

**Via portal** (if using `/my` project sharing):

1. Open the shared project in the portal.
2. Log time on the assigned task.

**Verify (Client Manager):** **Timesheets → All Timesheets** (filter: project) — 10 hours appear, status *Submitted* or ready for approval depending on config.

---

## Act 7 — Client approves timesheets

**Actor:** Client Manager

1. **Timesheets → To Validate** (or **All Timesheets**).
2. Filter by the engagement project.
3. Select the 10 hours → **Validate / Approve**.

Approved hours are now billable on the linked Sales Order.

---

## Act 8 — BlueYellow invoices the client

**Actor:** Platform Admin (BlueYellow)

**Option A — from the project:**

1. Open the shared **Project**.
2. **Create Invoice** (wizard from `sale_timesheet`) — invoices delivered timesheet quantity on the SO.

**Option B — from the Sales Order:**

1. Open the SO for Client Co.
2. **Create Invoice** — pulls delivered (= approved timesheet) quantities.

**Result:** Customer invoice (BlueYellow → Client Co.) for 10 × hourly rate.

**Verify:** **Accounting → Customers → Invoices** — draft or posted invoice. Client sees it at **`/my/invoices`** if given portal access.

---

## Act 9 — Client pays BlueYellow

**Actor:** Client Manager (or Platform Admin recording payment)

**Manual (v1):**

1. Open the invoice → **Register Payment**.
2. Select journal / payment method → validate.

**Online (when configured):**

1. Install/configure a payment provider (**Settings → Payment Providers** — Stripe, PayPal, etc.).
2. Client pays from **`/my/invoices`** or payment link on the invoice.

---

## Act 10 — BlueYellow pays the consultant

**Actor:** Platform Admin (BlueYellow)

The consultant is a **vendor** on BlueYellow.

1. Ensure the consultant's **Contact** has **Vendor** rank enabled.
2. **Accounting → Vendors → Bills → New**.
3. **Vendor** — consultant partner.
4. Line — e.g. *Payout — Client Co. Python engagement* — 10 hours × consultant rate (broker margin = client rate − consultant rate).
5. Confirm and **Register Payment** when paid.

**Alternative:** Use **Expenses** or **Purchase** flows if your accountant prefers PO → bill.

**Verify:** Consultant can see vendor documents on portal if configured (`/my/invoices` for vendor bills).

---

## Quick reference — who does what

| Step | Actor | App | Key record |
|------|-------|-----|------------|
| Post job | Client | Recruitment | `hr.job` (published) |
| Apply | Consultant | Website | `hr.applicant` |
| Hire | Client | Recruitment | Applicant → Hired |
| Shared project | Client / Admin | Project | `project.project` (portal privacy) |
| Agreement | Admin | Sales | `sale.order` (BlueYellow → Client) |
| Log time | Consultant | Timesheets | `account.analytic.line` |
| Approve time | Client | Timesheets | Validated timesheets |
| Invoice client | Admin | Sales / Accounting | `account.move` (out_invoice) |
| Client pays | Client / Admin | Accounting / Payment | Payment transaction |
| Pay consultant | Admin | Accounting | `account.move` (in_invoice / vendor bill) |

---

## Test checklist

Use this when validating a fresh install:

- [ ] Client user has **Client** group only (not Administrator / not standard Project Administrator)
- [ ] Organization wizard sets default company; projects scoped to that company
- [ ] Client Co. company exists; Client Manager defaults to it
- [ ] Job **Engagement Project** lists only Client Co. projects
- [ ] Job visible on `/jobs`
- [ ] Website application creates applicant under Client Co.
- [ ] Project sharing: consultant sees project in portal or backend
- [ ] Timesheet: 10h on task, linked to SO via `sale_timesheet`
- [ ] Client validates timesheets
- [ ] Invoice wizard produces correct amount (10 × rate)
- [ ] Vendor bill created for consultant payout
- [ ] (Optional) Payment provider registers client payment

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Client sees all platform/demo projects | User has **Administrator** or **Project Administrator** | Assign **Client** group only; run module upgrade; log out/in |
| Job project dropdown shows wrong projects | Active company mismatch or stale session | Switch to client company; log out/in after upgrade |
| Project created without company | Pre-fix data or non-Client user | Upgrade `blueyellow_client`; recreate project as Client user |
| Company switcher missing | User has only one allowed company | Expected for v1; create second org via wizard to enable switcher |
| **Create Project** on job missing | User lacks **Client Project Manager** | Ensure **Client** group is assigned |

---

## Known v1 limitations

- No automated margin calculation — set client and vendor rates manually.
- No paywall on consultant profiles or blog.
- No auto-matching — client browses directory or recruitment pipeline manually.
- Consultant public profile uses standard **`/partners/...`** page until the theme adds a custom template.

---

## Next steps

- **Theme:** Custom consultant profile page in `theme_blueyellow` (skills, bio, apply CTA).
- **Onboarding module:** Wizard to create Client Co. + users + defaults in one step.
- **Payments:** Configure Stripe (or other) for client invoice pay-online.

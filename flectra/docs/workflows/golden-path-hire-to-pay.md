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
| **Client Co.** | Hiring client (`Settings → Companies → Create`) |

Enable **Multi-Companies** for platform admins (`Settings → Users → [Admin] → Other → Multi Companies`).

### Users (create once, reuse in tests)

| User | Type | Native access |
|------|------|---------------|
| **Platform Admin** | Internal | Administrator + Billing Administrator + Recruitment Administrator + Timesheet Manager + Project Administrator |
| **Client Manager** | Internal | Internal User, Multi-Company, Recruitment Officer, Project User, Billing, Timesheet Approver — **default company: Client Co.** |
| **Consultant** | Internal + Portal | Internal User, Employee (linked), Billing, Timesheet User, Project User — **partner published** for public profile |

Link the consultant user to an **Employee** record and a **Contact** (`res.partner`). Publish the partner for the public profile (`Website tab → Publish`).

### Apps required

These modules are included in the default bootstrap (`FLECTRA_INIT_MODULES`):

- Recruitment + Online Jobs (`hr_recruitment`, `website_hr_recruitment`)
- Project + Timesheets (`project`, `hr_timesheet`, `sale_project`, `sale_timesheet`)
- Sales + Accounting (`sale_management`, `account_accountant`, `account_payment`, `payment`)
- Partner directory (`website_partner`, `website_crm_partner_assign`)
- Skills (`hr_skills`)

On an **existing** database, install missing apps from **Apps** before running through this path.

---

## Act 1 — Client posts a job

**Actor:** Client Manager (company: Client Co.)

1. Switch company to **Client Co.** (company switcher, top bar).
2. Open **Recruitment → Jobs → New**.
3. Fill in:
   - **Job Position** — e.g. *Senior Python Consultant*
   - **Company** — Client Co.
   - **Recruitment team** — default or client team
4. Open the **Recruitment** tab → set **Website** → **Published** (visible on `/jobs`).
5. Save.

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
5. Mark applicant as **Hired**.

**Optional — direct match (skip public board):** Create applicant manually from the consultant's contact instead of waiting for a website application.

---

## Act 4 — Create the shared project

**Actor:** Client Manager (or Platform Admin)

1. **Project → New**.
2. Fill in:
   - **Name** — e.g. *Client Co. — Python engagement*
   - **Customer** — Client Co. (as client partner) or the client's contact
   - **Company** — Client Co.
   - **Privacy** — **Invited portal users and all internal users (portal)** ← enables collaboration
3. Save.
4. Open **Settings** (gear on project) → **Collaborators** → **Add** the consultant's portal user.
5. Create tasks — e.g. *Sprint 1 — API integration*.

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

- [ ] Client Co. company exists; Client Manager defaults to it
- [ ] Job visible on `/jobs`
- [ ] Website application creates applicant under Client Co.
- [ ] Project sharing: consultant sees project in portal or backend
- [ ] Timesheet: 10h on task, linked to SO via `sale_timesheet`
- [ ] Client validates timesheets
- [ ] Invoice wizard produces correct amount (10 × rate)
- [ ] Vendor bill created for consultant payout
- [ ] (Optional) Payment provider registers client payment

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

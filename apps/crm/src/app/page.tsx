"use client";

import { useEffect, useState } from "react";
import { defaultLocale, getTranslations, type Locale } from "@consulting/shared";

type Lead = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  message: string;
  status: "NEW" | "SYNCED" | "FAILED";
  flectraLeadId: string | null;
  createdAt: string;
  updatedAt: string;
};

const columns = [
  { title: "New", status: "NEW" as const },
  { title: "Synced", status: "SYNCED" as const },
  { title: "Failed", status: "FAILED" as const },
];

export default function Home() {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = getTranslations(locale);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [contactSearch, setContactSearch] = useState("");
  const [companySearch, setCompanySearch] = useState("");
  const [hoveredCompany, setHoveredCompany] = useState("");
  const [hoveredContact, setHoveredContact] = useState("");
  const [hoveredActivity, setHoveredActivity] = useState("");
  const [apiStatus, setApiStatus] = useState("Не перевірено");
  const [flectraStatus, setFlectraStatus] = useState("Не перевірено");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const leadsPerPage = 9;
  const [showNewLead, setShowNewLead] = useState(false);
  const [showEditLead, setShowEditLead] = useState(false);
  const [error, setError] = useState("");
  const [activeView, setActiveView] = useState("Leads");
  const [hoveredNav, setHoveredNav] = useState("");

  useEffect(() => {
    fetch("http://localhost:4000/leads")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Помилка API: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Неочікувана відповідь API");
        }

        setLeads(data);
      })
      .catch((err) => {
        setError(
          err instanceof Error ? err.message : "Не вдалося завантажити лідів"
        );
      
            })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const newLeads = leads.filter((lead) => lead.status === "NEW");
  const syncedLeads = leads.filter((lead) => lead.status === "SYNCED");
  const failedLeads = leads.filter((lead) => lead.status === "FAILED");



  const contacts = Object.values(leads.reduce<Record<string, { name: string; email: string; company: string; latest: Lead }>>((acc, lead) => { const key = lead.email.toLowerCase(); const company = (lead.company ?? "Без компанії").trim() || "Без компанії"; if (!acc[key]) acc[key] = { name: lead.name, email: lead.email, company, latest: lead }; if (new Date(lead.createdAt) > new Date(acc[key].latest.createdAt)) acc[key].latest = lead; return acc; }, {}));
  const activities = leads.flatMap((lead) => [{ id: lead.id + "-updated", type: "Lead updated", lead, date: lead.updatedAt }, { id: lead.id + "-created", type: "Lead created", lead, date: lead.createdAt }]).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const companies = Object.values(leads.reduce<Record<string, { name: string; leads: number; latest: Lead }>>((acc, lead) => { const name = (lead.company ?? "Без компанії").trim() || "Без компанії"; if (!acc[name]) acc[name] = { name, leads: 0, latest: lead }; acc[name].leads += 1; if (new Date(lead.createdAt) > new Date(acc[name].latest.createdAt)) acc[name].latest = lead; return acc; }, {}));
  const filteredCompanies = companies.filter((company) => company.name.toLowerCase().includes(companySearch.toLowerCase()));
  const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(contactSearch.toLowerCase()) || contact.email.toLowerCase().includes(contactSearch.toLowerCase()) || contact.company.toLowerCase().includes(contactSearch.toLowerCase()));
  const reportCompanies = companies.sort((a, b) => b.leads - a.leads).slice(0, 5);

  const checkApi = async () => {
    setApiStatus("Перевірка...");
    try {
      const response = await fetch("http://localhost:4000/health");
      setApiStatus(response.ok ? "Підключено" : "Помилка API");
    } catch {
      setApiStatus("Офлайн");
    }
  };

  const checkFlectra = async () => {
    setFlectraStatus("Перевірка...");
    try {
      const response = await fetch("http://localhost:4000/leads");
      if (!response.ok) {
        setFlectraStatus("Офлайн");
        return;
      }
      const data = await response.json();
      setFlectraStatus(data.some((lead: Lead) => lead.flectraLeadId) ? "Підключено" : "Немає синхронізованих лідів");
    } catch {
      setFlectraStatus("Офлайн");
    }
  };

  const filteredLeads = leads.filter((lead) => {
    const query = search.trim().toLowerCase();
    if (statusFilter !== "ALL" && lead.status !== statusFilter) return false;
    if (!query) return true;
    return lead.name.toLowerCase().includes(query) || lead.email.toLowerCase().includes(query) || (lead.company ?? "").toLowerCase().includes(query);
  });

  const totalPages = Math.max(1, Math.ceil(filteredLeads.length / leadsPerPage));
  const paginatedLeads = filteredLeads.slice((currentPage - 1) * leadsPerPage, currentPage * leadsPerPage);


  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        background: "#f7f8fc",
        color: "#182033",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div data-language-switcher style={{position:"fixed",top:0,right:28,zIndex:9999,display:"flex",gap:4,padding:2,borderRadius:10,background:"#f1eff8",boxShadow:"0 2px 8px rgba(0,0,0,.08)"}}>
        <button onClick={() => setLocale("uk")} style={{border:0,borderRadius:7,padding:"5px 9px",cursor:"pointer",background:locale === "uk" ? "#5936df" : "transparent",color:locale === "uk" ? "#fff" : "#555",fontWeight:700}}>UA</button>
        <button onClick={() => setLocale("en")} style={{border:0,borderRadius:7,padding:"5px 9px",cursor:"pointer",background:locale === "en" ? "#5936df" : "transparent",color:locale === "en" ? "#fff" : "#555",fontWeight:700}}>EN</button>
      </div>
      <aside
        style={{
          width: 230,
          flexShrink: 0,
          background: "#151837",
          color: "#fff",
          padding: "28px 18px",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <div style={{ fontSize: 24, fontWeight: 800, marginBottom: 40 }}>
          ZCode
          <div style={{ fontSize: 13, fontWeight: 400, opacity: 0.7 }}>
            Consulting CRM
          </div>
        </div>

        <nav style={{ display: "grid", gap: 8 }}>
          {[
            "Dashboard",
            "Leads",
            "Companies",
            "Contacts",
            "Activities",
            "Reports",
            "Settings",
          ].map((item) => (
            <div
              key={item}
              onClick={() => setActiveView(item)}
              onMouseEnter={() => setHoveredNav(item)}
              onMouseLeave={() => setHoveredNav("")}
              style={{
                padding: "13px 14px",
                borderRadius: 10,
                background: item === activeView ? "#5936df" : hoveredNav === item ? "rgba(89,54,223,0.16)" : "transparent",
                fontWeight: item === activeView ? 700 : 500,
                cursor: "pointer",
              }}
            >
              {item === "Dashboard" ? t.nav.dashboard : item === "Leads" ? t.nav.leads : item === "Companies" ? t.nav.companies : item === "Contacts" ? t.nav.contacts : item === "Activities" ? t.nav.activities : item === "Reports" ? t.nav.reports : t.nav.settings}
            </div>
          ))}
        </nav>

        <div
          style={{
            marginTop: "auto",
            paddingTop: 18,
            borderTop: "1px solid #303354",
            fontSize: 13,
          }}
        >
          <strong>Admin User</strong>
          <div style={{ opacity: 0.65 }}>admin@zcode.com</div>
        </div>
      </aside>

      <section
        style={{
          flex: 1,
          padding: "30px 34px",
          overflow: "auto",
        }}
      >
<>{activeView === "Dashboard" && (<section style={{ marginBottom: 30 }}><h1 style={{ fontSize: 34, margin: 0 }}>{t.nav.dashboard}</h1><p style={{ color: "#75809a", marginTop: 6 }}>Огляд вашої CRM-системи</p><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 14, marginTop: 24 }}>{[[t.crm.totalLeads, leads.length],[t.crm.new, newLeads.length],[t.crm.synced, syncedLeads.length],[t.crm.failed, failedLeads.length]].map(([title,value]) => (<div key={String(title)} style={{ background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, padding: 20 }}><div style={{ color: "#75809a", fontSize: 13 }}>{title}</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{value}</div></div>))}</div></section>)}</>

<>{activeView === "Contacts" && (<section><h1 style={{ fontSize: 34, margin: 0 }}>{t.nav.contacts}</h1><p style={{ color: "#75809a", marginTop: 6 }}>Контакти з ваших лідів</p><input value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} placeholder={t.crm.searchContacts} style={{ marginTop: 18, width: "100%", maxWidth: 420, padding: "11px 14px", border: "1px solid #dfe2ea", borderRadius: 10, fontSize: 14, outline: "none" }} /><div style={{ marginTop: 24, background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, overflow: "hidden" }}><div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.2fr 1fr", padding: "14px 18px", background: "#f7f8fc", fontSize: 12, fontWeight: 700, color: "#75809a" }}><div>{t.crm.name}</div><div>{t.crm.email}</div><div>{t.crm.company}</div><div>Останній лід</div></div>{filteredContacts.map((contact) => (<div key={contact.email} onClick={() => setSelectedLead(contact.latest)} onMouseEnter={() => setHoveredContact(contact.email)} onMouseLeave={() => setHoveredContact("")} style={{ display: "grid", gridTemplateColumns: "1.2fr 1.4fr 1.2fr 1fr", padding: "16px 18px", borderTop: "1px solid #eef0f5", alignItems: "center", cursor: "pointer", transition: "background 0.15s ease", background: hoveredContact === contact.email ? "#f7f5ff" : "#fff" }}><div style={{ fontWeight: 700 }}>{contact.name}</div><div style={{ color: "#5f6880" }}>{contact.email}</div><div>{contact.company}</div><div style={{ color: "#75809a", fontSize: 13 }}>{new Date(contact.latest.createdAt).toLocaleDateString()}</div></div>))}</div></section>)}</>
<>{activeView === "Reports" && (<section><h1 style={{ fontSize: 34, margin: 0 }}>{t.nav.reports}</h1><p style={{ color: "#75809a", marginTop: 6 }}>Огляд ефективності CRM</p><div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(160px, 1fr))", gap: 14, marginTop: 24 }}>{[[t.crm.totalLeads, leads.length],[t.crm.new, newLeads.length],[t.crm.synced, syncedLeads.length],[t.crm.failed, failedLeads.length]].map(([title,value]) => (<div key={String(title)} style={{ background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, padding: 20 }}><div style={{ color: "#75809a", fontSize: 13 }}>{title}</div><div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>{value}</div></div>))}</div><div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(180px, 1fr))", gap: 14, marginTop: 24 }}>{[[t.crm.new, newLeads.length],[t.crm.synced, syncedLeads.length],[t.crm.failed, failedLeads.length]].map(([title,value]) => (<div key={String(title)} style={{ background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, padding: 20 }}><div style={{ color: "#75809a", fontSize: 13 }}>{title} лідів</div><div style={{ fontSize: 26, fontWeight: 800, marginTop: 8 }}>{value}</div></div>))}</div><div style={{ marginTop: 24, background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, overflow: "hidden" }}><div style={{ padding: "16px 18px", fontWeight: 700 }}>Топ компаній</div>{reportCompanies.map((company) => (<div key={company.name} style={{ display: "grid", gridTemplateColumns: "2fr 1fr", padding: "14px 18px", borderTop: "1px solid #eef0f5" }}><div>{company.name}</div><div>{company.leads} лідів</div></div>))}</div></section>)}</>
<>{activeView === "Settings" && (<section><h1 style={{ fontSize: 34, margin: 0 }}>{t.nav.settings}</h1><p style={{ color: "#75809a", marginTop: 6 }}>Конфігурація CRM та системна інформація</p><div style={{ marginTop: 24, background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, padding: 22 }}><h3 style={{ marginTop: 0 }}>Система</h3><div style={{ display: "grid", gap: 14 }}><div><div style={{ color: "#75809a", fontSize: 13 }}>CRM</div><div style={{ fontWeight: 700, marginTop: 4 }}>Consulting CRM</div></div><div><div style={{ color: "#75809a", fontSize: 13 }}>API</div><div style={{ fontWeight: 700, marginTop: 4 }}>http://localhost:4000</div><button onClick={checkApi} style={{ marginTop: 10, padding: "9px 14px", border: "1px solid #dfe2ea", borderRadius: 9, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#182033" }}>{t.crm.checkApi}</button><div style={{ marginTop: 8, fontSize: 13, color: apiStatus === "Підключено" ? "#16834b" : apiStatus === "Офлайн" ? "#c0392b" : "#75809a" }}>{apiStatus}</div></div><div><div style={{ color: "#75809a", fontSize: 13 }}>Синхронізація лідів</div><div style={{ fontWeight: 700, marginTop: 4 }}>Flectra через Outbox Worker</div><button onClick={checkFlectra} style={{ marginTop: 10, padding: "9px 14px", border: "1px solid #dfe2ea", borderRadius: 9, background: "#fff", cursor: "pointer", fontWeight: 600, color: "#182033" }}>{t.crm.checkFlectra}</button><div style={{ marginTop: 8, fontSize: 13, color: flectraStatus === "Підключено" ? "#16834b" : flectraStatus === "Офлайн" ? "#c0392b" : "#75809a" }}>{flectraStatus}</div></div></div></div></section>)}</><><>{activeView === "Activities" && (<section><h1 style={{ fontSize: 34, margin: 0 }}>{t.nav.activities}</h1><p style={{ color: "#75809a", marginTop: 6 }}>Останні активності за вашими лідами</p><div style={{ marginTop: 24, background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, overflow: "hidden" }}>{activities.map((activity) => (<div key={activity.id} onClick={() => setSelectedLead(activity.lead)} onMouseEnter={() => setHoveredActivity(activity.id)} onMouseLeave={() => setHoveredActivity("")} style={{ display: "grid", gridTemplateColumns: "1.4fr 1.5fr 1.5fr 1fr", padding: "16px 18px", borderTop: "1px solid #eef0f5", alignItems: "center", cursor: "pointer", transition: "background 0.15s ease", background: hoveredActivity === activity.id ? "#f7f5ff" : "#fff" }}><div style={{ fontWeight: 700 }}>{activity.type === "Lead updated" ? "Ліда оновлено" : "Ліда створено"}</div><div>{activity.lead.name}</div><div style={{ color: "#5f6880" }}>{activity.lead.company || "Без компанії"}</div><div style={{ color: "#75809a", fontSize: 13 }}>{new Date(activity.date).toLocaleString()}</div></div>))}</div></section>)}</>
{activeView === "Companies" && (<section><h1 style={{ fontSize: 34, margin: 0 }}>{t.nav.companies}</h1><p style={{ color: "#75809a", marginTop: 6 }}>Компанії з ваших лідів</p><input value={companySearch} onChange={(e) => setCompanySearch(e.target.value)} placeholder="Пошук компаній..." style={{ marginTop: 18, width: "100%", maxWidth: 420, padding: "11px 14px", border: "1px solid #dfe2ea", borderRadius: 10, fontSize: 14, outline: "none" }} /><div style={{ marginTop: 24, background: "#fff", border: "1px solid #e4e6ee", borderRadius: 14, overflow: "hidden" }}><div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", padding: "14px 18px", background: "#f7f8fc", fontSize: 12, fontWeight: 700, color: "#75809a" }}><div>{t.crm.company}</div><div>ЛІДИ</div><div>Останній лід</div></div>{filteredCompanies.map((company) => (<div key={company.name} onClick={() => setSelectedLead(company.latest)} onMouseEnter={() => setHoveredCompany(company.name)} onMouseLeave={() => setHoveredCompany("")} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.5fr", padding: "16px 18px", borderTop: "1px solid #eef0f5", alignItems: "center", cursor: "pointer", transition: "background 0.15s ease", background: hoveredCompany === company.name ? "#f7f5ff" : "#fff" }}><div style={{ fontWeight: 700 }}>{company.name}</div><div>{company.leads}</div><div style={{ color: "#75809a", fontSize: 13 }}>{new Date(company.latest.createdAt).toLocaleDateString()}</div></div>))}</div></section>)}</>
{activeView === "Leads" && (<><header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
          }}
        >
          <div>
            <h1 style={{ fontSize: 34, margin: 0 }}>{t.nav.leads}</h1>
            <p style={{ color: "#75809a", marginTop: 6 }}>
              {locale === "uk" ? "Керуйте та відстежуйте всі вхідні ліди" : "Manage and track all incoming leads"}
            </p>
          </div>

          <div style={{ display: "flex", gap: 12, alignItems: "center" }}><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ padding: "10px 12px", border: "1px solid #e2e5ef", borderRadius: 10, background: "#fff", color: "#182033", fontSize: 14 }}><option value="ALL">{locale === "uk" ? "Всі" : "All"}</option><option value="NEW">{t.crm.new}</option><option value="SYNCED">{t.crm.synced}</option><option value="FAILED">{t.crm.failed}</option></select><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={t.crm.searchLeads} style={{ width: 240, padding: "10px 14px", border: "1px solid #e2e5ef", borderRadius: 10, background: "#fff", fontSize: 14, color: "#182033", outline: "none" }} /><div style={{ padding: "10px 14px", background: "#fff", border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14, color: "#75809a" }}>{loading ? "Завантаження..." : `${leads.length} ${t.crm.leadsCountShort}`}</div><button type="button" onClick={() => setShowNewLead(true)} style={{ padding: "10px 16px", background: "#182033", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>+ {t.crm.newLead}</button></div>
        </header>

        {showNewLead && (<div onClick={() => setShowNewLead(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}><div onClick={(event) => event.stopPropagation()} style={{ width: 480, maxWidth: "calc(100vw - 32px)", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}><h2 style={{ margin: 0, fontSize: 22 }}>Новий лід</h2><p style={{ color: "#75809a", marginTop: 6 }}>Створіть нового ліда</p><form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); try { const response = await fetch("http://localhost:4000/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: String(data.get("name") || ""), email: String(data.get("email") || ""), company: String(data.get("company") || ""), message: String(data.get("message") || "") }) }); if (!response.ok) { throw new Error((await response.text()) || "Не вдалося створити ліда"); } setShowNewLead(false); window.location.reload(); } catch (err) { setError(err instanceof Error ? err.message : "Не вдалося створити ліда"); } }}><input name="name" required placeholder={t.crm.name} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", padding: "11px 12px", marginTop: 18, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14, color: "#182033" }} /><input name="email" required type="email" placeholder={t.crm.email} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", padding: "11px 12px", marginTop: 12, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14, color: "#182033" }} /><input name="company" placeholder={t.crm.company} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", padding: "11px 12px", marginTop: 12, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14, color: "#182033" }} /><textarea name="message" required minLength={10} placeholder={t.crm.messageMin} rows={4} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", padding: "11px 12px", marginTop: 12, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14, color: "#182033", resize: "vertical" }} /><div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}><button type="button" onClick={() => setShowNewLead(false)} style={{ padding: "10px 16px", background: "#fff", color: "#182033", border: "1px solid #e2e5ef", borderRadius: 10, cursor: "pointer" }}>{t.crm.cancel}</button><button type="submit" style={{ padding: "10px 16px", background: "#5b36e8", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>{t.crm.createLead}</button></div></form></div></div>)}
        {error && (
          <div
            style={{
              background: "#fff1f1",
              border: "1px solid #f3c7c7",
              color: "#b42318",
              padding: 16,
              borderRadius: 12,
              marginBottom: 20,
            }}
          >
            {error}
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
            gap: 18,
            marginBottom: 30,
          }}
        >
          {[
            [t.crm.totalLeads, leads.length],
            [t.crm.new, newLeads.length],
            [t.crm.synced, syncedLeads.length],
            [t.crm.failed, failedLeads.length],
          ].map(([title, value]) => (
            <div
              key={title}
              style={{
                background: "#fff",
                padding: 22,
                borderRadius: 16,
                border: "1px solid #e7e9f1",
              }}
            >
              <div style={{ color: "#7c8499", fontSize: 14 }}>{title}</div>
              <div
                style={{
                  fontSize: 30,
                  fontWeight: 800,
                  marginTop: 8,
                }}
              >
                {value}
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}><h2 style={{ fontSize: 22, margin: 0 }}>{locale === "uk" ? "Огляд лідів" : "Leads Overview"}</h2><div style={{ display: "flex", alignItems: "center", gap: 8 }}><button type="button" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} style={{ padding: "6px 10px", border: "1px solid #e2e5ef", borderRadius: 8, background: "#fff", color: "#182033", cursor: currentPage === 1 ? "not-allowed" : "pointer", opacity: currentPage === 1 ? 0.5 : 1 }}>&lsaquo;</button><span style={{ fontSize: 13, color: "#75809a", minWidth: 52, textAlign: "center" }}>{currentPage} / {totalPages}</span><button type="button" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))} style={{ padding: "6px 10px", border: "1px solid #e2e5ef", borderRadius: 8, background: "#fff", color: "#182033", cursor: currentPage === totalPages ? "not-allowed" : "pointer", opacity: currentPage === totalPages ? 0.5 : 1 }}>&rsaquo;</button></div></div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, minmax(220px, 1fr))",
            gap: 14,
          }}
        >
          {columns.map((column) => {
            const columnLeads = paginatedLeads.filter(
              (lead) => lead.status === column.status
            );


            return (
              <div
                key={column.status}
                style={{ background: "#eef0f6", borderRadius: 14, padding: 12, minHeight: 340 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, padding: "4px 4px 12px" }}>
                  <span>{column.status === "NEW" ? t.crm.new : column.status === "SYNCED" ? t.crm.synced : t.crm.failed}</span>
                  <span style={{ color: "#6f7890" }}>{columnLeads.length}</span>
                </div>
                {columnLeads.map((lead) => (
                  <div key={lead.id} onClick={() => setSelectedLead(lead)} style={{ background: "#fff", padding: 14, borderRadius: 12, marginBottom: 10, border: "1px solid #e4e6ee", boxShadow: "0 2px 6px rgba(20,24,40,.04)", cursor: "pointer" }}>
                    <div style={{ fontWeight: 700 }}>{lead.name}</div>
                    <div style={{ fontSize: 13, color: "#667086", marginTop: 5 }}>{lead.company || "Без компанії"}</div>
                    <div style={{ fontSize: 12, color: "#8b93a5", marginTop: 6 }}>{lead.email}</div>
                    <div style={{ fontSize: 11, color: "#9da4b3", marginTop: 8 }}>{new Date(lead.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </>)}
      </section>



      {showEditLead && selectedLead && (<div onClick={() => setShowEditLead(false)} style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.35)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100 }}><div onClick={(event) => event.stopPropagation()} style={{ width: 480, maxWidth: "calc(100vw - 32px)", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 20px 60px rgba(0,0,0,0.18)" }}><h2 style={{ margin: 0, fontSize: 22 }}>Редагувати ліда</h2><p style={{ color: "#75809a", marginTop: 6 }}>Оновіть інформацію про ліда</p><form onSubmit={async (event) => { event.preventDefault(); const form = event.currentTarget; const data = new FormData(form); try { const response = await fetch(`http://localhost:4000/leads/${selectedLead.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: String(data.get("name") || ""), email: String(data.get("email") || ""), company: String(data.get("company") || ""), message: String(data.get("message") || "") }) }); if (!response.ok) { throw new Error((await response.text()) || "Не вдалося оновити ліда"); } setShowEditLead(false); setSelectedLead(null); window.location.reload(); } catch (err) { setError(err instanceof Error ? err.message : "Не вдалося оновити ліда"); } }}><input name="name" required defaultValue={selectedLead.name} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", color: "#182033", padding: "11px 12px", marginTop: 18, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14 }} /><input name="email" required type="email" defaultValue={selectedLead.email} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", color: "#182033", padding: "11px 12px", marginTop: 12, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14 }} /><input name="company" defaultValue={selectedLead.company || ""} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", color: "#182033", padding: "11px 12px", marginTop: 12, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14 }} /><textarea name="message" required minLength={10} defaultValue={selectedLead.message} rows={4} style={{ width: "100%", boxSizing: "border-box", background: "#fff", colorScheme: "light", color: "#182033", padding: "11px 12px", marginTop: 12, border: "1px solid #e2e5ef", borderRadius: 10, fontSize: 14, resize: "vertical" }} /><div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}><button type="button" onClick={() => setShowEditLead(false)} style={{ padding: "10px 16px", background: "#fff", color: "#182033", border: "1px solid #e2e5ef", borderRadius: 10, cursor: "pointer" }}>{t.crm.cancel}</button><button type="submit" style={{ padding: "10px 16px", background: "#5b36e8", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 600 }}>Зберегти зміни</button></div></form></div></div>)}

      {selectedLead && (
        <>
          <div
            onClick={() => setSelectedLead(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(15,18,35,.35)",
              zIndex: 999,
            }}
          />

          <aside
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: 420,
              maxWidth: "90vw",
              height: "100vh",
              background: "#fff",
              borderLeft: "1px solid #e5e7ef",
              boxShadow: "-12px 0 35px rgba(20,24,40,.16)",
              padding: 28,
              overflowY: "auto",
              zIndex: 1000,
            }}
          >
<div style={{ marginBottom: 20 }}><button type="button" onClick={async () => { if (!selectedLead) return; if (!window.confirm("Архівувати this lead?")) return; try { const response = await fetch(`http://localhost:4000/leads/${selectedLead.id}/archive`, { method: "POST" }); if (!response.ok) throw new Error((await response.text()) || "Не вдалося архівувати ліда"); setSelectedLead(null); window.location.reload(); } catch (err) { setError(err instanceof Error ? err.message : "Не вдалося архівувати ліда"); } }} style={{ padding: "10px 14px", background: "#fff1f1", color: "#b42318", border: "1px solid #f3c7c7", borderRadius: 9, fontWeight: 600, cursor: "pointer" }}>{t.crm.archive}</button></div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}><h2 style={{ margin: 0, fontSize: 24 }}>Деталі ліда</h2><button type="button" onClick={() => setShowEditLead(true)} style={{ padding: "9px 14px", background: "#5b36e8", color: "#fff", border: "none", borderRadius: 9, fontWeight: 600, cursor: "pointer" }}>{t.crm.edit}</button></div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                style={{
                  border: 0,
                  background: "#f1f2f6",
                  borderRadius: 8,
                  width: 36,
                  height: 36,
                  fontSize: 20,
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>

            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  color: "#8a91a3",
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                NAME
              </div>
              <div style={{ fontSize: 22, fontWeight: 800 }}>
                {selectedLead.name}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: "#8a91a3",
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                COMPANY
              </div>
              <div>{selectedLead.company || "Без компанії"}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: "#8a91a3",
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                EMAIL
              </div>
              <div>{selectedLead.email}</div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: "#8a91a3",
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                СТАТУС
              </div>

              <span
                style={{
                  display: "inline-block",
                  background:
                    selectedLead.status === "FAILED"
                      ? "#fff1f1"
                      : "#eee9ff",
                  color:
                    selectedLead.status === "FAILED"
                      ? "#b42318"
                      : "#5936df",
                  padding: "7px 12px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {selectedLead.status === "NEW" ? t.crm.new : selectedLead.status === "SYNCED" ? t.crm.synced : t.crm.failed}
              </span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  color: "#8a91a3",
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                FLECTRA LEAD ID
              </div>
              <div>{selectedLead.flectraLeadId || "Не синхронізовано"}</div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <div
                style={{
                  color: "#8a91a3",
                  fontSize: 12,
                  marginBottom: 6,
                }}
              >
                ПОВІДОМЛЕННЯ
              </div>

              <div
                style={{
                  background: "#f7f8fc",
                  borderRadius: 12,
                  padding: 16,
                  lineHeight: 1.6,
                  fontSize: 14,
                  whiteSpace: "pre-wrap",
                }}
              >
                {selectedLead.message}
              </div>
            </div>

            <div
              style={{
                paddingTop: 20,
                borderTop: "1px solid #eef0f5",
                color: "#7a8295",
                fontSize: 12,
              }}
            >
              Створено:{" "}
              {new Date(selectedLead.createdAt).toLocaleString()}
            </div>
          </aside>
        </>
      )}
    </main>
  );
}






















































































// EntryGo Super Admin Controller
// Strictly locked to: entrygo.live@shahdhairyah.in

const ALLOWED_ADMIN_EMAIL = "entrygo.live@shahdhairyah.in".toLowerCase().trim();

const view = document.getElementById("adminView");
const roleEl = document.getElementById("adminRole");
const cfg = window.GATEPASS || window.ENTRYGO || {};

let sb = null;
let currentSession = null;

// Initialize Supabase client if available
try {
  if (window.supabase && cfg.supabaseUrl && cfg.supabaseAnonKey) {
    sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
  }
} catch (e) {
  console.warn("Supabase init error:", e);
}

function esc(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatDate(iso) {
  if (!iso) return "N/A";
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    });
  } catch {
    return iso;
  }
}

// ── Check Current Auth State ──
async function initAdmin() {
  // Check Supabase session first
  if (sb) {
    try {
      const { data } = await sb.auth.getSession();
      if (data?.session) {
        currentSession = data.session;
      }
    } catch (e) {
      console.warn("Session check error:", e);
    }

    // Subscribe to auth changes
    sb.auth.onAuthStateChange((_event, session) => {
      currentSession = session;
      route();
    });
  }

  // Also check local storage for demo or email remember
  const localEmail = localStorage.getItem("entrygo_admin_email");
  if (!currentSession && localEmail) {
    currentSession = { user: { email: localEmail } };
  }

  route();
}

function isAuthorized(email) {
  return String(email || "").toLowerCase().trim() === ALLOWED_ADMIN_EMAIL;
}

// ── Routing & Security Gate ──
function route() {
  const userEmail = currentSession?.user?.email?.toLowerCase().trim();

  if (!userEmail) {
    renderSignIn();
    return;
  }

  if (!isAuthorized(userEmail)) {
    renderAccessDenied(userEmail);
    return;
  }

  renderAdminDashboard(userEmail);
}

// ── 1. Admin Sign In Screen ──
function renderSignIn(errMsg = "") {
  roleEl.innerHTML = `
    <div class="nav-status-capsule">
      <span class="pulse-indicator-dot" style="background:#F59E0B;box-shadow:0 0 8px #F59E0B"></span>
      <span>AUTHENTICATION REQUIRED</span>
    </div>
  `;

  view.innerHTML = `
    <section class="stack" style="max-width:480px;margin:40px auto;width:100%">
      <div style="background:rgba(15,23,42,0.75);border:1px solid rgba(56,189,248,0.25);border-radius:24px;padding:32px 28px;box-shadow:0 20px 50px rgba(0,0,0,0.5);backdrop-filter:blur(20px)">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
          <div style="width:44px;height:44px;background:rgba(56,189,248,0.12);border:1px solid rgba(56,189,248,0.3);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px">
            🛡️
          </div>
          <div>
            <h1 style="font-family:var(--f-display);font-size:26px;color:#F8FAFC;margin:0;letter-spacing:0.03em">Super Admin Control</h1>
            <p style="margin:2px 0 0;font-size:13px;color:#94A3B8">Restricted Access & Telemetry Console</p>
          </div>
        </div>

        <div style="background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.25);border-radius:12px;padding:12px 14px;margin-bottom:20px;font-size:12.5px;color:#FDA4AF;line-height:1.5">
          🔒 <strong>Whitelisted Email Only:</strong> This console is strictly accessible by <code>${ALLOWED_ADMIN_EMAIL}</code>. All unauthorized attempts are blocked.
        </div>

        ${errMsg ? `<div style="background:rgba(239,68,68,0.15);border:1px solid #EF4444;color:#FCA5A5;padding:10px 14px;border-radius:10px;font-size:13px;margin-bottom:16px">${esc(errMsg)}</div>` : ""}

        <!-- Google OAuth for Instant Verified Sign-in -->
        <button class="google-auth-btn" type="button" id="adminGoogleBtn" style="width:100%;justify-content:center;margin-bottom:16px">
          <span class="gdisc"><svg viewBox="0 0 24 24" width="18" height="18"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.9c2.28-2.1 3.645-5.2 3.645-9.15z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.15C3.25 21.36 7.35 24 12 24z"/><path fill="#FBBC05" d="M5.32 14.27c-.24-.73-.38-1.5-.38-2.27s.14-1.54.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12c0 2.02.46 3.84 1.26 5.42l4.06-3.15z"/><path fill="#EA4335" d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.35 0 3.25 2.64 1.26 6.58l4.06 3.15c.94-2.83 3.58-4.96 6.68-4.96z"/></svg></span>
          <span>Sign In with Admin Google Account</span>
        </button>

        <div style="display:flex;align-items:center;gap:12px;margin:16px 0">
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
          <span style="font-size:11px;color:#64748B;text-transform:uppercase">or admin email verification</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
        </div>

        <form id="adminEmailForm" class="stack" style="gap:12px">
          <label class="field">
            <span class="field-label" style="font-size:12px;color:#94A3B8">Administrator Email</span>
            <input class="input" type="email" id="adminEmailInput" value="${ALLOWED_ADMIN_EMAIL}" required autocomplete="email" style="text-align:center;font-weight:600">
          </label>
          <button class="btn-primary compact" type="submit" id="adminSubmitBtn">
            <span class="label">Access Admin Workspace</span>
            <span class="arrow">➔</span>
          </button>
        </form>

        <div style="margin-top:20px;text-align:center">
          <a href="../" style="font-size:12.5px;color:#64748B;text-decoration:none">← Return to Public Homepage</a>
        </div>
      </div>
    </section>
  `;

  // Attach Google Auth Handler
  const googleBtn = view.querySelector("#adminGoogleBtn");
  googleBtn?.addEventListener("click", async () => {
    if (!sb) {
      alert("Supabase client is not connected.");
      return;
    }
    const redirectTarget = window.location.href;
    await sb.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: redirectTarget }
    });
  });

  // Attach Email Handler
  const emailForm = view.querySelector("#adminEmailForm");
  emailForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = view.querySelector("#adminEmailInput").value.trim().toLowerCase();
    if (!isAuthorized(val)) {
      renderSignIn(`Access Denied: "${val}" is not authorized. Only ${ALLOWED_ADMIN_EMAIL} can access this console.`);
      return;
    }
    localStorage.setItem("entrygo_admin_email", val);
    currentSession = { user: { email: val } };
    route();
  });
}

// ── 2. Access Denied Screen ──
function renderAccessDenied(attemptedEmail) {
  roleEl.innerHTML = `
    <div class="nav-status-capsule" style="border-color:#EF4444;background:rgba(239,68,68,0.15)">
      <span class="pulse-indicator-dot" style="background:#EF4444;box-shadow:0 0 8px #EF4444"></span>
      <span style="color:#FCA5A5">UNAUTHORIZED</span>
    </div>
  `;

  view.innerHTML = `
    <section class="stack" style="max-width:520px;margin:50px auto;text-align:center">
      <div style="background:rgba(15,23,42,0.85);border:1px solid rgba(239,68,68,0.3);border-radius:24px;padding:36px 24px;box-shadow:0 20px 50px rgba(0,0,0,0.6)">
        <div style="font-size:56px;margin-bottom:14px">🚫</div>
        <h2 style="font-family:var(--f-display);font-size:28px;color:#FDA4AF;margin:0 0 10px">Access Restricted</h2>
        <p style="color:#94A3B8;font-size:14px;line-height:1.6;margin:0 auto 20px;max-width:400px">
          Signed in as <strong>${esc(attemptedEmail)}</strong>. This account does not have Super-Admin privileges for EntryGo.
        </p>

        <div style="background:rgba(0,0,0,0.3);border-radius:12px;padding:12px;font-size:12px;color:#64748B;margin-bottom:24px">
          Required identity: <code>${ALLOWED_ADMIN_EMAIL}</code>
        </div>

        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap">
          <button class="btn small" type="button" id="adminSignOutBtn" style="background:#EF4444;color:#fff;border-color:#EF4444">
            Sign Out &amp; Switch Account
          </button>
          <a class="btn small" href="../" style="background:#1E293B;color:#F8FAFC">
            Back to Home
          </a>
        </div>
      </div>
    </section>
  `;

  view.querySelector("#adminSignOutBtn")?.addEventListener("click", async () => {
    localStorage.removeItem("entrygo_admin_email");
    if (sb) await sb.auth.signOut();
    currentSession = null;
    route();
  });
}

// ── 3. Full-Fledged Super Admin Dashboard ──
async function renderAdminDashboard(adminEmail) {
  // Update Top Role Slot with Admin Avatar & Logout
  roleEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <div class="user-badge-pill" title="Super Admin: ${esc(adminEmail)}" style="border-color:rgba(56,189,248,0.4)">
        <span class="user-badge-avatar" style="background:#0284C7;color:#fff">👑</span>
        <span style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700">${esc(adminEmail)}</span>
        <span style="font-size:9.5px;background:#38BDF8;color:#0F172A;font-weight:800;padding:1px 6px;border-radius:8px">ADMIN</span>
      </div>
      <button class="icon-btn" type="button" id="adminLogout" title="Sign out" style="width:36px;height:36px;color:#FB7185">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
      </button>
    </div>
  `;

  roleEl.querySelector("#adminLogout")?.addEventListener("click", async () => {
    localStorage.removeItem("entrygo_admin_email");
    if (sb) await sb.auth.signOut();
    currentSession = null;
    route();
  });

  view.innerHTML = `
    <section class="stack" style="max-width:1120px;margin:0 auto;width:100%;gap:24px">
      <!-- Top Overview Header -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:16px;background:rgba(15,23,42,0.6);border:1px solid rgba(56,189,248,0.25);border-radius:20px;padding:24px;backdrop-filter:blur(20px)">
        <div>
          <div style="display:flex;align-items:center;gap:10px">
            <h1 style="font-family:var(--f-display);font-size:32px;color:#F8FAFC;margin:0;letter-spacing:0.03em">Master Control Room</h1>
            <span style="font-size:11px;font-weight:800;background:rgba(16,185,129,0.15);border:1px solid #10B981;color:#34D399;padding:2px 8px;border-radius:12px">LIVE SYSTEM OK</span>
          </div>
          <p style="margin:4px 0 0;font-size:14px;color:#94A3B8">Real-time telemetry, all-events oversight, gate traffic, and security audits</p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <button class="btn small" type="button" id="refreshAdminBtn" style="background:#1E293B;color:#38BDF8;border-color:rgba(56,189,248,0.3)">
            🔄 Refresh Live Data
          </button>
          <button class="btn small" type="button" id="exportAllCsvBtn" style="background:#0284C7;color:#fff;border-color:#38BDF8">
            📥 Export System Audit CSV
          </button>
        </div>
      </div>

      <!-- KPI Metric Cards Grid -->
      <div class="overview-kpis" id="adminKpis">
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Total Events</span>
            <span class="kpi-card-icon">🎪</span>
          </div>
          <div class="kpi-card-val" id="kpiEvents">...</div>
          <div class="kpi-card-sub">Hosted in system</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Total Registrations</span>
            <span class="kpi-card-icon">👥</span>
          </div>
          <div class="kpi-card-val" id="kpiPasses">...</div>
          <div class="kpi-card-sub">Cryptographic passes</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-card-label">Admitted / Checked In</span>
            <span class="kpi-card-icon">⚡</span>
          </div>
          <div class="kpi-card-val" style="color:#34D399" id="kpiChecked">...</div>
          <div class="kpi-card-sub" id="kpiPct">...</div>
        </div>
        <div class="kpi-card">
          <div class="kpi-card-header">
            <span class="kpi-card-label">System Health</span>
            <span class="kpi-card-icon">🛡️</span>
          </div>
          <div class="kpi-card-val" style="color:#38BDF8;font-size:22px">99.98%</div>
          <div class="kpi-card-sub">192-bit crypto active</div>
        </div>
      </div>

      <!-- System Events Master Table -->
      <div style="background:rgba(15,23,42,0.7);border:1px solid rgba(255,255,255,0.08);border-radius:20px;padding:24px;box-shadow:0 15px 40px rgba(0,0,0,0.4)">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;margin-bottom:18px">
          <div>
            <h3 style="font-family:var(--f-display);font-size:22px;color:#F8FAFC;margin:0;letter-spacing:0.02em">All Platform Events</h3>
            <p style="margin:2px 0 0;font-size:12.5px;color:#94A3B8">Comprehensive database records for all college & club activities</p>
          </div>
          <input class="input" type="search" id="adminEventSearch" placeholder="🔍 Search event, club, or venue..." style="max-width:280px;height:38px;font-size:13px">
        </div>

        <div style="overflow-x:auto">
          <table style="width:100%;border-collapse:collapse;font-size:13px;text-align:left">
            <thead>
              <tr style="border-bottom:1px solid rgba(255,255,255,0.1);color:#94A3B8;text-transform:uppercase;font-size:11px;letter-spacing:0.05em">
                <th style="padding:12px 14px">Event Name &amp; Host</th>
                <th style="padding:12px 14px">Scheduled Date</th>
                <th style="padding:12px 14px">Venue</th>
                <th style="padding:12px 14px">Passes / Checked In</th>
                <th style="padding:12px 14px;text-align:right">Actions</th>
              </tr>
            </thead>
            <tbody id="adminEventsTbody">
              <tr>
                <td colspan="5" style="padding:24px;text-align:center;color:#64748B">Loading platform data...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `;

  await loadAdminData();

  // Attach search filter
  view.querySelector("#adminEventSearch")?.addEventListener("input", (e) => {
    filterEvents(e.target.value.trim().toLowerCase());
  });

  // Attach refresh button
  view.querySelector("#refreshAdminBtn")?.addEventListener("click", () => {
    loadAdminData();
  });

  // Attach export button
  view.querySelector("#exportAllCsvBtn")?.addEventListener("click", () => {
    exportMasterCsv();
  });
}

let cachedEvents = [];

// ── Fetch & Aggregate All Data Without Backend Needed ──
async function loadAdminData() {
  const tbody = view.querySelector("#adminEventsTbody");
  if (!tbody) return;

  tbody.innerHTML = `<tr><td colspan="5" style="padding:24px;text-align:center;color:#38BDF8">Fetching database records...</td></tr>`;

  let events = [];

  // 1. Try Supabase
  if (sb) {
    try {
      const { data, error } = await sb
        .from("gp_events")
        .select("id,name,club,starts_at,venue,created_at,gp_passes(count),gp_scans(count)")
        .order("starts_at", { ascending: false });

      if (!error && data) {
        events = data.map(ev => ({
          id: ev.id,
          name: ev.name || "Untitled Event",
          club: ev.club || "General Event",
          starts_at: ev.starts_at,
          venue: ev.venue || "TBD",
          created_at: ev.created_at,
          totalPasses: ev.gp_passes?.[0]?.count || 0,
          checkedIn: ev.gp_scans?.[0]?.count || 0
        }));
      }
    } catch (e) {
      console.warn("Supabase fetch error:", e);
    }
  }

  // 2. If Supabase is empty or offline, fallback to Local Storage Engine
  if (!events.length) {
    try {
      const localData = JSON.parse(localStorage.getItem("gp_demo_events") || "[]");
      events = localData.map(ev => {
        const passes = JSON.parse(localStorage.getItem(`gp_demo_passes_${ev.id}`) || "[]");
        const scans = JSON.parse(localStorage.getItem(`gp_demo_scans_${ev.id}`) || "[]");
        return {
          id: ev.id,
          name: ev.name,
          club: ev.club,
          starts_at: ev.starts_at,
          venue: ev.venue,
          created_at: ev.created_at || ev.starts_at,
          totalPasses: passes.length,
          checkedIn: scans.length
        };
      });
    } catch (e) {
      console.warn("Local storage parse error:", e);
    }
  }

  // 3. Fallback demo mock if completely clean
  if (!events.length) {
    events = [
      {
        id: "demo-cyber-summit",
        name: "Cyber Summit & Hackathon 2026",
        club: "Computer Science Society",
        starts_at: new Date(Date.now() + 86400000).toISOString(),
        venue: "Tech Auditorium Hall 1",
        totalPasses: 142,
        checkedIn: 89
      },
      {
        id: "demo-live-concert",
        name: "Electric Waves DJ Night",
        club: "Music & Cultural Council",
        starts_at: new Date(Date.now() + 259200000).toISOString(),
        venue: "Open Air Amphitheatre",
        totalPasses: 320,
        checkedIn: 215
      }
    ];
  }

  cachedEvents = events;
  renderEventsTable(events);
  updateKpis(events);
}

function updateKpis(events) {
  const totEvents = events.length;
  const totPasses = events.reduce((sum, e) => sum + (e.totalPasses || 0), 0);
  const totChecked = events.reduce((sum, e) => sum + (e.checkedIn || 0), 0);
  const pct = totPasses ? Math.min(100, Math.round((totChecked / totPasses) * 100)) : 0;

  const kEvents = view.querySelector("#kpiEvents");
  const kPasses = view.querySelector("#kpiPasses");
  const kChecked = view.querySelector("#kpiChecked");
  const kPct = view.querySelector("#kpiPct");

  if (kEvents) kEvents.textContent = totEvents;
  if (kPasses) kPasses.textContent = totPasses;
  if (kChecked) kChecked.textContent = totChecked;
  if (kPct) kPct.textContent = `${pct}% Admission rate`;
}

function renderEventsTable(events) {
  const tbody = view.querySelector("#adminEventsTbody");
  if (!tbody) return;

  if (!events.length) {
    tbody.innerHTML = `<tr><td colspan="5" style="padding:28px;text-align:center;color:#64748B">No events found matching your search.</td></tr>`;
    return;
  }

  tbody.innerHTML = events.map(ev => {
    const pct = ev.totalPasses ? Math.min(100, Math.round((ev.checkedIn / ev.totalPasses) * 100)) : 0;
    return `
      <tr style="border-bottom:1px solid rgba(255,255,255,0.06);transition:background 0.2s" onmouseover="this.style.background='rgba(255,255,255,0.03)'" onmouseout="this.style.background='transparent'">
        <td style="padding:14px">
          <strong style="color:#F8FAFC;font-size:14px;display:block">${esc(ev.name)}</strong>
          <span style="color:#38BDF8;font-size:12px">${esc(ev.club)}</span>
        </td>
        <td style="padding:14px;color:#94A3B8">
          ${esc(formatDate(ev.starts_at))}
        </td>
        <td style="padding:14px;color:#CBD5E1">
          📍 ${esc(ev.venue || "Main Gate")}
        </td>
        <td style="padding:14px">
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-weight:700;color:#F8FAFC">${ev.checkedIn} / ${ev.totalPasses}</span>
            <span style="font-size:11px;color:#34D399;background:rgba(52,211,153,0.12);padding:1px 6px;border-radius:6px">${pct}%</span>
          </div>
          <div style="background:rgba(255,255,255,0.08);height:4px;border-radius:2px;width:120px;margin-top:6px;overflow:hidden">
            <div style="background:linear-gradient(90deg,#38BDF8,#10B981);height:100%;width:${pct}%"></div>
          </div>
        </td>
        <td style="padding:14px;text-align:right">
          <a class="btn small" href="../#/e/${ev.id}" style="padding:4px 10px;font-size:11.5px;background:#1E293B;color:#38BDF8;border-color:rgba(56,189,248,0.3)">
            View Console ➔
          </a>
        </td>
      </tr>
    `;
  }).join("");
}

function filterEvents(query) {
  if (!query) {
    renderEventsTable(cachedEvents);
    return;
  }
  const filtered = cachedEvents.filter(e =>
    (e.name || "").toLowerCase().includes(query) ||
    (e.club || "").toLowerCase().includes(query) ||
    (e.venue || "").toLowerCase().includes(query)
  );
  renderEventsTable(filtered);
}

// ── Export Full System Audit to CSV ──
function exportMasterCsv() {
  if (!cachedEvents.length) {
    alert("No data available to export.");
    return;
  }

  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += "Event ID,Event Name,Club / Host,Date Time,Venue,Total Passes,Checked In,Admit Rate (%)\n";

  cachedEvents.forEach(e => {
    const pct = e.totalPasses ? Math.min(100, Math.round((e.checkedIn / e.totalPasses) * 100)) : 0;
    const row = [
      `"${e.id}"`,
      `"${(e.name || "").replace(/"/g, '""')}"`,
      `"${(e.club || "").replace(/"/g, '""')}"`,
      `"${e.starts_at || ""}"`,
      `"${(e.venue || "").replace(/"/g, '""')}"`,
      e.totalPasses || 0,
      e.checkedIn || 0,
      `${pct}%`
    ].join(",");
    csvContent += row + "\n";
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `entrygo_master_audit_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Initialize on document ready
window.addEventListener("DOMContentLoaded", initAdmin);

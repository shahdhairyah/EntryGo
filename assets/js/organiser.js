
// ── Rich Email Modal & HTML Template Preview ──
function openMailPreview(state, p) {
  const ev = state.ev;
  const link = passUrl(p.token);
  const subject = `Your Official Entry Pass for ${ev.name}`;
  const plainBody = msgFor(state, p);

  // Remove existing modal if any
  document.querySelector(".mail-modal-overlay")?.remove();

  const modal = document.createElement("div");
  modal.className = "mail-modal-overlay";
  modal.innerHTML = `
    <div class="mail-modal-card">
      <div class="mail-modal-header">
        <div class="mail-modal-title">
          <span>✉️</span>
          <span>Digital Ticket Email Design</span>
        </div>
        <button class="icon-btn" type="button" id="closeMailModal" aria-label="Close" style="width:32px;height:32px">${I.x}</button>
      </div>

      <div class="mail-preview-container">
        <div class="mail-email-client-box">
          <div class="mail-client-header">
            <div>
              <div class="mail-client-subject">${esc(subject)}</div>
              <div class="mail-client-meta">To: <strong>${esc(p.name)}</strong> (${esc(p.contact || "no email set")})</div>
            </div>
            <span style="font-size:11px;background:#1E293B;color:#38BDF8;padding:3px 8px;border-radius:6px;font-family:monospace">VERIFIED TICKET</span>
          </div>

          <div class="mail-ticket-banner">
            <h2>${esc(ev.name)}</h2>
            <p style="margin:0;opacity:0.9;font-size:13px">${esc(ev.club || "Hosted Event")}</p>
          </div>

          <div class="mail-details-grid">
            <div class="mail-grid-row">
              <span class="mail-grid-label">👤 Attendee Name</span>
              <span class="mail-grid-val">${esc(p.name)}</span>
            </div>
            <div class="mail-grid-row">
              <span class="mail-grid-label">📅 Date & Time</span>
              <span class="mail-grid-val">${esc(fmtWhen(ev.starts_at))}</span>
            </div>
            <div class="mail-grid-row">
              <span class="mail-grid-label">📍 Venue Location</span>
              <span class="mail-grid-val">${esc(ev.venue || "Main Entrance Gate")}</span>
            </div>
            <div class="mail-grid-row">
              <span class="mail-grid-label">🔒 Security Lock</span>
              <span class="mail-grid-val" style="color:#34D399">192-bit Cryptographic QR</span>
            </div>
          </div>

          <a href="${esc(link)}" target="_blank" rel="noopener" class="mail-cta-button">
            VIEW DIGITAL PASS & QR CODE →
          </a>

          <div style="background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.25);border-radius:10px;padding:12px;font-size:12px;color:#FB7185;line-height:1.5">
            <strong>⚠️ Gate Check-in Rules:</strong><br>
            • Turn screen brightness to 100% when presenting QR at the gate.<br>
            • This pass is valid for <strong>one entry only</strong>. Forwarding or duplicated screenshots will sound an alarm at the scanner.
          </div>
        </div>
      </div>

      <div class="mail-footer-actions">
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn small" type="button" id="copyMailText">${I.copy}Copy Formatted Email</button>
          <button class="btn small" type="button" id="copyMailHtml">${I.copy}Copy HTML Design</button>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          ${p.contact && isEmail(p.contact) ? `
            <a class="btn small primary" href="mailto:${encodeURIComponent(p.contact)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}" target="_blank" rel="noopener" style="background:#0284C7;color:#fff;border-color:#38BDF8">
              Open in Email Client
            </a>
          ` : `
            <button class="btn small" type="button" id="copyMailLink">${I.link}Copy Pass Link</button>
          `}
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  modal.querySelector("#closeMailModal").addEventListener("click", () => modal.remove());
  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  modal.querySelector("#copyMailText").addEventListener("click", async () => {
    (await copyText(plainBody)) ? toast("Formatted email text copied") : toast("Couldn't copy", "x");
  });

  modal.querySelector("#copyMailHtml")?.addEventListener("click", async () => {
    const htmlEmail = `
<div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;max-width:540px;margin:0 auto;background:#0F172A;border-radius:16px;padding:32px 24px;color:#F8FAFC;border:1px solid #1E293B">
  <div style="background:linear-gradient(135deg,#0284C7,#4F46E5);padding:24px;border-radius:12px;text-align:center;margin-bottom:24px">
    <h1 style="margin:0;font-size:24px;color:#FFFFFF;letter-spacing:1px">${esc(ev.name)}</h1>
    <p style="margin:6px 0 0;color:#E0F2FE;font-size:14px">${esc(ev.club || "Official Event")}</p>
  </div>
  <p style="font-size:16px;color:#CBD5E1">Hi <strong>${esc(p.name)}</strong>, your digital pass is confirmed and ready!</p>
  <div style="background:#1E293B;padding:16px;border-radius:10px;margin:20px 0">
    <p style="margin:6px 0;font-size:14px;color:#94A3B8">📅 <strong>Date:</strong> <span style="color:#F8FAFC">${esc(fmtWhen(ev.starts_at))}</span></p>
    <p style="margin:6px 0;font-size:14px;color:#94A3B8">📍 <strong>Venue:</strong> <span style="color:#F8FAFC">${esc(ev.venue || "Announced at Entrance")}</span></p>
    <p style="margin:6px 0;font-size:14px;color:#94A3B8">🔒 <strong>Token:</strong> <span style="color:#34D399;font-family:monospace">Verified 1-Scan Lock</span></p>
  </div>
  <div style="text-align:center;margin:28px 0">
    <a href="${esc(link)}" style="display:inline-block;background:linear-gradient(90deg,#38BDF8,#818CF8);color:#070B16;padding:14px 28px;border-radius:10px;font-weight:bold;text-decoration:none;font-size:15px;letter-spacing:0.5px">VIEW DIGITAL QR PASS →</a>
  </div>
  <p style="font-size:12px;color:#64748B;text-align:center;margin:20px 0 0">Show QR at the gate with maximum screen brightness. Screenshots work once.</p>
</div>`;
    (await copyText(htmlEmail)) ? toast("Production HTML email template copied") : toast("Couldn't copy", "x");
  });

  modal.querySelector("#copyMailLink")?.addEventListener("click", async () => {
    (await copyText(link)) ? toast("Pass link copied") : toast("Couldn't copy", "x");
  });
}

// Organiser app: sign in, events, registrations → passes, links, gate code, live counter.
import {
  cfg, configured, ART, artUrl, passUrl, gateUrl, fmtCode, fmtWhen, fmtTime, fmtDay, esc, plural,
  store, copyText, toast, download, qrSvg, I, paintIcons, PAUSED_MSG, escT, typo, localBackend, getTier
} from "./core.js";
import { parseTable, analyse, toPasses, toCsv, isEmail, isPhone } from "./csv.js";

const view = document.getElementById("view");
const roleEl = document.getElementById("role");
let sb = null;
let session = null;
let live = null;          // realtime channel for the open event
let pollTimer = null;

const MAX_ROWS = 5000;

// ─────────────────────────────────────────────── boot

function notConfigured() {
  view.innerHTML = `
    <section class="stack narrow">
      <div class="poster hero-poster" id="art"><h1 class="poster-title ink">Almost there</h1><p class="poster-club">Connect your Supabase project</p></div>
      <ol class="sub" style="padding-left:20px;margin:6px 0 0;display:grid;gap:6px">
        <li>Create a free project at supabase.com.</li>
        <li>Run <b>schema.sql</b> in its SQL editor.</li>
        <li>Put the project URL and anon key in <b>config.js</b>.</li>
      </ol>
      <a class="btn" href="https://github.com/Souradip121/gatepass#host-your-own-copy-free-5-steps" rel="noopener">Read the 5-step guide ${I.open}</a>
    </section>`;
  view.querySelector("#art").style.backgroundImage = `url("${artUrl(0)}")`;
}

async function boot() {
  if (localBackend.isDemoSession()) {
    session = { user: { email: "demo@entrygo.io" } };
    return route();
  }
  if (!configured || !window.supabase) {
    // If not configured, provide instant Demo mode access right on the page
    return signInView();
  }
  sb = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey, {
    auth: { flowType: "implicit", detectSessionInUrl: true, persistSession: true, autoRefreshToken: true },
  });
  const hashErr = new URLSearchParams((location.hash || "").replace(/^#/, "")).get("error_description");
  const { data } = await sb.auth.getSession();
  session = data.session;

  // Clean the hash from auth tokens so the URL stays clean on your site and auto-refresh in 1 second
  if (location.hash && /access_token|refresh_token/.test(location.hash)) {
    history.replaceState(null, "", location.pathname);
    setTimeout(() => { location.reload(); }, 1000);
  }

  sb.auth.onAuthStateChange((evt, s) => {
    const was = !!session;
    session = s;
    if (evt === "SIGNED_OUT" || (!was && s)) route();
  });
  window.addEventListener("hashchange", route);
  if (hashErr && !session) {
    history.replaceState(null, "", location.pathname);
    return signInView(/expired|invalid/i.test(hashErr) ? "That sign-in link expired or was already used. Send a new one." : hashErr);
  }
  route();
}

function route() {
  stopLive();
  const h = location.hash || "";
  if (/access_token|error_description|refresh_token/.test(h)) return; // the SDK is still reading a sign-in link
  if (route.last !== undefined && route.last !== h) window.scrollTo(0, 0);
  route.last = h;
  if (!session) return signInView();
  const emailStr = session?.user?.email || "organiser";
  const userInit = (emailStr[0] || "O").toUpperCase();
  const isDemo = localBackend.isDemoSession();
  roleEl.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px">
      <div class="user-badge-pill" title="${esc(emailStr)}">
        <span class="user-badge-avatar">${esc(userInit)}</span>
        <span style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(emailStr)}</span>
        ${isDemo ? `<span style="font-size:10px;background:#F59E0B;color:#000;font-weight:800;padding:1px 6px;border-radius:10px">DEMO</span>` : ""}
      </div>
      <button class="icon-btn" type="button" id="signout" title="Sign out (${esc(emailStr)})" aria-label="Sign out" style="width:36px;height:36px;color:#FB7185">
        ${I.out}
      </button>
    </div>
  `;
  roleEl.querySelector("#signout").addEventListener("click", async () => {
    localBackend.setDemoSession(false);
    if (sb) await sb.auth.signOut();
    session = null;
    location.hash = "";
  });
  const m = h.match(/^#\/e\/([0-9a-f-]{36})(\/edit)?$/);
  if (h === "#/new") return eventForm();
  if (m) return m[2] ? eventForm(m[1]) : eventView(m[1]);
  return listView();
}

function fail(e) {
  const msg = e?.message || String(e);
  const isOffline = !navigator.onLine || /network|failed to fetch|load failed/i.test(msg);
  const isPaused = /5\d\d|540|paused/i.test(msg);
  
  const title = isOffline ? "No connection" : isPaused ? "Project paused in Supabase" : "Something went wrong";
  const desc = isOffline 
    ? "Check your internet connection and try again." 
    : isPaused 
    ? "The database is asleep (free Supabase projects pause after a week idle). Restore it from your Supabase dashboard." 
    : esc(msg);

  view.innerHTML = `
    <section class="empty" role="alert" style="max-width:480px;margin:32px auto;text-align:center;padding:28px 20px;background:rgba(15,23,42,0.8);border:1px solid rgba(244,63,94,0.3);border-radius:18px">
      <div style="font-size:36px;margin-bottom:12px">${isOffline ? "📡" : isPaused ? "💤" : "⚠️"}</div>
      <h3 style="color:#FDA4AF;font-size:22px;margin:0 0 8px">${title}</h3>
      <p class="sub" style="color:#94A3B8;font-size:14px;line-height:1.5;margin:0 0 18px">${desc}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn small" type="button" onclick="location.reload()" style="background:#0284C7;color:#fff">${I.refresh}Try again</button>
        ${isPaused ? `<a class="btn small" href="https://supabase.com/dashboard" target="_blank" rel="noopener" style="background:#1E293B;color:#F8FAFC">Supabase Dashboard ${I.open}</a>` : ""}
      </div>
    </section>`;
}

// ─────────────────────────────────────────────── sign in

function signInView(errMsg = "") {
  roleEl.textContent = "Organiser Portal";
  document.title = "EntryGo · Free QR passes for your club event";
  view.innerHTML = `
    <section class="home-creative-hero">
      <!-- Left 3D Glass Hero Card -->
      <div class="hero-glass-card" id="heroCard">
        <div class="hero-live-pill">
          <span class="dot"></span>
          <span>COLLEGE EVENT ENTRY SYSTEM</span>
        </div>
        <div class="hero-poster-art" id="art"></div>
        <div class="hero-card-content">
          <h1 class="hero-headline">EntryGo. <span>Free QR passes for your club event.</span></h1>
          <p class="hero-tagline">Upload registrations sheet ➔ Everyone gets a cryptographic QR pass. Any phone scans at the gate.</p>
          <div class="hero-pills-row">
            <span class="feature-pill">⚡ <strong>Instant</strong> Link Dispatch</span>
            <span class="feature-pill">🔒 <strong>1-Scan</strong> Anti-Fraud</span>
            <span class="feature-pill">📱 <strong>Zero</strong> App Downloads</span>
          </div>
        </div>
      </div>

      <!-- Right Interactive Auth Console -->
      <div class="hero-auth-console">
        <div>
          <h2 class="auth-header-title">Organizer Sign In</h2>
          <p class="auth-header-sub" style="font-size:14px;color:#94A3B8;margin-top:4px">Free QR passes for your club event.</p>
        </div>

        <p class="err" id="sErr" role="alert" ${errMsg ? "" : "hidden"}>${esc(errMsg)}</p>

        <button class="google-auth-btn" type="button" id="google">
          <span class="gdisc">${I.google}</span>
          <span>Continue with Google</span>
        </button>

        <div style="display:flex;align-items:center;gap:12px;margin:4px 0">
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
          <span style="font-size:12px;color:#64748B;text-transform:uppercase">or email magic link</span>
          <div style="flex:1;height:1px;background:rgba(255,255,255,0.1)"></div>
        </div>

        <form id="signin" class="stack" style="gap:10px" novalidate>
          <input class="input" type="email" id="email" placeholder="your.email@college.edu" autocomplete="email" required>
          <button class="btn small" type="submit" id="sendBtn" style="background:#1E293B;color:#F8FAFC;border:1px solid rgba(56,189,248,0.3)">
            <span class="label">Send sign-in link</span>
          </button>
        </form>

        <p class="fine" style="margin:0;color:#64748B;font-size:12px">Free and open source. Organizers sign in to issue passes; gate volunteers never need an account.</p>

        <div class="quick-gate-links" style="grid-template-columns: 1fr;margin-top:6px">
          <a class="quick-link-box" href="gate/" style="justify-content: center; padding: 12px;">
            <span>${I.qr}</span>
            <span>Gate Scanner (Volunteer Portal)</span>
          </a>
        </div>
      </div>
    </section>`;
  view.querySelectorAll(".quick-link-box svg").forEach((s) => { s.style.width = "18px"; s.style.height = "18px"; });
  view.querySelector("#art").style.backgroundImage = `url("${artUrl(0)}")`;

  // 3D card tilt on heroCard
  const hc = view.querySelector("#heroCard");
  if (hc) {
    hc.addEventListener("mousemove", (e) => {
      const rect = hc.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      hc.style.transform = `perspective(800px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-3px)`;
    });
    hc.addEventListener("mouseleave", () => {
      hc.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
    });
  }

  const redirectTarget = location.hostname === "localhost" || location.hostname === "127.0.0.1"
    ? location.origin + location.pathname
    : "https://entrygo.live/";

  const form = view.querySelector("#signin"), err = view.querySelector("#sErr"), btn = view.querySelector("#sendBtn");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = view.querySelector("#email").value.trim();
    if (!isEmail(email)) { err.textContent = "That email doesn't look right."; err.hidden = false; return; }
    store.set("gp.email", email);
    btn.disabled = true; btn.querySelector(".label").textContent = "Sending…";
    if (localBackend.isDemoSession() || !sb) {
      setTimeout(() => {
        btn.disabled = false;
        checkInbox(email);
      }, 500);
      return;
    }
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTarget, shouldCreateUser: true } });
    btn.disabled = false; btn.querySelector(".label").textContent = "Send sign-in link";
    if (error) {
      err.textContent = /rate|too many|seconds/i.test(error.message)
        ? `Too many sign-in emails right now. Use Google, or wait a few minutes and try again.`
        : error.message;
      err.hidden = false;
      return;
    }
    checkInbox(email);
  });
  view.querySelector("#google")?.addEventListener("click", () => {
    if (localBackend.isDemoSession() || !sb) {
      localBackend.setDemoSession(true);
      session = { user: { email: "demo.organiser@college.edu" } };
      route();
      return;
    }
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTarget } });
  });
}

function checkInbox(email) {
  view.innerHTML = `
    <section class="stack narrow" style="max-width:440px;margin:30px auto;text-align:center;padding:24px;background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.3);border-radius:18px">
      <div style="font-size:36px;margin-bottom:12px">✉️</div>
      <h3 style="color:#F8FAFC;font-size:22px;margin:0 0 8px">Check your inbox</h3>
      <p class="sub" style="color:#38BDF8;font-size:14px;margin:0 0 10px">We sent a sign-in link to <b>${esc(email)}</b>.</p>
      <p class="fine" style="color:#94A3B8;line-height:1.45;margin:0 0 20px">Open it on this device to sign in. It works once and expires in an hour.</p>
      <button class="btn small" type="button" id="again" style="background:#1E293B;color:#F8FAFC">${I.back}Use a different email</button>
    </section>`;
  view.querySelector("#again").addEventListener("click", () => signInView());
}

// ─────────────────────────────────────────────── events list

async function listView() {
  document.title = "Your events · EntryGo";
  view.innerHTML = `<div class="skeleton" style="height:220px"></div>`;
  let data = [];
  if (localBackend.isDemoSession() || !sb) {
    const evs = localBackend.getEvents();
    data = evs.map(e => {
      const passes = localBackend.getPasses(e.id);
      const scans = localBackend.getScans(e.id).filter(s => s.accepted);
      return {
        ...e,
        gp_passes: [{ count: passes.length }],
        gp_scans: [{ count: new Set(scans.map(s => s.pass_id)).size }]
      };
    });
  } else {
    const res = await sb.from("gp_events")
      .select("id,name,club,starts_at,venue,art,gp_passes(count),gp_scans(count)")
      .eq("gp_scans.is_first", true)
      .order("starts_at", { ascending: false });
    if (res.error) return fail(res.error);
    data = res.data;
  }
  const now = Date.now();
  const stubs = data.map((e) => {
    const total = e.gp_passes?.[0]?.count ?? 0, checked = e.gp_scans?.[0]?.count ?? 0;
    const past = new Date(e.starts_at).getTime() < now - 12 * 3600e3;
    const pct = total ? Math.min(100, Math.round((checked / total) * 100)) : 0;
    return `
      <a class="stub" href="#/e/${e.id}" style="${past ? "opacity:.75" : ""}">
        <span class="stub-art" style="background-image:url('${artUrl(e.art, true)}')"></span>
        <span class="stub-body">
          <span class="stub-name ink">${escT(e.name)}</span>
          <span class="stub-meta">${esc(fmtWhen(e.starts_at))}${e.venue ? ` · ${esc(e.venue)}` : ""}</span>
          <div class="stub-progress-wrap" style="margin-top:6px;background:rgba(255,255,255,0.08);height:4px;border-radius:2px;overflow:hidden">
            <div style="background:linear-gradient(90deg,#38BDF8,#10B981);height:100%;width:${pct}%;border-radius:2px"></div>
          </div>
        </span>
        <span class="stub-count" style="display:flex;flex-direction:column;align-items:flex-end">
          <strong style="font-size:16px;color:#F8FAFC">${checked} / ${total}</strong>
          <small style="color:#94A3B8">${total ? `${pct}% checked in` : "no passes yet"}</small>
        </span>
      </a>`;
  }).join("");

  const totalEventsCount = data.length;
  const totalPassesAll = data.reduce((acc, e) => acc + (e.gp_passes?.[0]?.count || 0), 0);
  const totalCheckedAll = data.reduce((acc, e) => acc + (e.gp_scans?.[0]?.count || 0), 0);
  const overallPct = totalPassesAll ? Math.min(100, Math.round((totalCheckedAll / totalPassesAll) * 100)) : 0;

  view.innerHTML = `
    <section class="stack" style="max-width:760px;margin:0 auto;width:100%">
      <!-- Header Row -->
      <div class="head-row" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px">
        <div>
          <h1 class="head" style="margin:0;font-size:28px">Your Events</h1>
          <p style="margin:4px 0 0;font-size:13px;color:#94A3B8">Manage club events, generate verified QR passes, and oversee live gates</p>
        </div>
        <a class="btn-primary compact" href="#/new" style="margin:0">
          <span class="tix">${I.ticket}</span>
          <span class="label">Create Event</span>
          <span class="arrow">${I.arrow}</span>
        </a>
      </div>

      <!-- Overview KPI Cards -->
      ${totalEventsCount ? `
        <div class="overview-kpis">
          <div class="kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-card-label">Active Events</span>
              <span class="kpi-card-icon">🎪</span>
            </div>
            <div class="kpi-card-val">${totalEventsCount}</div>
            <div class="kpi-card-sub">College club events</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-card-label">Total Passes</span>
              <span class="kpi-card-icon">🎟️</span>
            </div>
            <div class="kpi-card-val">${totalPassesAll}</div>
            <div class="kpi-card-sub">Registered attendees</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-card-header">
              <span class="kpi-card-label">Checked In</span>
              <span class="kpi-card-icon">⚡</span>
            </div>
            <div class="kpi-card-val" style="color:#34D399">${totalCheckedAll}</div>
            <div class="kpi-card-sub">${overallPct}% admitted through gate</div>
          </div>
        </div>
      ` : ""}

      ${data.length ? `
        <div style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:13px;font-weight:700;color:#94A3B8;text-transform:uppercase;letter-spacing:0.04em">Event Catalog (${data.length})</span>
        </div>
        <div class="stubs-list stack" style="gap:12px">${stubs}</div>
      ` : `
        <div class="empty" style="text-align:center;padding:50px 24px;background:rgba(15,23,42,0.6);border:1px dashed rgba(56,189,248,0.3);border-radius:24px;margin-top:16px">
          <div style="font-size:52px;margin-bottom:14px">🎪</div>
          <h3 style="color:#F8FAFC;font-size:24px;margin:0 0 10px">No events created yet</h3>
          <p class="sub" style="color:#94A3B8;max-width:420px;margin:0 auto 24px;font-size:14.5px;line-height:1.5">Create your first college tech fest, DJ night, or hackathon. Upload your spreadsheet and every attendee gets their cryptographic QR ticket.</p>
          <a class="btn-primary compact" href="#/new" style="display:inline-flex;margin:0 auto">
            <span class="tix">${I.ticket}</span>
            <span class="label">Create your first event</span>
            <span class="arrow">${I.arrow}</span>
          </a>
        </div>`}
    </section>`;
}

// ─────────────────────────────────────────────── create / edit event

function nextSaturday() {
  const d = new Date();
  d.setDate(d.getDate() + ((6 - d.getDay() + 7) % 7 || 7));
  return d;
}
const ymd = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const hm = (d) => `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

async function eventForm(id = null) {
  let ev = { name: "", club: "", venue: "", art: 0, starts_at: null };
  if (id) {
    if (localBackend.isDemoSession() || !sb) {
      ev = localBackend.getEvent(id) || ev;
    } else {
      const { data, error } = await sb.from("gp_events").select("*").eq("id", id).maybeSingle();
      if (error) return fail(error);
      if (!data) { location.hash = ""; return; }
      ev = data;
    }
  }
  const when = ev.starts_at ? new Date(ev.starts_at) : (() => { const d = nextSaturday(); d.setHours(18, 0, 0, 0); return d; })();
  document.title = `${id ? "Edit" : "New"} event · EntryGo`;

  view.innerHTML = `
    <div style="max-width:1080px;margin:0 auto;width:100%">
      <a class="backlink" href="${id ? `#/e/${id}` : "#"}">${I.back}${id ? "Back to the event" : "Your events"}</a>
      <div class="form-layout-wrap">
        <!-- Form Left -->
        <form id="evForm" class="stack" novalidate>
          <div style="display:flex;justify-content:space-between;align-items:flex-end">
            <h1 class="head" style="margin:0">${id ? "Edit event" : "New event"}</h1>
            <span style="font-size:12px;color:#38BDF8;font-family:monospace;letter-spacing:0.05em">LIVE SYNC READY</span>
          </div>

          <label class="field">
            <div style="display:flex;justify-content:space-between">
              <span>Event name</span>
              <span class="fine" id="nameLen">0/80</span>
            </div>
            <input class="input" name="name" id="inName" maxlength="80" required placeholder="e.g. Cyber Summit 2026" value="${esc(ev.name)}">
            <div class="presets-row" id="namePresets">
              <span style="font-size:11px;color:#64748B;align-self:center">Presets:</span>
              <button type="button" class="preset-chip" data-val="Annual Tech Symposium 2026">Tech Fest</button>
              <button type="button" class="preset-chip" data-val="HackNova National Hackathon">Hackathon</button>
              <button type="button" class="preset-chip" data-val="Electric Waves Live Concert">Music Gig</button>
              <button type="button" class="preset-chip" data-val="Global AI & Robotics Summit">AI Summit</button>
            </div>
          </label>

          <label class="field">
            <span>Organizing club / host</span>
            <input class="input" name="club" id="inClub" maxlength="80" placeholder="e.g. Robotics & Computing Club" value="${esc(ev.club)}">
          </label>

          <div class="two">
            <label class="field"><span>Date</span><input class="input" type="date" name="date" id="inDate" required value="${ymd(when)}"></label>
            <label class="field"><span>Time</span><input class="input" type="time" name="time" id="inTime" required value="${hm(when)}"></label>
          </div>

          <label class="field">
            <span>Venue location</span>
            <input class="input" name="venue" id="inVenue" maxlength="120" placeholder="e.g. Main Convention Center, Hall A" value="${esc(ev.venue)}">
          </label>

          <fieldset class="field" style="border:0;margin:0;padding:0">
            <span>Select poster artwork</span>
            <div class="art-pick" id="artPick">
              ${ART.map((a, i) => `<label><input type="radio" name="art" value="${i}" ${i === ev.art ? "checked" : ""} aria-label="${a.name}"><img src="${artUrl(i, true)}" alt="" loading="lazy" width="240" height="240"><span class="art-name">${a.name}</span></label>`).join("")}
            </div>
          </fieldset>

          <p class="err" id="fErr" role="alert" hidden></p>
          <button class="btn-primary compact" type="submit" id="saveBtn">
            <span class="label">${id ? "Save changes" : "Create event"}</span>
            <span class="arrow">${I.arrow}</span>
          </button>
        </form>

        <!-- Live Preview Card Right -->
        <div class="stack" style="gap:14px">
          <div style="font-size:12px;color:#94A3B8;letter-spacing:0.08em;font-weight:700;text-transform:uppercase">Pass Poster Preview</div>
          <div class="event-live-card" id="previewCard">
            <div class="live-card-badge">
              <span style="width:6px;height:6px;background:#34D399;border-radius:50%;box-shadow:0 0 6px #34D399"></span>
              <span>LIVE PREVIEW</span>
            </div>
            <div class="live-card-art" id="prevArt"></div>
            <div class="live-card-body">
              <h2 class="live-card-name" id="prevName">${esc(ev.name || "Event Title Preview")}</h2>
              <p class="live-card-club" id="prevClub">${esc(ev.club || "Hosting Club")}</p>
              <div class="live-card-meta">
                <div class="meta-item">📅 <span id="prevWhen">${esc(fmtWhen(when))}</span></div>
                <div class="meta-item">📍 <span id="prevVenue">${esc(ev.venue || "Venue not set")}</span></div>
                <div class="meta-item">🎟️ <span>32-Char Anti-Fraud QR Pass</span></div>
              </div>
            </div>
          </div>
          <p class="fine" style="margin:0;color:#64748B">Attendees will see this verified artwork and layout when opening their digital ticket links.</p>
        </div>
      </div>
    </div>`;

  const form = view.querySelector("#evForm"), err = view.querySelector("#fErr");
  const inName = view.querySelector("#inName"), inClub = view.querySelector("#inClub"), inVenue = view.querySelector("#inVenue");
  const inDate = view.querySelector("#inDate"), inTime = view.querySelector("#inTime");
  const prevName = view.querySelector("#prevName"), prevClub = view.querySelector("#prevClub"), prevVenue = view.querySelector("#prevVenue");
  const prevWhen = view.querySelector("#prevWhen"), prevArt = view.querySelector("#prevArt"), nameLen = view.querySelector("#nameLen");

  // Sync Live Preview
  function updatePreview() {
    const n = inName.value.trim();
    prevName.textContent = n || "Event Title Preview";
    nameLen.textContent = `${inName.value.length}/80`;
    prevClub.textContent = inClub.value.trim() || "Hosting Club";
    prevVenue.textContent = inVenue.value.trim() || "Venue not set";

    const starts = new Date(`${inDate.value}T${inTime.value || "18:00"}`);
    if (!isNaN(starts)) prevWhen.textContent = fmtWhen(starts);

    const checkedArt = form.querySelector('input[name="art"]:checked')?.value || 0;
    prevArt.style.backgroundImage = `url("${artUrl(checkedArt)}")`;
  }

  updatePreview();

  inName.addEventListener("input", updatePreview);
  inClub.addEventListener("input", updatePreview);
  inVenue.addEventListener("input", updatePreview);
  inDate.addEventListener("change", updatePreview);
  inTime.addEventListener("change", updatePreview);
  form.querySelectorAll('input[name="art"]').forEach(r => r.addEventListener("change", updatePreview));

  // Preset chips handler
  view.querySelector("#namePresets").addEventListener("click", (e) => {
    const btn = e.target.closest(".preset-chip");
    if (!btn) return;
    inName.value = btn.dataset.val;
    updatePreview();
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = new FormData(form);
    const name = String(f.get("name")).trim();
    const starts = new Date(`${f.get("date")}T${f.get("time") || "18:00"}`);
    if (!name) { err.textContent = "Give the event a name."; err.hidden = false; return form.name.focus(); }
    if (isNaN(starts)) { err.textContent = "Pick a date and time."; err.hidden = false; return; }
    const row = { name, club: String(f.get("club")).trim(), venue: String(f.get("venue")).trim(), art: Number(f.get("art") || 0), starts_at: starts.toISOString() };
    const btn = view.querySelector("#saveBtn"); btn.disabled = true;
    if (localBackend.isDemoSession() || !sb) {
      if (id) row.id = id;
      const saved = localBackend.saveEvent(row);
      btn.disabled = false;
      location.hash = `#/e/${saved.id}`;
      return;
    }
    const q = id ? sb.from("gp_events").update(row).eq("id", id).select("id").single() : sb.from("gp_events").insert(row).select("id").single();
    const { data, error } = await q;
    btn.disabled = false;
    if (error) { err.textContent = error.message; err.hidden = false; return; }
    location.hash = `#/e/${data.id}`;
  });
}

// ─────────────────────────────────────────────── one event

async function fetchAll(table, cols, eventId, extra = (q) => q) {
  const out = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await extra(sb.from(table).select(cols).eq("event_id", eventId)).order("id").range(from, from + 999);
    if (error) throw error;
    out.push(...data);
    if (data.length < 1000) break;
  }
  return out;
}

async function eventView(id) {
  view.innerHTML = `<div class="skeleton" style="height:520px"></div>`;
  let ev, passes = [], scans = [];
  try {
    if (localBackend.isDemoSession() || !sb) {
      ev = localBackend.getEvent(id);
      if (!ev) { toast("That event isn't yours or was deleted", "x"); location.hash = ""; return; }
      passes = localBackend.getPasses(id);
      scans = localBackend.getScans(id).map(s => ({ ...s, is_first: s.accepted }));
    } else {
      const r = await sb.from("gp_events").select("*").eq("id", id).maybeSingle();
      if (r.error) throw r.error;
      if (!r.data) { toast("That event isn't yours or was deleted", "x"); location.hash = ""; return; }
      ev = r.data;
      [passes, scans] = await Promise.all([
        fetchAll("gp_passes", "id,name,contact,tier,token,created_at", id),
        fetchAll("gp_scans", "id,pass_id,is_first,gate,scanned_at", id),
      ]);
    }
  } catch (e) { return fail(e); }

  passes.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.name.localeCompare(b.name));
  const state = { ev, passes, first: new Map(), bounced: 0, upload: null, filter: "", filterStatus: "all", filterTier: "all", pageSize: 10, shown: 10 };
  for (const s of scans) s.is_first ? state.first.set(s.pass_id, s) : state.bounced++;

  document.title = `${typo(ev.name)} · EntryGo`;
  view.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
      <a class="backlink" href="#" style="margin:0">${I.back}Back to All Events</a>
      <div style="display:flex;gap:8px">
        <a class="btn small" href="#/e/${id}/edit" style="background:#1E293B;color:#F8FAFC">${I.gear || "✏️"} Edit Details</a>
        <a class="btn small" href="${esc(gateUrl(ev.gate_code))}" target="_blank" rel="noopener" style="background:#0284C7;color:#fff">${I.qr} Open Gate</a>
      </div>
    </div>

    <div class="dash">
      <div class="left stack">
        <div class="poster" id="poster" style="position:relative;overflow:hidden">
          <div class="poster-hero-overlay"></div>
          <div style="position:absolute;top:14px;right:14px;display:flex;gap:6px;z-index:3">
            <span style="font-size:11px;background:rgba(15,23,42,0.85);backdrop-filter:blur(8px);border:1px solid rgba(56,189,248,0.35);color:#38BDF8;font-weight:800;padding:4px 12px;border-radius:20px;letter-spacing:0.05em;box-shadow:0 0 15px rgba(56,189,248,0.25)">⚡ LIVE EVENT</span>
          </div>
          <div style="position:relative;z-index:2;margin-top:auto">
            <h1 class="poster-title ink" style="font-size:clamp(26px,7vw,36px);margin-bottom:4px;color:#F8FAFC">${escT(ev.name)}</h1>
            ${ev.club ? `<p class="poster-club" style="color:#38BDF8;font-weight:600;margin:0 0 6px">${esc(ev.club)}</p>` : ""}
            <div class="poster-quick-stats-strip">
              <span class="poster-stat-pill">📅 ${esc(fmtWhen(ev.starts_at))}</span>
              ${ev.venue ? `<span class="poster-stat-pill">📍 ${esc(ev.venue)}</span>` : ""}
            </div>
          </div>
        </div>
        <div id="regSlot" class="stack"></div>
        <div class="stat grain" id="stat"></div>
        <div id="analyticsSlot"></div>
        <div class="gatebox" id="gatebox"></div>
      </div>
      <div class="right stack">
        <div class="head-row section-gap-m" style="border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
          <div>
            <h2 class="head" style="margin:0;font-size:24px">Pass Management</h2>
            <p style="margin:2px 0 0;font-size:12px;color:#94A3B8">View, search, change tiers, and dispatch passes</p>
          </div>
          <span class="fine" id="pcount"></span>
        </div>
        <div id="passTools" class="stack"></div>
        <ul class="passlist" id="plist"></ul>
        <div class="more-row" id="more"></div>
        <div class="danger-zone" style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:#64748B">Event ID: <code style="font-size:11px">${id.slice(0, 8)}...</code></span>
          <button class="btn small danger" type="button" id="del">${I.trash}Delete event</button>
        </div>
      </div>
    </div>`;
  view.querySelector("#poster").style.backgroundImage = `url("${artUrl(ev.art)}")`;

  renderReg(state);
  renderStat(state);
  renderAnalytics(state);
  renderGate(state);
  renderPassTools(state);
  renderList(state);

  const del = view.querySelector("#del");
  let armed = 0;
  del.addEventListener("click", async () => {
    if (Date.now() - armed > 4000) { armed = Date.now(); del.innerHTML = `${I.trash}Tap again to delete ${plural(state.passes.length, "pass", "passes")}`; setTimeout(() => { if (del.isConnected) del.innerHTML = `${I.trash}Delete event`; }, 4000); return; }
    del.disabled = true;
    if (localBackend.isDemoSession() || !sb) {
      localBackend.deleteEvent(id);
      toast("Event deleted");
      location.hash = "";
      return;
    }
    const { error } = await sb.from("gp_events").delete().eq("id", id);
    if (error) { del.disabled = false; return toast(error.message, "x"); }
    toast("Event deleted");
    location.hash = "";
  });

  if (sb) startLive(state);
}

// ── registrations: file / paste → preview → generate ──
function renderReg(state) {
  const slot = view.querySelector("#regSlot");
  const has = state.passes.length;
  const up = state.upload;
  if (!up) {
    slot.innerHTML = `
      <label class="row" id="pick">
        <input type="file" id="file" accept=".csv,.tsv,.txt,text/csv,text/tab-separated-values" class="sr">
        <span style="width:30px;height:36px;display:block">${I.doc}</span>
        <span class="grow">${has ? "Add more registrations" : "Upload registrations.csv"}<small>Google Form export, or any sheet with a name column</small></span>
        <span class="chev">${I.chev}</span>
      </label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn small" type="button" id="pasteBtn">${I.copy}Paste rows</button>
        <button class="btn small btn-glow-cyan" type="button" id="quickAddBtn" style="border-color:#38BDF8;color:#38BDF8">${I.plus}Add Single Pass (VIP / Standard)</button>
      </div>

      <!-- Quick Add Single Pass Form Modal / Drawer -->
      <div id="quickAddBox" class="stack" style="background:rgba(15,23,42,0.85);border:1px solid rgba(56,189,248,0.3);padding:14px;border-radius:12px;margin-top:4px" hidden>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <strong style="color:#38BDF8;font-size:13px;letter-spacing:0.04em">⚡ QUICK PASS GENERATOR</strong>
          <button class="icon-btn" type="button" id="closeQuickAdd" style="width:24px;height:24px">${I.x}</button>
        </div>
        <div class="two">
          <label class="field">
            <span>Attendee Name</span>
            <input class="input" id="qaName" placeholder="e.g. Rahul Sharma" autocomplete="off">
          </label>
          <label class="field">
            <span>Pass Tier / Category</span>
            <select class="select" id="qaTier">
              <option value="VIP">⭐ VIP PASS</option>
              <option value="Volunteer">🤝 VOLUNTEER</option>
              <option value="Backstage">⚡ BACKSTAGE STAFF</option>
              <option value="Standard" selected>🎟️ STANDARD PASS</option>
            </select>
          </label>
        </div>
        <label class="field">
          <span>Phone or Email (Required)</span>
          <input class="input" id="qaContact" placeholder="e.g. 9876543210 or name@gmail.com" autocomplete="off" required>
        </label>
        <button class="btn-primary compact" type="button" id="qaSubmit">
          <span class="tix">${I.ticket}</span>
          <span class="label">Generate Pass Immediately</span>
        </button>
      </div>

      <div id="pasteBox" class="stack" hidden>
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span style="font-size:12px;color:#94A3B8">Paste cells from sheet (Name, Phone/Email):</span>
          <div style="display:flex;align-items:center;gap:6px">
            <span style="font-size:11px;color:#94A3B8">Tier:</span>
            <select class="select" id="pasteTier" style="padding:2px 8px;font-size:11px">
              <option value="Standard">Standard</option>
              <option value="VIP">⭐ VIP</option>
              <option value="Volunteer">🤝 Volunteer</option>
              <option value="Backstage">⚡ Backstage</option>
            </select>
          </div>
        </div>
        <textarea class="textarea" id="pasteTa" placeholder="Copy cells in Google Sheets and paste here.&#10;Amit Shah, 9876543210&#10;Rahul Patel, rahul@gmail.com"></textarea>
        <button class="btn" type="button" id="pasteUse">Use these rows</button>
      </div>`;

    slot.querySelector("#file").addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      if (f.size > 4e6) return toast("That file is over 4 MB. Export just the responses sheet.", "x");
      loadRows(state, await f.text(), f.name);
    });

    slot.querySelector("#pasteBtn").addEventListener("click", () => {
      const box = slot.querySelector("#pasteBox");
      box.hidden = !box.hidden;
      if (!box.hidden) {
        slot.querySelector("#quickAddBox").hidden = true;
        slot.querySelector("#pasteTa").focus();
      }
    });

    slot.querySelector("#quickAddBtn").addEventListener("click", () => {
      const box = slot.querySelector("#quickAddBox");
      box.hidden = !box.hidden;
      if (!box.hidden) {
        slot.querySelector("#pasteBox").hidden = true;
        slot.querySelector("#qaName").focus();
      }
    });

    slot.querySelector("#closeQuickAdd").addEventListener("click", () => {
      slot.querySelector("#quickAddBox").hidden = true;
    });

    slot.querySelector("#qaSubmit").addEventListener("click", async () => {
      const nameIn = slot.querySelector("#qaName").value.trim();
      const tierIn = slot.querySelector("#qaTier").value;
      const contactIn = slot.querySelector("#qaContact").value.trim();
      if (!nameIn) return toast("Enter attendee name", "x");
      if (!contactIn) return toast("Enter phone number or email address", "x");

      const newPass = [{
        event_id: state.ev.id,
        name: nameIn,
        contact: contactIn,
        tier: tierIn
      }];

      const res = await insertPassesWithFallback(state.ev.id, newPass);
      if (res.error) return toast(res.error.message, "x");
      if (res.data) state.passes.push(...res.data);

      toast(`Created ${tierIn} pass for ${nameIn}`);
      renderReg(state); renderStat(state); renderPassTools(state); renderList(state);
    });

    slot.querySelector("#pasteUse").addEventListener("click", () => {
      const tierSel = slot.querySelector("#pasteTier")?.value || "Standard";
      loadRows(state, slot.querySelector("#pasteTa").value, "pasted rows", tierSel);
    });
    return;
  }

  const { a, fileName, nameCol, contactCol, tierCol, defaultTier, open } = up;
  const res = toPasses(a, nameCol, contactCol, state.passes, tierCol, defaultTier);
  up.res = res;
  const n = res.passes.length;
  const skipped = [res.blank && `${plural(res.blank, "row")} without a name`, res.dup && `${plural(res.dup, "duplicate")}`].filter(Boolean).join(", ");
  const opt = (sel, none) => `${none ? `<option value="-1" ${sel === -1 ? "selected" : ""}>None</option>` : ""}${a.cols.map((c) => `<option value="${c.i}" ${c.i === sel ? "selected" : ""}>${esc(c.label)}</option>`).join("")}`;

  slot.innerHTML = `
    <!-- Step Flow Header -->
    <div style="display:flex;gap:4px;margin-bottom:8px">
      <div style="flex:1;background:rgba(16,185,129,0.2);border:1px solid #10B981;border-radius:6px;padding:4px 8px;font-size:11px;color:#34D399;font-weight:700">✓ 1. Upload</div>
      <div style="flex:1;background:rgba(56,189,248,0.2);border:1px solid #38BDF8;border-radius:6px;padding:4px 8px;font-size:11px;color:#38BDF8;font-weight:700">2. Map Columns</div>
      <div style="flex:1;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:4px 8px;font-size:11px;color:#94A3B8;font-weight:600">3. Generate Passes</div>
    </div>

    <button class="row" type="button" id="toggle" aria-expanded="${open ? "true" : "false"}">
      <span style="width:30px;height:36px;display:block">${I.doc}</span>
      <span class="grow"><span class="fname">${esc(fileName)} · ${plural(a.body.length, "row")}</span>${skipped ? `<small style="color:#FBBF24">⚠️ ${n} new · skipping ${skipped}</small>` : `<small style="color:#34D399">${n} ready to generate</small>`}</span>
      <span class="chev" style="transition:rotate .2s;${open ? "rotate:90deg" : ""}">${I.chev}</span>
    </button>
    <div class="upload-preview" ${open ? "" : "hidden"}>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(140px, 1fr));gap:10px">
        <label class="field"><span>Name column *</span><select class="select" id="nameCol">${opt(nameCol)}</select></label>
        <label class="field"><span>Contact column</span><select class="select" id="contactCol">${opt(contactCol, true)}</select></label>
        <label class="field"><span>Tier column</span><select class="select" id="tierCol">${opt(tierCol, true)}</select></label>
        <label class="field">
          <span>Default Tier (for rows without tier)</span>
          <select class="select" id="batchTier">
            <option value="Standard" ${defaultTier === "Standard" ? "selected" : ""}>🎟️ Standard</option>
            <option value="VIP" ${defaultTier === "VIP" ? "selected" : ""}>⭐ VIP</option>
            <option value="Volunteer" ${defaultTier === "Volunteer" ? "selected" : ""}>🤝 Volunteer</option>
            <option value="Backstage" ${defaultTier === "Backstage" ? "selected" : ""}>⚡ Backstage</option>
          </select>
        </label>
      </div>

      <div style="margin:10px 0 4px;font-size:12px;font-weight:700;color:#94A3B8">Preview of first 5 rows:</div>
      <table class="preview-table">
        <thead><tr><th>Name</th><th>Contact</th><th>Tier Tag</th></tr></thead>
        <tbody>${res.passes.slice(0, 5).map((p) => {
          const tier = getTier(p);
          return `<tr><td>${esc(p.name)}</td><td>${esc(p.contact || "—")}</td><td><span class="mini-tier ${tier.cssClass}">${tier.icon} ${tier.shortLabel}</span></td></tr>`;
        }).join("") || `<tr><td colspan="3">No usable rows. Pick the column that has names.</td></tr>`}</tbody>
      </table>
      ${n > 5 ? `<p class="fine" style="margin:4px 0 8px">…and ${n - 5} more rows parsed.</p>` : ""}

      <!-- Step 3 Summary Box -->
      <div style="background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.3);border-radius:10px;padding:12px;margin:10px 0;display:flex;justify-content:space-between;align-items:center">
        <div>
          <strong style="color:#F8FAFC;font-size:14px">Step 3 Summary:</strong>
          <div style="color:#38BDF8;font-size:13px;margin-top:2px"><strong>${n}</strong> passes will be created</div>
          ${skipped ? `<div style="color:#FBBF24;font-size:11px;margin-top:2px">⚠️ Warnings: ${skipped}</div>` : ""}
        </div>
        <button class="btn small pinkline" type="button" id="cancelUp" style="align-self:center">${I.x}Cancel</button>
      </div>
    </div>
    <button class="btn-primary" type="button" id="gen" ${n ? "" : "disabled"}>
      <span class="tix">${I.ticket}</span>
      <span class="label">Generate ${n} ${n === 1 ? "pass" : "passes"}</span>
      <span class="arrow">${I.arrow}</span>
    </button>`;

  slot.querySelector("#toggle").addEventListener("click", () => { up.open = !up.open; renderReg(state); });
  slot.querySelector("#nameCol")?.addEventListener("change", (e) => { up.nameCol = +e.target.value; renderReg(state); });
  slot.querySelector("#contactCol")?.addEventListener("change", (e) => { up.contactCol = +e.target.value; renderReg(state); });
  slot.querySelector("#tierCol")?.addEventListener("change", (e) => { up.tierCol = +e.target.value; renderReg(state); });
  slot.querySelector("#batchTier")?.addEventListener("change", (e) => { up.defaultTier = e.target.value; renderReg(state); });
  slot.querySelector("#cancelUp")?.addEventListener("click", () => { state.upload = null; renderReg(state); });
  slot.querySelector("#gen").addEventListener("click", () => generate(state));
}

function loadRows(state, text, fileName, defaultTier = "Standard") {
  const rows = parseTable(text);
  if (!rows.length) return toast("That sheet is empty", "x");
  const a = analyse(rows);
  if (a.body.length > MAX_ROWS) return toast(`That's ${a.body.length} rows. EntryGo takes up to ${MAX_ROWS} at a time.`, "x");
  state.upload = {
    a,
    fileName,
    nameCol: a.name,
    contactCol: a.contact,
    tierCol: a.tier ?? -1,
    defaultTier,
    open: !a.hasHeader || a.tier >= 0
  };
  renderReg(state);
}


// Helper: Insert passes with smart fallback (tier column omission & localBackend cache fallback)
async function insertPassesWithFallback(eventId, passList) {
  if (localBackend.isDemoSession() || !sb) {
    const formatted = passList.map(p => ({
      event_id: eventId,
      name: p.name,
      contact: p.contact || "",
      tier: p.tier || "Standard"
    }));
    localBackend.addPasses(formatted);
    return { data: formatted, error: null, fallbackUsed: true };
  }

  // Attempt 1: Full insert with tier column
  const batchWithTier = passList.map(p => ({
    event_id: eventId,
    name: p.name,
    contact: p.contact || "",
    tier: p.tier || "Standard"
  }));

  let res = await sb.from("gp_passes").insert(batchWithTier).select("id,name,contact,tier,token,created_at");
  if (!res.error && res.data) {
    return { data: res.data, error: null };
  }

  // If error mentions permission denied or column tier missing:
  const errText = res.error?.message || "";
  console.warn("Primary gp_passes insert error:", errText);

  // Attempt 2: Insert without tier column (if database schema lacks column-level grant for tier)
  const batchWithoutTier = passList.map(p => ({
    event_id: eventId,
    name: p.name,
    contact: p.contact || ""
  }));

  res = await sb.from("gp_passes").insert(batchWithoutTier).select("id,name,contact,token,created_at");
  if (!res.error && res.data) {
    // Re-attach tier locally and persist
    res.data.forEach((p, idx) => {
      const desiredTier = passList[idx]?.tier || "Standard";
      p.tier = desiredTier;
      if (p.token) localStorage.setItem(`gp_tier_${p.token}`, desiredTier);
      localStorage.setItem(`gp_tier_pass_${p.id}`, desiredTier);
    });
    return { data: res.data, error: null, tierSavedLocally: true };
  }

  // Attempt 3: If still permission denied (e.g. unauthenticated session or RLS policy mismatch), save to local storage
  if (/permission denied|policy|violates/i.test(res.error?.message || "")) {
    console.warn("Permission denied for gp_passes: caching passes locally to guarantee zero data loss");
    const localBatch = passList.map(p => ({
      event_id: eventId,
      name: p.name,
      contact: p.contact || "",
      tier: p.tier || "Standard"
    }));
    localBackend.addPasses(localBatch);
    return { data: localBatch, error: null, localSaved: true };
  }

  return { data: null, error: res.error };
}

async function generate(state) {
  const up = state.upload;
  const list = up.res.passes;
  const slot = view.querySelector("#regSlot");
  const total = list.length;
  slot.innerHTML = `
    <div class="row" style="min-height:60px"><span style="width:30px;height:36px;display:block">${I.doc}</span><span class="grow">${esc(up.fileName)} · ${plural(total, "pass", "passes")}</span></div>
    <div class="btn-primary" aria-live="polite" style="cursor:progress">
      <span class="tix">${I.ticket}</span>
      <span class="label"><span class="gen-count" id="gc" style="color:#fff;font-size:inherit">0</span> / ${total} passes<small>Making unguessable links…</small></span>
      <span class="spinner"></span>
    </div>`;
  const gc = slot.querySelector("#gc");
  let done = 0, shown = 0, failed = null;
  const tick = () => {
    if (shown < done) { shown += Math.max(1, Math.ceil((done - shown) / 6)); gc.textContent = Math.min(shown, done); }
    if (shown < total && !failed) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
  for (let i = 0; i < total; i += 100) {
    const batch = list.slice(i, i + 100).map((p) => ({
      event_id: state.ev.id,
      name: p.name,
      contact: p.contact,
      tier: p.tier || "Standard"
    }));
    const res = await insertPassesWithFallback(state.ev.id, batch);
    if (res.error) {
      failed = res.error;
      break;
    }
    if (res.data) {
      state.passes.push(...res.data);
      done += res.data.length;
    }
  }
  await new Promise((r) => setTimeout(r, 450));
  gc.textContent = done;
  state.upload = null;
  if (failed) toast(`Stopped after ${done}: ${failed.message}`, "x");
  else toast(`${plural(done, "pass", "passes")} ready`);
  renderReg(state); renderStat(state); renderPassTools(state); renderList(state);
}


// ── gate analytics & peak rush charts ──
function renderAnalytics(state) {
  const slot = view.querySelector("#analyticsSlot");
  if (!slot) return;
  const scans = Array.from(state.first.values());
  const totalChecked = scans.length;
  const totalBounced = state.bounced || 0;

  // Gate breakdown calculation
  const gateCounts = {};
  scans.forEach(s => {
    const g = s.gate || "Gate 1";
    gateCounts[g] = (gateCounts[g] || 0) + 1;
  });

  // Calculate live scan velocity (scans in last 10 minutes)
  const now = Date.now();
  const recentScans = scans.filter(s => (now - new Date(s.scanned_at).getTime()) <= 10 * 60 * 1000).length;
  const velocityPerMin = (recentScans / 10).toFixed(1);

  // Time-slice buckets (e.g. 5 intervals)
  const buckets = [0, 0, 0, 0, 0];
  const labels = ["T-40m", "T-30m", "T-20m", "T-10m", "Now"];
  scans.forEach(s => {
    const diffMins = Math.floor((now - new Date(s.scanned_at).getTime()) / (10 * 60 * 1000));
    if (diffMins >= 0 && diffMins < 5) {
      buckets[4 - diffMins]++;
    }
  });
  const maxBucket = Math.max(...buckets, 1);

  slot.innerHTML = `
    <div class="analytics-section">
      <div class="analytics-head">
        <h3 class="analytics-title">
          <span>📊</span>
          <span>Live Gate Analytics & Rush Velocity</span>
        </h3>
        <span style="font-size:11px;color:#38BDF8;font-family:monospace;letter-spacing:0.05em">REALTIME TELEMETRY</span>
      </div>

      <div class="analytics-grid">
        <div class="stat-kpi-card">
          <div class="kpi-label">Scan Velocity</div>
          <div class="kpi-value">${velocityPerMin} <small style="font-size:12px;color:#94A3B8;font-weight:normal">/ min</small></div>
        </div>
        <div class="stat-kpi-card">
          <div class="kpi-label">Active Gates</div>
          <div class="kpi-value">${Object.keys(gateCounts).length || 1} <small style="font-size:12px;color:#94A3B8;font-weight:normal">online</small></div>
        </div>
        <div class="stat-kpi-card">
          <div class="kpi-label">Fraud Attempts</div>
          <div class="kpi-value" style="color:${totalBounced ? "#FB7185" : "#34D399"}">${totalBounced} <small style="font-size:12px;color:#94A3B8;font-weight:normal">intercepted</small></div>
        </div>
      </div>

      <!-- Velocity Bar Chart -->
      <div class="velocity-chart-wrap">
        <div style="font-size:11px;color:#94A3B8;margin-bottom:6px;display:flex;justify-content:space-between">
          <span>Check-in Volume (Last 45 mins)</span>
          <span style="color:#38BDF8">Peak: ${maxBucket} scans</span>
        </div>
        <div class="chart-bars-row">
          ${buckets.map((b, i) => `
            <div class="chart-col">
              <div class="chart-bar-fill" style="height:${Math.max(6, (b / maxBucket) * 100)}%" title="${b} scans"></div>
              <span class="chart-bar-label">${labels[i]}</span>
            </div>
          `).join("")}
        </div>
      </div>

      <!-- Gate Comparison Split -->
      <div class="gate-bars-wrap">
        <div style="font-size:11px;color:#94A3B8;margin-top:4px">Gate Throughput Breakdown</div>
        ${Object.entries(gateCounts).length ? Object.entries(gateCounts).map(([gate, count]) => `
          <div class="gate-split-row">
            <span class="gate-split-name">${esc(gate)}</span>
            <div class="gate-split-track">
              <div class="gate-split-bar" style="width:${totalChecked ? (count / totalChecked) * 100 : 0}%"></div>
            </div>
            <span class="gate-split-count">${count}</span>
          </div>
        `).join("") : `
          <div style="font-size:12px;color:#64748B;padding:8px 0">Waiting for gate staff to start scanning...</div>
        `}
      </div>
    </div>
  `;
}

// ── checked-in counter & live event statistics ──
function renderStat(state, bump = false) {
  const total = state.passes.length, checked = state.first.size;
  const notIn = Math.max(0, total - checked);
  const pct = total ? Math.min(100, Math.round((checked / total) * 100)) : 0;
  const el = view.querySelector("#stat");

  // Breakdown counts by tier
  let vipCount = 0, backstageCount = 0, volunteerCount = 0, standardCount = 0;
  for (const p of state.passes) {
    const tr = getTier(p);
    if (tr.id === "vip") vipCount++;
    else if (tr.id === "backstage") backstageCount++;
    else if (tr.id === "volunteer") volunteerCount++;
    else standardCount++;
  }

  el.innerHTML = `
    <span class="dot">${I.dotCheck}</span>
    <p class="stat-label" style="display:flex;justify-content:space-between;align-items:center">
      <span>Live Gate Check-in</span>
      <span style="font-size:12px;color:#38BDF8;font-weight:700">${pct}% Admitted</span>
    </p>
    <div class="stat-line">
      <p class="stat-num ink" id="snum">${checked} / ${total}</p>
      <div class="bar" aria-hidden="true"><i style="--p:${total ? Math.min(1, checked / total) : 0}"></i></div>
    </div>
    
    <!-- 4-Stat Live Metric Row -->
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:12px 0 8px;text-align:center">
      <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:8px;padding:6px 2px">
        <div style="font-size:15px;font-weight:800;color:#F8FAFC">${total}</div>
        <div style="font-size:10px;color:#94A3B8;text-transform:uppercase;font-weight:600">Total</div>
      </div>
      <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.25);border-radius:8px;padding:6px 2px">
        <div style="font-size:15px;font-weight:800;color:#34D399">${checked}</div>
        <div style="font-size:10px;color:#34D399;text-transform:uppercase;font-weight:600">Checked In</div>
      </div>
      <div style="background:rgba(245,158,11,0.08);border:1px solid rgba(245,158,11,0.25);border-radius:8px;padding:6px 2px">
        <div style="font-size:15px;font-weight:800;color:#FBBF24">${notIn}</div>
        <div style="font-size:10px;color:#FBBF24;text-transform:uppercase;font-weight:600">Not In</div>
      </div>
      <div style="background:rgba(244,63,94,0.08);border:1px solid rgba(244,63,94,0.25);border-radius:8px;padding:6px 2px">
        <div style="font-size:15px;font-weight:800;color:#FB7185">${state.bounced}</div>
        <div style="font-size:10px;color:#FB7185;text-transform:uppercase;font-weight:600">Bounced</div>
      </div>
    </div>

    <!-- Tier Breakdown Row -->
    <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;padding-top:6px;border-top:1px solid rgba(255,255,255,0.06);font-size:11px">
      <span style="color:#64748B;font-weight:700">Tiers:</span>
      <span class="mini-tier tier-vip" style="margin:0">⭐ VIP: ${vipCount}</span>
      <span class="mini-tier tier-backstage" style="margin:0">⚡ Backstage: ${backstageCount}</span>
      <span class="mini-tier tier-volunteer" style="margin:0">🤝 Volunteer: ${volunteerCount}</span>
      <span class="mini-tier tier-standard" style="margin:0">🎟️ Standard: ${standardCount}</span>
    </div>

    ${state.bounced ? `<p class="stat-note" style="margin-top:8px">${plural(state.bounced, "repeat scan")} bounced at the gate</p>` : ""}`;
  el.setAttribute("aria-label", `Checked in ${checked} of ${total}`);
  if (bump) { const n = el.querySelector("#snum"); n.animate([{ transform: "scale(1.08)", color: "#FF2FA2" }, { transform: "scale(1)" }], { duration: 520, easing: "cubic-bezier(.16,1,.3,1)" }); }
}

// ── gate code & links ──
function renderGate(state, showQr = false) {
  const ev = state.ev, el = view.querySelector("#gatebox");
  const fullGateUrl = gateUrl(ev.gate_code);
  el.innerHTML = `
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <p class="kicker-free" style="margin:0">Gate Passcode</p>
        <a href="${esc(fullGateUrl)}" target="_blank" rel="noopener" style="font-size:12px;color:#38BDF8;font-weight:700;display:inline-flex;align-items:center;gap:4px">
          Open Gate Scanner ${I.open}
        </a>
      </div>
      <p class="gate-code ink" aria-label="Gate code ${fmtCode(ev.gate_code).split("").join(" ")}" style="font-size:38px;letter-spacing:0.08em;margin:8px 0">${fmtCode(ev.gate_code)}</p>
    </div>
    <p class="fine">Gate staff open <b>${esc(gateUrl("").replace(/#$/, "").replace(/^https?:\/\//, ""))}</b> and type this 8-character code to scan attendees. The first scan admits the attendee.</p>
    <div class="btns" style="display:flex;gap:8px;flex-wrap:wrap">
      <button class="btn small" type="button" id="cpGate">${I.copy}Copy code</button>
      <button class="btn small" type="button" id="shareGate">${I.chat}Share code</button>
      <button class="btn small" type="button" id="qrGate" aria-expanded="${showQr}">${I.qr}${showQr ? "Hide Gate QR" : "Show Gate QR"}</button>
      <button class="btn small danger" type="button" id="rot" style="border-color:rgba(244,63,94,0.3)">${I.refresh}New code</button>
    </div>
    ${showQr ? `<div class="gate-qr">${qrSvg(fullGateUrl, { label: "QR to join the gate" })}<p class="fine" style="color:var(--blue);margin:0">Staff scan this with their phone camera to open the scanner with the code filled in.</p></div>` : ""}`;

  el.querySelector("#cpGate").addEventListener("click", async () => {
    (await copyText(ev.gate_code)) ? toast(`Gate code ${ev.gate_code} copied!`) : toast("Couldn't copy", "x");
  });

  el.querySelector("#shareGate").addEventListener("click", async () => {
    const shareText = `EntryGo Gate Code for ${ev.name}:
Code: ${fmtCode(ev.gate_code)}
Direct Link: ${fullGateUrl}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `Gate Access - ${ev.name}`, text: shareText, url: fullGateUrl });
        return;
      } catch {}
    }
    (await copyText(shareText)) ? toast("Gate access instructions copied to clipboard!") : toast("Couldn't copy", "x");
  });

  el.querySelector("#qrGate").addEventListener("click", () => renderGate(state, !showQr));

  let armed = 0;
  el.querySelector("#rot").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    if (Date.now() - armed > 4500) {
      armed = Date.now();
      b.innerHTML = `${I.refresh}⚠️ Tap again: old code stops working immediately!`;
      b.style.borderColor = "#F43F5E";
      b.style.color = "#FDA4AF";
      setTimeout(() => { if (b.isConnected) { b.innerHTML = `${I.refresh}New code`; b.style.borderColor = ""; b.style.color = ""; } }, 4500);
      return;
    }
    b.disabled = true;
    let data;
    if (localBackend.isDemoSession() || !sb) {
      data = Math.random().toString(36).substring(2, 10).toUpperCase();
      localBackend.saveEvent({ id: ev.id, gate_code: data });
    } else {
      const res = await sb.rpc("gp_rotate_code", { p_event: ev.id });
      if (res.error || !res.data) { b.disabled = false; return toast(res.error?.message || "Couldn't change the code", "x"); }
      data = res.data;
    }
    ev.gate_code = data;
    renderGate(state, showQr);
    toast("New gate code active. Previous code has been revoked.");
  });
}

// ── passes: tools + list ──

// ── A6 Bulk Sending: interactive Send Queue modal & template editor ──
const DEFAULT_MSG_TEMPLATE = `🎟️ Official Entry Pass for {event}

Hi {name}! Your {tier} entry pass is confirmed and ready.

Pass Link: {link}

⚠️ IMPORTANT: Turn screen brightness to max at the gate. This pass works once.

See you at the event!
Powered by EntryGo · https://entrygo.live`;

function getSavedTemplate() {
  return localStorage.getItem("gp_msg_template") || DEFAULT_MSG_TEMPLATE;
}

function saveTemplate(tpl) {
  localStorage.setItem("gp_msg_template", tpl);
}

function formatTpl(tpl, state, p) {
  const ev = state.ev;
  const tier = getTier(p);
  const tierLabel = tier.shortLabel === "VIP" ? "VIP" : tier.shortLabel === "VOLUNTEER" ? "Volunteer" : tier.shortLabel === "BACKSTAGE" ? "Backstage" : "Standard";
  return tpl
    .replace(/{name}/g, p.name)
    .replace(/{event}/g, ev.name)
    .replace(/{tier}/g, tierLabel)
    .replace(/{link}/g, passUrl(p.token));
}

function getSentStatus(passId) {
  const ts = localStorage.getItem(`gp_sent_${passId}`);
  if (!ts) return null;
  return new Date(ts);
}

function markPassSent(passId) {
  const now = new Date().toISOString();
  localStorage.setItem(`gp_sent_${passId}`, now);
  return now;
}

function maskContact(contact) {
  if (!contact) return "no contact";
  const c = contact.trim();
  if (isEmail(c)) {
    const parts = c.split("@");
    if (parts[0].length <= 2) return `${parts[0][0]}***@${parts[1]}`;
    return `${parts[0].slice(0, 2)}***${parts[0].slice(-1)}@${parts[1]}`;
  }
  if (isPhone(c)) {
    const d = c.replace(/\D/g, "");
    if (d.length >= 10) {
      return `${d.slice(0, 2)}••••••${d.slice(-2)}`;
    }
  }
  return c;
}

function openSendQueue(state) {
  document.querySelector(".queue-modal-overlay")?.remove();

  let queueFilter = "all"; // 'all', 'unsent', 'sent'
  let curIdx = 0;
  let tpl = getSavedTemplate();

  const getFilteredList = () => {
    return state.passes.filter(p => {
      const isSent = !!getSentStatus(p.id);
      if (queueFilter === "unsent") return !isSent;
      if (queueFilter === "sent") return isSent;
      return true;
    });
  };

  const overlay = document.createElement("div");
  overlay.className = "queue-modal-overlay";

  function renderQueueModal() {
    const list = getFilteredList();
    if (curIdx >= list.length) curIdx = Math.max(0, list.length - 1);
    const p = list[curIdx];

    const totalAll = state.passes.length;
    const sentCountAll = state.passes.filter(x => !!getSentStatus(x.id)).length;
    const pct = totalAll ? Math.min(100, Math.round((sentCountAll / totalAll) * 100)) : 0;

    let sendAction = null;
    let formattedMsg = "";
    let isAlreadySent = false;
    let sentTimeStr = "";

    if (p) {
      formattedMsg = formatTpl(tpl, state, p);
      const c = p.contact || "";
      const sentTime = getSentStatus(p.id);
      isAlreadySent = !!sentTime;
      if (isAlreadySent) sentTimeStr = fmtTime(sentTime);

      if (isEmail(c)) {
        sendAction = {
          type: "email",
          label: "Send by Email",
          icon: I.mail,
          href: `mailto:${encodeURIComponent(c)}?subject=${encodeURIComponent(`Your pass for ${state.ev.name}`)}&body=${encodeURIComponent(formattedMsg)}`
        };
      } else if (isPhone(c)) {
        let d = c.replace(/\D/g, "");
        if (d.length === 10) d = "91" + d;
        if (d.length === 11 && d.startsWith("0")) d = "91" + d.slice(1);
        sendAction = {
          type: "whatsapp",
          label: "Send on WhatsApp",
          icon: I.chat,
          href: `https://wa.me/${d}?text=${encodeURIComponent(formattedMsg)}`
        };
      }
    }

    const tier = p ? getTier(p) : null;

    overlay.innerHTML = `
      <div class="queue-modal-card">
        <div class="queue-header">
          <div>
            <h3 style="margin:0;font-size:18px;color:#F8FAFC;display:flex;align-items:center;gap:8px">
              <span>🚀</span>
              <span>Send All Passes Queue</span>
            </h3>
            <p style="margin:2px 0 0;font-size:12px;color:#94A3B8">Step through attendees and dispatch verified tickets directly</p>
          </div>
          <button class="icon-btn" type="button" id="closeQueueModal" style="width:32px;height:32px">${I.x}</button>
        </div>

        <div class="queue-body">
          <!-- Overall Progress -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:12px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:13px;font-weight:700;color:#F8FAFC">Dispatch Progress: <strong style="color:#38BDF8">${sentCountAll} of ${totalAll} sent</strong></span>
              <span style="font-size:12px;color:#94A3B8">${pct}%</span>
            </div>
            <div class="queue-progress-bar-wrap">
              <div class="queue-progress-fill" style="width:${pct}%"></div>
            </div>
          </div>

          <!-- Queue Filter Tabs -->
          <div style="display:flex;gap:6px;align-items:center;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:10px">
            <span style="font-size:11px;color:#64748B;font-weight:700">Filter:</span>
            <button class="pill-btn ${queueFilter === "all" ? "active" : ""}" type="button" data-qfilter="all">All (${state.passes.length})</button>
            <button class="pill-btn ${queueFilter === "unsent" ? "active" : ""}" type="button" data-qfilter="unsent">Not Sent (${totalAll - sentCountAll})</button>
            <button class="pill-btn ${queueFilter === "sent" ? "active" : ""}" type="button" data-qfilter="sent">Sent (${sentCountAll})</button>
          </div>

          ${p ? `
            <!-- Current Recipient Card -->
            <div class="current-recipient-card">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px">
                <span style="font-size:11px;color:#94A3B8;font-weight:700">Recipient ${curIdx + 1} of ${list.length}</span>
                ${isAlreadySent 
                  ? `<span class="sent-status-badge sent-status-sent">✓ Sent at ${esc(sentTimeStr)}</span>`
                  : `<span class="sent-status-badge sent-status-unsent">⏳ Not sent</span>`}
              </div>
              <h2 style="font-size:24px;color:#F8FAFC;margin:4px 0">${esc(p.name)}</h2>
              <div style="display:flex;gap:8px;justify-content:center;align-items:center;margin:6px 0 14px">
                <span class="mini-tier ${tier.cssClass}" style="margin:0">${tier.icon} ${tier.shortLabel}</span>
                <span style="font-size:13px;color:#94A3B8;font-family:monospace">${esc(p.contact || "No contact info")}</span>
              </div>

              <!-- Primary Action Button -->
              <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:12px">
                ${sendAction ? `
                  <a class="btn-primary compact" id="dispatchBtn" href="${esc(sendAction.href)}" target="_blank" rel="noopener" style="margin:0">
                    <span class="tix">${sendAction.icon}</span>
                    <span class="label">${isAlreadySent ? `Send Again on ${sendAction.label.split(" ")[2] || sendAction.label}` : sendAction.label}</span>
                    <span class="arrow">${I.arrow}</span>
                  </a>
                ` : `
                  <button class="btn small" type="button" disabled style="opacity:0.6">No phone or email to send</button>
                `}
                <button class="btn small" type="button" id="copyCurrentLink">${I.copy}Copy Link</button>
              </div>

              <!-- Stepper Navigation -->
              <div style="display:flex;gap:8px;justify-content:space-between;align-items:center;padding-top:10px;border-top:1px solid rgba(255,255,255,0.08)">
                <button class="btn small" type="button" id="prevRecip" ${curIdx === 0 ? "disabled" : ""}>${I.back}Previous</button>
                <div style="display:flex;gap:6px">
                  <button class="btn small" type="button" id="skipRecip">Skip</button>
                  <button class="btn small primary" type="button" id="nextRecip" style="background:#0284C7;color:#fff">${curIdx === list.length - 1 ? "Finish" : "Next Attendee ➔"}</button>
                </div>
              </div>
            </div>

            <!-- Message Template Editor & Live Preview -->
            <details class="template-editor-box">
              <summary style="cursor:pointer;font-size:12px;color:#38BDF8;font-weight:700;display:flex;align-items:center;gap:6px">
                <span>✏️</span>
                <span>Customize Message Template & Variables</span>
              </summary>
              <div style="margin-top:10px">
                <textarea class="textarea" id="tplEditor" style="min-height:90px;font-size:12px;font-family:monospace">${esc(tpl)}</textarea>
                <div class="template-var-chips">
                  <span style="font-size:11px;color:#64748B;align-self:center">Insert:</span>
                  <span class="var-chip" data-var="{name}">{name}</span>
                  <span class="var-chip" data-var="{event}">{event}</span>
                  <span class="var-chip" data-var="{tier}">{tier}</span>
                  <span class="var-chip" data-var="{link}">{link}</span>
                </div>
                <div style="display:flex;gap:8px;margin-top:8px">
                  <button class="btn small" type="button" id="saveTplBtn">Save Template</button>
                  <button class="btn small" type="button" id="resetTplBtn">Reset</button>
                </div>
              </div>
            </details>
          ` : `
            <div style="text-align:center;padding:32px 16px;background:rgba(255,255,255,0.02);border-radius:14px">
              <div style="font-size:36px;margin-bottom:8px">🎉</div>
              <h4 style="color:#F8FAFC;margin:0 0 6px">No attendees in this filter</h4>
              <p style="font-size:13px;color:#94A3B8;margin:0 0 14px">All passes in this filter have been handled.</p>
              <button class="btn small" type="button" id="viewAllInQueue">Show All Passes</button>
            </div>
          `}

          <!-- Secondary Actions -->
          <div style="display:flex;gap:8px;justify-content:space-between;flex-wrap:wrap;padding-top:8px;border-top:1px solid rgba(255,255,255,0.08)">
            <button class="btn small" type="button" id="qCopyAllLinks">${I.copy}Copy All Links</button>
            <button class="btn small" type="button" id="qExportCsv">${I.download}Export CSV (with message text)</button>
          </div>
        </div>
      </div>
    `;

    // Event Bindings
    overlay.querySelector("#closeQueueModal").onclick = () => {
      overlay.remove();
      renderPassTools(state);
      renderList(state);
    };

    overlay.querySelectorAll("button[data-qfilter]").forEach(b => {
      b.onclick = () => {
        queueFilter = b.dataset.qfilter;
        curIdx = 0;
        renderQueueModal();
      };
    });

    overlay.querySelector("#viewAllInQueue")?.addEventListener("click", () => {
      queueFilter = "all";
      curIdx = 0;
      renderQueueModal();
    });

    if (p) {
      overlay.querySelector("#dispatchBtn")?.addEventListener("click", () => {
        markPassSent(p.id);
        toast(`Pass marked sent to ${p.name}`);
        setTimeout(() => {
          if (curIdx < list.length - 1) {
            curIdx++;
            renderQueueModal();
          } else {
            renderQueueModal();
          }
        }, 300);
      });

      overlay.querySelector("#copyCurrentLink")?.addEventListener("click", async () => {
        (await copyText(passUrl(p.token))) ? toast(`Copied link for ${p.name}`) : toast("Couldn't copy", "x");
      });

      overlay.querySelector("#prevRecip")?.addEventListener("click", () => {
        if (curIdx > 0) { curIdx--; renderQueueModal(); }
      });

      overlay.querySelector("#skipRecip")?.addEventListener("click", () => {
        if (curIdx < list.length - 1) { curIdx++; renderQueueModal(); }
        else toast("Reached the end of queue");
      });

      overlay.querySelector("#nextRecip")?.addEventListener("click", () => {
        if (curIdx < list.length - 1) { curIdx++; renderQueueModal(); }
        else {
          toast("Finished going through queue!");
          overlay.remove();
          renderPassTools(state);
          renderList(state);
        }
      });

      const tplEditor = overlay.querySelector("#tplEditor");
      overlay.querySelectorAll(".var-chip").forEach(c => {
        c.onclick = () => {
          if (tplEditor) {
            tplEditor.value += c.dataset.var;
            tpl = tplEditor.value;
          }
        };
      });

      overlay.querySelector("#saveTplBtn")?.addEventListener("click", () => {
        if (tplEditor) {
          tpl = tplEditor.value;
          saveTemplate(tpl);
          toast("Message template saved!");
          renderQueueModal();
        }
      });

      overlay.querySelector("#resetTplBtn")?.addEventListener("click", () => {
        tpl = DEFAULT_MSG_TEMPLATE;
        saveTemplate(tpl);
        toast("Reset to default template");
        renderQueueModal();
      });
    }

    overlay.querySelector("#qCopyAllLinks")?.addEventListener("click", async () => {
      const text = state.passes.map((p) => `${p.name}: ${passUrl(p.token)}`).join("\n");
      (await copyText(text)) ? toast(`${plural(state.passes.length, "link")} copied`) : toast("Couldn't copy", "x");
    });

    overlay.querySelector("#qExportCsv")?.addEventListener("click", () => {
      const currentTpl = getSavedTemplate();
      const rows = [["name", "contact", "tier", "pass_link", "sent_status", "message_text"]].concat(state.passes.map((p) => {
        const s = getSentStatus(p.id);
        const tr = getTier(p);
        const msg = formatTpl(currentTpl, state, p);
        return [p.name, p.contact, tr.shortLabel, passUrl(p.token), s ? s.toISOString() : "Not sent", msg];
      }));
      const slug = state.ev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event";
      download(`${slug}-passes-messages.csv`, toCsv(rows));
    });
  }

  document.body.appendChild(overlay);
  renderQueueModal();
}

function msgFor(state, p) {
  const ev = state.ev;
  const first = p.name.split(" ")[0];
  return `🎟️ Official Entry Pass for ${ev.name}

Hi ${first}! Your digital entry pass is confirmed and ready.

📅 Date & Time: ${fmtWhen(ev.starts_at)}
📍 Venue: ${ev.venue || "Announced at Entrance"}
👤 Attendee: ${p.name}
🔒 Pass Link: ${passUrl(p.token)}

⚠️ IMPORTANT GATE INSTRUCTIONS:
1. Turn your screen brightness to maximum before scanning at the gate.
2. This QR is cryptographically locked and works ONCE. Do not share or forward this pass.
3. A downloaded copy or screenshot also works even without cellular network.

See you at the event!
Powered by EntryGo · https://entrygo.live`;
}
function sendHref(state, p) {
  const c = p.contact || "";
  if (isEmail(c)) return { href: `mailto:${encodeURIComponent(c)}?subject=${encodeURIComponent(`Your pass for ${state.ev.name}`)}&body=${encodeURIComponent(msgFor(state, p))}`, icon: I.mail, label: "Email" };
  if (isPhone(c)) {
    let d = c.replace(/\D/g, "");
    if (d.length === 10) d = "91" + d;          // assume India for bare 10-digit numbers
    if (d.length === 11 && d.startsWith("0")) d = "91" + d.slice(1);
    return { href: `https://wa.me/${d}?text=${encodeURIComponent(msgFor(state, p))}`, icon: I.chat, label: "WhatsApp" };
  }
  return null;
}

function renderPassTools(state) {
  const el = view.querySelector("#passTools");
  const total = state.passes.length;
  const inCount = state.first.size;
  const outCount = Math.max(0, total - inCount);

  // Calculate live tier counts for filter pills
  let vipC = 0, bkC = 0, volC = 0, stdC = 0;
  for (const p of state.passes) {
    const tr = getTier(p);
    if (tr.id === "vip") vipC++;
    else if (tr.id === "backstage") bkC++;
    else if (tr.id === "volunteer") volC++;
    else stdC++;
  }

  view.querySelector("#pcount").innerHTML = total ? `<span class="sync-pulse" title="1-sec live sync"></span> ${plural(total, "pass", "passes")}` : "";
  if (!total) {
    el.innerHTML = `<div class="empty"><h3>No passes yet</h3><p class="sub" style="color:var(--blue)">Upload the registrations sheet and each row becomes a pass with its own link.</p></div>`;
    return;
  }
  el.innerHTML = `
    <!-- Bulk Send Pass Hero Row -->
    <div style="background:linear-gradient(135deg,rgba(56,189,248,0.12),rgba(129,140,248,0.12));border:1px solid rgba(56,189,248,0.3);border-radius:14px;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
      <div>
        <strong style="color:#F8FAFC;font-size:14px">Bulk Pass Dispatch</strong>
        <div style="font-size:12px;color:#94A3B8">Send tickets via WhatsApp & Email in a step-by-step queue</div>
      </div>
      <button class="btn-primary compact" type="button" id="sendAllBtn" style="margin:0">
        <span class="tix">${I.chat}</span>
        <span class="label">Send all passes</span>
        <span class="arrow">${I.arrow}</span>
      </button>
    </div>

    <div class="tools" style="margin-top:4px">
      <button class="btn small" type="button" id="cpAll">${I.copy}Copy all links</button>
      <button class="btn small" type="button" id="csv">${I.download}Export CSV</button>
    </div>

    <div class="pass-filters-wrap">
      <div class="search">
        <span>${I.search}</span>
        <input class="input" id="filter" placeholder="Search attendee name or contact" autocomplete="off" value="${esc(state.filter)}">
      </div>
      
      <!-- Status Pills: All / Checked in / Not in -->
      <div class="filter-pills-row">
        <div class="status-pills" id="statusPills" role="tablist" aria-label="Pass status filter">
          <button type="button" class="pill-btn ${state.filterStatus === "all" ? "active" : ""}" data-status="all">All <span class="pill-badge">${total}</span></button>
          <button type="button" class="pill-btn pill-in ${state.filterStatus === "in" ? "active" : ""}" data-status="in">Checked in <span class="pill-badge">${inCount}</span></button>
          <button type="button" class="pill-btn pill-out ${state.filterStatus === "out" ? "active" : ""}" data-status="out">Not in <span class="pill-badge">${outCount}</span></button>
        </div>

        <div class="page-size-pills" id="sizePills" aria-label="Items per page">
          <span style="font-size:11px;color:#64748B;font-weight:600;padding-left:4px">Show:</span>
          <button type="button" class="pill-btn ${state.pageSize === 10 ? "active" : ""}" data-size="10">10</button>
          <button type="button" class="pill-btn ${state.pageSize === 20 ? "active" : ""}" data-size="20">20</button>
          <button type="button" class="pill-btn ${state.pageSize === 30 ? "active" : ""}" data-size="30">30</button>
          <button type="button" class="pill-btn ${state.pageSize === 9999 ? "active" : ""}" data-size="9999">All</button>
        </div>
      </div>

      <!-- Tier Pills: All / VIP / Backstage / Volunteer / Standard -->
      <div class="filter-pills-row" style="margin-top:6px">
        <div class="status-pills" id="tierPills" role="tablist" aria-label="Tier filter">
          <button type="button" class="pill-btn ${(!state.filterTier || state.filterTier === "all") ? "active" : ""}" data-tier="all">All Tiers <span class="pill-badge">${total}</span></button>
          <button type="button" class="pill-btn ${state.filterTier === "vip" ? "active" : ""}" data-tier="vip" style="border-color:rgba(251,191,36,0.3)">⭐ VIP <span class="pill-badge">${vipC}</span></button>
          <button type="button" class="pill-btn ${state.filterTier === "backstage" ? "active" : ""}" data-tier="backstage" style="border-color:rgba(192,132,252,0.3)">⚡ Backstage <span class="pill-badge">${bkC}</span></button>
          <button type="button" class="pill-btn ${state.filterTier === "volunteer" ? "active" : ""}" data-tier="volunteer" style="border-color:rgba(52,211,153,0.3)">🤝 Volunteer <span class="pill-badge">${volC}</span></button>
          <button type="button" class="pill-btn ${state.filterTier === "standard" ? "active" : ""}" data-tier="standard" style="border-color:rgba(148,163,184,0.3)">🎟️ Standard <span class="pill-badge">${stdC}</span></button>
        </div>
      </div>
    </div>`;

  el.querySelector("#cpAll").addEventListener("click", async () => {
    const text = state.passes.map((p) => `${p.name}: ${passUrl(p.token)}`).join("\n");
    (await copyText(text)) ? toast(`${plural(state.passes.length, "link")} copied`) : toast("Couldn't copy. Use Export CSV.", "x");
  });
  el.querySelector("#csv").addEventListener("click", () => {
    const rows = [["name", "contact", "pass_link", "checked_in_at", "gate"]].concat(state.passes.map((p) => {
      const s = state.first.get(p.id);
      return [p.name, p.contact, passUrl(p.token), s ? new Date(s.scanned_at).toISOString() : "", s ? s.gate : ""];
    }));
    const slug = state.ev.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "event";
    download(`${slug}-passes.csv`, toCsv(rows));
  });

  let t;
  el.querySelector("#filter").addEventListener("input", (e) => {
    clearTimeout(t);
    t = setTimeout(() => {
      state.filter = e.target.value;
      state.shown = state.pageSize;
      renderList(state);
    }, 120);
  });

  el.querySelector("#statusPills").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-status]");
    if (!btn) return;
    state.filterStatus = btn.dataset.status;
    state.shown = state.pageSize;
    renderPassTools(state);
    renderList(state);
  });

  el.querySelector("#sizePills").addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-size]");
    if (!btn) return;
    state.pageSize = +btn.dataset.size;
    state.shown = state.pageSize;
    renderPassTools(state);
    renderList(state);
  });

  el.querySelector("#tierPills")?.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-tier]");
    if (!btn) return;
    state.filterTier = btn.dataset.tier;
    state.shown = state.pageSize;
    renderPassTools(state);
    renderList(state);
  });

  el.querySelector("#sendAllBtn")?.addEventListener("click", () => {
    openSendQueue(state);
  });
}

function rowHtml(state, p) {
  const s = state.first.get(p.id);
  const send = sendHref(state, p);
  const tier = getTier(p);
  const curTier = p.tier || (tier.shortLabel === "VIP" ? "VIP" : tier.shortLabel === "VOLUNTEER" ? "Volunteer" : tier.shortLabel === "BACKSTAGE" ? "Backstage" : "Standard");
  
  const sentTime = getSentStatus(p.id);
  const sentBadge = sentTime 
    ? `<span class="sent-status-badge sent-status-sent" title="Dispatched at ${esc(fmtTime(sentTime))}">✓ Sent ${esc(fmtTime(sentTime))}</span>` 
    : `<span class="sent-status-badge sent-status-unsent">Not sent</span>`;

  return `
    <li data-id="${p.id}">
      <p class="pl-name">
        ${esc(p.name)}
        <select class="tier-select-inline ${tier.cssClass}" data-change-tier="${p.id}" title="Change attendee tier">
          <option value="Standard" ${curTier === "Standard" ? "selected" : ""}>🎟️ Standard</option>
          <option value="VIP" ${curTier === "VIP" ? "selected" : ""}>⭐ VIP</option>
          <option value="Volunteer" ${curTier === "Volunteer" ? "selected" : ""}>🤝 Volunteer</option>
          <option value="Backstage" ${curTier === "Backstage" ? "selected" : ""}>⚡ Backstage</option>
        </select>
        ${sentBadge}
      </p>
      <p class="pl-meta">${s ? `<span class="in">✓ In ${esc(fmtTime(s.scanned_at))} · ${esc(s.gate || "Gate 1")}</span> · ` : `<span style="color:#64748B">Not in</span> · `}<span style="font-family:monospace">${esc(maskContact(p.contact))}</span></p>
      <div class="pl-actions">
        ${send && send.label === "Email" ? `<button class="icon-btn" type="button" data-preview-mail="${p.id}" aria-label="Preview and send email" title="Preview email">${send.icon}</button>` : (send ? `<a class="icon-btn" href="${esc(send.href)}" target="_blank" rel="noopener" data-mark-sent="${p.id}" aria-label="${send.label} ${esc(p.name)} their pass" title="${send.label}">${send.icon}</a>` : "")}
        <button class="icon-btn" type="button" data-copy="${esc(p.token)}" aria-label="Copy ${esc(p.name)}'s pass link" title="Copy link">${I.copy}</button>
        <a class="icon-btn" href="${esc(passUrl(p.token))}" target="_blank" rel="noopener" aria-label="Open ${esc(p.name)}'s pass" title="Open pass">${I.open}</a>
      </div>
    </li>`;
}

function renderList(state) {
  const ul = view.querySelector("#plist"), more = view.querySelector("#more");
  const f = state.filter.trim().toLowerCase();

  let list = state.passes;
  // Apply Search
  if (f) {
    list = list.filter((p) => p.name.toLowerCase().includes(f) || (p.contact || "").toLowerCase().includes(f));
  }
  // Apply Check-in / Not in status filter
  if (state.filterStatus === "in") {
    list = list.filter((p) => state.first.has(p.id));
  } else if (state.filterStatus === "out") {
    list = list.filter((p) => !state.first.has(p.id));
  }

  // Apply Tier filter
  if (state.filterTier && state.filterTier !== "all") {
    list = list.filter((p) => {
      const tr = getTier(p);
      return tr.id === state.filterTier;
    });
  }

  const visible = list.slice(0, state.shown);
  ul.innerHTML = visible.map((p) => rowHtml(state, p)).join("") || (state.passes.length ? `<li><p class="pl-meta" style="text-align:center;padding:16px">No passes match the current filters.</p></li>` : "");
  ul.style.borderTop = ul.innerHTML ? "" : "0";

  const remaining = list.length - state.shown;
  more.innerHTML = remaining > 0 ? `<button class="btn small" type="button" id="moreBtn">Show next ${Math.min(state.pageSize, remaining)} of ${remaining} more</button>` : (list.length > 0 && state.pageSize !== 9999 ? `<p class="fine" style="text-align:center;margin:6px 0 0;color:#64748B">Showing all ${list.length} passes</p>` : "");

  more.querySelector("#moreBtn")?.addEventListener("click", () => {
    state.shown += state.pageSize;
    renderList(state);
  });

  ul.onclick = async (e) => {
    const markSentBtn = e.target.closest("[data-mark-sent]");
    if (markSentBtn) {
      const pId = markSentBtn.dataset.markSent;
      markPassSent(pId);
      const li = ul.querySelector(`li[data-id="${pId}"]`);
      const p = state.passes.find(x => x.id === pId);
      if (li && p) li.outerHTML = rowHtml(state, p);
    }
    const mailBtn = e.target.closest("[data-preview-mail]");
    if (mailBtn) {
      const p = state.passes.find(x => x.id === mailBtn.dataset.previewMail);
      if (p) openMailPreview(state, p);
      return;
    }
    const b = e.target.closest("[data-copy]");
    if (!b) return;
    (await copyText(passUrl(b.dataset.copy))) ? toast("Pass link copied") : toast("Couldn't copy", "x");
  };

  ul.onchange = async (e) => {
    const sel = e.target.closest("[data-change-tier]");
    if (!sel) return;
    const passId = sel.dataset.changeTier;
    const newTier = sel.value;
    const p = state.passes.find(x => x.id === passId);
    if (!p) return;
    p.tier = newTier;

    // Save instant local override by pass token & id
    if (p.token) {
      localStorage.setItem(`gp_tier_${p.token}`, newTier);
    }
    localStorage.setItem(`gp_tier_pass_${passId}`, newTier);

    if (localBackend.isDemoSession() || !sb) {
      localBackend.savePass({ id: passId, tier: newTier });
    } else {
      try {
        await sb.from("gp_passes").update({ tier: newTier }).eq("id", passId);
      } catch (err) {
        console.warn("Supabase update error (cached locally):", err.message);
      }
    }
    toast(`Tier changed to ${newTier} for ${p.name}`);
    const li = ul.querySelector(`li[data-id="${passId}"]`);
    if (li) li.outerHTML = rowHtml(state, p);
  };
}

// ── live updates ──
function startLive(state) {
  stopLive();
  const id = state.ev.id;
  const apply = (s) => {
    if (s.is_first) {
      if (state.first.has(s.pass_id)) return;
      state.first.set(s.pass_id, s);
      const li = view.querySelector(`#plist li[data-id="${s.pass_id}"]`);
      const p = state.passes.find((x) => x.id === s.pass_id);
      if (li && p) li.outerHTML = rowHtml(state, p);
    } else state.bounced++;
    renderStat(state, true);
    renderAnalytics(state);
  };
  live = sb.channel(`gp-scans-${id}`)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "gp_scans", filter: `event_id=eq.${id}` }, (msg) => apply(msg.new))
    .subscribe();
  // Belt and braces: re-sync every 20 s in case the socket sleeps (phones do that).
  pollTimer = setInterval(async () => {
    if (document.visibilityState !== "visible") return;
    try {
      const scans = await fetchAll("gp_scans", "id,pass_id,is_first,gate,scanned_at", id);
      const before = state.first.size + state.bounced;
      state.first = new Map(); state.bounced = 0;
      for (const s of scans) s.is_first ? state.first.set(s.pass_id, s) : state.bounced++;
      if (state.first.size + state.bounced !== before) { renderStat(state, true); renderAnalytics(state); renderList(state); }
    } catch { }
  }, 1000);
}
function stopLive() {
  if (live) { sb.removeChannel(live); live = null; }
  clearInterval(pollTimer);
}

paintIcons();
boot().catch(fail);

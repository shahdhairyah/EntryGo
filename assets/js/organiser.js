
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
  store, copyText, toast, download, qrSvg, I, paintIcons, PAUSED_MSG, escT, typo, localBackend
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
  roleEl.innerHTML = `Organiser <button class="icon-btn" type="button" id="signout" title="Sign out (${esc(session.user.email || "")})" aria-label="Sign out" style="width:36px;height:36px;margin-left:4px">${I.out}</button>`;
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
  const paused = /fetch|network|Failed to fetch|5\d\d/.test(msg) ? PAUSED_MSG + " Or check your connection." : msg;
  view.innerHTML = `<section class="empty"><h3>Something broke</h3><p class="sub">${esc(paused)}</p><p style="margin-top:14px"><button class="btn small" type="button" onclick="location.reload()">${I.refresh}Try again</button></p></section>`;
}

// ─────────────────────────────────────────────── sign in

function signInView(errMsg = "") {
  roleEl.textContent = "Organiser Portal";
  document.title = "EntryGo · Next-Gen QR Entry System";
  view.innerHTML = `
    <section class="home-creative-hero">
      <!-- Left 3D Glass Hero Card -->
      <div class="hero-glass-card" id="heroCard">
        <div class="hero-live-pill">
          <span class="dot"></span>
          <span>HIGH-VELOCITY EVENT ENGINE</span>
        </div>
        <div class="hero-poster-art" id="art"></div>
        <div class="hero-card-content">
          <h1 class="hero-headline">Instant Passes. <span>Zero Friction.</span></h1>
          <p class="hero-tagline">Upload registrations sheet ➔ Everyone gets a cryptographic QR pass.</p>
          <div class="hero-pills-row">
            <span class="feature-pill">⚡ <strong>&lt; 30s</strong> Generation</span>
            <span class="feature-pill">🔒 <strong>100%</strong> Anti-Fraud</span>
            <span class="feature-pill">📱 <strong>0</strong> App Downloads</span>
          </div>
        </div>
      </div>

      <!-- Right Interactive Auth Console -->
      <div class="hero-auth-console">
        <div>
          <h2 class="auth-header-title">Organizer Sign In</h2>
          <p class="auth-header-sub">Manage your events, dispatch verified tickets, and monitor live gates.</p>
        </div>

        <p class="err" id="sErr" role="alert" ${errMsg ? "" : "hidden"}>${esc(errMsg)}</p>

        <button class="google-auth-btn" type="button" id="google">
          <span class="gdisc">${I.google}</span>
          <span>Continue with Google</span>
        </button>

        <p class="fine" style="margin:0;color:#64748B;font-size:12px">Organizers sign in with Google OAuth. Gate volunteers and attendees never need an account.</p>

        <div class="quick-gate-links">
          <a class="quick-link-box" href="gate/">
            <span>${I.qr}</span>
            <span>Gate Scanner</span>
          </a>
          <a class="quick-link-box" href="p/#ZXDEMOTOKEN123456789012345678901">
            <span>${I.ticket}</span>
            <span>Sample Pass</span>
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
    const { error } = await sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirectTarget, shouldCreateUser: true } });
    btn.disabled = false; btn.querySelector(".label").textContent = "Send me a sign-in link";
    if (error) {
      err.textContent = /rate|too many|seconds/i.test(error.message)
        ? `Too many sign-in emails right now. ${cfg.googleSignIn ? "Use Google, or wait" : "Wait"} a few minutes and try again.`
        : error.message;
      err.hidden = false;
      return;
    }
    checkInbox(email);
  });
  view.querySelector("#google")?.addEventListener("click", () => {
    sb.auth.signInWithOAuth({ provider: "google", options: { redirectTo: redirectTarget } });
  });
}

function checkInbox(email) {
  view.innerHTML = `
    <section class="stack narrow">
      <div class="empty">
        <h3>Check your inbox</h3>
        <p class="sub" style="color:var(--blue)">We sent a sign-in link to <b>${esc(email)}</b>. Open it on this device. It works once and expires in an hour.</p>
        <p class="fine" style="margin:10px 0 0">Nothing after a minute? Look in spam, or go back and try again.</p>
      </div>
      <button class="btn" type="button" id="again">${I.back} Use a different email</button>
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
    return `
      <a class="stub" href="#/e/${e.id}" style="${past ? "opacity:.72" : ""}">
        <span class="stub-art" style="background-image:url('${artUrl(e.art, true)}')"></span>
        <span class="stub-body">
          <span class="stub-name ink">${escT(e.name)}</span>
          <span class="stub-meta">${esc(fmtWhen(e.starts_at))}${e.venue ? ` · ${esc(e.venue)}` : ""}</span>
        </span>
        <span class="stub-count">${checked} / ${total}<small>${total ? "checked in" : "no passes yet"}</small></span>
      </a>`;
  }).join("");
  view.innerHTML = `
    <section class="stack narrow">
      <div class="head-row"><h1 class="head">Your events</h1></div>
      ${data.length ? stubs : `
        <div class="empty">
          <h3>No events yet</h3>
          <p class="sub">Make one, drop in your registrations sheet, and every row gets a pass.</p>
        </div>`}
      <a class="btn-primary compact" href="#/new" style="margin-top:6px"><span class="tix">${I.ticket}</span><span class="label">New event</span><span class="arrow">${I.arrow}</span></a>
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
        fetchAll("gp_passes", "id,name,contact,token,created_at", id),
        fetchAll("gp_scans", "id,pass_id,is_first,gate,scanned_at", id),
      ]);
    }
  } catch (e) { return fail(e); }

  passes.sort((a, b) => a.created_at.localeCompare(b.created_at) || a.name.localeCompare(b.name));
  const state = { ev, passes, first: new Map(), bounced: 0, upload: null, filter: "", filterStatus: "all", pageSize: 10, shown: 10 };
  for (const s of scans) s.is_first ? state.first.set(s.pass_id, s) : state.bounced++;

  document.title = `${typo(ev.name)} · EntryGo`;
  view.innerHTML = `
    <a class="backlink" href="#">${I.back}Your events</a>
    <div class="dash">
      <div class="left stack">
        <div class="poster" id="poster">
          <h1 class="poster-title ink">${escT(ev.name)}</h1>
          ${ev.club ? `<p class="poster-club">${esc(ev.club)}</p>` : ""}
          <span class="poster-when">${esc(fmtWhen(ev.starts_at))}${ev.venue ? ` · ${esc(ev.venue)}` : ""}</span>
        </div>
        <div id="regSlot" class="stack"></div>
        <div class="stat grain" id="stat"></div>
        <div id="analyticsSlot"></div>
        <div class="gatebox" id="gatebox"></div>
      </div>
      <div class="right stack">
        <div class="head-row section-gap-m"><h2 class="head">Passes</h2><span class="fine" id="pcount"></span></div>
        <div id="passTools" class="stack"></div>
        <ul class="passlist" id="plist"></ul>
        <div class="more-row" id="more"></div>
        <div class="danger-zone">
          <a class="btn small" href="#/e/${id}/edit">Edit details</a>
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
      <button class="btn small" type="button" id="pasteBtn" style="align-self:flex-start">${I.copy}Or paste rows from your sheet</button>
      <div id="pasteBox" class="stack" hidden>
        <textarea class="textarea" id="pasteTa" placeholder="Copy the cells in Google Sheets (with the header row) and paste here.&#10;Name, Email or Phone, …"></textarea>
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
      if (!box.hidden) slot.querySelector("#pasteTa").focus();
    });
    slot.querySelector("#pasteUse").addEventListener("click", () => loadRows(state, slot.querySelector("#pasteTa").value, "pasted rows"));
    return;
  }

  const { a, fileName, nameCol, contactCol, open } = up;
  const res = toPasses(a, nameCol, contactCol, state.passes);
  up.res = res;
  const n = res.passes.length;
  const skipped = [res.blank && `${plural(res.blank, "row")} without a name`, res.dup && `${plural(res.dup, "duplicate")}`].filter(Boolean).join(", ");
  const opt = (sel, none) => `${none ? `<option value="-1" ${sel === -1 ? "selected" : ""}>None</option>` : ""}${a.cols.map((c) => `<option value="${c.i}" ${c.i === sel ? "selected" : ""}>${esc(c.label)}</option>`).join("")}`;
  slot.innerHTML = `
    <button class="row" type="button" id="toggle" aria-expanded="${open ? "true" : "false"}">
      <span style="width:30px;height:36px;display:block">${I.doc}</span>
      <span class="grow"><span class="fname">${esc(fileName)} · ${plural(a.body.length, "row")}</span>${skipped ? `<small>${n} new · skipping ${skipped}</small>` : ""}</span>
      <span class="chev" style="transition:rotate .2s;${open ? "rotate:90deg" : ""}">${I.chev}</span>
    </button>
    <div class="upload-preview" ${open ? "" : "hidden"}>
      <div class="two">
        <label class="field"><span>Name column</span><select class="select" id="nameCol">${opt(nameCol)}</select></label>
        <label class="field"><span>Contact column</span><select class="select" id="contactCol">${opt(contactCol, true)}</select></label>
      </div>
      <table class="preview-table">
        <thead><tr><th>Name</th><th>Contact</th></tr></thead>
        <tbody>${res.passes.slice(0, 5).map((p) => `<tr><td>${esc(p.name)}</td><td>${esc(p.contact || "—")}</td></tr>`).join("") || `<tr><td colspan="2">No usable rows. Pick the column that has names.</td></tr>`}</tbody>
      </table>
      ${n > 5 ? `<p class="fine" style="margin:0">…and ${n - 5} more.</p>` : ""}
      <button class="btn small pinkline" type="button" id="cancelUp" style="align-self:flex-start">${I.x}Cancel</button>
    </div>
    <button class="btn-primary" type="button" id="gen" ${n ? "" : "disabled"}>
      <span class="tix">${I.ticket}</span>
      <span class="label">Generate ${n} ${n === 1 ? "pass" : "passes"}</span>
      <span class="arrow">${I.arrow}</span>
    </button>`;
  slot.querySelector("#toggle").addEventListener("click", () => { up.open = !up.open; renderReg(state); });
  slot.querySelector("#nameCol")?.addEventListener("change", (e) => { up.nameCol = +e.target.value; renderReg(state); });
  slot.querySelector("#contactCol")?.addEventListener("change", (e) => { up.contactCol = +e.target.value; renderReg(state); });
  slot.querySelector("#cancelUp")?.addEventListener("click", () => { state.upload = null; renderReg(state); });
  slot.querySelector("#gen").addEventListener("click", () => generate(state));
}

function loadRows(state, text, fileName) {
  const rows = parseTable(text);
  if (!rows.length) return toast("That sheet is empty", "x");
  const a = analyse(rows);
  if (a.body.length > MAX_ROWS) return toast(`That's ${a.body.length} rows. EntryGo takes up to ${MAX_ROWS} at a time.`, "x");
  state.upload = { a, fileName, nameCol: a.name, contactCol: a.contact, open: !a.hasHeader };
  renderReg(state);
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
      contact: p.contact
    }));
    if (localBackend.isDemoSession() || !sb) {
      localBackend.addPasses(batch);
      state.passes.push(...batch);
      done += batch.length;
    } else {
      const { data, error } = await sb.from("gp_passes").insert(batch).select("id,name,contact,token,created_at");
      if (error) { failed = error; break; }
      state.passes.push(...data);
      done += data.length;
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

// ── checked-in counter ──
function renderStat(state, bump = false) {
  const total = state.passes.length, checked = state.first.size;
  const el = view.querySelector("#stat");
  el.innerHTML = `
    <span class="dot">${I.dotCheck}</span>
    <p class="stat-label">Checked in</p>
    <div class="stat-line"><p class="stat-num ink" id="snum">${checked} / ${total}</p><div class="bar" aria-hidden="true"><i style="--p:${total ? Math.min(1, checked / total) : 0}"></i></div></div>
    ${state.bounced ? `<p class="stat-note">${plural(state.bounced, "repeat scan")} bounced at the gate</p>` : ""}`;
  el.setAttribute("aria-label", `Checked in ${checked} of ${total}`);
  if (bump) { const n = el.querySelector("#snum"); n.animate([{ transform: "scale(1.08)", color: "#FF2FA2" }, { transform: "scale(1)" }], { duration: 520, easing: "cubic-bezier(.16,1,.3,1)" }); }
}

// ── gate code ──
function renderGate(state, showQr = false) {
  const ev = state.ev, el = view.querySelector("#gatebox");
  el.innerHTML = `
    <p class="kicker-free">Gate code</p>
    <p class="gate-code ink" aria-label="Gate code ${fmtCode(ev.gate_code).split("").join(" ")}">${fmtCode(ev.gate_code)}</p>
    <p class="fine">Staff open <b>${esc(gateUrl("").replace(/#$/, "").replace(/^https?:\/\//, ""))}</b> and type this. Anyone with the code can scan, so share it only with your team.</p>
    <div class="btns">
      <button class="btn small" type="button" id="cpGate">${I.link}Copy gate link</button>
      <button class="btn small" type="button" id="qrGate" aria-expanded="${showQr}">${I.qr}${showQr ? "Hide QR" : "Show QR"}</button>
      <button class="btn small" type="button" id="rot">${I.refresh}New code</button>
    </div>
    ${showQr ? `<div class="gate-qr">${qrSvg(gateUrl(ev.gate_code), { label: "QR to join the gate" })}<p class="fine" style="color:var(--blue);margin:0">Staff scan this with their phone camera to open the scanner with the code filled in.</p></div>` : ""}`;
  el.querySelector("#cpGate").addEventListener("click", async () => { (await copyText(gateUrl(ev.gate_code))) ? toast("Gate link copied") : toast("Couldn't copy", "x"); });
  el.querySelector("#qrGate").addEventListener("click", () => renderGate(state, !showQr));
  let armed = 0;
  el.querySelector("#rot").addEventListener("click", async (e) => {
    const b = e.currentTarget;
    if (Date.now() - armed > 4000) { armed = Date.now(); b.innerHTML = `${I.refresh}Tap again: old code stops working`; return; }
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
    toast("New gate code. Staff need to re-join.");
  });
}

// ── passes: tools + list ──
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

  view.querySelector("#pcount").innerHTML = total ? `<span class="sync-pulse" title="1-sec live sync"></span> ${plural(total, "pass", "passes")}` : "";
  if (!total) {
    el.innerHTML = `<div class="empty"><h3>No passes yet</h3><p class="sub" style="color:var(--blue)">Upload the registrations sheet and each row becomes a pass with its own link.</p></div>`;
    return;
  }
  el.innerHTML = `
    <div class="tools">
      <button class="btn small" type="button" id="cpAll">${I.copy}Copy all links</button>
      <button class="btn small" type="button" id="csv">${I.download}Export CSV</button>
    </div>
    <div class="pass-filters-wrap">
      <div class="search">
        <span>${I.search}</span>
        <input class="input" id="filter" placeholder="Search attendee name or contact" autocomplete="off" value="${esc(state.filter)}">
      </div>
      <div class="filter-pills-row">
        <div class="status-pills" id="statusPills" role="tablist" aria-label="Pass status filter">
          <button type="button" class="pill-btn ${state.filterStatus === "all" ? "active" : ""}" data-status="all">All <span class="pill-badge">${total}</span></button>
          <button type="button" class="pill-btn pill-in ${state.filterStatus === "in" ? "active" : ""}" data-status="in">Check-in <span class="pill-badge">${inCount}</span></button>
          <button type="button" class="pill-btn pill-out ${state.filterStatus === "out" ? "active" : ""}" data-status="out">Check-out <span class="pill-badge">${outCount}</span></button>
        </div>
        <div class="page-size-pills" id="sizePills" aria-label="Items per page">
          <span style="font-size:11px;color:#64748B;font-weight:600;padding-left:4px">Show:</span>
          <button type="button" class="pill-btn ${state.pageSize === 10 ? "active" : ""}" data-size="10">10</button>
          <button type="button" class="pill-btn ${state.pageSize === 20 ? "active" : ""}" data-size="20">20</button>
          <button type="button" class="pill-btn ${state.pageSize === 30 ? "active" : ""}" data-size="30">30</button>
          <button type="button" class="pill-btn ${state.pageSize === 9999 ? "active" : ""}" data-size="9999">All</button>
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
}

function rowHtml(state, p) {
  const s = state.first.get(p.id);
  const send = sendHref(state, p);
  return `
    <li data-id="${p.id}">
      <p class="pl-name">${esc(p.name)}</p>
      <p class="pl-meta">${s ? `<span class="in">✓ In ${esc(fmtTime(s.scanned_at))} · ${esc(s.gate)}</span> · ` : `<span style="color:#64748B">Not checked in</span> · `}${esc(p.contact || "no contact")}</p>
      <div class="pl-actions">
        ${send && send.label === "Email" ? `<button class="icon-btn" type="button" data-preview-mail="${p.id}" aria-label="Preview and send email" title="Preview email">${send.icon}</button>` : (send ? `<a class="icon-btn" href="${esc(send.href)}" target="_blank" rel="noopener" aria-label="${send.label} ${esc(p.name)} their pass" title="${send.label}">${send.icon}</a>` : "")}
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
  // Apply Check-in / Check-out status filter
  if (state.filterStatus === "in") {
    list = list.filter((p) => state.first.has(p.id));
  } else if (state.filterStatus === "out") {
    list = list.filter((p) => !state.first.has(p.id));
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

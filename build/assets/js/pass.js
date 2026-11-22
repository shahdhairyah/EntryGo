// The attendee's pass. Public at /p/#<token>; reads only its own pass through gp_pass().
import { configured, rpc, esc, escT, typo, fmtWhen, fmtTime, qrSvg, setArt, passUrl, copyText, toast, I, ROOT, PAUSED_MSG, getTier } from "./core.js";

const view = document.getElementById("view");
const token = decodeURIComponent((location.hash || "").replace(/^#\/?/, "")).trim();

function missing(title, body) {
  document.title = "Pass not found · EntryGo";
  view.innerHTML = `
    <section class="torn">
      <h1>${esc(title)}</h1>
      <p class="sub">${body}</p>
    </section>`;
}

async function load() {
  if (!/^[A-Za-z0-9_-]{10,}$/.test(token)) {
    return missing("No pass here", "This link is incomplete. Open the whole link from your message again, or ask the organiser to resend it.");
  }
  let p;
  try {
    p = await rpc("gp_pass", { p_token: token });
  } catch (e) {
    if (e.offline) return missing("You're offline", "Connect to the internet once to load your pass. After that, a screenshot works at the gate too (once).");
    if (e.paused) return missing("Back in a minute", esc(PAUSED_MSG));
    return missing("Couldn't load", esc(e.message));
  }
  if (!p) return missing("No pass here", "This pass doesn't exist or the event was deleted. Ask the organiser to resend your link.");

  // Check client-side updated tier if present
  const localTier = localStorage.getItem(`gp_tier_${token}`);
  if (localTier) {
    p.tier = localTier;
  }

  render(p);
}

function render(p) {
  const ev = p.event;
  document.title = `${p.name} · ${typo(ev.name)} · EntryGo`;
  const used = !!p.checked_in_at;
  const tier = getTier(p);

  view.innerHTML = `
    <div class="ticket-wrap">
      <article class="ticket ${used ? "used" : ""} ticket-${tier.id}" aria-label="Entry pass for ${esc(p.name)}">
        <div class="ticket-badge ${tier.cssClass}">
          <span class="dot"></span>
          <span class="badge-tier-tag">${tier.icon} ${tier.shortLabel}</span>
          <span class="badge-status-sep">·</span>
          <span>${used ? "USED" : "ACTIVE PASS"}</span>
        </div>
        <div class="t-art" role="img" aria-label=""></div>
        <div class="t-body">
          <div class="t-tier-pill ${tier.cssClass}">
            <span class="tier-pill-icon">${tier.icon}</span>
            <span class="tier-pill-label">${tier.label}</span>
          </div>
          <h1 class="t-name ink">${esc(p.name)}</h1>
          <div class="t-rule inked"></div>
          <p class="t-event ink">${escT(ev.name)}</p>
          <p class="t-when">${esc(fmtWhen(ev.starts_at))}</p>
          ${ev.venue ? `<p class="t-where">${esc(ev.venue)}</p>` : ""}
        </div>
        <div class="t-qr" id="qrContainer">
          ${qrSvg(passUrl(token), { label: `Entry QR for ${p.name}`, ghost: "#FF2FA2" })}
          ${used ? `<div class="t-stamp"><div class="inked">Checked in<small>${esc(fmtTime(p.checked_in_at))} · ${esc(p.gate)}</small></div></div>` : ""}
        </div>
        <div class="t-tear" aria-hidden="true"></div>
        <div class="t-stub ink">${used ? "Already used" : `Show this at the gate · ${tier.shortLabel}`}</div>
      </article>
    </div>
    <div class="pass-notes">
      <p class="fine">${used
        ? "This pass let someone in already. If that wasn't you, find the organiser at the gate."
        : "Turn your brightness up at the gate. A screenshot or saved PNG works too: first scan lets you in."}</p>
    </div>
    <div class="pass-actions">
      <button class="btn small" type="button" id="copy">${I.link}Copy pass link</button>
    </div>`;
  const t = view.querySelector(".ticket");
  setArt(view.querySelector(".t-art"), ev.art);

  // Dynamic 3D gyro tilt effect on mobile & mouse hover on desktop
  const handleTilt = (e) => {
    const rect = t.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    t.style.transform = `perspective(800px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-2px)`;
  };
  const resetTilt = () => {
    t.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
  };
  t.addEventListener("mousemove", handleTilt);
  t.addEventListener("mouseleave", resetTilt);

  view.querySelector("#copy").addEventListener("click", async () => {
    (await copyText(passUrl(token))) ? toast("Pass link copied") : toast("Couldn't copy. Long-press the address bar.", "x");
  });
  keepAwake();
}

// Keep the screen on while the pass is open (no-op where unsupported).
let lock;
async function keepAwake() {
  try { lock = await navigator.wakeLock?.request("screen"); } catch {}
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && lock?.released) keepAwake(); });
window.addEventListener("hashchange", () => location.reload());

load();
// Auto check pass status every 1 second so check-in stamp appears live
setInterval(() => {
  if (document.visibilityState === "visible") load();
}, 1000);

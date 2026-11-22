// The attendee's pass. Public at /p/#<token>; reads only its own pass through gp_pass().
import { configured, rpc, esc, escT, typo, fmtWhen, fmtTime, qrSvg, setArt, passUrl, copyText, toast, I, ROOT, PAUSED_MSG, getTier } from "./core.js";

const view = document.getElementById("view");
const token = decodeURIComponent((location.hash || "").replace(/^#\/?/, "")).trim();

function missing(title, body) {
  document.title = "Pass not found · EntryGo";
  view.innerHTML = `
    <section class="torn" role="alert" style="max-width:440px;margin:30px auto;text-align:center;padding:24px 18px;background:rgba(15,23,42,0.85);border:1px solid rgba(244,63,94,0.3);border-radius:16px;box-shadow:0 10px 30px rgba(0,0,0,0.5)">
      <div style="font-size:36px;margin-bottom:10px">🎫</div>
      <h1 class="head" style="font-size:26px;color:#FDA4AF;margin:0 0 8px">${esc(title)}</h1>
      <p class="sub" style="color:#94A3B8;font-size:15px;line-height:1.5;margin:0 0 18px">${body}</p>
      <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
        <button class="btn small" type="button" onclick="location.reload()" style="background:#1E293B;color:#F8FAFC">${I.refresh}Try again</button>
        <a class="btn small" href="../" style="background:#0284C7;color:#fff">Go to EntryGo</a>
      </div>
    </section>`;
}

async function load() {
  if (!/^[A-Za-z0-9_-]{10,}$/.test(token)) {
    return missing("This pass link isn't valid", "Ask your event organiser for a new pass link. Make sure the entire link was copied.");
  }
  let p;
  let isOffline = false;
  try {
    p = await rpc("gp_pass", { p_token: token });
    if (p) {
      try { localStorage.setItem(`gp_pass_cached_${token}`, JSON.stringify(p)); } catch {}
    }
  } catch (e) {
    // Attempt to load from offline cache
    try {
      const cached = localStorage.getItem(`gp_pass_cached_${token}`);
      if (cached) {
        p = JSON.parse(cached);
        isOffline = true;
      }
    } catch {}

    if (!p) {
      if (e.offline || !navigator.onLine) {
        return missing("You're offline", "Connect to the internet once to verify your pass. Once verified online, your ticket can be presented at the gate.");
      }
      if (e.paused) return missing("Database Asleep", esc(PAUSED_MSG));
      return missing("This pass link isn't valid", "Ask your organiser for a new one.");
    }
  }
  if (!p) return missing("This pass link isn't valid", "This pass doesn't exist or was removed. Ask your organiser for a new one.");

  // Check client-side updated tier if present
  const localTier = localStorage.getItem(`gp_tier_${token}`);
  if (localTier) {
    p.tier = localTier;
  }

  render(p, isOffline);
}

function render(p, isOffline = false) {
  const ev = p.event;
  document.title = `${p.name} · ${typo(ev.name)} · EntryGo`;
  const used = !!p.checked_in_at;
  const tier = getTier(p);
  const shortToken = token.length > 12 ? `${token.slice(0, 6)}•••${token.slice(-4)}` : token;

  view.innerHTML = `
    ${isOffline ? `
      <div class="offline-pass-banner" role="status" style="max-width:380px;margin:0 auto 12px;background:rgba(245,158,11,0.15);border:1px solid #F59E0B;color:#FDE68A;padding:8px 14px;border-radius:10px;font-size:12px;text-align:center;display:flex;align-items:center;justify-content:center;gap:6px">
        <span>⚠️</span>
        <span><b>Offline View:</b> Entry verification is validated live at the gate scanner.</span>
      </div>` : ""}

    <div class="ticket-wrap">
      <article class="ticket ${used ? "used" : ""} ticket-${tier.id}" aria-label="Entry pass for ${esc(p.name)}">
        <!-- Top Status Bar -->
        <div class="ticket-badge ${tier.cssClass}">
          <span class="dot"></span>
          <span class="badge-tier-tag">${tier.icon} ${tier.shortLabel}</span>
          <span class="badge-status-sep">·</span>
          <span>${used ? "USED" : "ACTIVE PASS"}</span>
        </div>

        <!-- Poster Banner -->
        <div class="t-art" role="img" aria-label="Event Poster"></div>

        <!-- Body Details -->
        <div class="t-body">
          <!-- Large Tier Pill with Icon + Text -->
          <div class="t-tier-pill ${tier.cssClass}" style="margin:6px auto 10px">
            <span class="tier-pill-icon">${tier.icon}</span>
            <span class="tier-pill-label">${tier.label}</span>
          </div>

          <h1 class="t-name ink" style="font-size:28px">${esc(p.name)}</h1>
          <div class="t-rule inked"></div>
          <p class="t-event ink">${escT(ev.name)}</p>
          <p class="t-when">📅 ${esc(fmtWhen(ev.starts_at))}</p>
          ${ev.venue ? `<p class="t-where">📍 ${esc(ev.venue)}</p>` : ""}
        </div>

        <!-- Big QR Section on White Rounded Square -->
        <div class="t-qr" id="qrContainer">
          <div class="qr-canvas-holder ${used ? "qr-used-dim" : ""}">
            ${qrSvg(passUrl(token), { label: `Entry QR for ${p.name}`, ghost: "#FF2FA2" })}
            <div class="qr-token-id">PASS TOKEN: ${esc(shortToken)}</div>
          </div>
          ${used ? `
            <div class="t-stamp" role="alert">
              <div class="inked">
                <span class="stamp-word">USED</span>
                <small>Checked in at ${esc(fmtTime(p.checked_in_at))}${p.gate ? ` · ${esc(p.gate)}` : ""}</small>
              </div>
            </div>` : ""}
        </div>

        <div class="t-tear" aria-hidden="true"></div>
        <div class="t-stub ink">${used ? `Checked in at ${esc(fmtTime(p.checked_in_at))}` : `Show this at the gate · This pass works once`}</div>
      </article>
    </div>

    <!-- Pass Notes & Instructions -->
    <div class="pass-notes" style="max-width:390px;margin:12px auto;text-align:center">
      <p class="fine" style="color:#94A3B8;font-size:13px;line-height:1.45;margin:0 0 10px">
        ${used
          ? `✓ This pass was scanned and admitted at ${esc(fmtTime(p.checked_in_at))}. Sharing it will not get a second person in.`
          : `Show this at the gate. A screenshot works once; sharing it will not get a second person in.`
        }
      </p>

      <div class="brightness-hint" style="display:inline-flex;align-items:center;gap:6px;background:rgba(56,189,248,0.1);border:1px solid rgba(56,189,248,0.25);padding:5px 12px;border-radius:20px;font-size:12px;color:#38BDF8">
        <span>💡</span>
        <span>Turn brightness up for faster scanning</span>
      </div>
    </div>

    <!-- Pass Actions -->
    <div class="pass-actions" style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin:12px auto 20px;max-width:400px">
      <button class="btn small" type="button" id="saveImgBtn" style="background:#1E293B;color:#F8FAFC">${I.download}Save as image</button>
      <button class="btn small" type="button" id="copy" style="background:#1E293B;color:#F8FAFC">${I.link}Copy pass link</button>
      <button class="btn small" type="button" id="pwaInstallBtn" style="background:#0284C7;color:#fff" hidden>📱 Add to home screen</button>
    </div>`;

  const t = view.querySelector(".ticket");
  setArt(view.querySelector(".t-art"), ev.art);

  // Dynamic 3D gyro tilt effect on mobile & mouse hover on desktop
  const handleTilt = (e) => {
    const rect = t.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    t.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-2px)`;
  };
  const resetTilt = () => {
    t.style.transform = "perspective(800px) rotateY(0deg) rotateX(0deg) translateY(0)";
  };
  t.addEventListener("mousemove", handleTilt);
  t.addEventListener("mouseleave", resetTilt);

  view.querySelector("#copy").addEventListener("click", async () => {
    (await copyText(passUrl(token))) ? toast("Pass link copied") : toast("Couldn't copy link", "x");
  });

  // Save as image (HTML5 Canvas Snapshot)
  view.querySelector("#saveImgBtn").addEventListener("click", () => {
    try {
      const svgEl = view.querySelector(".t-qr svg");
      if (!svgEl) return window.print();
      // Draw SVG to canvas for download
      const svgData = new XMLSerializer().serializeToString(svgEl);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      canvas.width = 600;
      canvas.height = 600;
      img.onload = () => {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, 600, 600);
        ctx.drawImage(img, 30, 30, 540, 540);
        const a = document.createElement("a");
        a.download = `${p.name.replace(/\s+/g, "_")}_EntryGo_Pass.png`;
        a.href = canvas.toDataURL("image/png");
        a.click();
        toast("Ticket image downloaded");
      };
      img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
    } catch {
      window.print();
    }
  });

  // PWA Install prompt handling
  const pwaBtn = view.querySelector("#pwaInstallBtn");
  if (window.deferredPwaPrompt) {
    pwaBtn.hidden = false;
    pwaBtn.addEventListener("click", async () => {
      window.deferredPwaPrompt.prompt();
      const choice = await window.deferredPwaPrompt.userChoice;
      if (choice.outcome === "accepted") pwaBtn.hidden = true;
      window.deferredPwaPrompt = null;
    });
  }

  keepAwake();
}

// Keep the screen on while the pass is open (no-op where unsupported).
let lock;
async function keepAwake() {
  try { lock = await navigator.wakeLock?.request("screen"); } catch {}
}
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && lock?.released) keepAwake(); });
window.addEventListener("hashchange", () => location.reload());

// Capture beforeinstallprompt for Add to home screen
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  window.deferredPwaPrompt = e;
  const b = document.getElementById("pwaInstallBtn");
  if (b) b.hidden = false;
});

load();
// Auto check pass status every 2 seconds so check-in stamp appears live
setInterval(() => {
  if (document.visibilityState === "visible" && !document.hidden && navigator.onLine) load();
}, 2000);

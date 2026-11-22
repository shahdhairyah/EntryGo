// Gate scanner. Staff hold the event's gate code; every call is a code-checked RPC.
import { configured, rpc, esc, typo, fmtTime, fmtCode, store, I, paintIcons, plural, PAUSED_MSG, getTier } from "./core.js";
import { Camera, decode, tokenFrom } from "./scanner.js";

const $ = (id) => document.getElementById(id);
const joinEl = $("join"), scanEl = $("scan");
const S = {
  code: null, gate: "Gate 1", event: null,
  device: store.get("gp.device") || Math.random().toString(36).slice(2, 10),
  last: { token: null, seen: 0, text: null, textSeen: 0 },
  busy: false, statsTimer: null, loopOn: false,
  soundOn: store.get("gp.sound") !== false,
  vibrateOn: store.get("gp.vibrate") !== false,
};
store.set("gp.device", S.device);
paintIcons();
$("findBtn").innerHTML = I.search;
$("photoLbl").innerHTML = I.camera;
document.querySelectorAll(".fine").forEach((p) => { p.innerHTML = p.innerHTML.replace("${search}", `<span style="display:inline-block;width:16px;height:16px;vertical-align:-3px">${I.search}</span>`).replace("${camera}", `<span style="display:inline-block;width:16px;height:16px;vertical-align:-3px">${I.camera}</span>`); });

// ── sound + buzz (unlocked on the first tap) ──
let ac;
function unlockAudio() { try { ac ||= new (window.AudioContext || window.webkitAudioContext)(); ac.resume?.(); } catch {} }
document.addEventListener("pointerdown", unlockAudio, { once: true });
function tone(freq, start, dur, type = "sine", gain = 0.2) {
  try {
    if (!S.soundOn || !ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, ac.currentTime + start);
    g.gain.exponentialRampToValueAtTime(gain, ac.currentTime + start + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + start + dur);
    o.connect(g).connect(ac.destination);
    o.start(ac.currentTime + start); o.stop(ac.currentTime + start + dur + 0.05);
  } catch {}
}
function vibrate(pattern) {
  if (S.vibrateOn && navigator.vibrate) {
    try { navigator.vibrate(pattern); } catch {}
  }
}
const sounds = {
  ok() { tone(988, 0, 0.11, "sine", 0.3); tone(1480, 0.12, 0.18, "sine", 0.3); vibrate([80]); },
  dup() { tone(150, 0, 0.45, "sawtooth", 0.28); tone(130, 0.12, 0.45, "square", 0.15); vibrate([100, 60, 100, 60, 240]); },
  warn() { tone(440, 0, 0.15, "triangle", 0.25); tone(330, 0.16, 0.2, "triangle", 0.25); vibrate([60, 50, 60]); },
};

// ── full-screen result overlay (auto-dismiss in 3.2s or tap) ──
let overlayTimer = null;
const overlay = $("resultOverlay");
const resIcon = $("resIcon"), resTitle = $("resTitle"), resName = $("resName");
const resTierBanner = $("resTierBanner"), rtbIcon = $("rtbIcon"), rtbText = $("rtbText");
const resSub = $("resSub");

function dismissResult() {
  clearTimeout(overlayTimer);
  overlay.hidden = true;
  overlay.className = "result-overlay";
}

overlay.addEventListener("click", dismissResult);

function showResultOverlay(type, title, name, tier, subText) {
  clearTimeout(overlayTimer);
  overlay.className = `result-overlay res-${type}`;
  
  // Icon setup
  if (type === "ok") {
    resIcon.innerHTML = I.bigCheck;
    sounds.ok();
  } else if (type === "dup") {
    resIcon.innerHTML = I.bigX;
    sounds.dup();
  } else {
    resIcon.innerHTML = I.warnDot;
    sounds.warn();
  }

  resTitle.textContent = title;
  resName.textContent = name;
  resName.hidden = !name;

  if (tier) {
    resTierBanner.hidden = false;
    resTierBanner.className = `result-tier-banner ${tier.cssClass}`;
    rtbIcon.textContent = tier.icon;
    rtbText.textContent = tier.label;
  } else {
    resTierBanner.hidden = true;
  }

  resSub.innerHTML = subText;
  overlay.hidden = false;

  // Auto-dismiss after 3.2 seconds
  overlayTimer = setTimeout(dismissResult, 3200);
}

function setCounts(c) {
  if (!c) return;
  const checked = c.checked ?? c.checked_in ?? 0;
  $("cNum").textContent = `${checked} / ${c.total}`;
  const onlineDot = $("connDot");
  if (onlineDot) {
    onlineDot.className = "conn-dot online";
    onlineDot.title = "Live Server Connected";
  }
}

function showResult(r) {
  if (!r) return;
  setCounts(r.counts);
  const tier = getTier(r);

  switch (r.status) {
    case "ok":
      showResultOverlay("ok", "ENTRY OK", r.name, tier, `First scan admitted at <strong>${esc(r.gate || S.gate)}</strong> · ${esc(fmtTime(r.scanned_at))}`);
      break;
    case "dup":
      showResultOverlay("dup", "ALREADY SCANNED", r.name, tier, `First admitted at <strong>${esc(fmtTime(r.first_at))}</strong> at <strong>${esc(r.first_gate)}</strong>${r.same_device ? " (this device)" : ""} · ${plural(r.repeats, "repeat scan")}`);
      break;
    case "wrong_event":
      showResultOverlay("warn", "WRONG EVENT PASS", "", null, "This pass was issued for another event. Do not let them enter on this pass.");
      break;
    case "unknown":
      showResultOverlay("warn", "NOT A VALID PASS", "", null, "This QR code is not registered in this event pass roster.");
      break;
    case "bad_code":
      // Gate code mismatch — could be a genuine rotation by the organiser.
      // Show a dismissable warning so the volunteer can retry with a fresh code,
      // but don't auto-kick them out (they might be scanning a stale QR accidentally).
      showResultOverlay("warn", "GATE CODE MISMATCH", "", null,
        "This QR may belong to a different event, or the gate code was recently changed. " +
        "Ask the organiser for the current gate code if this keeps happening.");
      break;
    default:
      return;
  }
  try { loadStats(); } catch {}
}

async function scanToken(token) {
  S.busy = true;
  try {
    const res = await rpc("gp_scan", { p_code: S.code, p_token: token, p_gate: S.gate, p_device: S.device });
    if (res) {
      // Apply local tier override if set by organiser
      const localTier = localStorage.getItem(`gp_tier_${token}`);
      if (localTier) res.tier = localTier;
      showResult(res);
    } else {
      showResultOverlay("warn", "NOT A VALID PASS", "", null, "This pass could not be verified on the server.");
    }
  } catch (e) {
    console.error("Scan error details:", e);
    const connDot = $("connDot");
    const isOffline = e.offline || !navigator.onLine;
    if (isOffline) {
      if (connDot) {
        connDot.className = "conn-dot offline";
        connDot.title = "No Server Connection";
      }
      showResultOverlay("offline", "NO CONNECTION", "", null,
        `Nobody is admitted offline to prevent duplicate pass fraud.<br><button class="btn small" type="button" style="margin-top:10px;background:#38BDF8;color:#000;font-weight:700" onclick="scanToken('${token}')">Try again</button>`);
    } else {
      showResultOverlay("warn", "SCAN ERROR", "", null,
        `${esc(e.message || "Couldn't verify this pass.")}<br><button class="btn small" type="button" style="margin-top:10px;background:#38BDF8;color:#000;font-weight:700" onclick="scanToken('${token}')">Try again</button>`);
    }
    S.last.token = null; // allow an immediate retry
  } finally {
    S.busy = false;
  }
}

// Called with every decoded QR text (camera, photo, or tests).
async function handleText(text) {
  const now = Date.now();
  const token = tokenFrom(text);
  if (!token) {
    if (text === S.last.text && now - S.last.textSeen < 3000) { S.last.textSeen = now; return; }
    S.last.text = text; S.last.textSeen = now;
    sounds.warn(); showResultOverlay("warn", "Not an EntryGo QR", "", null, "That code isn't an entry pass.");
    return;
  }
  // The same pass sitting in front of the camera is one scan, not twenty.
  if (token === S.last.token && now - S.last.seen < 3500) { S.last.seen = now; return; }
  if (S.busy) return;
  S.last.token = token; S.last.seen = now;
  await scanToken(token);
}
window.GatePassGate = window.EntryGoGate = window.ZentryXGate = { handleText }; // handy for testing in the console

// ── stats ──
async function loadStats() {
  if (!S.code) return;
  try {
    const st = await rpc("gp_gate_stats", { p_code: S.code });
    if (!st) return leave("The organiser changed this gate's code. Ask them for the new one.");
    setCounts(st.counts);

    // Dynamic Tier Count Breakdown
    let vipC = 0, bkC = 0, volC = 0, stdC = 0;
    if (st.tier_counts) {
      vipC = st.tier_counts.vip || 0;
      bkC = st.tier_counts.backstage || 0;
      volC = st.tier_counts.volunteer || 0;
      stdC = st.tier_counts.standard || 0;
    } else {
      // Calculate from recent and counts
      st.recent.forEach(r => {
        const tr = getTier(r);
        if (tr.id === "vip") vipC++;
        else if (tr.id === "backstage") bkC++;
        else if (tr.id === "volunteer") volC++;
        else stdC++;
      });
    }
    $("tcVip").textContent = vipC;
    $("tcBackstage").textContent = bkC;
    $("tcVol").textContent = volC;
    $("tcStd").textContent = stdC;

    // Recent Scans Strip: Last 5 with color dot and tier chip
    const last5 = st.recent.slice(0, 5);
    $("recent").innerHTML = last5.length ? last5.map((r) => {
      const tier = getTier(r);
      return `
      <li>
        <span class="${r.is_first ? "r-ok" : "r-dup"}">${r.is_first ? I.check : I.x}</span>
        <span class="r-name">${esc(r.name)} <span class="mini-tier ${tier.cssClass}">${tier.icon} ${tier.shortLabel}</span></span>
        <span class="r-at">${r.is_first ? "" : "repeat · "}${esc(r.gate || S.gate || "Gate")} · ${esc(fmtTime(r.scanned_at))}</span>
      </li>`;
    }).join("") : `<li><span class="r-at">Nobody scanned yet. Ready at ${esc(S.gate)}.</span></li>`;
  } catch {}
}

// ── camera ──
const cam = new Camera($("video"));
const camMsg = $("camMsg"), viewport = $("viewport"), browserHint = $("browserHint");

function camMessage(title, body, action) {
  camMsg.innerHTML = `<h3>${title}</h3><p>${body}</p>${action ? `<button class="btn small" type="button" id="camAct">${action}</button>` : ""}`;
  camMsg.hidden = false;
  camMsg.querySelector("#camAct")?.addEventListener("click", () => { unlockAudio(); startCamera(); });
}

async function startCamera() {
  camMsg.hidden = true;
  browserHint.hidden = true;
  try {
    await cam.start();
  } catch (e) {
    viewport.classList.remove("hunting");
    browserHint.hidden = false;
    if (e.kind === "denied") return camMessage("Camera blocked", "Allow camera access in browser settings, then tap Try again.", "Try again");
    if (e.kind === "none") return camMessage("No camera found", "Use Find by name or scan a photo from gallery.", "Try again");
    if (e.kind === "unsupported") return camMessage("Camera unavailable", "Open directly in Chrome or Safari (not inside Instagram/WhatsApp).", null);
    return camMessage("Camera didn't start", esc(e.message), "Try again");
  }
  viewport.classList.add("hunting");
  renderCamTools();
  loop();
}

function renderCamTools() {
  $("torchBtn").hidden = !cam.canTorch;
  $("flipBtn").hidden = !cam.canFlip;
}

$("torchBtn").addEventListener("click", async (e) => {
  const on = await cam.torch();
  e.currentTarget.setAttribute("aria-pressed", String(on));
  e.currentTarget.classList.toggle("active", !!on);
});

$("flipBtn").addEventListener("click", async () => {
  await cam.flip();
  renderCamTools();
});
async function loop() {
  if (S.loopOn) return;
  S.loopOn = true;
  const video = $("video");
  while (cam.running && !scanEl.hidden) {
    if (document.visibilityState === "visible" && video.readyState >= 2 && !S.busy) {
      try {
        const text = await decode(video);
        if (text) await handleText(text);
      } catch {}
    }
    await new Promise((r) => setTimeout(r, 110));
  }
  S.loopOn = false;
}

// ── photo fallback ──
$("photo").addEventListener("change", async (e) => {
  const f = e.target.files?.[0];
  e.target.value = "";
  if (!f) return;
  try {
    const bmp = await createImageBitmap(f);
    const text = await decode(bmp, { maxSide: 1400 });
    if (text) { S.last.token = null; await handleText(text); }
    else { sounds.warn(); showResultOverlay("warn", "No QR Found", "", null, "Get closer so the QR fills most of the picture."); }
  } catch { showResultOverlay("warn", "Photo Error", "", null, "Couldn't read that photo. Try another one."); }
});

// ── find by name ──
$("findBtn").addEventListener("click", openFind);
function openFind() {
  const bg = document.createElement("div");
  bg.className = "sheet-bg";
  bg.innerHTML = `
    <div class="sheet" role="dialog" aria-modal="true" aria-labelledby="findT">
      <div class="sheet-top"><h2 class="head" id="findT" style="font-size:24px">Find by name</h2>
        <button class="icon-btn" type="button" id="closeFind" aria-label="Close">${I.x}</button></div>
      <p class="sub" style="margin-bottom:12px">For a dead phone or a cracked screen. Check their ID before you let them in.</p>
      <div class="search"><span>${I.search}</span><input class="input" id="q" placeholder="Type 2+ letters of their name" autocomplete="off" enterkeyhint="search"></div>
      <ul class="passlist" id="found" style="margin-top:12px"></ul>
    </div>`;
  document.body.append(bg);
  const close = () => { bg.remove(); document.removeEventListener("keydown", onKey); };
  const onKey = (e) => { if (e.key === "Escape") close(); };
  document.addEventListener("keydown", onKey);
  bg.addEventListener("click", (e) => { if (e.target === bg) close(); });
  bg.querySelector("#closeFind").addEventListener("click", close);
  const q = bg.querySelector("#q"), list = bg.querySelector("#found");
  q.focus();
  let t, seq = 0;
  q.addEventListener("input", () => {
    clearTimeout(t);
    t = setTimeout(async () => {
      const mine = ++seq;
      if (q.value.trim().length < 2) { list.innerHTML = ""; return; }
      let rows = [];
      try { rows = await rpc("gp_gate_find", { p_code: S.code, p_query: q.value }); } catch { list.innerHTML = `<li><p class="err">Couldn't search. Check your connection.</p></li>`; return; }
      if (mine !== seq) return;
      list.innerHTML = rows.length ? rows.map((r) => {
        const tier = getTier(r);
        return `
        <li>
          <p class="pl-name">${esc(r.name)} <span class="mini-tier ${tier.cssClass}">${tier.icon} ${tier.shortLabel}</span></p>
          <p class="pl-meta">${esc(r.hint || "no contact")}${r.checked_in_at ? ` · <span style="color:var(--stop);font-weight:700">✓ In at ${esc(fmtTime(r.checked_in_at))} · ${esc(r.gate || "Gate")}</span>` : ` · <span style="color:#38BDF8">Not in yet</span>`}</p>
          <div class="pl-actions">
            ${r.checked_in_at 
              ? `<span style="font-size:11px;color:#FB7185;font-weight:700">Already In</span>` 
              : `<button class="btn small find-admit-btn" type="button" data-id="${r.id}" data-name="${esc(r.name)}">Admit</button>`
            }
          </div>
        </li>`;
      }).join("") : `<li><p class="pl-meta" style="grid-column:1/-1">Nobody by that name in this event.</p></li>`;
    }, 220);
  });

  list.addEventListener("click", async (e) => {
    const b = e.target.closest("button[data-id]");
    if (!b) return;

    // Two-step confirmation: "Admit" -> "Check ID, then admit"
    if (!b.dataset.armed) {
      b.dataset.armed = "1";
      b.classList.add("btn-confirm");
      b.innerHTML = `Check ID, then admit`;
      setTimeout(() => {
        if (b && b.isConnected) {
          delete b.dataset.armed;
          b.classList.remove("btn-confirm");
          b.textContent = "Admit";
        }
      }, 4000);
      return;
    }

    b.disabled = true;
    close();
    try { 
      showResult(await rpc("gp_gate_admit", { p_code: S.code, p_pass: b.dataset.id, p_gate: S.gate, p_device: S.device })); 
    } catch (err) { 
      showResultOverlay("warn", "COULDN'T ADMIT", b.dataset.name, null, err.offline ? "No connection. Connect and try again." : esc(err.message));
    }
  });
}

// ── join / leave ──
function showJoin(msg = "") {
  scanEl.hidden = true; joinEl.hidden = false;
  const err = $("joinErr");
  err.textContent = msg; err.hidden = !msg;
  if (!msg && codeIn) {
    codeIn.focus();
  }
}
function leave(msg = "") {
  cam.stop(); clearInterval(S.statsTimer);
  S.code = null; store.del("gp.gate");
  if (location.hash) {
    history.replaceState(null, "", location.pathname);
  }
  showJoin(msg);
}
$("leaveBtn").addEventListener("click", (e) => {
  e.preventDefault();
  leave();
});

function showScanner() {
  joinEl.hidden = true; scanEl.hidden = false;
  $("evName").textContent = typo(S.event.name);
  $("gateName").textContent = S.gate;
  document.title = `${S.gate} · ${typo(S.event.name)} · EntryGo`;
  setCounts(S.event.counts);
  loadStats();
  clearInterval(S.statsTimer);
  S.statsTimer = setInterval(() => { if (document.visibilityState === "visible") loadStats(); }, 1000);
}

async function join(code, gate, { auto = false } = {}) {
  const btn = $("joinBtn");
  btn.disabled = true;
  try {
    const ev = await rpc("gp_gate_join", { p_code: code });
    if (!ev) { if (auto) store.del("gp.gate"); return showJoin(auto ? "" : "No event has that code. Check it with the organiser; they may have made a new one."); }
    S.code = code.replace(/[^A-Za-z0-9]/g, "").toUpperCase(); S.gate = gate; S.event = ev;
    store.set("gp.gate", { code: S.code, gate });
    showScanner();
    const perm = await navigator.permissions?.query?.({ name: "camera" }).catch(() => null);
    if (!auto || perm?.state === "granted") startCamera();
    else camMessage("Ready", "Tap to turn on the camera.", "Start camera");
  } catch (e) {
    showJoin(e.offline ? "No connection. Connect and try again." : e.paused ? PAUSED_MSG : e.message);
  } finally {
    btn.disabled = false;
  }
}

const codeIn = $("code");
codeIn.addEventListener("input", () => {
  const raw = codeIn.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 8);
  codeIn.value = raw.length > 4 ? `${raw.slice(0, 4)}-${raw.slice(4)}` : raw;
  $("joinErr").hidden = true;
});
// ── Gate chips & custom gate toggle ──
const customRadio = $("gateCustomRadio");
const customBox = $("customGateBox");
const customInput = $("customGateInput");

document.querySelectorAll('input[name="gate"]').forEach(radio => {
  radio.addEventListener("change", () => {
    if (radio.value === "Custom") {
      customBox.hidden = false;
      customInput.focus();
    } else {
      customBox.hidden = true;
    }
  });
});

$("joinForm").addEventListener("submit", (e) => {
  e.preventDefault();
  unlockAudio();
  const raw = codeIn.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  if (raw.length !== 8) return showJoin("The gate code has 8 letters and numbers, like K7QM-2XPA.");
  
  let gate = new FormData(e.target).get("gate") || "Gate 1";
  if (gate === "Custom") {
    gate = (customInput.value.trim() || "Custom Gate").slice(0, 30);
  }
  join(raw, gate);
});
document.addEventListener("visibilitychange", () => { if (document.visibilityState === "visible" && S.code) loadStats(); });

// ── boot ──
(function boot() {
  const fromHash = (location.hash || "").replace(/^#\/?/, "").replace(/[^A-Za-z0-9]/g, "").toUpperCase();
  const saved = store.get("gp.gate");
  if (fromHash.length === 8) {
    codeIn.value = fmtCode(fromHash);
    history.replaceState(null, "", location.pathname);
    if (saved?.code === fromHash) return join(saved.code, saved.gate, { auto: true });
    return showJoin();
  }
  if (saved?.code) return join(saved.code, saved.gate || "Gate 1", { auto: true });
  showJoin();
})();

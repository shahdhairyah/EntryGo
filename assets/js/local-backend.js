// Local Demo / Fallback Data Store for EntryGo
// Allows EntryGo to work 100% out-of-the-box in the browser even without an active Supabase project.

const STORAGE_KEY_EVENTS = "zx_demo_events";
const STORAGE_KEY_PASSES = "zx_demo_passes";
const STORAGE_KEY_SCANS = "zx_demo_scans";

function getStorage(key, def) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : def;
  } catch {
    return def;
  }
}

function setStorage(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error("Storage error:", e);
  }
}

// Seed initial event if empty
export function initDemoData() {
  let events = getStorage(STORAGE_KEY_EVENTS, []);
  if (!events.length) {
    const defaultEvent = {
      id: "demo-event-1",
      name: "EntryGo Launch Summit 2026",
      club: "EntryGo Tech & Music Collective",
      starts_at: new Date(Date.now() + 86400000 * 2).toISOString(),
      venue: "Grand Cyber Arena / Hall A",
      art: 0,
      gate_code: "ZX889900",
      created_at: new Date().toISOString()
    };
    events = [defaultEvent];
    setStorage(STORAGE_KEY_EVENTS, events);

    const defaultPasses = [
      {
        id: "p-1",
        event_id: "demo-event-1",
        name: "Alex Vance",
        contact: "alex.vance@tech.io",
        token: "ZXDEMOTOKEN123456789012345678901",
        created_at: new Date().toISOString()
      },
      {
        id: "p-2",
        event_id: "demo-event-1",
        name: "Devon Miller",
        contact: "+1 555-0199",
        token: "ZXDEMOTOKEN987654321098765432109",
        created_at: new Date().toISOString()
      }
    ];
    setStorage(STORAGE_KEY_PASSES, defaultPasses);
    setStorage(STORAGE_KEY_SCANS, []);
  }
}

export const localBackend = {
  isDemoSession() {
    return localStorage.getItem("zx_demo_active") === "true";
  },
  setDemoSession(active) {
    if (active) localStorage.setItem("zx_demo_active", "true");
    else localStorage.removeItem("zx_demo_active");
  },
  
  getEvents() {
    return getStorage(STORAGE_KEY_EVENTS, []);
  },

  getEvent(id) {
    return this.getEvents().find(e => e.id === id);
  },

  saveEvent(ev) {
    const events = this.getEvents();
    if (!ev.id) {
      ev.id = "e-" + Math.random().toString(36).substring(2, 10);
      ev.gate_code = Math.random().toString(36).substring(2, 10).toUpperCase();
      ev.created_at = new Date().toISOString();
      events.unshift(ev);
    } else {
      const idx = events.findIndex(e => e.id === ev.id);
      if (idx !== -1) events[idx] = { ...events[idx], ...ev };
    }
    setStorage(STORAGE_KEY_EVENTS, events);
    return ev;
  },

  deleteEvent(id) {
    const events = this.getEvents().filter(e => e.id !== id);
    setStorage(STORAGE_KEY_EVENTS, events);
  },

  getPasses(eventId) {
    return getStorage(STORAGE_KEY_PASSES, []).filter(p => p.event_id === eventId);
  },

  addPasses(newPasses) {
    const passes = getStorage(STORAGE_KEY_PASSES, []);
    for (const p of newPasses) {
      if (!p.id) p.id = "p-" + Math.random().toString(36).substring(2, 10);
      if (!p.token) p.token = "ZX" + Array.from(crypto.getRandomValues(new Uint8Array(15)), b => b.toString(16).padStart(2, "0")).join("");
      if (!p.tier) p.tier = "Standard";
      if (!p.created_at) p.created_at = new Date().toISOString();
      passes.push(p);
    }
    setStorage(STORAGE_KEY_PASSES, passes);
    return newPasses;
  },

  savePass(pass) {
    const passes = getStorage(STORAGE_KEY_PASSES, []);
    const idx = passes.findIndex(x => x.id === pass.id);
    if (idx !== -1) {
      passes[idx] = { ...passes[idx], ...pass };
      setStorage(STORAGE_KEY_PASSES, passes);
    }
  },

  getScans(eventId) {
    return getStorage(STORAGE_KEY_SCANS, []).filter(s => s.event_id === eventId);
  },

  getPassByToken(token) {
    const passes = getStorage(STORAGE_KEY_PASSES, []);
    const p = passes.find(x => x.token === token);
    if (!p) return null;
    const ev = this.getEvent(p.event_id);
    const scans = getStorage(STORAGE_KEY_SCANS, []).filter(s => s.pass_id === p.id && s.accepted);
    const firstScan = scans[0];
    
    return {
      id: p.id,
      name: p.name,
      contact: p.contact,
      tier: p.tier || "Standard",
      token: p.token,
      checked_in_at: firstScan ? firstScan.scanned_at : null,
      gate: firstScan ? firstScan.gate : null,
      event: ev
    };
  },

  scanToken(code, token, gate, device) {
    const events = this.getEvents();
    const cleanCode = (code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const ev = events.find(e => (e.gate_code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanCode);
    if (!ev) return { status: "bad_code" };

    const passes = getStorage(STORAGE_KEY_PASSES, []);
    const p = passes.find(x => x.token === token);
    if (!p) return { status: "unknown" };
    if (p.event_id !== ev.id) return { status: "wrong_event" };

    const scans = getStorage(STORAGE_KEY_SCANS, []);
    const existing = scans.find(s => s.pass_id === p.id && s.accepted);

    if (existing) {
      scans.push({
        event_id: ev.id,
        pass_id: p.id,
        token,
        gate,
        device,
        scanned_at: new Date().toISOString(),
        accepted: false
      });
      setStorage(STORAGE_KEY_SCANS, scans);
      return {
        status: "dup",
        name: p.name,
        tier: p.tier || "Standard",
        first_at: existing.scanned_at,
        first_gate: existing.gate,
        repeats: scans.filter(s => s.pass_id === p.id && !s.accepted).length,
        same_device: existing.device === device
      };
    }

    const now = new Date().toISOString();
    scans.push({
      event_id: ev.id,
      pass_id: p.id,
      token,
      gate,
      device,
      scanned_at: now,
      accepted: true
    });
    setStorage(STORAGE_KEY_SCANS, scans);
    return {
      status: "ok",
      name: p.name,
      tier: p.tier || "Standard",
      scanned_at: now
    };
  },

  gateStats(code) {
    const cleanCode = (code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const ev = this.getEvents().find(e => (e.gate_code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanCode);
    if (!ev) return null;
    const passes = this.getPasses(ev.id);
    const scans = this.getScans(ev.id);
    const checkedInIds = new Set(scans.filter(s => s.accepted).map(s => s.pass_id));
    const checkedInCount = checkedInIds.size;
    const recent = scans.slice(-8).reverse().map(s => {
      const p = passes.find(x => x.id === s.pass_id);
      return {
        id: s.pass_id,
        name: p ? p.name : "Attendee",
        tier: p ? (p.tier || "Standard") : "Standard",
        scanned_at: s.scanned_at,
        gate: s.gate || null,
        accepted: s.accepted,
        is_first: s.accepted  // first (accepted) scan = green, repeat = red
      };
    });
    return {
      counts: { total: passes.length, checked: checkedInCount, checked_in: checkedInCount },
      recent
    };
  },

  gateJoin(code) {
    const cleanCode = (code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const ev = this.getEvents().find(e => (e.gate_code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanCode);
    if (!ev) return null;
    const passes = this.getPasses(ev.id);
    const scans = this.getScans(ev.id);
    const checkedInCount = new Set(scans.filter(s => s.accepted).map(s => s.pass_id)).size;
    return {
      id: ev.id,
      name: ev.name,
      club: ev.club,
      starts_at: ev.starts_at,
      venue: ev.venue,
      counts: { total: passes.length, checked: checkedInCount, checked_in: checkedInCount }
    };
  },

  findByName(code, query) {
    const cleanCode = (code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const ev = this.getEvents().find(e => (e.gate_code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanCode);
    if (!ev) return [];
    const q = (query || "").toLowerCase().trim();
    if (q.length < 2) return [];
    const passes = this.getPasses(ev.id);
    const scans = getStorage(STORAGE_KEY_SCANS, []);
    return passes
      .filter(p => (p.name || "").toLowerCase().includes(q))
      .map(p => {
        const firstScan = scans.find(s => s.pass_id === p.id && s.accepted);
        const contact = p.contact || "";
        const masked = contact.includes("@")
          ? contact.replace(/^(.{2}).*(@.*)$/, "$1\u2022\u2022\u2022$2")
          : contact.replace(/^(.{0})(\d*)(\d{4})$/, (_, a, b, c) => `\u2022\u2022\u2022${c}`);
        return {
          id: p.id,
          name: p.name,
          tier: p.tier || "Standard",
          hint: masked || null,
          checked_in_at: firstScan ? firstScan.scanned_at : null,
          gate: firstScan ? firstScan.gate : null
        };
      });
  },

  admitPass(code, passId, gate, device) {
    const cleanCode = (code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    const ev = this.getEvents().find(e => (e.gate_code || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase() === cleanCode);
    if (!ev) return { status: "bad_code" };
    const passes = getStorage(STORAGE_KEY_PASSES, []);
    const p = passes.find(x => x.id === passId);
    if (!p) return { status: "unknown" };
    const scans = getStorage(STORAGE_KEY_SCANS, []);
    const existing = scans.find(s => s.pass_id === p.id && s.accepted);
    if (existing) {
      return {
        status: "dup",
        name: p.name,
        tier: p.tier || "Standard",
        first_at: existing.scanned_at,
        first_gate: existing.gate,
        repeats: scans.filter(s => s.pass_id === p.id && !s.accepted).length,
        same_device: existing.device === device
      };
    }
    const now = new Date().toISOString();
    scans.push({ event_id: ev.id, pass_id: p.id, token: p.token, gate, device, scanned_at: now, accepted: true });
    setStorage(STORAGE_KEY_SCANS, scans);
    return { status: "ok", name: p.name, tier: p.tier || "Standard", scanned_at: now, gate };
  }
};

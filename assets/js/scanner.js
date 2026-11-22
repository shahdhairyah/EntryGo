// Camera + QR decoding. BarcodeDetector where the browser has it (Android Chrome, Safari 17+),
// jsQR (vendored, loaded on demand) everywhere else.
import { ROOT } from "./core.js";

let detector = null;
let jsqrLoading = null;

async function nativeDetector() {
  if (detector !== null) return detector;
  detector = false;
  try {
    if ("BarcodeDetector" in window) {
      const formats = await window.BarcodeDetector.getSupportedFormats();
      if (formats.includes("qr_code")) detector = new window.BarcodeDetector({ formats: ["qr_code"] });
    }
  } catch { detector = false; }
  return detector;
}

function loadJsQR() {
  if (window.jsQR) return Promise.resolve(window.jsQR);
  jsqrLoading ||= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = new URL("vendor/jsQR.js", ROOT).href;
    s.onload = () => resolve(window.jsQR);
    s.onerror = () => reject(new Error("Couldn't load the QR decoder"));
    document.head.append(s);
  });
  return jsqrLoading;
}

const canvas = document.createElement("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

function frameSize(src) {
  const w = src.videoWidth || src.naturalWidth || src.width;
  const h = src.videoHeight || src.naturalHeight || src.height;
  return [w, h];
}

// Decode one frame (video, image, bitmap). Returns the QR text or null.
export async function decode(src, { maxSide = 720 } = {}) {
  const [w, h] = frameSize(src);
  if (!w || !h) return null;
  const det = await nativeDetector();
  if (det) {
    try {
      const codes = await det.detect(src);
      if (codes.length) return codes[0].rawValue;
      return null;
    } catch { /* fall through to jsQR */ }
  }
  const jsQR = await loadJsQR();
  const k = Math.min(1, maxSide / Math.max(w, h));
  canvas.width = Math.round(w * k);
  canvas.height = Math.round(h * k);
  ctx.drawImage(src, 0, 0, canvas.width, canvas.height);
  const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const hit = jsQR(img.data, img.width, img.height, { inversionAttempts: "attemptBoth" });
  return hit ? hit.data : null;
}

export const engine = async () => ((await nativeDetector()) ? "BarcodeDetector" : "jsQR");

// ── camera ──
export class Camera {
  constructor(video) {
    this.video = video;
    this.stream = null;
    this.devices = [];
    this.deviceIndex = -1;
    this.torchOn = false;
    this.running = false;
  }

  async start(deviceId) {
    this.stop();
    if (!navigator.mediaDevices?.getUserMedia) {
      const e = new Error("This browser can't open the camera here.");
      e.kind = "unsupported";
      throw e;
    }
    // Battery & thermal optimized resolution (960x720 ideal: ultra-fast barcode detection, 40% less battery/CPU drain)
    const video = deviceId
      ? { deviceId: { exact: deviceId }, width: { ideal: 960, max: 1280 }, height: { ideal: 720, max: 720 }, frameRate: { ideal: 24, max: 30 } }
      : { facingMode: { ideal: "environment" }, width: { ideal: 960, max: 1280 }, height: { ideal: 720, max: 720 }, frameRate: { ideal: 24, max: 30 } };
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video, audio: false });
    } catch (err) {
      const e = new Error(err.message);
      e.kind = err.name === "NotAllowedError" || err.name === "SecurityError" ? "denied" : err.name === "NotFoundError" || err.name === "OverconstrainedError" ? "none" : "other";
      throw e;
    }
    this.video.srcObject = this.stream;
    this.video.setAttribute("playsinline", "");
    this.video.muted = true;
    await this.video.play().catch(() => {});
    this.running = true;
    try {
      this.devices = (await navigator.mediaDevices.enumerateDevices()).filter((d) => d.kind === "videoinput");
      const cur = this.track?.getSettings?.().deviceId;
      this.deviceIndex = this.devices.findIndex((d) => d.deviceId === cur);
    } catch {}
  }

  get track() { return this.stream?.getVideoTracks?.()[0]; }
  get canTorch() {
    try {
      const caps = this.track?.getCapabilities?.();
      return !!(caps && ("torch" in caps || "fillLightMode" in caps));
    } catch {
      return false;
    }
  }
  get canFlip() { return this.devices.length > 1; }

  async torch() {
    if (!this.track) return false;
    this.torchOn = !this.torchOn;
    try {
      await this.track.applyConstraints({
        advanced: [{ torch: this.torchOn, fillLightMode: this.torchOn ? "flash" : "off" }]
      });
    } catch (err) {
      console.warn("Torch constraint error:", err);
      // Fallback constraint attempt
      try {
        await this.track.applyConstraints({ advanced: [{ torch: this.torchOn }] });
      } catch (e) {
        this.torchOn = false;
      }
    }
    return this.torchOn;
  }

  async flip() {
    if (!this.canFlip) return;
    const next = this.devices[(this.deviceIndex + 1) % this.devices.length];
    await this.start(next.deviceId);
  }

  stop() {
    this.running = false;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.torchOn = false;
  }
}

// Pull the pass token out of whatever the QR says (a pass URL, or a bare token).
export function tokenFrom(text) {
  if (!text) return null;
  const t = String(text).trim();
  const hashMatch = t.match(/#\/?([A-Za-z0-9_-]{10,})/);
  if (hashMatch) return hashMatch[1];
  const directMatch = t.match(/^([A-Za-z0-9_-]{10,})$/);
  return directMatch ? directMatch[1] : null;
}

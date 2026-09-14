import { z } from "zod";

export const VoiceDiagnosticSchema = z.object({
  version: z.literal(1),
  session: z.string().uuid(),
  event: z.enum(["start", "connected", "disconnected", "connection_error", "screen_active", "screen_released", "screen_unavailable", "screen_denied", "screen_unsupported", "screen_request_error", "screen_timeout", "start_blocked", "hidden", "returned", "quiet", "delayed", "user_received", "agent_received", "audio_received", "input_signal", "reconnect", "human_help", "call_tapped"]),
  platform: z.enum(["ios", "other"]),
  browser: z.enum(["safari_family", "chrome_ios", "firefox_ios", "other"]),
  framed: z.boolean(),
}).strict();
type VoiceEvent = z.infer<typeof VoiceDiagnosticSchema>["event"];

let session: string | undefined;
let sent = 0;
export function reportVoiceEvent(event: VoiceEvent) {
  if (typeof window === "undefined" || sent >= 80) return;
  session ??= crypto.randomUUID();
  const ua = navigator.userAgent;
  const payload = {
    version: 1, session, event,
    platform: /iPhone|iPad|iPod/.test(ua) ? "ios" : "other",
    browser: /CriOS/.test(ua) ? "chrome_ios" : /FxiOS/.test(ua) ? "firefox_ios" : /Version\/.+Safari\//.test(ua) ? "safari_family" : "other",
    framed: window.top !== window.self,
  };
  sent++;
  // Only fixed event names and coarse capabilities: no speech, draft values,
  // contact details, device identifiers or authentication data leave the page.
  try {
    const body = JSON.stringify(payload);
    if (navigator.sendBeacon?.("/api/voice-health", new Blob([body], { type: "application/json" }))) return;
    void fetch("/api/voice-health", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {});
  } catch { /* Diagnostics must never prevent the conversation. */ }
}

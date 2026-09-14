export type VoiceHealth = "ready" | "waiting" | "quiet" | "delayed";

// Timers only reveal recovery controls. They never mute, disconnect, create a
// user turn, infer consent, or decide that a quiet visitor is frustrated.
export function createVoiceHealth(now: () => number = Date.now) {
  let activityAt = now();
  let waitingSince: number | null = null;
  return {
    userMessage() { waitingSince = now(); activityAt = now(); },
    agentActivity() { waitingSince = null; activityAt = now(); },
    reset() { waitingSince = null; activityAt = now(); },
    sample({ speaking, muted }: { speaking: boolean; muted: boolean }): VoiceHealth {
      if (muted) return "ready";
      if (speaking && now() - activityAt < 15000) return "ready";
      if (waitingSince !== null) return now() - waitingSince >= 10000 ? "delayed" : "waiting";
      return now() - activityAt >= 15000 ? "quiet" : "ready";
    },
  };
}

export type ScreenAwakeStatus = "off" | "active" | "released" | "unavailable";

type EventSource = Pick<EventTarget, "addEventListener" | "removeEventListener">;
type ScreenPage = EventSource & { visibilityState: string };
type ScreenLock = EventSource & { released: boolean; release(): Promise<void> };

// Phones can revoke a granted lock without hiding the page. Voice users may
// never tap again, so recover automatically, with backoff if the OS refuses.
export function keepScreenAwake(
  page: ScreenPage,
  requestLock: (() => Promise<ScreenLock>) | undefined,
  report: (status: ScreenAwakeStatus) => void,
  lifecycle?: EventSource,
  reportFailure?: (reason: "unsupported" | "denied" | "request_error") => void,
) {
  let stopped = false;
  let pending: Promise<boolean> | null = null;
  let lock: ScreenLock | null = null;
  let retry: ReturnType<typeof setTimeout> | undefined;
  let retryIndex = 0;
  const delays = [1000, 3000, 10000, 30000];

  function cancelRetry() { clearTimeout(retry); retry = undefined; }
  function scheduleRetry() {
    if (stopped || !requestLock || page.visibilityState !== "visible" || retry !== undefined || (lock && !lock.released)) return;
    retry = setTimeout(() => {
      retry = undefined;
      void acquire();
    }, delays[Math.min(retryIndex++, delays.length - 1)]);
  }

  function acquire(): Promise<boolean> {
    if (stopped || page.visibilityState !== "visible") return Promise.resolve(false);
    if (lock && !lock.released) return Promise.resolve(true);
    if (pending) return pending;
    if (!requestLock) { report("unavailable"); reportFailure?.("unsupported"); return Promise.resolve(false); }
    let requested: Promise<ScreenLock>;
    try { requested = requestLock(); }
    catch { report("unavailable"); reportFailure?.("request_error"); scheduleRetry(); return Promise.resolve(false); }
    pending = (async () => { try {
      const next = await requested;
      if (stopped || page.visibilityState !== "visible") { await next.release(); return false; }
      if (next.released) { report("released"); return false; }
      lock = next;
      const acquiredAt = Date.now();
      next.addEventListener("release", () => {
        if (stopped || lock !== next) return;
        lock = null;
        if (Date.now() - acquiredAt >= 10000) retryIndex = 0;
        report("released");
        scheduleRetry();
      }, { once: true });
      report("active");
      return true;
    } catch (error) {
      if (!stopped) {
        report("unavailable");
        reportFailure?.(error instanceof Error && error.name === "NotAllowedError" ? "denied" : "request_error");
      }
      return false;
    } finally {
      pending = null;
      // Covers a return to the page while an earlier request/release was pending.
      scheduleRetry();
    } })();
    return pending;
  }

  function releaseCurrent() {
    const previous = lock;
    lock = null;
    void previous?.release().catch(() => {});
  }
  function visibilityChanged() {
    if (page.visibilityState === "visible") retryOnInteraction();
    else { cancelRetry(); releaseCurrent(); report("released"); }
  }
  function retryOnInteraction() {
    cancelRetry(); retryIndex = 0;
    return acquire();
  }
  page.addEventListener("visibilitychange", visibilityChanged);
  page.addEventListener("pointerdown", retryOnInteraction);
  lifecycle?.addEventListener("pageshow", retryOnInteraction);
  lifecycle?.addEventListener("focus", retryOnInteraction);
  void Promise.resolve().then(acquire);

  function stop() {
    stopped = true;
    cancelRetry();
    page.removeEventListener("visibilitychange", visibilityChanged);
    page.removeEventListener("pointerdown", retryOnInteraction);
    lifecycle?.removeEventListener("pageshow", retryOnInteraction);
    lifecycle?.removeEventListener("focus", retryOnInteraction);
    releaseCurrent();
  }
  return Object.assign(stop, { request: retryOnInteraction });
}

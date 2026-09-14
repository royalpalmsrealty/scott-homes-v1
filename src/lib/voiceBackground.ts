type EventSource = Pick<EventTarget, "addEventListener" | "removeEventListener">;

// Visibility is not a disconnect event. Preserve the live session, and let the
// interface offer recovery on return without discarding the conversation.
export function observeVoiceBackground(
  page: EventSource & { visibilityState: string },
  lifecycle: EventSource,
  onHidden: () => void,
  onReturn: () => void,
) {
  let hidden = false;
  function hide() { if (!hidden) { hidden = true; onHidden(); } }
  function show() { if (hidden && page.visibilityState === "visible") { hidden = false; onReturn(); } }
  function visibilityChanged() { if (page.visibilityState === "hidden") hide(); else show(); }
  function pageShown(event: Event) { if ((event as PageTransitionEvent).persisted) hide(); show(); }
  page.addEventListener("visibilitychange", visibilityChanged);
  lifecycle.addEventListener("pagehide", hide);
  lifecycle.addEventListener("pageshow", pageShown);
  visibilityChanged();
  return () => {
    page.removeEventListener("visibilitychange", visibilityChanged);
    lifecycle.removeEventListener("pagehide", hide);
    lifecycle.removeEventListener("pageshow", pageShown);
  };
}

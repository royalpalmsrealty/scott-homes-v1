import type { ScreenAwakeStatus } from "@/lib/screenAwake";

export function ScreenAwakeNotice({ status }: { status: ScreenAwakeStatus }) {
  if (status === "off") return null;
  return <p role="status" className="text-xs text-muted">{status === "active"
    ? "Screen-awake protection is on."
    : status === "released"
    ? "Restoring screen-awake protection…"
    : "Screen-awake protection is unavailable in this browser. You can still type your answers or call Scott."}</p>;
}

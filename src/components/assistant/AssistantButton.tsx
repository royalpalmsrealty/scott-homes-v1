"use client";

export const ASSISTANT_EVENT = "rpr:open-assistant";
export function AssistantButton({ mode = "offer", children, className, onClick }: {
  mode?: "offer" | "agent"; children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return <button type="button" className={className} onClick={() => {
    onClick?.();
    window.dispatchEvent(new CustomEvent(ASSISTANT_EVENT, { detail: mode }));
  }}>{children}</button>;
}

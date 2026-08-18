import type { ReactNode } from "react";

export function AdminPageHeader({
  icon,
  eyebrow,
  title,
  description,
  actions,
}: {
  icon: ReactNode;
  eyebrow: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,var(--teal)_0%,var(--gold)_100%)] text-ink shadow-[0_8px_20px_rgba(40,188,184,0.25)]">
          {icon}
        </span>
        <div>
          <p className="font-sans text-xs font-medium uppercase tracking-[0.18em] text-gold-deep">{eyebrow}</p>
          <h1 className="mt-1 font-display text-3xl text-ink">{title}</h1>
          {description && <p className="mt-2 max-w-2xl font-sans text-sm text-muted">{description}</p>}
        </div>
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}

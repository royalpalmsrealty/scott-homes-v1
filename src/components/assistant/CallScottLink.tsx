"use client";

import { brand } from "@/lib/brand";
import { HUMAN_CALL_EVENT } from "@/lib/humanHandoff";

export function CallScottLink({ prominent = false }: { prominent?: boolean }) {
  return <a href={brand.phone.href} aria-label={`Call Scott now at ${brand.phone.display}`} onClick={() => window.dispatchEvent(new Event(HUMAN_CALL_EVENT))} className={prominent
    ? "inline-flex min-h-12 items-center justify-center rounded-full bg-teal-deep px-5 py-3 font-semibold text-white"
    : "inline-flex min-h-11 items-center font-semibold text-teal-deep underline"}>Call Scott now</a>;
}

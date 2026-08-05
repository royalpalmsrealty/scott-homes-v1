"use client";

import { useEffect, useState } from "react";

type NetworkInformation = {
  saveData?: boolean;
  effectiveType?: string;
};

// Shared gate for any autoplaying background video: skip it on mobile
// viewports, reduced-motion, or slow connections (build brief §7.1). Poster
// stays as the fallback in every case.
export function useVideoEligibility() {
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const isMobileViewport = window.matchMedia("(max-width: 767px)").matches;
    const connection = (navigator as unknown as { connection?: NetworkInformation })
      .connection;
    const isSlowConnection = Boolean(
      connection &&
        (connection.saveData ||
          ["slow-2g", "2g", "3g"].includes(connection.effectiveType ?? ""))
    );

    if (!prefersReducedMotion && !isMobileViewport && !isSlowConnection) {
      setEligible(true);
    }
  }, []);

  return eligible;
}

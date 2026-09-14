"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { keepScreenAwake, type ScreenAwakeStatus } from "@/lib/screenAwake";
import { reportVoiceEvent } from "@/lib/voiceDiagnostics";

export function useScreenAwake(enabled: boolean) {
  const [status, setStatus] = useState<ScreenAwakeStatus>("off");
  const controller = useRef<ReturnType<typeof keepScreenAwake> | null>(null);
  useEffect(() => {
    if (!enabled) return;
    let previous: ScreenAwakeStatus = "off";
    let previousFailure = "";
    const stop = keepScreenAwake(
      document,
      "wakeLock" in navigator ? () => navigator.wakeLock.request("screen") : undefined,
      value => {
        setStatus(value);
        if (value !== previous && value !== "off") reportVoiceEvent(`screen_${value}`);
        previous = value;
      },
      window,
      reason => {
        if (reason !== previousFailure) reportVoiceEvent(`screen_${reason}`);
        previousFailure = reason;
      },
    );
    controller.current = stop;
    return () => { controller.current = null; stop(); };
  }, [enabled]);
  const request = useCallback(async () => {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([
        controller.current?.request() ?? Promise.resolve(false),
        new Promise<boolean>(resolve => { timeout = setTimeout(() => { reportVoiceEvent("screen_timeout"); resolve(false); }, 2500); }),
      ]);
    } finally { clearTimeout(timeout); }
  }, []);
  return { status: enabled ? status : "off" as ScreenAwakeStatus, request };
}

"use client";

import { useEffect, useState } from "react";

/** Read-only elapsed display. Does not control session duration or lifecycle. */
export function SessionClock({ startedAt }: { startedAt: string | null }) {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const start = startedAt ? Date.parse(startedAt) : Date.now();
    const update = () => setElapsed(Number.isFinite(start) ? Math.max(0,Math.floor((Date.now() - start) / 1000)) : 0);
    const timer = window.setInterval(update,1000);
    return () => window.clearInterval(timer);
  },[startedAt]);
  return <span className="session-clock" aria-label="Elapsed session time"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true"><circle cx="12" cy="13" r="8" /><path d="M12 9v5l3 2M9 2h6" /></svg><time>{String(Math.floor(elapsed / 60)).padStart(2,"0")}:{String(elapsed % 60).padStart(2,"0")}</time></span>;
}

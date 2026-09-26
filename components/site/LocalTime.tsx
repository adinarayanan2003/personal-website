"use client";

import { useEffect, useState } from "react";

/** Current time in a given time zone. Renders a placeholder on the server to avoid a hydration mismatch. */
export function LocalTime({ timeZone }: { timeZone: string }) {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    const format = new Intl.DateTimeFormat("en-US", { timeZone, hour: "numeric", minute: "2-digit" });
    const tick = () => setTime(format.format(new Date()));
    tick();
    const id = window.setInterval(tick, 15_000);
    return () => window.clearInterval(id);
  }, [timeZone]);

  return <span className="tabular-nums">{time ?? "--:--"}</span>;
}

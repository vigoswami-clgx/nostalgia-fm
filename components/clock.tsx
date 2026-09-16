"use client";

import { useEffect, useMemo, useState } from "react";

const formatter = new Intl.DateTimeFormat("en-IN", {
  timeZone: "Asia/Kolkata",
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

type ClockParts = {
  hour: string;
  minute: string;
  period: string;
};

function getClockParts(date: Date): ClockParts {
  const parts = formatter.formatToParts(date);
  return {
    hour: parts.find((part) => part.type === "hour")?.value ?? "--",
    minute: parts.find((part) => part.type === "minute")?.value ?? "--",
    period: parts.find((part) => part.type === "dayPeriod")?.value ?? "--",
  };
}

export function KolkataClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setNow(new Date());
    });
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => {
      window.cancelAnimationFrame(frame);
      window.clearInterval(timer);
    };
  }, []);

  const time = useMemo(() => getClockParts(now ?? new Date()), [now]);

  if (!now) {
    return <span className="text-sm font-medium text-white/90">--:-- --</span>;
  }

  return (
    <span className="text-sm font-medium text-white/90">
      {time.hour}
      <span className="animate-blink">:</span>
      {time.minute} {time.period}
    </span>
  );
}

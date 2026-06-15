"use client";

import { useEffect, useState } from "react";

type Props = { dueTime: string; date: string };

export default function Countdown({ dueTime, date }: Props) {
  const [diff, setDiff] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(`${date}T${dueTime}:00`);

    const tick = () => {
      const now = new Date();
      setDiff(target.getTime() - now.getTime());
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [dueTime, date]);

  if (diff === null) return null;

  if (diff < 0) {
    return <span className="text-xs font-medium text-red-500">마감 지남</span>;
  }

  const totalSec = Math.floor(diff / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  const isUrgent = diff < 60 * 60 * 1000; // 1시간 미만

  return (
    <span
      className={`text-xs font-mono font-semibold ${isUrgent ? "text-red-500 animate-pulse" : "text-orange-500"}`}
    >
      {h > 0 && `${h}시간 `}
      {m}분 {String(s).padStart(2, "0")}초
    </span>
  );
}

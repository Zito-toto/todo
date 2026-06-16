"use client";

import { useMemo } from "react";
import { Todo } from "@/types";

type Props = {
  year: number;
  month: number;
  todos: Todo[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

export default function MonthCalendar({ year, month, todos, selectedDate, onSelectDate }: Props) {
  const today = new Date().toISOString().split("T")[0];

  const countByDate = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    for (const t of todos) {
      if (!map[t.date]) map[t.date] = { total: 0, done: 0 };
      map[t.date].total++;
      if (t.completed) map[t.date].done++;
    }
    return map;
  }, [todos]);

  const { first, total } = useMemo(() => ({
    first: new Date(year, month, 1).getDay(),
    total: new Date(year, month + 1, 0).getDate(),
  }), [year, month]);

  const cells: (number | null)[] = [
    ...Array(first).fill(null),
    ...Array.from({ length: total }, (_, i) => i + 1),
  ];

  return (
    <div className="px-3">
      {/* Day headers */}
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className="text-center py-1"
            style={{
              fontSize: 12,
              fontWeight: 400,
              letterSpacing: "-0.12px",
              color: i === 0 ? "var(--color-red)" : i === 6 ? "var(--color-primary)" : "var(--color-ink-muted-48)",
            }}
          >
            {d}
          </div>
        ))}
      </div>

      {/* Date cells */}
      <div className="grid grid-cols-7">
        {cells.map((d, i) => {
          if (!d) return <div key={`e-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const info = countByDate[dateStr];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === today;
          const dow = (first + d - 1) % 7;
          const allDone = info && info.done === info.total;
          const hasPending = info && info.total - info.done > 0;

          const textColor = isSelected
            ? "#fff"
            : isToday
            ? "var(--color-primary)"
            : dow === 0
            ? "var(--color-red)"
            : dow === 6
            ? "var(--color-primary)"
            : "var(--color-ink)";

          return (
            <button
              key={d}
              onClick={() => onSelectDate(dateStr)}
              className="flex flex-col items-center py-1 gap-0.5"
            >
              <span
                className="w-8 h-8 flex items-center justify-center rounded-full transition-all"
                style={{
                  fontSize: 15,
                  fontWeight: isSelected || isToday ? 600 : 400,
                  letterSpacing: "-0.374px",
                  background: isSelected ? "var(--color-primary)" : "transparent",
                  color: textColor,
                }}
              >
                {d}
              </span>
              <div className="h-1.5 flex items-center gap-0.5">
                {allDone && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-green)" }} />
                )}
                {hasPending && (
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--color-primary)" }} />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

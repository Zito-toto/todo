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
    <div className="px-4">
      <div className="grid grid-cols-7 mb-1">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${
              i === 0 ? "text-[#FF3B30]" : i === 6 ? "text-[#007AFF]" : "text-[#3C3C4399]"
            }`}
          >
            {d}
          </div>
        ))}
      </div>
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

          return (
            <button
              key={d}
              onClick={() => onSelectDate(dateStr)}
              className="flex flex-col items-center py-1 gap-0.5"
            >
              <span
                className={`w-8 h-8 flex items-center justify-center rounded-full text-[15px] font-medium transition-colors ${
                  isSelected
                    ? "bg-[#007AFF] text-white font-semibold"
                    : isToday
                    ? "text-[#007AFF] font-semibold"
                    : dow === 0
                    ? "text-[#FF3B30]"
                    : dow === 6
                    ? "text-[#007AFF]"
                    : "text-black"
                }`}
              >
                {d}
              </span>
              <div className="h-1.5 flex items-center gap-0.5">
                {allDone && <span className="w-1.5 h-1.5 rounded-full bg-[#34C759]" />}
                {hasPending && <span className="w-1.5 h-1.5 rounded-full bg-[#007AFF]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

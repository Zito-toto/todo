"use client";

import { useMemo } from "react";
import { Todo } from "@/types";

type Props = {
  year: number;
  month: number; // 0-indexed
  todos: Todo[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

export default function MonthCalendar({
  year,
  month,
  todos,
  selectedDate,
  onSelectDate,
}: Props) {
  const countByDate = useMemo(() => {
    const map: Record<string, { total: number; done: number }> = {};
    for (const t of todos) {
      if (!map[t.date]) map[t.date] = { total: 0, done: 0 };
      map[t.date].total++;
      if (t.completed) map[t.date].done++;
    }
    return map;
  }, [todos]);

  const days = useMemo(() => {
    const first = new Date(year, month, 1).getDay();
    const total = new Date(year, month + 1, 0).getDate();
    return { first, total };
  }, [year, month]);

  const cells = [];
  for (let i = 0; i < days.first; i++) cells.push(null);
  for (let d = 1; d <= days.total; d++) cells.push(d);

  const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map((d, i) => (
          <div
            key={d}
            className={`text-center text-xs font-medium py-1 ${i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-gray-400"}`}
          >
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />;
          const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
          const info = countByDate[dateStr];
          const isSelected = dateStr === selectedDate;
          const isToday = dateStr === new Date().toISOString().split("T")[0];
          const dow = (days.first + d - 1) % 7;

          return (
            <button
              key={d}
              onClick={() => onSelectDate(dateStr)}
              className={`flex flex-col items-center justify-start py-1.5 rounded-xl transition-all ${
                isSelected
                  ? "bg-indigo-500 text-white"
                  : isToday
                    ? "bg-indigo-50"
                    : "hover:bg-gray-50"
              }`}
            >
              <span
                className={`text-sm font-medium leading-none ${
                  isSelected
                    ? "text-white"
                    : dow === 0
                      ? "text-red-400"
                      : dow === 6
                        ? "text-blue-400"
                        : "text-gray-700"
                }`}
              >
                {d}
              </span>
              {info && (
                <div className="flex gap-0.5 mt-1">
                  {info.done > 0 && (
                    <span className="w-1 h-1 rounded-full bg-green-400" />
                  )}
                  {info.total - info.done > 0 && (
                    <span className="w-1 h-1 rounded-full bg-indigo-300" />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

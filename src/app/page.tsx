"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CreateTodoInput, Member, Todo } from "@/types";
import MonthCalendar from "@/components/MonthCalendar";
import TodoItem from "@/components/TodoItem";
import TodoForm from "@/components/TodoForm";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";

const MEMBERS: { value: Member | "전체"; emoji: string }[] = [
  { value: "전체", emoji: "👨‍👩‍👧‍👦" },
  { value: "지원", emoji: "🙋‍♀️" },
  { value: "소영", emoji: "👧" },
  { value: "엄마", emoji: "👩" },
  { value: "아빠", emoji: "👨" },
];

export default function Home() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState(today);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [monthTodos, setMonthTodos] = useState<Todo[]>([]);
  const [dayTodos, setDayTodos] = useState<Todo[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterMember, setFilterMember] = useState<Member | "전체">("전체");
  const [loading, setLoading] = useState(false);

  const monthKey = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}`;

  const fetchMonth = useCallback(async () => {
    const res = await fetch(`/api/todos?month=${monthKey}`);
    const data = await res.json();
    setMonthTodos(data);
  }, [monthKey]);

  const fetchDay = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/todos?date=${selectedDate}`);
    const data = await res.json();
    setDayTodos(data);
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => {
    fetchMonth();
  }, [fetchMonth]);
  useEffect(() => {
    fetchDay();
  }, [fetchDay]);

  const filteredTodos = useMemo(
    () =>
      filterMember === "전체"
        ? dayTodos
        : dayTodos.filter((t) => t.assignee === filterMember),
    [dayTodos, filterMember],
  );

  const pending = filteredTodos.filter((t) => !t.completed);
  const done = filteredTodos.filter((t) => t.completed);

  const handleSave = async (input: CreateTodoInput) => {
    await fetch("/api/todos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    setShowForm(false);
    await fetchDay();
    await fetchMonth();
  };

  const handleToggle = async (id: string, completed: boolean) => {
    await fetch(`/api/todos/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    await fetchDay();
    await fetchMonth();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/todos/${id}`, { method: "DELETE" });
    await fetchDay();
    await fetchMonth();
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else setViewMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else setViewMonth((m) => m + 1);
  };

  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString(
    "ko-KR",
    {
      month: "long",
      day: "numeric",
      weekday: "short",
    },
  );

  return (
    <main className="min-h-screen bg-gray-50 pb-20">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-indigo-600">🏠 우리집 할일</h1>
          <button
            onClick={() => {
              setSelectedDate(today);
              setViewYear(new Date().getFullYear());
              setViewMonth(new Date().getMonth());
            }}
            className="text-xs text-gray-400 hover:text-indigo-500 border border-gray-200 rounded-lg px-3 py-1.5"
          >
            오늘
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 pt-4 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevMonth}
            className="p-2 hover:bg-white rounded-lg text-gray-500"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="font-semibold text-gray-700">
            {viewYear}년 {viewMonth + 1}월
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-white rounded-lg text-gray-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <MonthCalendar
          year={viewYear}
          month={viewMonth}
          todos={monthTodos}
          selectedDate={selectedDate}
          onSelectDate={(d) => {
            setSelectedDate(d);
            const dt = new Date(d + "T00:00:00");
            setViewYear(dt.getFullYear());
            setViewMonth(dt.getMonth());
          }}
        />

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-gray-800">{dateLabel}</h2>
            <span className="text-sm text-gray-400">
              {pending.length}개 남음
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {MEMBERS.map(({ value, emoji }) => (
              <button
                key={value}
                onClick={() => setFilterMember(value)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  filterMember === value
                    ? "bg-indigo-500 text-white"
                    : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                {emoji} {value}
              </button>
            ))}
          </div>
        </div>

        {showForm && (
          <TodoForm
            date={selectedDate}
            onSave={handleSave}
            onCancel={() => setShowForm(false)}
          />
        )}

        {loading ? (
          <div className="text-center text-gray-400 py-10">불러오는 중…</div>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {pending.map((t) => (
                <TodoItem
                  key={t.id}
                  todo={t}
                  today={today}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                />
              ))}
              {pending.length === 0 && !showForm && (
                <div className="text-center text-gray-300 py-8 text-sm">
                  할 일이 없어요 🎉
                </div>
              )}
            </div>

            {done.length > 0 && (
              <div className="flex flex-col gap-2">
                <p className="text-xs text-gray-400 font-medium">
                  완료 {done.length}개
                </p>
                {done.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    today={today}
                    onToggle={handleToggle}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all active:scale-95"
        >
          <Plus size={28} />
        </button>
      )}
    </main>
  );
}

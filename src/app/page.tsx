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
    try {
      const res = await fetch(`/api/todos?month=${monthKey}`);
      if (!res.ok) return;
      const data = await res.json();
      setMonthTodos(Array.isArray(data) ? data : []);
    } catch {}
  }, [monthKey]);

  const fetchDay = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/todos?date=${selectedDate}`);
      if (!res.ok) return;
      const data = await res.json();
      setDayTodos(Array.isArray(data) ? data : []);
    } catch {}
    setLoading(false);
  }, [selectedDate]);

  useEffect(() => { fetchMonth(); }, [fetchMonth]);
  useEffect(() => { fetchDay(); }, [fetchDay]);

  const filteredTodos = useMemo(
    () => filterMember === "전체" ? dayTodos : dayTodos.filter(t => t.assignee === filterMember),
    [dayTodos, filterMember],
  );

  const pending = filteredTodos.filter(t => !t.completed);
  const done = filteredTodos.filter(t => t.completed);

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
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const dateLabel = new Date(selectedDate + "T00:00:00").toLocaleDateString("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      {/* iOS Navigation Bar */}
      <header className="sticky top-0 z-30 bg-[#F2F2F7]/80 backdrop-blur-xl border-b border-[#3C3C4349]">
        <div className="max-w-lg mx-auto px-4 pt-12 pb-3 flex items-end justify-between">
          <h1 className="text-[34px] font-bold leading-none tracking-tight text-black">우리집</h1>
          <button
            onClick={() => {
              setSelectedDate(today);
              setViewYear(new Date().getFullYear());
              setViewMonth(new Date().getMonth());
            }}
            className="text-[15px] text-[#007AFF] font-medium mb-0.5"
          >
            오늘
          </button>
        </div>
      </header>

      <div className="max-w-lg mx-auto">
        {/* Month Navigation */}
        <div className="flex items-center justify-between px-4 py-3">
          <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center">
            <ChevronLeft size={20} className="text-[#007AFF]" />
          </button>
          <span className="text-[15px] font-semibold text-black">
            {viewYear}년 {viewMonth + 1}월
          </span>
          <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center">
            <ChevronRight size={20} className="text-[#007AFF]" />
          </button>
        </div>

        {/* Calendar */}
        <MonthCalendar
          year={viewYear}
          month={viewMonth}
          todos={monthTodos}
          selectedDate={selectedDate}
          onSelectDate={d => {
            setSelectedDate(d);
            const dt = new Date(d + "T00:00:00");
            setViewYear(dt.getFullYear());
            setViewMonth(dt.getMonth());
          }}
        />

        {/* Date header */}
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h2 className="text-[20px] font-bold text-black">{dateLabel}</h2>
          {pending.length > 0 && (
            <span className="text-[13px] text-[#8E8E93]">{pending.length}개 남음</span>
          )}
        </div>

        {/* Member filter — iOS segmented/chip style */}
        <div className="flex gap-2 px-4 pb-3 overflow-x-auto">
          {MEMBERS.map(({ value, emoji }) => (
            <button
              key={value}
              onClick={() => setFilterMember(value)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors ${
                filterMember === value
                  ? "bg-[#007AFF] text-white"
                  : "bg-white text-black"
              }`}
            >
              {emoji} {value}
            </button>
          ))}
        </div>

        {/* Todo list */}
        {loading ? (
          <div className="text-center text-[#8E8E93] py-16 text-[15px]">불러오는 중…</div>
        ) : (
          <div className="pb-32">
            {/* Pending */}
            {pending.length > 0 && (
              <div className="mx-4 bg-white rounded-2xl overflow-hidden mb-4">
                {pending.map((t, i) => (
                  <div key={t.id}>
                    <TodoItem todo={t} today={today} onToggle={handleToggle} onDelete={handleDelete} />
                    {i < pending.length - 1 && (
                      <div className="ml-[52px] h-px bg-[#3C3C4349]" />
                    )}
                  </div>
                ))}
              </div>
            )}

            {pending.length === 0 && done.length === 0 && !loading && (
              <div className="text-center py-16">
                <p className="text-[40px] mb-2">🎉</p>
                <p className="text-[15px] text-[#8E8E93]">할 일이 없어요</p>
              </div>
            )}

            {/* Done */}
            {done.length > 0 && (
              <div className="mx-4">
                <p className="text-[13px] text-[#8E8E93] font-medium px-1 mb-2">완료 {done.length}개</p>
                <div className="bg-white rounded-2xl overflow-hidden">
                  {done.map((t, i) => (
                    <div key={t.id}>
                      <TodoItem todo={t} today={today} onToggle={handleToggle} onDelete={handleDelete} />
                      {i < done.length - 1 && (
                        <div className="ml-[52px] h-px bg-[#3C3C4349]" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* FAB */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-6 w-14 h-14 bg-[#007AFF] text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
          style={{ boxShadow: "0 4px 20px rgba(0,122,255,0.4)" }}
        >
          <Plus size={28} strokeWidth={2.5} />
        </button>
      )}

      {/* Form bottom sheet */}
      {showForm && (
        <TodoForm
          date={selectedDate}
          onSave={handleSave}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

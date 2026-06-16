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
    <div className="min-h-screen" style={{ background: "var(--color-canvas-parchment)" }}>
      {/* Black global nav — Apple.com style */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: "rgba(0,0,0,0.85)",
          backdropFilter: "saturate(180%) blur(20px)",
          WebkitBackdropFilter: "saturate(180%) blur(20px)",
          borderBottom: "0.5px solid rgba(255,255,255,0.12)",
        }}
      >
        <div className="max-w-lg mx-auto px-5 h-11 flex items-center justify-between">
          <span
            className="font-semibold"
            style={{ color: "var(--color-on-dark)", fontSize: 15, letterSpacing: "-0.12px" }}
          >
            🏠 우리집 할일
          </span>
          <button
            onClick={() => {
              setSelectedDate(today);
              setViewYear(new Date().getFullYear());
              setViewMonth(new Date().getMonth());
            }}
            style={{
              color: "var(--color-primary-on-dark)",
              fontSize: 14,
              letterSpacing: "-0.224px",
            }}
          >
            오늘
          </button>
        </div>
      </header>

      {/* Calendar card */}
      <div className="max-w-lg mx-auto px-4 pt-5 pb-2">
        <div
          className="rounded-[18px] overflow-hidden"
          style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}
        >
          {/* Month nav */}
          <div className="flex items-center justify-between px-5 pt-4 pb-3">
            <button onClick={prevMonth} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "var(--color-canvas-parchment)" }}>
              <ChevronLeft size={16} style={{ color: "var(--color-primary)" }} />
            </button>
            <span
              className="font-semibold"
              style={{ fontSize: 15, color: "var(--color-ink)", letterSpacing: "-0.374px" }}
            >
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button onClick={nextMonth} className="w-8 h-8 flex items-center justify-center rounded-full" style={{ background: "var(--color-canvas-parchment)" }}>
              <ChevronRight size={16} style={{ color: "var(--color-primary)" }} />
            </button>
          </div>

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
          <div className="pb-3" />
        </div>
      </div>

      {/* Date label */}
      <div className="max-w-lg mx-auto px-5 pt-5 pb-2 flex items-baseline justify-between">
        <h2
          className="font-semibold"
          style={{ fontSize: 21, color: "var(--color-ink)", letterSpacing: "0.231px", lineHeight: 1.19 }}
        >
          {dateLabel}
        </h2>
        {pending.length > 0 && (
          <span style={{ fontSize: 14, color: "var(--color-ink-muted-48)", letterSpacing: "-0.224px" }}>
            {pending.length}개 남음
          </span>
        )}
      </div>

      {/* Member filter — pill chips */}
      <div className="max-w-lg mx-auto px-4 pb-4 flex gap-2 overflow-x-auto">
        {MEMBERS.map(({ value, emoji }) => (
          <button
            key={value}
            onClick={() => setFilterMember(value)}
            className="flex-shrink-0 flex items-center gap-1 rounded-full"
            style={{
              padding: "7px 16px",
              fontSize: 14,
              letterSpacing: "-0.224px",
              fontWeight: filterMember === value ? 600 : 400,
              background: filterMember === value ? "var(--color-primary)" : "var(--color-canvas)",
              color: filterMember === value ? "#fff" : "var(--color-ink)",
              border: filterMember === value ? "none" : "1px solid var(--color-hairline)",
              transition: "background 0.15s, color 0.15s",
            }}
          >
            {emoji} {value}
          </button>
        ))}
      </div>

      {/* Todo list */}
      <div className="max-w-lg mx-auto pb-32 px-4">
        {loading ? (
          <div className="text-center py-20" style={{ color: "var(--color-ink-muted-48)", fontSize: 15 }}>
            불러오는 중…
          </div>
        ) : (
          <>
            {/* Pending */}
            {pending.length > 0 && (
              <div
                className="rounded-[18px] overflow-hidden mb-4"
                style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}
              >
                {pending.map((t, i) => (
                  <div key={t.id}>
                    <TodoItem todo={t} today={today} onToggle={handleToggle} onDelete={handleDelete} />
                    {i < pending.length - 1 && (
                      <div className="ml-14" style={{ height: "0.5px", background: "var(--color-hairline)" }} />
                    )}
                  </div>
                ))}
              </div>
            )}

            {pending.length === 0 && done.length === 0 && (
              <div className="text-center py-20">
                <p style={{ fontSize: 40, marginBottom: 8 }}>🎉</p>
                <p style={{ fontSize: 15, color: "var(--color-ink-muted-48)", letterSpacing: "-0.374px" }}>
                  오늘 할 일이 없어요
                </p>
              </div>
            )}

            {/* Done */}
            {done.length > 0 && (
              <>
                <p
                  className="px-1 mb-2"
                  style={{ fontSize: 13, color: "var(--color-ink-muted-48)", fontWeight: 600, letterSpacing: "-0.12px" }}
                >
                  완료 {done.length}개
                </p>
                <div
                  className="rounded-[18px] overflow-hidden"
                  style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}
                >
                  {done.map((t, i) => (
                    <div key={t.id}>
                      <TodoItem todo={t} today={today} onToggle={handleToggle} onDelete={handleDelete} />
                      {i < done.length - 1 && (
                        <div className="ml-14" style={{ height: "0.5px", background: "var(--color-hairline)" }} />
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* FAB — Action Blue pill */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="fixed bottom-8 right-5 flex items-center gap-2 rounded-full"
          style={{
            background: "var(--color-primary)",
            color: "#fff",
            padding: "14px 22px",
            fontSize: 15,
            fontWeight: 600,
            letterSpacing: "-0.374px",
            boxShadow: "rgba(0,0,0,0.22) 0px 3px 30px 0px",
          }}
        >
          <Plus size={18} strokeWidth={2.5} />
          추가
        </button>
      )}

      {/* Bottom sheet form */}
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

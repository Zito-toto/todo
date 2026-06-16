"use client";

import { useState } from "react";
import { Category, CreateTodoInput, Member, Priority } from "@/types";

const MEMBERS: Member[] = ["지원", "소영", "엄마", "아빠"];
const CATEGORIES: { value: Category; emoji: string }[] = [
  { value: "집안일", emoji: "🏠" },
  { value: "심부름", emoji: "🛍" },
  { value: "개인", emoji: "👤" },
  { value: "장보기", emoji: "🛒" },
  { value: "기타", emoji: "📌" },
];
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "urgent", label: "긴급", color: "#FF3B30" },
  { value: "normal", label: "보통", color: "#FF9500" },
  { value: "low", label: "여유", color: "#34C759" },
];

type Props = {
  date: string;
  onSave: (todo: CreateTodoInput) => Promise<void>;
  onCancel: () => void;
};

export default function TodoForm({ date, onSave, onCancel }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const isToday = date === today;

  const [form, setForm] = useState<CreateTodoInput>({
    title: "",
    description: null,
    assignee: "지원",
    requested_by: null,
    category: "기타",
    priority: "normal",
    date,
    due_time: null,
    estimated_minutes: null,
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof CreateTodoInput>(k: K, v: CreateTodoInput[K]) =>
    setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 z-40 overlay-enter"
        onClick={onCancel}
      />

      {/* Bottom Sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sheet-enter">
        <div className="bg-[#F2F2F7] rounded-t-[20px] max-h-[90vh] overflow-y-auto">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-10 h-1 rounded-full bg-[#3C3C4349]" />
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={onCancel} className="text-[#007AFF] text-[17px]">
              취소
            </button>
            <h2 className="text-[17px] font-semibold">할 일 추가</h2>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.title.trim()}
              className="text-[#007AFF] text-[17px] font-semibold disabled:opacity-40"
            >
              {saving ? "저장 중" : "저장"}
            </button>
          </div>

          <form onSubmit={handleSubmit} className="px-4 pb-10 flex flex-col gap-4">
            {/* Title */}
            <div className="bg-white rounded-2xl px-4 py-3">
              <input
                className="w-full text-[17px] outline-none placeholder:text-[#C7C7CC]"
                placeholder="할 일 제목"
                value={form.title}
                onChange={e => set("title", e.target.value)}
                required
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl px-4 py-3">
              <textarea
                className="w-full text-[15px] text-[#3C3C43] outline-none resize-none placeholder:text-[#C7C7CC] min-h-[60px]"
                placeholder="메모 (선택)"
                value={form.description ?? ""}
                onChange={e => set("description", e.target.value || null)}
              />
            </div>

            {/* Priority */}
            <div>
              <p className="text-[13px] text-[#8E8E93] font-medium px-1 mb-2">우선순위</p>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set("priority", p.value)}
                    className={`flex-1 py-2.5 rounded-2xl text-[14px] font-medium border-2 transition-all ${
                      form.priority === p.value
                        ? "border-transparent text-white"
                        : "border-transparent bg-white text-[#3C3C43]"
                    }`}
                    style={form.priority === p.value ? { background: p.color, borderColor: p.color } : {}}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="text-[13px] text-[#8E8E93] font-medium px-1 mb-2">카테고리</p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set("category", c.value)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl text-[14px] font-medium transition-all ${
                      form.category === c.value
                        ? "bg-[#007AFF] text-white"
                        : "bg-white text-[#3C3C43]"
                    }`}
                  >
                    {c.emoji} {c.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee & Requester */}
            <div className="bg-white rounded-2xl overflow-hidden">
              <div className="flex items-center px-4 py-3 border-b border-[#3C3C4349]">
                <span className="text-[15px] text-black flex-1">담당자</span>
                <select
                  className="text-[15px] text-[#007AFF] outline-none bg-transparent"
                  value={form.assignee}
                  onChange={e => set("assignee", e.target.value as Member)}
                >
                  {MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex items-center px-4 py-3">
                <span className="text-[15px] text-black flex-1">요청자</span>
                <select
                  className="text-[15px] text-[#007AFF] outline-none bg-transparent"
                  value={form.requested_by ?? ""}
                  onChange={e => set("requested_by", (e.target.value as Member) || null)}
                >
                  <option value="">없음</option>
                  {MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </div>
            </div>

            {/* Time */}
            <div className="bg-white rounded-2xl overflow-hidden">
              {isToday && (
                <div className="flex items-center px-4 py-3 border-b border-[#3C3C4349]">
                  <span className="text-[15px] text-black flex-1">마감 시간</span>
                  <input
                    type="time"
                    className="text-[15px] text-[#007AFF] outline-none bg-transparent"
                    value={form.due_time ?? ""}
                    onChange={e => set("due_time", e.target.value || null)}
                  />
                </div>
              )}
              <div className="flex items-center px-4 py-3">
                <span className="text-[15px] text-black flex-1">소요 시간</span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    className="text-[15px] text-[#007AFF] outline-none bg-transparent w-12 text-right"
                    value={form.estimated_minutes ?? ""}
                    onChange={e => set("estimated_minutes", e.target.value ? Number(e.target.value) : null)}
                  />
                  <span className="text-[15px] text-[#8E8E93]">분</span>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

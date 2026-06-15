"use client";

import { useState } from "react";
import { Category, CreateTodoInput, Member, Priority } from "@/types";

const MEMBERS: Member[] = ["지원", "소영", "엄마", "아빠"];
const CATEGORIES: Category[] = ["집안일", "심부름", "개인", "장보기", "기타"];
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "urgent", label: "🔴 긴급", color: "text-red-600" },
  { value: "normal", label: "🟡 보통", color: "text-yellow-600" },
  { value: "low", label: "🟢 여유", color: "text-green-600" },
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
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-md p-5 flex flex-col gap-4"
    >
      <input
        className="text-lg font-semibold border-b border-gray-200 pb-2 outline-none placeholder:text-gray-300"
        placeholder="할 일을 입력하세요"
        value={form.title}
        onChange={(e) => set("title", e.target.value)}
        required
        autoFocus
      />

      <textarea
        className="text-sm text-gray-600 border border-gray-100 rounded-lg p-3 outline-none resize-none placeholder:text-gray-300 bg-gray-50"
        placeholder="상세 설명 (선택)"
        rows={2}
        value={form.description ?? ""}
        onChange={(e) => set("description", e.target.value || null)}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium">담당자</span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            value={form.assignee}
            onChange={(e) => set("assignee", e.target.value as Member)}
          >
            {MEMBERS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium">
            요청자 (선택)
          </span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            value={form.requested_by ?? ""}
            onChange={(e) =>
              set("requested_by", (e.target.value as Member) || null)
            }
          >
            <option value="">없음</option>
            {MEMBERS.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium">카테고리</span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            value={form.category}
            onChange={(e) => set("category", e.target.value as Category)}
          >
            {CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium">우선순위</span>
          <select
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            value={form.priority}
            onChange={(e) => set("priority", e.target.value as Priority)}
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>

        {isToday && (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-gray-400 font-medium">마감 시간</span>
            <input
              type="time"
              className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
              value={form.due_time ?? ""}
              onChange={(e) => set("due_time", e.target.value || null)}
            />
          </label>
        )}

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400 font-medium">
            소요 시간 (분)
          </span>
          <input
            type="number"
            min={1}
            placeholder="예: 30"
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none"
            value={form.estimated_minutes ?? ""}
            onChange={(e) =>
              set(
                "estimated_minutes",
                e.target.value ? Number(e.target.value) : null,
              )
            }
          />
        </label>
      </div>

      <div className="flex gap-2 justify-end pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700"
        >
          취소
        </button>
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-indigo-500 text-white text-sm font-medium rounded-lg hover:bg-indigo-600 disabled:opacity-50"
        >
          {saving ? "저장 중…" : "저장"}
        </button>
      </div>
    </form>
  );
}

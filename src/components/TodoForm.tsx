"use client";

import { useState } from "react";
import { Category, CreateTodoInput, Member, Priority } from "@/types";

const MEMBERS: Member[] = ["지원", "소영", "엄마", "아빠"];
const CATEGORIES: { value: Category; emoji: string }[] = [
  { value: "집안일", emoji: "🏠" },
  { value: "심부름", emoji: "🛍" },
  { value: "개인",  emoji: "👤" },
  { value: "장보기", emoji: "🛒" },
  { value: "기타",  emoji: "📌" },
];
const PRIORITIES: { value: Priority; label: string; color: string }[] = [
  { value: "urgent", label: "긴급", color: "var(--color-red)" },
  { value: "normal", label: "보통", color: "var(--color-orange)" },
  { value: "low",    label: "여유", color: "var(--color-green)" },
];

type Props = {
  date: string;
  onSave: (todo: CreateTodoInput) => Promise<void>;
  onCancel: () => void;
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div
      className="flex items-center px-5 py-3"
      style={{ borderBottom: "0.5px solid var(--color-hairline)" }}
    >
      <span style={{ fontSize: 17, color: "var(--color-ink)", letterSpacing: "-0.374px", flex: 1 }}>
        {label}
      </span>
      {children}
    </div>
  );
}

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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 overlay-enter"
        style={{ background: "rgba(0,0,0,0.5)" }}
        onClick={onCancel}
      />

      {/* Bottom sheet */}
      <div className="fixed bottom-0 left-0 right-0 z-50 sheet-enter">
        <div
          className="rounded-t-[20px] overflow-y-auto"
          style={{
            background: "var(--color-canvas-parchment)",
            maxHeight: "92vh",
          }}
        >
          {/* Handle bar */}
          <div className="flex justify-center pt-2.5 pb-1">
            <div className="w-9 h-1 rounded-full" style={{ background: "var(--color-hairline)" }} />
          </div>

          {/* Nav row */}
          <div
            className="flex items-center justify-between px-5 py-3"
            style={{ borderBottom: "0.5px solid var(--color-hairline)" }}
          >
            <button
              onClick={onCancel}
              style={{ color: "var(--color-primary)", fontSize: 17, letterSpacing: "-0.374px" }}
            >
              취소
            </button>
            <span style={{ fontSize: 17, fontWeight: 600, color: "var(--color-ink)", letterSpacing: "-0.374px" }}>
              할 일 추가
            </span>
            <button
              onClick={handleSubmit}
              disabled={saving || !form.title.trim()}
              style={{
                color: saving || !form.title.trim() ? "var(--color-ink-muted-48)" : "var(--color-primary)",
                fontSize: 17,
                fontWeight: 600,
                letterSpacing: "-0.374px",
              }}
            >
              {saving ? "저장 중" : "저장"}
            </button>
          </div>

          <div className="px-4 py-4 flex flex-col gap-4 pb-12">
            {/* Title + Description card */}
            <div
              className="rounded-[18px] overflow-hidden"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}
            >
              <div className="px-5 pt-4 pb-2" style={{ borderBottom: "0.5px solid var(--color-hairline)" }}>
                <input
                  className="w-full outline-none bg-transparent placeholder:text-[var(--color-ink-muted-48)]"
                  style={{ fontSize: 17, color: "var(--color-ink)", letterSpacing: "-0.374px", fontWeight: 600 }}
                  placeholder="할 일 제목"
                  value={form.title}
                  onChange={e => set("title", e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="px-5 py-3">
                <textarea
                  className="w-full outline-none bg-transparent resize-none placeholder:text-[var(--color-ink-muted-48)]"
                  style={{ fontSize: 15, color: "var(--color-ink-muted-80)", letterSpacing: "-0.374px", minHeight: 56 }}
                  placeholder="메모 (선택)"
                  value={form.description ?? ""}
                  onChange={e => set("description", e.target.value || null)}
                />
              </div>
            </div>

            {/* Priority */}
            <div>
              <p className="px-1 mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>
                우선순위
              </p>
              <div className="flex gap-2">
                {PRIORITIES.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => set("priority", p.value)}
                    className="flex-1 rounded-full"
                    style={{
                      padding: "10px 0",
                      fontSize: 14,
                      fontWeight: form.priority === p.value ? 600 : 400,
                      letterSpacing: "-0.224px",
                      background: form.priority === p.value ? p.color : "var(--color-canvas)",
                      color: form.priority === p.value ? "#fff" : "var(--color-ink)",
                      border: form.priority === p.value ? "none" : "1px solid var(--color-hairline)",
                      transition: "all 0.15s",
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Category */}
            <div>
              <p className="px-1 mb-2" style={{ fontSize: 13, fontWeight: 600, color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>
                카테고리
              </p>
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set("category", c.value)}
                    className="flex items-center gap-1.5 rounded-full"
                    style={{
                      padding: "8px 14px",
                      fontSize: 14,
                      fontWeight: form.category === c.value ? 600 : 400,
                      letterSpacing: "-0.224px",
                      background: form.category === c.value ? "var(--color-primary)" : "var(--color-canvas)",
                      color: form.category === c.value ? "#fff" : "var(--color-ink)",
                      border: form.category === c.value ? "none" : "1px solid var(--color-hairline)",
                      transition: "all 0.15s",
                    }}
                  >
                    {c.emoji} {c.value}
                  </button>
                ))}
              </div>
            </div>

            {/* Assignee / Requester / Time */}
            <div
              className="rounded-[18px] overflow-hidden"
              style={{ background: "var(--color-canvas)", border: "1px solid var(--color-hairline)" }}
            >
              <Row label="담당자">
                <select
                  className="outline-none bg-transparent"
                  style={{ fontSize: 17, color: "var(--color-primary)", letterSpacing: "-0.374px" }}
                  value={form.assignee}
                  onChange={e => set("assignee", e.target.value as Member)}
                >
                  {MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Row>
              <Row label="요청자">
                <select
                  className="outline-none bg-transparent"
                  style={{ fontSize: 17, color: "var(--color-primary)", letterSpacing: "-0.374px" }}
                  value={form.requested_by ?? ""}
                  onChange={e => set("requested_by", (e.target.value as Member) || null)}
                >
                  <option value="">없음</option>
                  {MEMBERS.map(m => <option key={m}>{m}</option>)}
                </select>
              </Row>
              {isToday && (
                <Row label="마감 시간">
                  <input
                    type="time"
                    className="outline-none bg-transparent"
                    style={{ fontSize: 17, color: "var(--color-primary)", letterSpacing: "-0.374px" }}
                    value={form.due_time ?? ""}
                    onChange={e => set("due_time", e.target.value || null)}
                  />
                </Row>
              )}
              <div className="flex items-center px-5 py-3">
                <span style={{ fontSize: 17, color: "var(--color-ink)", letterSpacing: "-0.374px", flex: 1 }}>
                  소요 시간
                </span>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1}
                    placeholder="0"
                    className="outline-none bg-transparent text-right w-12"
                    style={{ fontSize: 17, color: "var(--color-primary)", letterSpacing: "-0.374px" }}
                    value={form.estimated_minutes ?? ""}
                    onChange={e => set("estimated_minutes", e.target.value ? Number(e.target.value) : null)}
                  />
                  <span style={{ fontSize: 17, color: "var(--color-ink-muted-48)" }}>분</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

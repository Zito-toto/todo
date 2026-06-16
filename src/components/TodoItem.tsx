"use client";

import { useState } from "react";
import { Todo } from "@/types";
import Countdown from "./Countdown";
import { Trash2 } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "var(--color-red)",
  normal: "var(--color-orange)",
  low: "var(--color-green)",
};

const PRIORITY_LABEL: Record<string, string> = {
  urgent: "긴급",
  normal: "보통",
  low: "여유",
};

const CATEGORY_STYLE: Record<string, { bg: string; color: string }> = {
  집안일: { bg: "#e8f0fe", color: "#1a56db" },
  심부름: { bg: "#fff3e0", color: "#b45309" },
  개인:  { bg: "#f3e8ff", color: "#7c3aed" },
  장보기: { bg: "#dcfce7", color: "#15803d" },
  기타:  { bg: "var(--color-canvas-parchment)", color: "var(--color-ink-muted-48)" },
};

type Props = {
  todo: Todo;
  today: string;
  onToggle: (id: string, completed: boolean) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
};

export default function TodoItem({ todo, today, onToggle, onDelete }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const showCountdown = todo.date === today && todo.due_time && !todo.completed;
  const cat = CATEGORY_STYLE[todo.category] ?? CATEGORY_STYLE["기타"];

  const handleToggle = async () => {
    setLoading(true);
    await onToggle(todo.id, !todo.completed);
    setLoading(false);
  };

  const handleDelete = async () => {
    if (!confirm("삭제할까요?")) return;
    await onDelete(todo.id);
  };

  return (
    <div style={{ opacity: todo.completed ? 0.48 : 1, transition: "opacity 0.2s" }}>
      <div
        className="flex items-start gap-3 px-4 py-3 cursor-pointer"
        onClick={() => todo.description && setExpanded(v => !v)}
      >
        {/* Checkbox */}
        <button
          onClick={e => { e.stopPropagation(); handleToggle(); }}
          disabled={loading}
          className="flex-shrink-0 mt-0.5"
        >
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center transition-all"
            style={{
              border: todo.completed ? "none" : `2px solid var(--color-hairline)`,
              background: todo.completed ? "var(--color-green)" : "transparent",
            }}
          >
            {todo.completed && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Priority dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: PRIORITY_COLOR[todo.priority] }}
              title={PRIORITY_LABEL[todo.priority]}
            />
            <span
              style={{
                fontSize: 17,
                fontWeight: 400,
                letterSpacing: "-0.374px",
                lineHeight: 1.24,
                color: todo.completed ? "var(--color-ink-muted-48)" : "var(--color-ink)",
                textDecoration: todo.completed ? "line-through" : "none",
              }}
            >
              {todo.title}
            </span>
          </div>

          {/* Meta row */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {/* Category chip */}
            <span
              className="rounded-full"
              style={{
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "-0.12px",
                padding: "2px 8px",
                background: cat.bg,
                color: cat.color,
              }}
            >
              {todo.category}
            </span>

            <span style={{ fontSize: 13, color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>
              {todo.assignee}
            </span>

            {todo.requested_by && (
              <span style={{ fontSize: 13, color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>
                ← {todo.requested_by}
              </span>
            )}

            {todo.estimated_minutes && (
              <span style={{ fontSize: 13, color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>
                {todo.estimated_minutes}분
              </span>
            )}

            {todo.due_time && (
              <span style={{ fontSize: 13, color: "var(--color-ink-muted-48)", letterSpacing: "-0.12px" }}>
                {todo.due_time.slice(0, 5)}
              </span>
            )}

            {showCountdown && (
              <Countdown dueTime={todo.due_time!} date={todo.date} />
            )}
          </div>

          {/* Expanded description */}
          {expanded && todo.description && (
            <p
              className="mt-2"
              style={{
                fontSize: 14,
                color: "var(--color-ink-muted-48)",
                letterSpacing: "-0.224px",
                lineHeight: 1.43,
              }}
            >
              {todo.description}
            </p>
          )}
        </div>

        {/* Delete */}
        <button
          onClick={e => { e.stopPropagation(); handleDelete(); }}
          className="flex-shrink-0 p-1 mt-0.5"
        >
          <Trash2 size={15} style={{ color: "var(--color-hairline)" }} />
        </button>
      </div>
    </div>
  );
}

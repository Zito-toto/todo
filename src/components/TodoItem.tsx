"use client";

import { useState } from "react";
import { Todo } from "@/types";
import Countdown from "./Countdown";
import { ChevronRight, Trash2 } from "lucide-react";

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "#FF3B30",
  normal: "#FF9500",
  low: "#34C759",
};

const CATEGORY_BG: Record<string, string> = {
  집안일: "bg-blue-50 text-[#007AFF]",
  심부름: "bg-orange-50 text-[#FF9500]",
  개인: "bg-purple-50 text-[#AF52DE]",
  장보기: "bg-green-50 text-[#34C759]",
  기타: "bg-gray-100 text-gray-500",
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
    <div className={`transition-opacity ${todo.completed ? "opacity-50" : ""}`}>
      <div className="flex items-center gap-3 px-4 py-3">
        {/* iOS checkbox */}
        <button
          onClick={handleToggle}
          disabled={loading}
          className="flex-shrink-0"
        >
          <div
            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
              todo.completed
                ? "bg-[#34C759] border-[#34C759]"
                : "border-[#C7C7CC]"
            }`}
          >
            {todo.completed && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4L4.5 7.5L11 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </div>
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0" onClick={() => todo.description && setExpanded(v => !v)}>
          <div className="flex items-center gap-2">
            {/* Priority dot */}
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: PRIORITY_COLOR[todo.priority] }}
            />
            <span className={`text-[15px] font-medium leading-snug flex-1 ${todo.completed ? "line-through text-[#8E8E93]" : "text-black"}`}>
              {todo.title}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-md ${CATEGORY_BG[todo.category]}`}>
              {todo.category}
            </span>
            <span className="text-[12px] text-[#8E8E93]">{todo.assignee}</span>
            {todo.requested_by && (
              <span className="text-[12px] text-[#8E8E93]">← {todo.requested_by}</span>
            )}
            {todo.estimated_minutes && (
              <span className="text-[12px] text-[#8E8E93]">{todo.estimated_minutes}분</span>
            )}
            {todo.due_time && (
              <span className="text-[12px] text-[#8E8E93]">{todo.due_time.slice(0, 5)}</span>
            )}
            {showCountdown && (
              <Countdown dueTime={todo.due_time!} date={todo.date} />
            )}
          </div>

          {expanded && todo.description && (
            <p className="text-[13px] text-[#8E8E93] mt-1.5 leading-relaxed">{todo.description}</p>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {todo.description && (
            <ChevronRight
              size={16}
              className={`text-[#C7C7CC] transition-transform ${expanded ? "rotate-90" : ""}`}
            />
          )}
          <button onClick={handleDelete} className="p-1 ml-1">
            <Trash2 size={15} className="text-[#C7C7CC]" />
          </button>
        </div>
      </div>
    </div>
  );
}

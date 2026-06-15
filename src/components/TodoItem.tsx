"use client";

import { useState } from "react";
import { Todo } from "@/types";
import Countdown from "./Countdown";
import { ChevronDown, ChevronUp, Trash2 } from "lucide-react";

const PRIORITY_BADGE: Record<string, string> = {
  urgent: "🔴",
  normal: "🟡",
  low: "🟢",
};

const CATEGORY_COLOR: Record<string, string> = {
  집안일: "bg-blue-100 text-blue-700",
  심부름: "bg-orange-100 text-orange-700",
  개인: "bg-purple-100 text-purple-700",
  장보기: "bg-green-100 text-green-700",
  기타: "bg-gray-100 text-gray-600",
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
    <div
      className={`bg-white rounded-xl shadow-sm border transition-all ${todo.completed ? "opacity-60" : ""}`}
    >
      <div className="flex items-center gap-3 p-4">
        <button
          onClick={handleToggle}
          disabled={loading}
          className={`w-6 h-6 rounded-full border-2 flex-shrink-0 transition-all ${
            todo.completed
              ? "bg-indigo-500 border-indigo-500"
              : "border-gray-300 hover:border-indigo-400"
          }`}
        >
          {todo.completed && (
            <span className="text-white text-xs flex items-center justify-center w-full h-full">
              ✓
            </span>
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-medium ${todo.completed ? "line-through text-gray-400" : "text-gray-800"}`}
            >
              {PRIORITY_BADGE[todo.priority]} {todo.title}
            </span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLOR[todo.category]}`}
            >
              {todo.category}
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-xs text-gray-400">{todo.assignee}</span>
            {todo.requested_by && (
              <span className="text-xs text-gray-400">
                ← {todo.requested_by} 요청
              </span>
            )}
            {todo.estimated_minutes && (
              <span className="text-xs text-gray-400">
                ⏱ {todo.estimated_minutes}분
              </span>
            )}
            {todo.due_time && (
              <span className="text-xs text-gray-400">
                🕐 {todo.due_time.slice(0, 5)}
              </span>
            )}
            {showCountdown && (
              <Countdown dueTime={todo.due_time!} date={todo.date} />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {todo.description && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          )}
          <button
            onClick={handleDelete}
            className="p-1 text-gray-300 hover:text-red-400"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {expanded && todo.description && (
        <div className="px-4 pb-4 text-sm text-gray-500 border-t border-gray-50 pt-3">
          {todo.description}
        </div>
      )}
    </div>
  );
}

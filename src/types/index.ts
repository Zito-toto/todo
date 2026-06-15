export type Member = "지원" | "소영" | "엄마" | "아빠";

export type Priority = "urgent" | "normal" | "low";

export type Category = "집안일" | "심부름" | "개인" | "장보기" | "기타";

export type Todo = {
  id: string;
  title: string;
  description: string | null;
  assignee: Member;
  requested_by: Member | null;
  category: Category;
  priority: Priority;
  date: string; // YYYY-MM-DD
  due_time: string | null; // HH:MM
  estimated_minutes: number | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string;
};

export type CreateTodoInput = Omit<
  Todo,
  "id" | "completed" | "completed_at" | "created_at"
>;

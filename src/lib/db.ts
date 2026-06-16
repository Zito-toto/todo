import { neon } from "@neondatabase/serverless";

function getDb() {
  return neon((process.env.NEON_POSTGRES_URL ?? process.env.neon_POSTGRES_URL)!);
}

export async function initDb() {
  const sql = getDb();
  await sql`
    CREATE TABLE IF NOT EXISTS todos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title TEXT NOT NULL,
      description TEXT,
      assignee TEXT NOT NULL,
      requested_by TEXT,
      category TEXT NOT NULL DEFAULT '기타',
      priority TEXT NOT NULL DEFAULT 'normal',
      date DATE NOT NULL,
      due_time TIME,
      estimated_minutes INTEGER,
      completed BOOLEAN NOT NULL DEFAULT FALSE,
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;
}

export function sql() {
  return getDb();
}
